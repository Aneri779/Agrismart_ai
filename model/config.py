"""
AgriSmart AI — Configuration
All hyperparameters, paths, and class-name normalization live here.
Kaggle usage:  %%writefile config.py
"""

import os
import re
from pathlib import Path

# ──────────────────────────────────────────────
# Paths  (Kaggle defaults — override via env vars)
# ──────────────────────────────────────────────
DATA_DIR = os.environ.get(
    "AGRISMART_DATA_DIR",
    "/kaggle/input/datasets/abdallahalidev/plantvillage-dataset/color",
)
OUTPUT_DIR = os.environ.get("AGRISMART_OUTPUT_DIR", "/kaggle/working")
CHECKPOINT_DIR = os.path.join(OUTPUT_DIR, "checkpoints")

# ──────────────────────────────────────────────
# Training hyper-parameters
# ──────────────────────────────────────────────
IMAGE_SIZE = 224
BATCH_SIZE = 32
NUM_WORKERS = 2          # Kaggle gives 2 CPUs
SEED = 42
VAL_SPLIT = 0.2          # stratified 80/20

# Phase 1 — frozen backbone
PHASE1_EPOCHS = 5
PHASE1_LR = 1e-3

# Phase 2 — unfrozen backbone
PHASE2_EPOCHS = 20
PHASE2_LR_BACKBONE = 1e-4
PHASE2_LR_HEAD = 1e-3
EARLY_STOP_PATIENCE = 5

# Regularisation
LABEL_SMOOTHING = 0.1
DROPOUT = 0.3

# Prediction
CONFIDENCE_THRESHOLD = 0.6

# ──────────────────────────────────────────────
# Class catalogue  (raw folder names → counts)
# ──────────────────────────────────────────────
CLASS_COUNTS: dict[str, int] = {
    "Apple___Apple_scab": 630,
    "Apple___Black_rot": 621,
    "Apple___Cedar_apple_rust": 275,
    "Apple___healthy": 1645,
    "Blueberry___healthy": 1502,
    "Cherry_(including_sour)___Powdery_mildew": 1052,
    "Cherry_(including_sour)___healthy": 854,
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": 513,
    "Corn_(maize)___Common_rust_": 1192,
    "Corn_(maize)___Northern_Leaf_Blight": 985,
    "Corn_(maize)___healthy": 1162,
    "Grape___Black_rot": 1180,
    "Grape___Esca_(Black_Measles)": 1383,
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": 1076,
    "Grape___healthy": 423,
    "Orange___Haunglongbing_(Citrus_greening)": 5507,
    "Peach___Bacterial_spot": 2297,
    "Peach___healthy": 360,
    "Pepper,_bell___Bacterial_spot": 997,
    "Pepper,_bell___healthy": 1478,
    "Potato___Early_blight": 1000,
    "Potato___Late_blight": 1000,
    "Potato___healthy": 152,
    "Raspberry___healthy": 371,
    "Soybean___healthy": 5090,
    "Squash___Powdery_mildew": 1835,
    "Strawberry___Leaf_scorch": 1109,
    "Strawberry___healthy": 456,
    "Tomato___Bacterial_spot": 2127,
    "Tomato___Early_blight": 1000,
    "Tomato___Late_blight": 1909,
    "Tomato___Leaf_Mold": 952,
    "Tomato___Septoria_leaf_spot": 1771,
    "Tomato___Spider_mites Two-spotted_spider_mite": 1676,
    "Tomato___Target_Spot": 1404,
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": 5357,
    "Tomato___Tomato_mosaic_virus": 373,
    "Tomato___healthy": 1591,
}

# Sorted canonical order (deterministic, alphabetical)
CLASS_NAMES: list[str] = sorted(CLASS_COUNTS.keys())
NUM_CLASSES: int = len(CLASS_NAMES)
CLASS_TO_IDX: dict[str, int] = {c: i for i, c in enumerate(CLASS_NAMES)}
IDX_TO_CLASS: dict[int, str] = {i: c for c, i in CLASS_TO_IDX.items()}


# ──────────────────────────────────────────────
# Class-name normalization
# ──────────────────────────────────────────────
def normalize_class_name(raw: str) -> str:
    """
    Produce a canonical, lowercase, underscore-delimited key from any
    variant of a PlantVillage class folder name.

    Examples
    --------
    >>> normalize_class_name("Cherry_(including_sour)___Powdery_mildew")
    'cherry_including_sour__powdery_mildew'
    >>> normalize_class_name("Pepper, bell___Bacterial spot")
    'pepper_bell__bacterial_spot'
    """
    s = raw.strip()
    s = s.lower()
    # Remove parentheses but keep their content
    s = s.replace("(", "").replace(")", "")
    # Normalise the triple-underscore crop/disease separator to double
    s = re.sub(r"_{2,}", "__", s)
    # Replace commas, spaces, hyphens with underscores
    s = re.sub(r"[,\s\-]+", "_", s)
    # Collapse runs of underscores (but preserve double __ as separator)
    s = re.sub(r"_{3,}", "__", s)
    # Strip leading/trailing underscores
    s = s.strip("_")
    return s


# Build lookup: normalized_key → original_class_name
NORM_TO_CLASS: dict[str, str] = {
    normalize_class_name(c): c for c in CLASS_NAMES
}


def match_class_name(query: str) -> str | None:
    """
    Given any string (e.g. from an organizer's class list), find the
    matching PlantVillage class name via normalized key comparison.
    Returns None if no match is found.
    """
    key = normalize_class_name(query)
    return NORM_TO_CLASS.get(key)
