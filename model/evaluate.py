"""
AgriSmart AI — Evaluation Script
Macro-F1, confusion matrix, per-class precision/recall, over-prediction detector.
Kaggle usage:  %%writefile evaluate.py
Then run:      !python evaluate.py --checkpoint /kaggle/working/checkpoints/best_model.pth
"""

import argparse
import os
import sys
from pathlib import Path

import matplotlib
matplotlib.use("Agg")  # non-interactive backend for Kaggle
import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
import torch
import torch.nn.functional as F
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    f1_score,
)
from tqdm.auto import tqdm

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import config  # noqa: E402
from dataset import get_train_val_loaders  # noqa: E402
from model import CropDiseaseModel, TemperatureScaler  # noqa: E402
from utils import get_device, load_checkpoint, set_seed, setup_logger  # noqa: E402

logger = setup_logger("evaluate")


@torch.no_grad()
def collect_predictions(
    model: torch.nn.Module,
    loader,
    device: torch.device,
    temperature: float = 1.0,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Run model on entire loader. Returns (all_labels, all_preds, all_confidences).
    Applies temperature scaling to logits before softmax.
    """
    model.eval()
    scaler = TemperatureScaler()
    scaler.temperature = torch.nn.Parameter(torch.tensor([temperature]))
    scaler.to(device)

    all_labels = []
    all_preds = []
    all_confs = []

    for images, labels in tqdm(loader, desc="Evaluating", leave=False):
        images = images.to(device)
        logits = model(images)
        scaled_logits = scaler(logits)
        probs = F.softmax(scaled_logits, dim=1)
        conf, pred = probs.max(dim=1)

        all_labels.extend(labels.numpy())
        all_preds.extend(pred.cpu().numpy())
        all_confs.extend(conf.cpu().numpy())

    return np.array(all_labels), np.array(all_preds), np.array(all_confs)


def detect_over_prediction(cm: np.ndarray, class_names: list[str], threshold: float = 2.0):
    """
    Flag classes whose predicted-column sum is > threshold × their true count.
    This catches classes that the model is "dumping" uncertain predictions into.
    """
    col_sums = cm.sum(axis=0)       # total predictions per class
    row_sums = cm.sum(axis=1)       # total true samples per class
    flagged = []
    for i, name in enumerate(class_names):
        if row_sums[i] > 0 and col_sums[i] > threshold * row_sums[i]:
            ratio = col_sums[i] / row_sums[i]
            flagged.append((name, col_sums[i], row_sums[i], ratio))
    return flagged


def plot_confusion_matrix(
    cm: np.ndarray,
    class_names: list[str],
    save_path: str,
    figsize: tuple = (20, 18),
):
    """Save a high-resolution confusion matrix heatmap."""
    # Use short labels (crop___disease → disease part only for readability)
    short_names = []
    for name in class_names:
        parts = name.split("___")
        short = parts[-1][:25] if len(parts) > 1 else name[:25]
        short_names.append(short)

    fig, ax = plt.subplots(figsize=figsize)

    # Normalise per row (recall-oriented)
    cm_norm = cm.astype(float) / cm.sum(axis=1, keepdims=True).clip(min=1)

    sns.heatmap(
        cm_norm,
        annot=False,    # too many classes for annotations
        fmt=".2f",
        cmap="Blues",
        xticklabels=short_names,
        yticklabels=short_names,
        ax=ax,
        vmin=0.0,
        vmax=1.0,
    )
    ax.set_xlabel("Predicted", fontsize=12)
    ax.set_ylabel("True", fontsize=12)
    ax.set_title("Normalised Confusion Matrix (row = recall)", fontsize=14)
    plt.xticks(rotation=90, fontsize=7)
    plt.yticks(rotation=0, fontsize=7)
    plt.tight_layout()
    plt.savefig(save_path, dpi=150, bbox_inches="tight")
    plt.close()
    logger.info(f"Confusion matrix saved to {save_path}")


def evaluate(args):
    set_seed()
    device = get_device()
    logger.info(f"Device: {device}")

    # ── Load checkpoint ──
    ckpt = load_checkpoint(args.checkpoint, device)
    class_names = ckpt["class_names"]
    num_classes = ckpt["num_classes"]
    temperature = ckpt.get("temperature", 1.0)
    logger.info(f"Loaded checkpoint: {args.checkpoint}")
    logger.info(f"  Classes: {num_classes}  |  Temperature: {temperature:.4f}")
    logger.info(f"  Training metrics: {ckpt.get('metrics', {})}")

    # ── Rebuild model ──
    model = CropDiseaseModel(num_classes=num_classes, dropout=config.DROPOUT)
    model.load_state_dict(ckpt["model_state_dict"])
    model.to(device)

    # ── Get validation data ──
    _, val_loader, _, _ = get_train_val_loaders(
        data_dir=args.data_dir,
        batch_size=args.batch_size,
        num_workers=args.num_workers,
    )

    # ── Predictions ──
    labels, preds, confs = collect_predictions(model, val_loader, device, temperature)

    # ── Metrics ──
    macro_f1 = f1_score(labels, preds, average="macro", zero_division=0)
    weighted_f1 = f1_score(labels, preds, average="weighted", zero_division=0)
    accuracy = np.mean(labels == preds)

    logger.info("═" * 50)
    logger.info("VALIDATION RESULTS")
    logger.info("═" * 50)
    logger.info(f"  Accuracy:     {accuracy:.4f}")
    logger.info(f"  Macro-F1:     {macro_f1:.4f}")
    logger.info(f"  Weighted-F1:  {weighted_f1:.4f}")
    logger.info(f"  Mean conf:    {confs.mean():.4f}  (std={confs.std():.4f})")

    # ── Per-class report ──
    report = classification_report(
        labels, preds,
        target_names=class_names,
        digits=4,
        zero_division=0,
    )
    logger.info("\nPer-class Precision / Recall / F1:\n")
    print(report)

    # Save report to file
    report_path = os.path.join(args.output_dir, "classification_report.txt")
    os.makedirs(args.output_dir, exist_ok=True)
    with open(report_path, "w") as f:
        f.write(f"Accuracy:    {accuracy:.4f}\n")
        f.write(f"Macro-F1:    {macro_f1:.4f}\n")
        f.write(f"Weighted-F1: {weighted_f1:.4f}\n\n")
        f.write(report)
    logger.info(f"Report saved to {report_path}")

    # ── Confusion matrix ──
    cm = confusion_matrix(labels, preds, labels=list(range(num_classes)))
    cm_path = os.path.join(args.output_dir, "confusion_matrix.png")
    plot_confusion_matrix(cm, class_names, cm_path)

    # ── Over-prediction detection ──
    flagged = detect_over_prediction(cm, class_names, threshold=2.0)
    if flagged:
        logger.warning("⚠ OVER-PREDICTED CLASSES (pred_count > 2× true_count):")
        for name, pred_count, true_count, ratio in flagged:
            logger.warning(
                f"  {name}: predicted {pred_count} times vs {true_count} true "
                f"({ratio:.1f}×)"
            )
    else:
        logger.info("✓ No classes are being significantly over-predicted")

    return {
        "accuracy": accuracy,
        "macro_f1": macro_f1,
        "weighted_f1": weighted_f1,
        "confusion_matrix": cm,
    }


def parse_args():
    p = argparse.ArgumentParser(description="AgriSmart AI — Evaluate trained model")
    p.add_argument("--checkpoint", type=str,
                    default=os.path.join(config.CHECKPOINT_DIR, "best_model.pth"))
    p.add_argument("--data-dir", type=str, default=config.DATA_DIR)
    p.add_argument("--output-dir", type=str,
                    default=os.path.join(config.OUTPUT_DIR, "evaluation"))
    p.add_argument("--batch-size", type=int, default=config.BATCH_SIZE)
    p.add_argument("--num-workers", type=int, default=config.NUM_WORKERS)
    return p.parse_args()


if __name__ == "__main__":
    args = parse_args()
    evaluate(args)
