"""Train the crop disease classifier on PlantVillage and PlantDoc."""

from __future__ import annotations

import argparse
import json
import os
import random
from collections import Counter
from pathlib import Path

import torch
from torch import nn
from torch.utils.data import ConcatDataset, DataLoader
from torchvision import datasets, models, transforms
from torchvision.datasets import VisionDataset
from torchvision.models import ResNet18_Weights


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train the crop disease classifier")
    parser.add_argument("--plantvillage-dir", type=Path, default=Path("data/PlantVillage"))
    parser.add_argument("--plantdoc-dir", type=Path, default=Path("data/PlantDoc-Dataset-master"))
    parser.add_argument("--field-dir", type=Path, default=None,
                        help="Optional field-photo directory with one folder per canonical class")
    parser.add_argument("--output-dir", type=Path, default=Path("models"))
    parser.add_argument("--epochs", type=int, default=15)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--max-images-per-class", type=int, default=500,
                        help="Cap each source/class combination for practical CPU training (0 uses every image)")
    parser.add_argument("--learning-rate", type=float, default=1e-4)
    parser.add_argument("--plantvillage-test-ratio", type=float, default=0.2)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--backbone", choices=["resnet18", "resnet50"], default="resnet18")
    parser.add_argument("--unfreeze-from", choices=["none", "layer4", "all"], default="all",
                        help="How much of the backbone to fine-tune beyond the classification head")
    return parser.parse_args()


def set_seed(seed: int) -> None:
    random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


def image_transform(training: bool) -> transforms.Compose:
    operations = [transforms.Resize((256, 256))]
    if training:
        operations.extend([
            transforms.RandomResizedCrop(224, scale=(0.70, 1.0)),
            transforms.RandomHorizontalFlip(),
            transforms.RandomRotation(15),
            transforms.ColorJitter(brightness=0.25, contrast=0.25, saturation=0.20, hue=0.05),
        ])
    else:
        operations.append(transforms.CenterCrop(224))
    operations.extend([transforms.ToTensor(),
                       transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])])
    return transforms.Compose(operations)


def find_plantvillage_root(root: Path) -> Path:
    return root / "PlantVillage" if (root / "PlantVillage").is_dir() else root


def collect_samples(root: Path, limit: int) -> list[tuple[Path, str]]:
    if not root.is_dir():
        raise FileNotFoundError(f"Dataset directory does not exist: {root}")
    image_folder = datasets.ImageFolder(root)
    samples = [(Path(path), canonicalize_label(image_folder.classes[index])) for path, index in image_folder.samples]
    if limit:
        kept: list[tuple[Path, str]] = []
        counts: Counter[str] = Counter()
        for sample in samples:
            if counts[sample[1]] < limit:
                kept.append(sample)
                counts[sample[1]] += 1
        samples = kept
    return samples


