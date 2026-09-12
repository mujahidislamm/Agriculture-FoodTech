import argparse
import json
from pathlib import Path

from PIL import Image
import torch
from torchvision import transforms


def load_labels(labels_path: str):
    path = Path(labels_path)
    if path.exists():
        labels = [line.strip() for line in path.read_text(encoding='utf-8').splitlines() if line.strip()]
        if labels:
            return labels
    return []


def main():
    parser = argparse.ArgumentParser(description='Run crop disease inference with the trained PyTorch TorchScript model.')
    parser.add_argument('--model', required=True, help='Path to the TorchScript model file')
    parser.add_argument('--labels', required=True, help='Path to the class-label file')
    parser.add_argument('--image', required=True, help='Path to the input leaf image')
    parser.add_argument('--tta', type=int, choices=[1, 5], default=5,
                        help='Number of deterministic views to average at inference time')
    args = parser.parse_args()

    model_path = Path(args.model)
    labels_path = Path(args.labels)
    image_path = Path(args.image)

    if not model_path.exists():
        raise FileNotFoundError(f'Model file not found: {model_path}')
    if not image_path.exists():
        raise FileNotFoundError(f'Image file not found: {image_path}')

    device = torch.device('cpu')
    model = torch.jit.load(str(model_path), map_location=device)
    model.eval()

    labels = load_labels(str(labels_path))
    if not labels:
        raise ValueError(f'No class labels found in {labels_path}')

    image = Image.open(image_path).convert('RGB')
    to_tensor = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])
    resized = transforms.Resize(256)(image)
    views = [to_tensor(transforms.CenterCrop(224)(resized))]
    if args.tta == 5:
        crops = transforms.TenCrop(224)(resized)
        views.extend([
            to_tensor(transforms.functional.hflip(resized).crop((16, 16, 240, 240))),
            to_tensor(crops[0]),
            to_tensor(crops[4]),
            to_tensor(crops[5]),
        ])
    tensor = torch.stack(views)

    with torch.no_grad():
        logits = model(tensor).mean(dim=0, keepdim=True)
        probabilities = torch.softmax(logits, dim=1)[0]

    if len(labels) != len(probabilities):
        raise ValueError(f'Model output size {len(probabilities)} does not match label count {len(labels)}')

    prediction = {labels[index]: float(probabilities[index].item()) for index in range(len(labels))}
    print(json.dumps(prediction, ensure_ascii=False))


if __name__ == '__main__':
    main()
