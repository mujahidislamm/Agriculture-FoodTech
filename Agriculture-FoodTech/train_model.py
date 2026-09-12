"""Train the crop disease classifier on PlantVillage and PlantDoc."""

from __future__ import annotations

import argparse
import copy
import os
import random
import time
from collections import Counter
from pathlib import Path

import torch
from torch import nn
from torch.utils.data import ConcatDataset, DataLoader
from torchvision import datasets, models, transforms
from torchvision.datasets import VisionDataset
from torchvision.models import ResNet18_Weights


def format_duration(seconds: float) -> str:
    if seconds < 60:
        return f"{seconds:.1f}s"
    if seconds < 3600:
        minutes, secs = divmod(seconds, 60)
        return f"{int(minutes)}m {secs:.0f}s"
    hours, remainder = divmod(seconds, 3600)
    minutes, secs = divmod(remainder, 60)
    return f"{int(hours)}h {int(minutes)}m {secs:.0f}s"


def format_eta(remaining_seconds: float) -> str:
    return format_duration(max(0.0, remaining_seconds))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train the crop disease classifier")
    parser.add_argument("--bcdd-dir", type=Path,
                        default=Path("data/archives/BCDD/Bangladeshi_Crops_Disease_Dataset"),
                        help="Prepared BCDD dataset with train/val/test folders")
    parser.add_argument("--plantvillage-dir", type=Path, default=Path("data/archives/PlantVillage-Dataset"))
    parser.add_argument("--plantdoc-dir", type=Path, default=Path("data/archives/PlantDoc-Dataset"))
    parser.add_argument("--extra-dataset-dir", type=Path,
                        default=Path("data/archives/user-datasets"),
                        help="Additional extracted crop datasets to merge")
    parser.add_argument("--output-dir", type=Path, default=Path("models"))
    parser.add_argument("--epochs", type=int, default=20)
    parser.add_argument("--batch-size", type=int, default=48,
                        help="Use a larger batch on GPU to reduce training time; lower on CPU if memory is tight")
    parser.add_argument("--max-images-per-class", type=int, default=200,
                        help="Cap each source/class combination for practical CPU training (0 uses every image)")
    parser.add_argument("--learning-rate", type=float, default=3e-4,
                        help="Higher LR often converges faster for transfer-learning fine-tuning")
    parser.add_argument("--plantvillage-test-ratio", type=float, default=0.2)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--target-accuracy", type=float, default=0.90,
                        help="Stop early after reaching this validation accuracy (0 disables early stopping)")
    parser.add_argument("--num-workers", type=int, default=2,
                        help="Number of DataLoader workers; set to 0 for debugging or low-resource machines")
    parser.add_argument("--mixed-precision", action="store_true",
                        help="Use CUDA mixed precision when available for faster training")
    parser.add_argument("--pin-memory", action="store_true",
                        help="Pin memory on CUDA for better throughput")
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


def normalized_label(label: str) -> str:
    value = label.lower().replace("_", " ")
    if "wheat" in value:
        if "healthy" in value:
            return "Wheat___Healthy"
        if "stripe" in value or "yellow" in value:
            return "Wheat___Yellow_Rust"
        return "Wheat___Brown_Rust"
    if "rice" in value or "bacterial leaf blight" in value or "brown spot" in value or "leaf smut" in value:
        if "healthy" in value:
            return "Rice___Healthy"
        if "brown" in value:
            return "Rice___Brown_Spot"
        if "blast" in value:
            return "Rice___Leaf_Blast"
        return "Rice___Bacterial_Leaf_Blight"
    if "maize" in value or "corn" in value:
        if "healthy" in value:
            return "Corn___Healthy"
        if "common rust" in value:
            return "Corn___Common_Rust"
        if "gray" in value or "grey" in value:
            return "Corn___Gray_Leaf_Spot"
        return "Corn___Northern_Leaf_Blight"
    if "chilli" in value or "pepper" in value:
        return "Chilli___Healthy" if "healthy" in value else "Chilli___Bacterial_Spot"
    if "brinjal" in value or "eggplant" in value:
        return "Brinjal___Healthy" if "fresh" in value or "healthy" in value else "Brinjal___Diseased"
    return label


