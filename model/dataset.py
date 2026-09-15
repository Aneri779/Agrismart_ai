"""
AgriSmart AI — Dataset & Data Pipeline
PyTorch Dataset, domain-gap-targeted augmentations, stratified split, class weights.
Kaggle usage:  %%writefile dataset.py
"""

import os
import sys
from pathlib import Path
from typing import Tuple

import albumentations as A
import cv2
import numpy as np
import torch
from albumentations.pytorch import ToTensorV2
from sklearn.model_selection import train_test_split
from torch.utils.data import DataLoader, Dataset, WeightedRandomSampler

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import config  # noqa: E402
from utils import setup_logger  # noqa: E402

logger = setup_logger(__name__)


# ──────────────────────────────────────────────
# Augmentation pipelines
# ──────────────────────────────────────────────

def get_train_transforms(image_size: int = config.IMAGE_SIZE) -> A.Compose:
    """
    Heavy, domain-gap-targeted augmentation pipeline.
    Goal: destroy lab-image shortcuts (uniform background, studio lighting)
    so the model must rely on leaf/lesion features that transfer to field photos.
    """
    return A.Compose([
        # --- Geometry ---
        A.RandomResizedCrop(
            size=(image_size, image_size),
            scale=(0.6, 1.0),        # aggressive crop to simulate variable framing
            ratio=(0.75, 1.333),
            interpolation=cv2.INTER_LINEAR,
        ),
        A.HorizontalFlip(p=0.5),
        A.VerticalFlip(p=0.2),
        A.Rotate(limit=30, border_mode=cv2.BORDER_REFLECT_101, p=0.5),
        A.Affine(
            scale=(0.85, 1.15),
            translate_percent={"x": (-0.1, 0.1), "y": (-0.1, 0.1)},
            rotate=(-15, 15),
            shear=(-10, 10),
            # pyrefly: ignore [unexpected-keyword]
            mode=cv2.BORDER_REFLECT_101,
            p=0.3,
        ),

        # --- Color / Lighting  (simulate natural outdoor lighting) ---
        A.OneOf([
            A.ColorJitter(
                brightness=0.3, contrast=0.3, saturation=0.3, hue=0.05, p=1.0
            ),
            A.RandomBrightnessContrast(
                brightness_limit=0.3, contrast_limit=0.3, p=1.0
            ),
        ], p=0.8),
        A.HueSaturationValue(
            hue_shift_limit=15, sat_shift_limit=30, val_shift_limit=25, p=0.4
        ),
        A.RandomGamma(gamma_limit=(70, 130), p=0.3),
        A.RandomShadow(
            shadow_roi=(0, 0, 1, 1),
            num_shadows_limit=(1, 3),
            shadow_dimension=5,
            p=0.25,
        ),

        # --- Blur / Noise  (simulate phone cameras, motion) ---
        A.OneOf([
            A.GaussianBlur(blur_limit=(3, 7), p=1.0),
            A.MotionBlur(blur_limit=(3, 7), p=1.0),
        ], p=0.3),
        A.GaussNoise(std_range=(0.01, 0.04), p=0.3),
        A.ImageCompression(quality_range=(50, 90), p=0.3),

        # --- Occlusion  (simulate leaves/stems blocking view) ---
        A.CoarseDropout(
            num_holes_range=(1, 4),
            hole_height_range=(0.05, 0.15),
            hole_width_range=(0.05, 0.15),
            fill="random",
            p=0.4,
        ),

        # --- Normalize ---
        A.Normalize(
            mean=(0.485, 0.456, 0.406),
            std=(0.229, 0.224, 0.225),
        ),
        ToTensorV2(),
    ])


def get_val_transforms(image_size: int = config.IMAGE_SIZE) -> A.Compose:
    """Minimal deterministic transforms for validation / inference."""
    return A.Compose([
        A.Resize(height=image_size, width=image_size),
        A.Normalize(
            mean=(0.485, 0.456, 0.406),
            std=(0.229, 0.224, 0.225),
        ),
        ToTensorV2(),
    ])


# ──────────────────────────────────────────────
# Dataset
# ──────────────────────────────────────────────

