"""Train the crop disease classifier on PlantVillage and PlantDoc."""

from __future__ import annotations

import argparse
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
    parser.add_argument("--output-dir", type=Path, default=Path("models"))
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--max-images-per-class", type=int, default=200,
                        help="Cap each source/class combination for practical CPU training (0 uses every image)")
    parser.add_argument("--learning-rate", type=float, default=1e-4)
    parser.add_argument("--plantvillage-test-ratio", type=float, default=0.2)
    parser.add_argument("--seed", type=int, default=42)
    return parser.parse_args()


def set_seed(seed: int) -> None:
    random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


def image_transform(training: bool) -> transforms.Compose:
    operations = [transforms.Resize((224, 224))]
    if training:
        operations.extend([transforms.RandomHorizontalFlip(), transforms.RandomRotation(10)])
    operations.extend([transforms.ToTensor(),
                       transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])])
    return transforms.Compose(operations)


def find_plantvillage_root(root: Path) -> Path:
    return root / "PlantVillage" if (root / "PlantVillage").is_dir() else root


def collect_samples(root: Path, limit: int) -> list[tuple[Path, str]]:
    if not root.is_dir():
        raise FileNotFoundError(f"Dataset directory does not exist: {root}")
    image_folder = datasets.ImageFolder(root)
    samples = [(Path(path), image_folder.classes[index]) for path, index in image_folder.samples]
    if limit:
        kept: list[tuple[Path, str]] = []
        counts: Counter[str] = Counter()
        for sample in samples:
            if counts[sample[1]] < limit:
                kept.append(sample)
                counts[sample[1]] += 1
        samples = kept
    return samples


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
    classes = sorted({label for _, label in village + doc_train + doc_test})
    if len(classes) < 2:
        raise ValueError("At least two class folders are required")
    indices = {label: index for index, label in enumerate(classes)}
    village_train, village_test = split_by_class(village, args.plantvillage_test_ratio, args.seed)
    train = ConcatDataset([LabelledImages(village_train, indices, image_transform(True)),
                           LabelledImages(doc_train, indices, image_transform(True))])
    test = ConcatDataset([LabelledImages(village_test, indices, image_transform(False)),
                          LabelledImages(doc_test, indices, image_transform(False))])
    return classes, train, test


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


def evaluate(model, loader, device) -> float:
    model.eval()
    correct = 0
    with torch.no_grad():
        for images, labels in loader:
            correct += (model(images.to(device)).argmax(dim=1) == labels.to(device)).sum().item()
    return correct / len(loader.dataset)


def main() -> None:
    args = parse_args()
    if args.max_images_per_class < 0:
        raise ValueError("max-images-per-class must be zero or greater")
    set_seed(args.seed)
    if not torch.cuda.is_available():
        torch.set_num_threads(max(1, min(4, os.cpu_count() or 1)))
    classes, train_data, test_data = build_datasets(args)
    print(f"Training on {len(train_data)} images; testing on {len(test_data)} images across {len(classes)} classes")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    train_loader = DataLoader(train_data, batch_size=args.batch_size, shuffle=True, num_workers=0)
    test_loader = DataLoader(test_data, batch_size=args.batch_size, num_workers=0)
    model = models.resnet18(weights=ResNet18_Weights.DEFAULT)
    for parameter in model.parameters():
        parameter.requires_grad = False
    model.fc = nn.Linear(model.fc.in_features, len(classes))
    model.to(device)
    optimizer = torch.optim.Adam(model.fc.parameters(), lr=args.learning_rate)
    loss_function = nn.CrossEntropyLoss()
    for epoch in range(args.epochs):
        loss = train_epoch(model, train_loader, device, optimizer, loss_function)
        accuracy = evaluate(model, test_loader, device)
        print(f"Epoch {epoch + 1}/{args.epochs}: loss={loss:.4f}, accuracy={accuracy:.2%}")
    args.output_dir.mkdir(parents=True, exist_ok=True)
    model.to("cpu").eval()
    torch.jit.trace(model, torch.zeros(1, 3, 224, 224)).save(str(args.output_dir / "crop_model.pt"))
    (args.output_dir / "classes.txt").write_text("\n".join(classes) + "\n", encoding="utf-8")
    print(f"Saved {args.output_dir / 'crop_model.pt'} and {args.output_dir / 'classes.txt'}")


if __name__ == "__main__":
    main()