def collect_extra_samples(root: Path, limit: int) -> list[tuple[Path, str]]:
    if not root.is_dir():
        return []
    samples: list[tuple[Path, str]] = []
    counts: Counter[str] = Counter()
    for folder in sorted(path for path in root.rglob("*") if path.is_dir()):
        images = [path for path in folder.iterdir() if path.suffix.lower() in {".jpg", ".jpeg", ".png"}]
        label = normalized_label(folder.name)
        for image in images:
            if not limit or counts[label] < limit:
                samples.append((image, label))
                counts[label] += 1
    return samples


def build_datasets(args: argparse.Namespace):
    bcdd_train = args.bcdd_dir / "train"
    bcdd_val = args.bcdd_dir / "val"
    bcdd_test = args.bcdd_dir / "test"
    if bcdd_train.is_dir() and bcdd_val.is_dir() and bcdd_test.is_dir():
        train_folder = datasets.ImageFolder(bcdd_train)
        val_folder = datasets.ImageFolder(bcdd_val)
        test_folder = datasets.ImageFolder(bcdd_test)
        extra = collect_extra_samples(args.extra_dataset_dir, args.max_images_per_class)
        classes = sorted(set(train_folder.classes) | {label for _, label in extra})
        if val_folder.classes != classes or test_folder.classes != classes:
            bcdd_classes = set(train_folder.classes)
            if set(val_folder.classes) != bcdd_classes or set(test_folder.classes) != bcdd_classes:
                raise ValueError("BCDD train, val, and test folders must contain the same class folders")
        indices = {label: index for index, label in enumerate(classes)}
        bcdd_train_samples = [(Path(path), classes[index]) for path, index in train_folder.samples]
        bcdd_test_samples = [(Path(path), classes[index]) for path, index in test_folder.samples]
        extra_train, extra_test = split_by_class(extra, 0.2, args.seed) if extra else ([], [])
        train = LabelledImages(
            bcdd_train_samples + extra_train,
            indices, image_transform(True))
        test = LabelledImages(
            bcdd_test_samples + extra_test,
            indices, image_transform(False))
        return classes, train, test

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


def train_epoch(model, loader, device, optimizer, loss_function, epoch, epochs, mixed_precision=False) -> float:
    model.train()
    loss_sum = 0.0
    started = time.monotonic()
    total_batches = len(loader)
    scaler = torch.cuda.amp.GradScaler(enabled=(device.type == "cuda" and mixed_precision))
    for batch_number, (images, labels) in enumerate(loader, 1):
        images = images.to(device, non_blocking=device.type == "cuda")
        labels = labels.to(device, non_blocking=device.type == "cuda")
        optimizer.zero_grad(set_to_none=True)
        with torch.autocast(device_type=device.type, enabled=(device.type == "cuda" and mixed_precision)):
            logits = model(images)
            loss = loss_function(logits, labels)
        scaler.scale(loss).backward()
        scaler.step(optimizer)
        scaler.update()
        loss_sum += loss.item() * images.size(0)
        if batch_number == 1 or batch_number % 10 == 0 or batch_number == total_batches:
            completed = ((epoch - 1) * total_batches + batch_number) / (epochs * total_batches)
            elapsed = time.monotonic() - started
            batch_rate = batch_number / max(elapsed, 0.001)
            remaining_batches = max(total_batches - batch_number, 0)
            remaining_epoch = (epochs - epoch) * total_batches
            remaining_seconds = (remaining_batches + remaining_epoch) / max(batch_rate, 0.001)
            eta = format_eta(remaining_seconds)
            print(
                f"Progress: {completed:.1%} | epoch {epoch}/{epochs}, batch {batch_number}/{total_batches} | "
                f"elapsed {format_duration(elapsed)} | ETA {eta}",
                flush=True,
            )
    return loss_sum / len(loader.dataset)