class PlantVillageDataset(Dataset):
    """
    Loads images from the PlantVillage `color/` folder.
    Expects structure:  color/<ClassName>/image_xxxx.jpg
    """

    def __init__(
        self,
        image_paths: list[str],
        labels: list[int],
        class_names: list[str],
        transform: A.Compose | None = None,
    ):
        self.image_paths = image_paths
        self.labels = labels
        self.class_names = class_names
        self.transform = transform

    def __len__(self) -> int:
        return len(self.image_paths)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int]:
        img_path = self.image_paths[idx]
        label = self.labels[idx]

        # Read as RGB (albumentations expects numpy HWC)
        image = cv2.imread(img_path, cv2.IMREAD_COLOR)
        if image is None:
            raise FileNotFoundError(f"Cannot read image: {img_path}")
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        if self.transform:
            augmented = self.transform(image=image)
            image = augmented["image"]

        return image, label


# ──────────────────────────────────────────────
# Data loading helpers
# ──────────────────────────────────────────────

def discover_samples(data_dir: str = config.DATA_DIR) -> Tuple[list[str], list[int], list[str]]:
    """
    Walk the color/ folder and return (image_paths, labels, class_names).
    Class order is sorted alphabetically (matches config.CLASS_NAMES).
    """
    data_path = Path(data_dir)
    if not data_path.exists():
        raise FileNotFoundError(
            f"Dataset directory not found: {data_dir}\n"
            f"Set AGRISMART_DATA_DIR env var or pass --data-dir."
        )

    # Discover classes from actual folder names
    class_dirs = sorted([
        d for d in data_path.iterdir() if d.is_dir()
    ], key=lambda d: d.name)

    class_names = [d.name for d in class_dirs]
    class_to_idx = {name: i for i, name in enumerate(class_names)}

    image_paths: list[str] = []
    labels: list[int] = []

    for class_dir in class_dirs:
        idx = class_to_idx[class_dir.name]
        for img_file in class_dir.iterdir():
            if img_file.suffix.lower() in (".jpg", ".jpeg", ".png", ".bmp"):
                image_paths.append(str(img_file))
                labels.append(idx)

    logger.info(
        f"Discovered {len(image_paths)} images across {len(class_names)} classes"
    )
    return image_paths, labels, class_names


def compute_class_weights(labels: list[int], num_classes: int) -> torch.Tensor:
    """
    Inverse-frequency class weights for CrossEntropyLoss.
    weight_c = total_samples / (num_classes * count_c)
    """
    counts = np.bincount(labels, minlength=num_classes).astype(np.float64)
    # Guard against zero counts
    counts = np.maximum(counts, 1.0)
    weights = len(labels) / (num_classes * counts)
    # Normalise so mean weight = 1.0 (prevents loss scale issues)
    weights = weights / weights.mean()
    return torch.tensor(weights, dtype=torch.float32)


def get_train_val_loaders(
    data_dir: str = config.DATA_DIR,
    val_split: float = config.VAL_SPLIT,
    batch_size: int = config.BATCH_SIZE,
    num_workers: int = config.NUM_WORKERS,
    seed: int = config.SEED,
) -> Tuple[DataLoader, DataLoader, list[str], torch.Tensor]:
    """
    Build stratified train/val DataLoaders.

    Returns
    -------
    train_loader, val_loader, class_names, class_weights
    """
    image_paths, labels, class_names = discover_samples(data_dir)

    # Stratified split
    train_paths, val_paths, train_labels, val_labels = train_test_split(
        image_paths,
        labels,
        test_size=val_split,
        stratify=labels,
        random_state=seed,
    )

    logger.info(f"Train: {len(train_paths)}  |  Val: {len(val_paths)}")

    # Class weights (computed on training split only)
    class_weights = compute_class_weights(train_labels, len(class_names))
    logger.info(
        f"Class weight range: {class_weights.min():.3f} – {class_weights.max():.3f}"
    )

    # Datasets
    train_ds = PlantVillageDataset(
        train_paths, train_labels, class_names,
        transform=get_train_transforms(),
    )
    val_ds = PlantVillageDataset(
        val_paths, val_labels, class_names,
        transform=get_val_transforms(),
    )

    # DataLoaders
    train_loader = DataLoader(
        train_ds,
        batch_size=batch_size,
        shuffle=True,
        num_workers=num_workers,
        pin_memory=True,
        drop_last=True,
    )
    val_loader = DataLoader(
        val_ds,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=True,
    )

    return train_loader, val_loader, class_names, class_weights
