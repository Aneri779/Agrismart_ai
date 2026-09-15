# AgriSmart AI
**AI-Powered Crop Disease Detection & Farm Advisory System**
*Smart India Hackathon (Internal) — L. J. Institute of Engineering and Technology · Problem Statement 1 · Project Report*

## 1. Problem Statement
Crop diseases cause major, preventable yield loss for Indian farmers who lack timely expert diagnosis. Lab-trained models score well in controlled conditions but degrade on real field photos — a domain gap most prototypes never measure, nor combine with weather, irrigation, or sustainability guidance.

## 2. Proposed Solution
- **Capture & Detect** — EfficientNet-B0 CNN (transfer-learned on PlantVillage, 38 classes) predicts disease with a temperature-calibrated confidence score.
- **Compose** — one backend endpoint composes detection + live weather (Open-Meteo) + sustainability score into a single recommendation card.
- **Explain** — a grounded RAG assistant (Google Gemini Flash 3.6) answers farmer questions from the scan's own data and a knowledge base, with regional-language support.
- **Verify** — a real field-rehearsal photo set measures the lab-vs-field accuracy gap and displays it publicly on the site.
- **Monitor** — Admin gets model-health monitoring, a knowledge-base manager, and a versioned sustainability formula console.

## 3. Technology Stack
| Layer | Technology |
|---|---|
| Frontend | React.js (Vite) + Tailwind CSS + Framer Motion |
| Backend | FastAPI (Python) |
| ML Serving | PyTorch → TorchScript / ONNX, EfficientNet-B0 (transfer learning) |
| Weather Data | Open-Meteo API |
| GenAI | Google Gemini Flash 3.6 via API, grounded / RAG prompting |
| Database | PostgreSQL (production) / SQLite (development) |
| Auth | JWT sessions, two roles (user, admin); farm_id-scoped access enforced server-side |
| Deployment | Docker Compose; GitHub Actions smoke test on predict.py per push |

## 4. Model Report (Core Task)
| Field | Detail |
|---|---|
| Task | 38-class crop-leaf disease classification across 14 crops (incl. healthy states). |
| Dataset & Split | PlantVillage, 54,305 images; stratified 80/20 train/val (43,444/10,861), seed 42; class-weighted loss for imbalance (152–5,507 imgs/class). |
| Model / Approach | EfficientNet-B0 (pretrained) + dropout/linear head; two-phase transfer learning; label smoothing, domain-gap augmentation, temperature calibration (T≈0.516). |
| Metric, Result & Baseline | Macro-F1 = 0.998, Accuracy = 0.999 on held-out validation (best epoch 16); confusion matrix + per-class P/R generated. Organiser baseline to be compared once published. |

## 5. What Makes This Different
- **Domain gap measured, not claimed** — live before/after accuracy from a real field-rehearsal photo set, shown publicly on the site.
- **One unified recommendation** — detection, weather, irrigation, sustainability composed server-side into a single card.
- **Admin as an honesty layer** — model-health dashboards, a versioned sustainability formula, a groundable RAG knowledge base.
- **Service-layer access control** — farm_id scoping and JWT role checks enforced server-side, not only in the UI.

## 6. Limitations
- **Lab-to-field gap & class imbalance** — trained/validated on lab-only PlantVillage images (real-field accuracy expected below the 99.9% lab score despite augmentation); rare classes (152–5,507 images) are harder to calibrate, so predictions below 0.6 confidence are flagged uncertain and routed to human review.
- **Cluster images & backbone capacity** — multi-leaf / clustered images are not reliably detected, as the model is validated for a single leaf per frame; the lighter EfficientNet-B0 backbone also trades accuracy for speed — EfficientNet-B3/B5 would likely give more accurate field predictions at higher compute/latency cost.
- **External dependencies** — irrigation advice depends on Open-Meteo accuracy; the GenAI assistant only answers within its maintained knowledge base.

*AgriSmart AI — Project Report · Repository: github.com/Aaryan775/Agrismart_AI*
