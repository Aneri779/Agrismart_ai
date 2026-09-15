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
<video src="./Demo.mp4" width="100%" controls></video>
