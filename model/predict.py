"""
AgriSmart AI — Prediction Interface
Single-image prediction with temperature-scaled confidence + uncertainty gating.

Kaggle usage:  %%writefile predict.py
CLI:           !python predict.py --image /path/to/leaf.jpg
Importable:    from predict import predict, load_model
"""

import argparse
import os
import sys
from pathlib import Path
from typing import Tuple

import cv2
import numpy as np
import torch
import torch.nn.functional as F

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import config  # noqa: E402
from dataset import get_val_transforms  # noqa: E402
from model import CropDiseaseModel, TemperatureScaler  # noqa: E402
from utils import get_device, load_checkpoint  # noqa: E402


# ──────────────────────────────────────────────
# Cached model loader (singleton)
# ──────────────────────────────────────────────

_cached_model = None
_cached_meta = None


def load_model(
    checkpoint_path: str | None = None,
    device: torch.device | str | None = None,
    force_reload: bool = False,
) -> Tuple[CropDiseaseModel, dict, torch.device]:
    """
    Load model + metadata from checkpoint.  Cached after first call
    so repeated predict() calls don't reload weights.

    Returns
    -------
    model, metadata_dict, device
    """
    global _cached_model, _cached_meta

    if _cached_model is not None and not force_reload:
        dev = next(_cached_model.parameters()).device
        return _cached_model, _cached_meta, dev

    if checkpoint_path is None or not os.path.exists(checkpoint_path):
        candidate = os.path.join(config.CHECKPOINT_DIR, "best_model.pth")
        if os.path.exists(candidate):
            checkpoint_path = candidate
        else:
            local_fallback = Path(__file__).resolve().parent / "checkpoints" / "best_model.pth"
            if local_fallback.exists():
                checkpoint_path = str(local_fallback)
            else:
                checkpoint_path = candidate

    if device is None:
        device = get_device()
    elif isinstance(device, str):
        device = torch.device(device)

    ckpt = load_checkpoint(checkpoint_path, device)

    model = CropDiseaseModel(
        num_classes=ckpt["num_classes"],
        dropout=ckpt["config"].get("dropout", config.DROPOUT),
        pretrained=False,   # no need to download weights again
    )
    model.load_state_dict(ckpt["model_state_dict"])
    model.to(device)
    model.eval()

    meta = {
        "class_names": ckpt["class_names"],
        "class_to_idx": ckpt["class_to_idx"],
        "num_classes": ckpt["num_classes"],
        "temperature": ckpt.get("temperature", 1.0),
        "image_size": ckpt.get("image_size", config.IMAGE_SIZE),
        "confidence_threshold": ckpt["config"].get(
            "confidence_threshold", config.CONFIDENCE_THRESHOLD
        ),
    }

    _cached_model = model
    _cached_meta = meta

    return model, meta, device


# ──────────────────────────────────────────────
# Core prediction function
# ──────────────────────────────────────────────

def predict(
    image_path: str,
    checkpoint_path: str | None = None,
    confidence_threshold: float | None = None,
    device: torch.device | str | None = None,
) -> Tuple[str, float]:
    """
    Predict crop disease from a single image.

    Parameters
    ----------
    image_path : str
        Path to a leaf image (jpg/png).
    checkpoint_path : str, optional
        Path to the saved checkpoint. Defaults to CHECKPOINT_DIR/best_model.pth.
    confidence_threshold : float, optional
        Minimum confidence to return a class prediction.
        Below this, returns ("Uncertain", confidence).  Default: 0.6.
    device : str or torch.device, optional
        Compute device.  Default: auto-detect.

    Returns
    -------
    (class_label, confidence) : Tuple[str, float]
        class_label is the predicted disease name or "Uncertain".
        confidence is the temperature-scaled softmax probability.
    """
    model, meta, dev = load_model(checkpoint_path, device)

    if confidence_threshold is None:
        confidence_threshold = meta["confidence_threshold"]

    # ── Preprocess ──
    image = cv2.imread(image_path, cv2.IMREAD_COLOR)
    if image is None:
        raise FileNotFoundError(f"Cannot read image: {image_path}")
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    transform = get_val_transforms(meta["image_size"])
    tensor = transform(image=image)["image"]          # (C, H, W)
    tensor = tensor.unsqueeze(0).to(dev)              # (1, C, H, W)

    # ── Forward pass ──
    with torch.no_grad():
        logits = model(tensor)                        # (1, num_classes)

        # Temperature scaling
        temperature = meta["temperature"]
        scaled_logits = logits / max(temperature, 0.1)

        probs = F.softmax(scaled_logits, dim=1)       # (1, num_classes)
        confidence, pred_idx = probs.max(dim=1)
        confidence = confidence.item()
        pred_idx = pred_idx.item()

    # ── Uncertainty gating ──
    if confidence < confidence_threshold:
        class_label = "Uncertain"
    else:
        class_label = meta["class_names"][pred_idx]

    return class_label, confidence


def predict_top_k(
    image_path: str,
    k: int = 5,
    checkpoint_path: str | None = None,
    device: torch.device | str | None = None,
) -> list[Tuple[str, float]]:
    """
    Return top-k predictions with confidence scores.
    Useful for Streamlit UI to show alternative diagnoses.
    """
    model, meta, dev = load_model(checkpoint_path, device)

    image = cv2.imread(image_path, cv2.IMREAD_COLOR)
    if image is None:
        raise FileNotFoundError(f"Cannot read image: {image_path}")
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    transform = get_val_transforms(meta["image_size"])
    tensor = transform(image=image)["image"].unsqueeze(0).to(dev)

    with torch.no_grad():
        logits = model(tensor)
        scaled_logits = logits / max(meta["temperature"], 0.1)
        probs = F.softmax(scaled_logits, dim=1).squeeze(0)

    topk_probs, topk_idxs = probs.topk(k)
    results = [
        (meta["class_names"][idx.item()], prob.item())
        for prob, idx in zip(topk_probs, topk_idxs)
    ]
    return results


# ──────────────────────────────────────────────
# CLI entry point
# ──────────────────────────────────────────────

def main():
    p = argparse.ArgumentParser(
        description="AgriSmart AI — Predict crop disease from a leaf image"
    )
    p.add_argument("--image", type=str, required=True,
                    help="Path to input leaf image")
    p.add_argument("--checkpoint", type=str, default=None,
                    help="Path to model checkpoint (default: checkpoints/best_model.pth)")
    p.add_argument("--threshold", type=float, default=None,
                    help="Confidence threshold (default: 0.6)")
    p.add_argument("--top-k", type=int, default=None,
                    help="If set, show top-k predictions instead of just the best")
    args = p.parse_args()

    if args.top_k:
        results = predict_top_k(
            args.image,
            k=args.top_k,
            checkpoint_path=args.checkpoint,
        )
        print(f"\nTop-{args.top_k} predictions for: {args.image}")
        print("-" * 50)
        for rank, (label, conf) in enumerate(results, 1):
            print(f"  {rank}. {label:50s}  {conf:.4f}")
    else:
        label, conf = predict(
            args.image,
            checkpoint_path=args.checkpoint,
            confidence_threshold=args.threshold,
        )
        print(f"\nPrediction for: {args.image}")
        print("-" * 50)
        print(f"  Class:      {label}")
        print(f"  Confidence: {conf:.4f}")
        if label == "Uncertain":
            threshold = args.threshold or config.CONFIDENCE_THRESHOLD
            print(f"  ⚠ Confidence below threshold ({threshold})")


if __name__ == "__main__":
    main()