def canonicalize_label(label: str) -> str:
    """Merge naming variants from PlantVillage and PlantDoc into one class."""
    normalized = " ".join(label.lower().replace("_", " ").replace("-", " ").split())
    normalized = normalized.replace("bell pepper", "pepper")
    if normalized in {"apple leaf", "apple healthy leaf"}:
        return "Apple_healthy"
    if "apple" in normalized and "scab" in normalized:
        return "Apple_Scab"
    if "apple" in normalized and "rust" in normalized:
        return "Apple_rust"
    if "blueberry" in normalized:
        return "Blueberry_healthy"
    if "cherry" in normalized:
        return "Cherry_healthy"
    if "peach" in normalized:
        return "Peach_healthy"
    if "raspberry" in normalized:
        return "Raspberry_healthy"
    if "soyabean" in normalized or "soybean" in normalized:
        return "Soybean_healthy"
    if "strawberry" in normalized:
        return "Strawberry_healthy"
    if "squash" in normalized and "powdery mildew" in normalized:
        return "Squash_Powdery_mildew"
    if "tomato" in normalized:
        if "early blight" in normalized:
            return "Tomato_Early_blight"
        if "late blight" in normalized:
            return "Tomato_Late_blight"
        if "bacterial spot" in normalized:
            return "Tomato_Bacterial_spot"
        if "septoria" in normalized:
            return "Tomato_Septoria_leaf_spot"
        if "target spot" in normalized:
            return "Tomato__Target_Spot"
        if "yellow" in normalized and "virus" in normalized:
            return "Tomato__Tomato_YellowLeaf__Curl_Virus"
        if "mosaic" in normalized:
            return "Tomato__Tomato_mosaic_virus"
        if "mold" in normalized:
            return "Tomato_Leaf_Mold"
        if "spider" in normalized or "mite" in normalized:
            return "Tomato_Spider_mites_Two_spotted_spider_mite"
        if "healthy" in normalized or normalized == "tomato leaf":
            return "Tomato_healthy"
    if "potato" in normalized:
        if "early blight" in normalized:
            return "Potato___Early_blight"
        if "late blight" in normalized:
            return "Potato___Late_blight"
        if "healthy" in normalized:
            return "Potato___healthy"
    if "pepper" in normalized or "bell pepper" in normalized:
        if "bacterial spot" in normalized or "leaf spot" in normalized:
            return "Pepper__bell___Bacterial_spot"
        if "healthy" in normalized or normalized == "bell pepper leaf":
            return "Pepper__bell___healthy"
    if "corn" in normalized or "maize" in normalized:
        if "gray" in normalized:
            return "Corn Gray leaf spot"
        if "blight" in normalized:
            return "Corn leaf blight"
        if "rust" in normalized:
            return "Corn rust leaf"
    return label


class LabelledImages(VisionDataset):
    def __init__(self, samples: list[tuple[Path, str]], indices: dict[str, int], transform):
        super().__init__(root=".", transform=transform)
        self.samples = [(str(path), indices[label]) for path, label in samples]

    def __getitem__(self, index: int):
        from PIL import Image
        path, target = self.samples[index]
        with Image.open(path) as image:
            return self.transform(image.convert("RGB")), target

    def __len__(self) -> int:
        return len(self.samples)


def split_by_class(samples: list[tuple[Path, str]], ratio: float, seed: int):
    if not 0 < ratio < 1:
        raise ValueError("plantvillage-test-ratio must be between 0 and 1")
    grouped: dict[str, list[tuple[Path, str]]] = {}
    for sample in samples:
        grouped.setdefault(sample[1], []).append(sample)
    rng = random.Random(seed)
    train, test = [], []
    for items in grouped.values():
        rng.shuffle(items)
        test_count = max(1, round(len(items) * ratio)) if len(items) > 1 else 0
        test.extend(items[:test_count])
        train.extend(items[test_count:])
    return train, test


def build_datasets(args: argparse.Namespace):
    village = collect_samples(find_plantvillage_root(args.plantvillage_dir), args.max_images_per_class)
    doc_train = collect_samples(args.plantdoc_dir / "train", args.max_images_per_class)
    doc_test = collect_samples(args.plantdoc_dir / "test", args.max_images_per_class)
    field = collect_samples(args.field_dir, args.max_images_per_class) if args.field_dir else []
    classes = sorted({label for _, label in village + doc_train + doc_test + field})
    if len(classes) < 2:
        raise ValueError("At least two class folders are required")
    indices = {label: index for index, label in enumerate(classes)}
    village_train, village_test = split_by_class(village, args.plantvillage_test_ratio, args.seed)
    train_sets = [LabelledImages(village_train, indices, image_transform(True)),
                  LabelledImages(doc_train, indices, image_transform(True))]
    if field:
        train_sets.append(LabelledImages(field, indices, image_transform(True)))
    train = ConcatDataset(train_sets)
    test = ConcatDataset([LabelledImages(village_test, indices, image_transform(False)),
                          LabelledImages(doc_test, indices, image_transform(False))])
    train_targets = [target for _, target in LabelledImages(village_train, indices, image_transform(False)).samples]
    train_targets.extend(target for _, target in LabelledImages(doc_train, indices, image_transform(False)).samples)
    if field:
        train_targets.extend(target for _, target in LabelledImages(field, indices, image_transform(False)).samples)
    return classes, train, test, train_targets


