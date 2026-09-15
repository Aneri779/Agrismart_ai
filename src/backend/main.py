"""
AgriSmart AI — FastAPI Backend
Connective layer between the PyTorch ML model and the React frontend.

Run:
    uvicorn main:app --reload --port 8000
"""

import os
import sys
from pathlib import Path

# ─── Path setup ───────────────────────────────────────────────
# Add the ML model directory so `from predict import predict` works.
# Also add repo root so `from knowledge_base import ...` works.
_BACKEND_DIR = Path(__file__).resolve().parent
_REPO_ROOT = _BACKEND_DIR.parent.parent
_ML_MODEL_DIR = _REPO_ROOT / "model"

sys.path.insert(0, str(_ML_MODEL_DIR))
sys.path.insert(0, str(_REPO_ROOT))

# Load .env files automatically
from dotenv import load_dotenv
load_dotenv(_BACKEND_DIR / ".env")
load_dotenv(_REPO_ROOT / ".env")

# Set default model output dir if not set
if not os.environ.get("AGRISMART_OUTPUT_DIR"):
    os.environ["AGRISMART_OUTPUT_DIR"] = str(_ML_MODEL_DIR)

# ─── FastAPI app ──────────────────────────────────────────────
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import scan, assistant, stubs, weather, auth, admin

app = FastAPI(
    title="AgriSmart AI API",
    version="0.1.0",
    description="Crop disease detection backend bridging a PyTorch model to the React frontend.",
)

# CORS — allow the Vite dev server (default port 5173) and common localhost ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Mount static uploads & routers ───────────────────────────
from fastapi.staticfiles import StaticFiles

_UPLOADS_DIR = _BACKEND_DIR / "uploads"
_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory=str(_UPLOADS_DIR)), name="uploads")

# All frontend API calls target /api/farmer/... or /api/auth/...
app.include_router(scan.router,      prefix="/api/farmer", tags=["scan"])
app.include_router(assistant.router,  prefix="/api/farmer", tags=["assistant"])
app.include_router(weather.router,    prefix="/api/farmer", tags=["weather"])
app.include_router(auth.router,       prefix="/api/auth",   tags=["auth"])
app.include_router(admin.router,      prefix="/api/admin",  tags=["admin"])
app.include_router(stubs.router,      prefix="/api/farmer", tags=["stubs"])


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
