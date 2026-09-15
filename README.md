

# AgriSmart AI – Crop Health Diagnosis & Intelligent Agricultural Advisory

**AgriSmart AI** is a production-ready, full-stack agricultural platform designed to empower farmers with automated leaf disease detection, scientifically grounded agronomic advisory, live weather tracking, and dynamic irrigation recommendations.

## 1. Modules Built
- **Core Modules**:
  - Deep Learning Crop Diagnosis (38 disease and healthy classes across 14 major agricultural crops).
  - Human-Verified Agricultural Knowledge Base (`knowledge_base.py`).
  - Expert Agricultural AI Assistant (powered by Google Gemini).
- **Bonus Modules**:
  - Live Weather Integration (Open-Meteo).
  - Dynamic Rule-Based Irrigation Engine.
  - Full-Stack Authentication with multi-user farmer registration.
  - Modern Responsive React Frontend with simulated heatmaps and chat advisory.

## 2. Setup and Run Instructions
### Prerequisites
- Python 3.10+
- Node.js 18+

### Quick Start (Windows)
1. Double-click `setup.bat` (or run `.\setup.ps1` in PowerShell) to automatically install all backend, frontend, and machine learning dependencies.
2. Ensure you have copied `.env.example` to `.env` and added any required API keys (e.g., GEMINI_API_KEY).
3. Double-click `run.bat` (or run `.\run.ps1`) to launch both the FastAPI backend and React frontend simultaneously.
4. Navigate to `http://localhost:5173` to view the application.

*Note: You can reproduce a prediction under 10 minutes by simply uploading a leaf image via the frontend scanner interface.*

## 3. Dataset Used
- **Source**: PlantVillage Benchmark Dataset (provided dataset for core requirements).
- **License**: Public Domain (CC0) / Open Access.

## 4. Reported Metrics
- **Macro-F1 Score**: 0.998
- **Confusion Matrix**: High precision and recall across all 38 classes, with minimal misclassification primarily limited to closely related early-stage blight conditions. (Detailed confusion matrix available in the generated model report).

## 5. Architecture Overview & Known Limitations
### Architecture
- **Frontend**: React 19, Vite, Tailwind CSS. Communicates via REST APIs.
- **Backend**: FastAPI, SQLite. Handles business logic, Gemini AI integration, and model inference.
- **ML Pipeline**: PyTorch-based vision model (ResNet/MobileNet architecture) loaded from `model/checkpoints/best_model.pth`.

### Known Limitations
- The model may be sensitive to extreme lighting conditions or backgrounds not present in the PlantVillage dataset (e.g., non-leaf objects).
- The dynamic irrigation engine currently relies solely on weather API data and does not integrate with physical ground sensors.

## 6. Demo Video & Deployment
- **Demo Video**: [Link to Demo Video (7.4)]

https://github.com/user-attachments/assets/749cbc08-d1fd-4304-8dc4-517bdecdae8a

# AI Vision Fallback, Invalid Image Filtering & Diagnostic Source Indicators

Implement intelligent multimodal fallback when the local PyTorch model is uncertain or when an invalid/non-leaf image is uploaded, along with clear visual badges in the UI indicating whether the diagnosis originated from the trained PyTorch neural network or the Gemini AI Vision agent.

---

## Architecture & Flow Overview

```
                   User Uploads Leaf Image
                              │
                              ▼
                 PyTorch Model (EfficientNet)
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
    Confident (>= 60%)               Uncertain (< 60%)
              │                               │
              │                               ▼
              │                  Gemini 3.6 Multimodal Vision
              │                               │
              │                ┌──────────────┴──────────────┐
              │                ▼                             ▼
              │         Not a Leaf Image                Valid Leaf
              │                │                             │
              ▼                ▼                             ▼
     Source: "ml_model"   Source: "invalid_image"    Source: "ai_vision"
    [🔬 Trained Neural]   [⚠️ Not a Leaf Alert]     [✨ AI Vision Fallback]
```

---

## User Review Required

