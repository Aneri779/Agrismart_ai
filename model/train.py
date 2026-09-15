"""
AgriSmart AI — Training Script
Two-phase transfer learning with early stopping on macro-F1.
Kaggle usage:  %%writefile train.py
Then run:      !python train.py --data-dir /kaggle/input/.../color
"""

import argparse
import os
import sys
import time
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
from sklearn.metrics import f1_score
from torch.optim.lr_scheduler import CosineAnnealingLR
from tqdm.auto import tqdm

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import config  # noqa: E402
from dataset import get_train_val_loaders  # noqa: E402
from model import CropDiseaseModel, TemperatureScaler  # noqa: E402
from utils import get_device, save_checkpoint, set_seed, setup_logger  # noqa: E402

logger = setup_logger("train")


# ──────────────────────────────────────────────
# Training / validation loops
# ──────────────────────────────────────────────

def train_one_epoch(
    model: nn.Module,
    loader,
    criterion: nn.Module,
    optimizer: torch.optim.Optimizer,
    device: torch.device,
    epoch: int,
) -> dict:
    model.train()
    running_loss = 0.0
    all_preds = []
    all_labels = []

    pbar = tqdm(loader, desc=f"Train Epoch {epoch}", leave=False)
    for images, labels in pbar:
        images, labels = images.to(device), labels.to(device)

        optimizer.zero_grad()
        logits = model(images)
        loss = criterion(logits, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * images.size(0)
        preds = logits.argmax(dim=1).cpu().numpy()
        all_preds.extend(preds)
        all_labels.extend(labels.cpu().numpy())

        pbar.set_postfix(loss=f"{loss.item():.4f}")

    n = len(all_labels)
    avg_loss = running_loss / n
    acc = np.mean(np.array(all_preds) == np.array(all_labels))
    macro_f1 = f1_score(all_labels, all_preds, average="macro", zero_division=0)

    return {"loss": avg_loss, "accuracy": acc, "macro_f1": macro_f1}


@torch.no_grad()
def validate(
    model: nn.Module,
    loader,
    criterion: nn.Module,
    device: torch.device,
) -> dict:
    model.eval()
    running_loss = 0.0
    all_preds = []
    all_labels = []

    for images, labels in tqdm(loader, desc="Validate", leave=False):
        images, labels = images.to(device), labels.to(device)
        logits = model(images)
        loss = criterion(logits, labels)

        running_loss += loss.item() * images.size(0)
        preds = logits.argmax(dim=1).cpu().numpy()
        all_preds.extend(preds)
        all_labels.extend(labels.cpu().numpy())

    n = len(all_labels)
    avg_loss = running_loss / n
    acc = np.mean(np.array(all_preds) == np.array(all_labels))
    macro_f1 = f1_score(all_labels, all_preds, average="macro", zero_division=0)

    return {"loss": avg_loss, "accuracy": acc, "macro_f1": macro_f1}


# ──────────────────────────────────────────────
# Main training routine
# ──────────────────────────────────────────────

def train(args):
    set_seed(args.seed)
    device = get_device()
    logger.info(f"Device: {device}")

    # ── Data ──
    train_loader, val_loader, class_names, class_weights = get_train_val_loaders(
        data_dir=args.data_dir,
        val_split=args.val_split,
        batch_size=args.batch_size,
        num_workers=args.num_workers,
        seed=args.seed,
    )
    class_weights = class_weights.to(device)
    num_classes = len(class_names)
    logger.info(f"Classes: {num_classes}")

    # ── Model ──
    model = CropDiseaseModel(num_classes=num_classes, dropout=config.DROPOUT)
    model.to(device)

    # ── Loss ──
    criterion = nn.CrossEntropyLoss(
        weight=class_weights,
        label_smoothing=config.LABEL_SMOOTHING,
    )

    checkpoint_path = os.path.join(args.checkpoint_dir, "best_model.pth")
    best_macro_f1 = 0.0
    best_temperature = 1.0

    # ════════════════════════════════════════════
    #  Phase 1 — Frozen backbone, train head only
    # ════════════════════════════════════════════
    logger.info("═" * 50)
    logger.info("PHASE 1: Frozen backbone — training classification head")
    logger.info("═" * 50)

    model.freeze_backbone()
    optimizer = torch.optim.AdamW(
        model.classifier.parameters(),
        lr=args.phase1_lr,
        weight_decay=1e-4,
    )

    for epoch in range(1, args.phase1_epochs + 1):
        train_metrics = train_one_epoch(
            model, train_loader, criterion, optimizer, device, epoch
        )
        val_metrics = validate(model, val_loader, criterion, device)

        logger.info(
            f"[Phase1 Epoch {epoch}/{args.phase1_epochs}]  "
            f"Train Loss={train_metrics['loss']:.4f}  Acc={train_metrics['accuracy']:.4f}  F1={train_metrics['macro_f1']:.4f}  │  "
            f"Val Loss={val_metrics['loss']:.4f}  Acc={val_metrics['accuracy']:.4f}  F1={val_metrics['macro_f1']:.4f}"
        )

        if val_metrics["macro_f1"] > best_macro_f1:
            best_macro_f1 = val_metrics["macro_f1"]
            save_checkpoint(
                model, optimizer, epoch, val_metrics,
                class_names, best_temperature, checkpoint_path,
            )
            logger.info(f"  ✓ New best macro-F1: {best_macro_f1:.4f} — checkpoint saved")

    # ════════════════════════════════════════════
    #  Phase 2 — Unfreeze backbone, differential LR
    # ════════════════════════════════════════════
    logger.info("═" * 50)
    logger.info("PHASE 2: Unfrozen backbone — fine-tuning full network")
    logger.info("═" * 50)

    model.unfreeze_backbone()
    param_groups = model.get_param_groups(
        lr_backbone=args.phase2_lr_backbone,
        lr_head=args.phase2_lr_head,
    )
    optimizer = torch.optim.AdamW(param_groups, weight_decay=1e-4)
    scheduler = CosineAnnealingLR(optimizer, T_max=args.phase2_epochs, eta_min=1e-6)

    patience_counter = 0

    for epoch in range(1, args.phase2_epochs + 1):
        train_metrics = train_one_epoch(
            model, train_loader, criterion, optimizer, device, epoch
        )
        val_metrics = validate(model, val_loader, criterion, device)
        scheduler.step()

        current_lr_bb = optimizer.param_groups[0]["lr"]
        current_lr_hd = optimizer.param_groups[1]["lr"]

        logger.info(
            f"[Phase2 Epoch {epoch}/{args.phase2_epochs}]  "
            f"Train Loss={train_metrics['loss']:.4f}  Acc={train_metrics['accuracy']:.4f}  F1={train_metrics['macro_f1']:.4f}  │  "
            f"Val Loss={val_metrics['loss']:.4f}  Acc={val_metrics['accuracy']:.4f}  F1={val_metrics['macro_f1']:.4f}  "
            f"(lr: bb={current_lr_bb:.2e} hd={current_lr_hd:.2e})"
        )

        if val_metrics["macro_f1"] > best_macro_f1:
            best_macro_f1 = val_metrics["macro_f1"]
            patience_counter = 0
            save_checkpoint(
                model, optimizer, epoch, val_metrics,
                class_names, best_temperature, checkpoint_path,
            )
            logger.info(f"  ✓ New best macro-F1: {best_macro_f1:.4f} — checkpoint saved")
        else:
            patience_counter += 1
            if patience_counter >= args.early_stop_patience:
                logger.info(
                    f"  Early stopping triggered (no improvement for "
                    f"{args.early_stop_patience} epochs)"
                )
                break

    # ════════════════════════════════════════════
    #  Temperature Scaling (post-hoc calibration)
    # ════════════════════════════════════════════
    logger.info("═" * 50)
    logger.info("CALIBRATION: Fitting temperature scaling on validation set")
    logger.info("═" * 50)

    # Reload best model
    best_ckpt = torch.load(checkpoint_path, map_location=device, weights_only=False)
    model.load_state_dict(best_ckpt["model_state_dict"])
    model.to(device)

    scaler = TemperatureScaler()
    learned_t = scaler.calibrate(model, val_loader, device)
    logger.info(f"  Learned temperature T = {learned_t:.4f}")

    # Re-save checkpoint with calibrated temperature
    save_checkpoint(
        model, None, best_ckpt["epoch"], best_ckpt["metrics"],
        class_names, learned_t, checkpoint_path,
    )
    logger.info(f"✓ Final checkpoint saved to {checkpoint_path}")
    logger.info(f"✓ Best validation macro-F1: {best_macro_f1:.4f}")

    return checkpoint_path


# ──────────────────────────────────────────────
# CLI entry point
# ──────────────────────────────────────────────

def parse_args():
    p = argparse.ArgumentParser(description="AgriSmart AI — Train crop disease model")
    p.add_argument("--data-dir", type=str, default=config.DATA_DIR,
                    help="Path to PlantVillage color/ folder")
    p.add_argument("--checkpoint-dir", type=str, default=config.CHECKPOINT_DIR)
    p.add_argument("--batch-size", type=int, default=config.BATCH_SIZE)
    p.add_argument("--num-workers", type=int, default=config.NUM_WORKERS)
    p.add_argument("--seed", type=int, default=config.SEED)
    p.add_argument("--val-split", type=float, default=config.VAL_SPLIT)
    p.add_argument("--phase1-epochs", type=int, default=config.PHASE1_EPOCHS)
    p.add_argument("--phase1-lr", type=float, default=config.PHASE1_LR)
    p.add_argument("--phase2-epochs", type=int, default=config.PHASE2_EPOCHS)
    p.add_argument("--phase2-lr-backbone", type=float, default=config.PHASE2_LR_BACKBONE)
    p.add_argument("--phase2-lr-head", type=float, default=config.PHASE2_LR_HEAD)
    p.add_argument("--early-stop-patience", type=int, default=config.EARLY_STOP_PATIENCE)
    return p.parse_args()


if __name__ == "__main__":
    args = parse_args()
    start = time.time()
    ckpt = train(args)
    elapsed = time.time() - start
    logger.info(f"Total training time: {elapsed / 60:.1f} minutes")