def evaluate(model, loader, device) -> float:
    model.eval()
    correct = 0
    with torch.no_grad():
        for images, labels in loader:
            images = images.to(device, non_blocking=device.type == "cuda")
            labels = labels.to(device, non_blocking=device.type == "cuda")
            with torch.autocast(device_type=device.type, enabled=device.type == "cuda"):
                logits = model(images)
            correct += (logits.argmax(dim=1) == labels).sum().item()
    return correct / len(loader.dataset)


def main() -> None:
    args = parse_args()
    if args.max_images_per_class < 0:
        raise ValueError("max-images-per-class must be zero or greater")
    if not 0 <= args.target_accuracy <= 1:
        raise ValueError("target-accuracy must be between 0 and 1")
    if args.batch_size <= 0:
        raise ValueError("batch-size must be greater than 0")
    if args.num_workers < 0:
        raise ValueError("num-workers must be zero or greater")
    set_seed(args.seed)
    if not torch.cuda.is_available():
        cpu_count = os.cpu_count() or 1
        torch.set_num_threads(max(1, cpu_count - 2))
        torch.set_num_interop_threads(max(1, min(4, cpu_count // 2)))
    else:
        torch.backends.cudnn.benchmark = True
        torch.backends.cudnn.deterministic = False
    classes, train_data, test_data = build_datasets(args)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device} | CUDA available: {torch.cuda.is_available()}")
    print(f"Training on {len(train_data)} images; testing on {len(test_data)} images across {len(classes)} classes")
    train_loader = DataLoader(
        train_data,
        batch_size=args.batch_size,
        shuffle=True,
        num_workers=args.num_workers,
        pin_memory=(device.type == "cuda" and args.pin_memory),
    )
    test_loader = DataLoader(
        test_data,
        batch_size=args.batch_size,
        num_workers=args.num_workers,
        pin_memory=(device.type == "cuda" and args.pin_memory),
    )
    model = models.resnet18(weights=ResNet18_Weights.DEFAULT)
    for parameter in model.parameters():
        parameter.requires_grad = False
    model.fc = nn.Linear(model.fc.in_features, len(classes))
    for parameter in model.layer4.parameters():
        parameter.requires_grad = True
    model.to(device)
    optimizer = torch.optim.AdamW(
        (parameter for parameter in model.parameters() if parameter.requires_grad),
        lr=args.learning_rate)
    loss_function = nn.CrossEntropyLoss()
    best_accuracy = 0.0
    best_state = copy.deepcopy(model.state_dict())
    start_time = time.monotonic()
    for epoch in range(args.epochs):
        epoch_start = time.monotonic()
        loss = train_epoch(model, train_loader, device, optimizer, loss_function, epoch + 1, args.epochs, mixed_precision=args.mixed_precision)
        accuracy = evaluate(model, test_loader, device)
        epoch_elapsed = time.monotonic() - epoch_start
        epoch_eta = ((time.monotonic() - start_time) / (epoch + 1)) * (args.epochs - epoch - 1)
        print(
            f"Epoch {epoch + 1}/{args.epochs}: loss={loss:.4f}, accuracy={accuracy:.2%}, "
            f"epoch_time={format_duration(epoch_elapsed)}, ETA={format_eta(epoch_eta)}",
            flush=True,
        )
        if accuracy > best_accuracy:
            best_accuracy = accuracy
            best_state = copy.deepcopy(model.state_dict())
        if args.target_accuracy and accuracy >= args.target_accuracy:
            print(f"Target validation accuracy reached: {accuracy:.2%}")
            break
    args.output_dir.mkdir(parents=True, exist_ok=True)
    model.load_state_dict(best_state)
    model.to("cpu").eval()
    torch.jit.trace(model, torch.zeros(1, 3, 224, 224)).save(str(args.output_dir / "crop_model.pt"))
    (args.output_dir / "classes.txt").write_text("\n".join(classes) + "\n", encoding="utf-8")
    print(f"Best validation accuracy: {best_accuracy:.2%}")
    print(f"Saved {args.output_dir / 'crop_model.pt'} and {args.output_dir / 'classes.txt'}")


if __name__ == "__main__":
    main()