> [!IMPORTANT]
> - **Fallback Threshold**: When the PyTorch model confidence is below 60% (or outputs `"Uncertain"`), the backend will automatically call Gemini 3.6 Flash with the image bytes.
> - **Invalid Image Handling**: If a user uploads a photo of something unrelated to plants/agriculture (e.g. a pet, room, vehicle, or blur), the system will flag `is_invalid_image: true` and display a prominent warning banner instructing the user to upload a clear leaf photo.
> - **Diagnostic Source Indicators**: Both the API response, database, and frontend UI (`ResultsPage` and `AssistantPage`) will show a distinct badge and explanatory note displaying whether the diagnosis came from the **PyTorch Neural Network** or **Gemini Multimodal AI Vision**.

---

## Proposed Changes

### Backend

#### [MODIFY] [backend/db.py](file:///d:/Agrismart_AI/backend/db.py)
- In `init_db()`, ensure the `scans` table includes `diagnosis_source TEXT DEFAULT 'ml_model'` (with automatic column migration if missing).

#### [MODIFY] [backend/routers/scan.py](file:///d:/Agrismart_AI/backend/routers/scan.py)
- When PyTorch model prediction is `"Uncertain"`:
  1. Call Gemini 3.6 Flash with the uploaded image bytes.
  2. Ask Gemini to evaluate:
     - `is_plant_leaf: bool` — Is this image a plant or crop leaf?
     - `rejection_reason: str` — If not a plant leaf, why (e.g., *"Image depicts a domestic animal, not a plant leaf"*).
     - `identified_crop: str` — Visually apparent crop if discernible, or "General".
     - `visual_assessment: str` — Observed symptoms (e.g., discoloration, necrotic lesions, pest damage).
     - `recommended_actions: list[str]` — Prudent management steps.
     - `severity: str` — Low / Medium / High / Unknown.
  3. If `is_plant_leaf` is `false`:
     - Set `disease = "Invalid Image (Not a Leaf)"`
     - Set `diagnosis_source = "invalid_image"`
     - Set `status = "Rejected"`
     - Return clear recommendations to upload a genuine leaf.
  4. If `is_plant_leaf` is `true`:
     - Set `disease = visual_assessment` (concise condition summary)
     - Set `diagnosis_source = "ai_vision"`
     - Set `status = "AI Inspected"`
  5. If the PyTorch model was confident:
     - Set `diagnosis_source = "ml_model"`
- Include `diagnosisSource` in `POST /api/farmer/scan` and `GET /api/farmer/scan/{scan_id}` responses.

#### [MODIFY] [backend/routers/assistant.py](file:///d:/Agrismart_AI/backend/routers/assistant.py)
- Include `diagnosisSource` in the assistant context so diagnostic reports explicitly state whether the original assessment came from the PyTorch Neural Network or Gemini Multimodal AI Vision.

---

### Frontend

#### [MODIFY] [frontend/src/pages/user/ResultsPage.jsx](file:///d:/Agrismart_AI/frontend/src/pages/user/ResultsPage.jsx)
- Add a prominent **Diagnostic Source Badge** at the top of the diagnostic card:
  - **`🔬 Trained Neural Net (PyTorch EfficientNet-B0)`** (green badge) for standard ML predictions.
  - **`✨ AI Vision Fallback (Gemini Multimodal)`** (emerald/purple badge) with a helper tooltip/note: *"The local classifier was uncertain, so Gemini Multimodal Vision inspected this image directly."*
  - **`⚠️ Invalid Image Alert`** (amber/red banner) when the image is not a plant leaf, guiding the user to upload a proper photo.

#### [MODIFY] [frontend/src/pages/user/AssistantPage.jsx](file:///d:/Agrismart_AI/frontend/src/pages/user/AssistantPage.jsx)
- Display the diagnostic source tag in the sidebar context block (e.g. `Source: AI Vision Fallback` or `Source: ML Model`).

---

## Verification Plan

### Automated / Script Verification
1. **PyTorch Model Path**: Test a normal leaf image $\rightarrow$ verify response has `diagnosisSource: 'ml_model'`.
2. **AI Vision Fallback Path**: Test an ambiguous / low-confidence leaf image $\rightarrow$ verify Gemini Vision responds and `diagnosisSource: 'ai_vision'`.
3. **Invalid Image Path**: Test with a non-leaf test image $\rightarrow$ verify Gemini detects it is not a leaf and returns `diagnosisSource: 'invalid_image'` with user guidance.
4. **Database Verification**: Ensure `diagnosis_source` persists and retrieves cleanly in SQLite / PostgreSQL.
5. **Frontend Build Check**: Run `npm run build` to verify clean React JSX compilation without errors.


