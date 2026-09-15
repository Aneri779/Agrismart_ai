"""
AgriSmart AI — Utilities
Checkpoint management, reproducibility, and logging helpers.
Kaggle usage:  %%writefile utils.py
"""

import logging
import os
import random
import sys
from pathlib import Path

import numpy as np
import torch

# Ensure sibling modules are importable on Kaggle
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import config  # noqa: E402


def set_seed(seed: int = config.SEED) -> None:
    """Set all random seeds for full reproducibility."""
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False


def setup_logger(name: str = "agrismart", log_file: str | None = None) -> logging.Logger:
    """Create a console + optional file logger."""
    logger = logging.getLogger(name)
    if logger.handlers:
        return logger  # already configured

    logger.setLevel(logging.INFO)
    fmt = logging.Formatter(
        "[%(asctime)s] %(levelname)s — %(message)s", datefmt="%H:%M:%S"
    )

    # Console handler
    ch = logging.StreamHandler(sys.stdout)
    ch.setFormatter(fmt)
    logger.addHandler(ch)

    # File handler (optional)
    if log_file:
        os.makedirs(os.path.dirname(log_file), exist_ok=True)
        fh = logging.FileHandler(log_file)
        fh.setFormatter(fmt)
        logger.addHandler(fh)

    return logger


def save_checkpoint(
    model: torch.nn.Module,
    optimizer: torch.optim.Optimizer | None,
    epoch: int,
    metrics: dict,
    class_names: list[str],
    temperature: float,
    path: str | Path,
) -> None:
    """
    Save a self-contained checkpoint that includes everything needed
    for prediction without access to the training code's config.
    """
    os.makedirs(os.path.dirname(path), exist_ok=True)
    payload = {
        "epoch": epoch,
        "model_state_dict": model.state_dict(),
        "metrics": metrics,
        "class_names": class_names,
        "class_to_idx": {c: i for i, c in enumerate(class_names)},
        "num_classes": len(class_names),
        "temperature": temperature,
        "image_size": config.IMAGE_SIZE,
        "config": {
            "label_smoothing": config.LABEL_SMOOTHING,
            "dropout": config.DROPOUT,
            "confidence_threshold": config.CONFIDENCE_THRESHOLD,
        },
    }
    if optimizer is not None:
        payload["optimizer_state_dict"] = optimizer.state_dict()
    torch.save(payload, path)


def load_checkpoint(path: str | Path, device: torch.device | str = "cpu") -> dict:
    """Load a checkpoint saved by save_checkpoint."""
    return torch.load(path, map_location=device, weights_only=False)


def get_device() -> torch.device:
    """Return the best available device."""
    if torch.cuda.is_available():
        return torch.device("cuda")
    return torch.device("cpu")
