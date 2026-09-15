"""
AgriSmart AI — Kaggle Notebook Runner
====================================
Paste this file's contents into a single Kaggle notebook to run the
entire pipeline.  Each section is marked with a cell separator comment.
Alternatively, use the %%writefile approach described below each header.

Prerequisites:
  - Add dataset "abdallahalidev/plantvillage-dataset" to your notebook
  - Enable GPU accelerator (P100 or T4)
  - Internet must be ON for first run (to download EfficientNet-B0 weights)
"""


# ═══════════════════════════════════════════════
# CELL 1: Install missing dependencies
# ═══════════════════════════════════════════════
# !pip install -q timm albumentations --no-deps 2>/dev/null
# (timm and albumentations may already be installed on Kaggle)

import subprocess, sys
for pkg in ["timm", "albumentations"]:
    try:
        __import__(pkg)
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", pkg])

print("✓ Dependencies ready")


# ═══════════════════════════════════════════════
# CELL 2: Write all source modules to /kaggle/working/
# ═══════════════════════════════════════════════
# This cell writes the 6 Python modules as files so they can import each other.
# On Kaggle, /kaggle/working/ is already on sys.path.

import os

# Read the source files from the dataset or paste them.
# If you've uploaded the AgriSmart source as a Kaggle dataset, adjust paths.
# Otherwise, the easiest approach is %%writefile cells:

print("To set up the project, run these cells first:")
print("  %%writefile config.py   → paste config.py contents")
print("  %%writefile utils.py    → paste utils.py contents")
print("  %%writefile dataset.py  → paste dataset.py contents")
print("  %%writefile model.py    → paste model.py contents")
print("  %%writefile train.py    → paste train.py contents")
print("  %%writefile evaluate.py → paste evaluate.py contents")
print("  %%writefile predict.py  → paste predict.py contents")
print()
print("Or upload them as a Kaggle dataset and add to notebook inputs.")


# ═══════════════════════════════════════════════
# CELL 3: Verify dataset is accessible
# ═══════════════════════════════════════════════
DATA_DIR = "/kaggle/input/datasets/abdallahalidev/plantvillage-dataset/color"

assert os.path.isdir(DATA_DIR), f"Dataset not found at {DATA_DIR}"
classes = sorted(os.listdir(DATA_DIR))
print(f"✓ Found {len(classes)} class folders")
print(f"  First 5: {classes[:5]}")
print(f"  Last 5:  {classes[-5:]}")


# ═══════════════════════════════════════════════
# CELL 4: Quick sanity check — load a single batch
# ═══════════════════════════════════════════════
import sys
sys.path.insert(0, "/kaggle/working")

from dataset import get_train_val_loaders

train_loader, val_loader, class_names, class_weights = get_train_val_loaders(
    data_dir=DATA_DIR,
    batch_size=32,
    num_workers=2,
)

images, labels = next(iter(train_loader))
print(f"✓ Batch shape: {images.shape}")
print(f"  Label range: {labels.min()} – {labels.max()}")
print(f"  Class weights shape: {class_weights.shape}")
print(f"  Weight range: {class_weights.min():.3f} – {class_weights.max():.3f}")


# ═══════════════════════════════════════════════
# CELL 5: Visualise augmented training samples
# ═══════════════════════════════════════════════
import matplotlib.pyplot as plt
import numpy as np

MEAN = np.array([0.485, 0.456, 0.406])
STD  = np.array([0.229, 0.224, 0.225])

fig, axes = plt.subplots(2, 4, figsize=(16, 8))
for i, ax in enumerate(axes.flat):
    img = images[i].permute(1, 2, 0).numpy()
    img = (img * STD + MEAN).clip(0, 1)
    ax.imshow(img)
    ax.set_title(class_names[labels[i].item()][:30], fontsize=8)
    ax.axis("off")
plt.suptitle("Augmented Training Samples", fontsize=14)
plt.tight_layout()
plt.savefig("/kaggle/working/augmentation_preview.png", dpi=100)
plt.show()


# ═══════════════════════════════════════════════
# CELL 6: TRAIN  (this is the long cell — ~1-2 hours on GPU)
# ═══════════════════════════════════════════════
# Option A: Run the training script directly
# !python train.py --data-dir /kaggle/input/datasets/abdallahalidev/plantvillage-dataset/color

# Option B: Call train() from Python (more control, keeps variables in scope)
from train import train

class TrainArgs:
    data_dir = DATA_DIR
    checkpoint_dir = "/kaggle/working/checkpoints"
    batch_size = 32
    num_workers = 2
    seed = 42
    val_split = 0.2
    phase1_epochs = 5
    phase1_lr = 1e-3
    phase2_epochs = 20
    phase2_lr_backbone = 1e-4
    phase2_lr_head = 1e-3
    early_stop_patience = 5

args = TrainArgs()
checkpoint_path = train(args)
print(f"\n✓ Training complete. Checkpoint: {checkpoint_path}")


# ═══════════════════════════════════════════════
# CELL 7: EVALUATE
# ═══════════════════════════════════════════════
# !python evaluate.py --checkpoint /kaggle/working/checkpoints/best_model.pth

from evaluate import evaluate

class EvalArgs:
    checkpoint = "/kaggle/working/checkpoints/best_model.pth"
    data_dir = DATA_DIR
    output_dir = "/kaggle/working/evaluation"
    batch_size = 32
    num_workers = 2

results = evaluate(EvalArgs())
print(f"\n✓ Macro-F1: {results['macro_f1']:.4f}")


# ═══════════════════════════════════════════════
# CELL 8: Display confusion matrix
# ═══════════════════════════════════════════════
from IPython.display import Image as IPImage, display
display(IPImage(filename="/kaggle/working/evaluation/confusion_matrix.png"))


# ═══════════════════════════════════════════════
# CELL 9: Test single-image prediction
# ═══════════════════════════════════════════════
from predict import predict, predict_top_k

# Pick a random validation image for testing
import random
test_img = random.choice(val_loader.dataset.image_paths)
print(f"Test image: {test_img}")
print(f"True class: {os.path.basename(os.path.dirname(test_img))}")
print()

label, conf = predict(test_img)
print(f"Prediction: {label}  (confidence: {conf:.4f})")
print()

print("Top-5 predictions:")
for rank, (name, prob) in enumerate(predict_top_k(test_img, k=5), 1):
    print(f"  {rank}. {name:50s}  {prob:.4f}")