def train_epoch(model, loader, device, optimizer, loss_function) -> float:
    model.train()
    loss_sum = 0.0
    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)
        optimizer.zero_grad()
        loss = loss_function(model(images), labels)
        loss.backward()
        optimizer.step()
        loss_sum += loss.item() * images.size(0)
    return loss_sum / len(loader.dataset)


def evaluate(model, loader, device) -> tuple[float, list[int], list[int]]:
    model.eval()
    correct = 0
    predicted, actual = [], []
    with torch.no_grad():
        for images, labels in loader:
            outputs = model(images.to(device))
            batch_predictions = outputs.argmax(dim=1).cpu().tolist()
            predicted.extend(batch_predictions)
            actual.extend(labels.tolist())
            correct += sum(prediction == target for prediction, target in zip(batch_predictions, labels.tolist()))
    return correct / len(loader.dataset), predicted, actual


def main() -> None:
    args = parse_args()
    if args.max_images_per_class < 0:
        raise ValueError("max-images-per-class must be zero or greater")
    set_seed(args.seed)
    if not torch.cuda.is_available():
        torch.set_num_threads(max(1, min(4, os.cpu_count() or 1)))
    classes, train_data, test_data, train_targets = build_datasets(args)
    print(f"Training on {len(train_data)} images; testing on {len(test_data)} images across {len(classes)} classes")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    train_loader = DataLoader(train_data, batch_size=args.batch_size, shuffle=True, num_workers=0)
    test_loader = DataLoader(test_data, batch_size=args.batch_size, num_workers=0)
    if args.backbone == "resnet50":
        model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
    else:
        model = models.resnet18(weights=ResNet18_Weights.DEFAULT)
    for parameter in model.parameters():
        parameter.requires_grad = False
    model.fc = nn.Linear(model.fc.in_features, len(classes))
    if args.unfreeze_from in {"layer4", "all"}:
        for parameter in model.layer4.parameters():
            parameter.requires_grad = True
    if args.unfreeze_from == "all":
        for parameter in model.layer1.parameters():
            parameter.requires_grad = True
        for parameter in model.layer2.parameters():
            parameter.requires_grad = True
        for parameter in model.layer3.parameters():
            parameter.requires_grad = True
    model.to(device)
    train_counts = Counter(train_targets)
    class_weights = torch.tensor(
        [len(train_targets) / (len(classes) * max(1, train_counts[index])) for index in range(len(classes))],
        dtype=torch.float32,
        device=device,
    )
    optimizer = torch.optim.AdamW((parameter for parameter in model.parameters() if parameter.requires_grad), lr=args.learning_rate)
    loss_function = nn.CrossEntropyLoss(weight=class_weights)
    metrics = {
        "classes": classes,
        "epochs": [],
        "backbone": args.backbone,
        "unfreezeFrom": args.unfreeze_from,
        "fieldImages": len(field) if args.field_dir else 0,
    }
    for epoch in range(args.epochs):
        loss = train_epoch(model, train_loader, device, optimizer, loss_function)
        accuracy, _, _ = evaluate(model, test_loader, device)
        metrics["epochs"].append({"epoch": epoch + 1, "loss": loss, "accuracy": accuracy})
        print(f"Epoch {epoch + 1}/{args.epochs}: loss={loss:.4f}, accuracy={accuracy:.2%}")
    args.output_dir.mkdir(parents=True, exist_ok=True)
    model.to("cpu").eval()
    torch.jit.trace(model, torch.zeros(1, 3, 224, 224)).save(str(args.output_dir / "crop_model.pt"))
    (args.output_dir / "classes.txt").write_text("\n".join(classes) + "\n", encoding="utf-8")
    (args.output_dir / "evaluation.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    print(f"Saved {args.output_dir / 'crop_model.pt'} and {args.output_dir / 'classes.txt'}")


if __name__ == "__main__":
    main()
