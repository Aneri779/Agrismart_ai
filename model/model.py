"""
AgriSmart AI — Model Definition
EfficientNet-B0 with transfer learning + Temperature Scaling.
Kaggle usage:  %%writefile model.py
"""

import os
import sys

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader
from tqdm.auto import tqdm

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import config  # noqa: E402


# ──────────────────────────────────────────────
# EfficientNet-B0 Wrapper
# ──────────────────────────────────────────────

class CropDiseaseModel(nn.Module):
    """
    EfficientNet-B0 (ImageNet-pretrained via timm) with a custom
    classification head.  Supports two-phase training:
      Phase 1 — freeze_backbone() → train head only
      Phase 2 — unfreeze_backbone() → fine-tune everything
    """

    def __init__(
        self,
        num_classes: int = config.NUM_CLASSES,
        dropout: float = config.DROPOUT,
        pretrained: bool = True,
    ):
        super().__init__()
        import timm

        # Create backbone (global_pool="" returns feature maps)
        self.backbone = timm.create_model(
            "efficientnet_b0",
            pretrained=pretrained,
            num_classes=0,          # strip original classifier
            global_pool="avg",      # keep global average pool
        )
        # Feature dimension from EfficientNet-B0
        self.feat_dim = self.backbone.num_features   # 1280

        # Custom classifier head
        self.classifier = nn.Sequential(
            nn.Dropout(p=dropout),
            nn.Linear(self.feat_dim, num_classes),
        )

        self.num_classes = num_classes

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Return raw logits (num_classes,)."""
        features = self.backbone(x)          # (B, 1280)
        logits = self.classifier(features)   # (B, num_classes)
        return logits

    def freeze_backbone(self) -> None:
        """Freeze all backbone parameters (Phase 1)."""
        for param in self.backbone.parameters():
            param.requires_grad = False

    def unfreeze_backbone(self) -> None:
        """Unfreeze all backbone parameters (Phase 2)."""
        for param in self.backbone.parameters():
            param.requires_grad = True

    def get_param_groups(self, lr_backbone: float, lr_head: float) -> list[dict]:
        """
        Return differential-LR parameter groups for Phase 2.
        Backbone gets a lower LR; head gets a higher LR.
        """
        return [
            {"params": self.backbone.parameters(), "lr": lr_backbone},
            {"params": self.classifier.parameters(), "lr": lr_head},
        ]


# ──────────────────────────────────────────────
# Temperature Scaling (post-hoc calibration)
# ──────────────────────────────────────────────

class TemperatureScaler(nn.Module):
    """
    Learns a single scalar T ≥ 0.1 such that softmax(logits / T) is
    calibrated.  Fitted on a validation set AFTER training is complete.
    """

    def __init__(self):
        super().__init__()
        # Initialise at T=1.0 (identity)
        self.temperature = nn.Parameter(torch.ones(1))

    def forward(self, logits: torch.Tensor) -> torch.Tensor:
        """Scale logits by learned temperature."""
        return logits / self.temperature.clamp(min=0.1)

    @torch.no_grad()
    def _collect_logits(
        self, model: nn.Module, val_loader: DataLoader, device: torch.device
    ) -> tuple[torch.Tensor, torch.Tensor]:
        """Collect all (logits, labels) from the validation set."""
        model.eval()
        all_logits = []
        all_labels = []
        for images, labels in tqdm(val_loader, desc="Collecting logits", leave=False):
            images = images.to(device)
            logits = model(images)
            all_logits.append(logits.cpu())
            all_labels.append(labels)
        return torch.cat(all_logits), torch.cat(all_labels)

    def calibrate(
        self,
        model: nn.Module,
        val_loader: DataLoader,
        device: torch.device,
        lr: float = 0.01,
        max_iter: int = 200,
    ) -> float:
        """
        Fit the temperature parameter on the validation set by
        minimising NLL.  Returns the learned temperature value.
        """
        logits, labels = self._collect_logits(model, val_loader, device)

        # Move to device for optimisation
        logits = logits.to(device)
        labels = labels.to(device)
        self.to(device)

        optimizer = torch.optim.LBFGS([self.temperature], lr=lr, max_iter=max_iter)
        nll_criterion = nn.CrossEntropyLoss()

        def closure():
            optimizer.zero_grad()
            scaled = self.forward(logits)
            loss = nll_criterion(scaled, labels)
            loss.backward()
            return loss

        optimizer.step(closure)

        learned_t = self.temperature.item()
        return learned_t
