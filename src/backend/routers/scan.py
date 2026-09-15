import logging
import os
import tempfile
import uuid
from datetime import datetime, timezone

import json
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

# Shared database session for saving scans
from db import db_session

logger = logging.getLogger(__name__)

_UPLOADS_DIR = Path(__file__).resolve().parents[1] / "uploads"
_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# Ensure ml-model and repo root are in sys.path
import sys
_REPO_ROOT = Path(__file__).resolve().parents[1]
_ML_MODEL_DIR = _REPO_ROOT / "ml-model"
if str(_ML_MODEL_DIR) not in sys.path:
    sys.path.insert(0, str(_ML_MODEL_DIR))
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))

try:
    from predict import predict, predict_top_k
    _predict_err = None
except ImportError as _err:
    predict = None
    predict_top_k = None
    _predict_err = str(_err)

from knowledge_base import get_disease_info, KNOWLEDGE_BASE

router = APIRouter()


# ─── Helpers ──────────────────────────────────────────────────

def _format_name(raw: str) -> str:
    """
    Convert a PlantVillage name fragment to human-readable form.
    """
    s = raw.replace("_", " ").strip()
    return s.title()


def _parse_class_label(class_label: str) -> tuple[str, str, bool]:
    """
    Split a PlantVillage class label into (crop, disease, is_healthy).
    """
    if "___" in class_label:
        crop_raw, disease_raw = class_label.split("___", 1)
    else:
        crop_raw = class_label
        disease_raw = "Unknown"

    crop = _format_name(crop_raw)
    disease = _format_name(disease_raw)
    is_healthy = disease_raw.strip().lower() == "healthy"
    return crop, disease, is_healthy


def _derive_severity(
    confidence_pct: int, is_healthy: bool, severity_hint: str
) -> str:
    """
    Simple heuristic combining the knowledge-base severity hint with model confidence.
    """
    if is_healthy:
        return "None"

    if severity_hint == "high":
        return "High Risk"
    if severity_hint == "medium":
        return "High Risk" if confidence_pct >= 85 else "Medium Risk"
    if severity_hint == "low":
        return "Medium Risk" if confidence_pct >= 85 else "Low Risk"

    if confidence_pct >= 80:
        return "High Risk"
    if confidence_pct >= 50:
        return "Medium Risk"
    return "Low Risk"


def _derive_sustainability_score(is_healthy: bool, severity: str) -> int:
    """
    Placeholder heuristic for the sustainability gauge the frontend displays.
    """
    if is_healthy:
        return 85
    return {"High Risk": 50, "Medium Risk": 65, "Low Risk": 75, "None": 85}.get(
        severity, 60
    )


def _inspect_image_with_gemini(image_path: str, user_crop: str = "") -> dict | None:
    """
    Multimodal inspection fallback using Gemini 3.6 Flash.
    Validates if the image is a plant leaf, and provides visual agronomic findings if so.
    Returns parsed dict or None if API is unavailable.
    """
    from dotenv import load_dotenv
    load_dotenv()
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return None

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)
        with open(image_path, "rb") as f:
            img_bytes = f.read()

        mime = "image/png" if image_path.lower().endswith(".png") else "image/jpeg"
        part = types.Part.from_bytes(data=img_bytes, mime_type=mime)

        crop_clause = f"The farmer mentioned this might be a '{user_crop}' crop." if user_crop else ""

        prompt = f"""You are an agricultural diagnostic assistant evaluating an uploaded leaf image.
{crop_clause}
Carefully inspect this image and return a JSON object with this exact schema:
{{
  "is_plant_leaf": true,
  "rejection_reason": null,
  "identified_crop": "string",
  "condition_summary": "string",
  "severity": "Low Risk | Medium Risk | High Risk | Unknown",
  "observed_symptoms": ["string"],
  "recommendations": ["string"]
}}

CRITICAL INSTRUCTIONS:
1. INVALID IMAGE DETECTION: If this image is NOT an actual crop, plant, or leaf (for example: a person, domestic animal, furniture, vehicle, random household item, black screen, or unreadable blur), set "is_plant_leaf": false, set "rejection_reason" to a polite, specific explanation (e.g. "The photo does not show a plant or leaf."), and keep other fields simple.
2. VALID PLANT LEAF: If it IS a plant/leaf:
   - Identify the crop name if visually discernible, otherwise use "{user_crop or 'General'}".
   - In "condition_summary", state what is visibly observed without claiming false 100% certainty (e.g. "Suspected Early Blight", "Foliar Nutrient Deficiency", or "Healthy Appearance").
   - Provide 2 to 4 observed symptoms and actionable agronomic management steps.
Respond ONLY with the raw JSON object.
"""

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=[part, prompt],
            config=types.GenerateContentConfig(
                temperature=0.1,
                response_mime_type="application/json",
            ),
        )
        if response.text:
            return json.loads(response.text)
    except Exception as exc:
        logger.warning("Gemini multimodal image inspection failed: %s", exc)
        return None

    return None


# ─── Endpoint ────────────────────────────────────────────────

@router.post("/scan")
async def scan_crop(
    image: UploadFile = File(...),
    crop: str = Form(""),
    stage: str = Form(""),
    soilType: str = Form(""),
    soilPh: str = Form(""),
    soilMoisture: str = Form(""),
    location: str = Form(""),
):
    """
    Run crop disease detection on an uploaded image.
    Uses PyTorch model first; falls back to Gemini Multimodal Vision if uncertain.
    Flags invalid/non-leaf images cleanly.
    """
    # ── Validate upload ──
    if image.content_type not in ("image/jpeg", "image/png"):
        raise HTTPException(
            status_code=400,
            detail="Unsupported image type. Upload a JPEG or PNG.",
        )

    scan_id = f"AG-SCAN-{uuid.uuid4().hex[:8].upper()}"
    suffix = ".jpg" if image.content_type == "image/jpeg" else ".png"
    persistent_filename = f"{scan_id}{suffix}"
    persistent_path = _UPLOADS_DIR / persistent_filename
    image_url = f"/api/uploads/{persistent_filename}"

    contents = await image.read()
    with open(persistent_path, "wb") as pf:
        pf.write(contents)

    # ── Run ML model ──
    class_label = "Uncertain"
    raw_confidence = 0.0
    top_k = []
    if predict:
        try:
            class_label, raw_confidence = predict(str(persistent_path))
            top_k = predict_top_k(str(persistent_path), k=5)
        except Exception as pred_err:
            logger.warning("PyTorch prediction failed (%s): %s", type(pred_err).__name__, pred_err)
            class_label = "Uncertain"

    # ── Context metadata ──
    confidence_pct = round(raw_confidence * 100)
    now_iso = datetime.now(timezone.utc).isoformat()
    display_date = datetime.now().strftime("%d %b %Y, %H:%M")

    def _val(x):
        return x.strip() if isinstance(x, str) else ""

    user_crop_clean = _val(crop)
    farm_context = {
        "location": _val(location) or None,
        "stage": _val(stage) or None,
        "soilType": _val(soilType) or None,
        "soilPh": _val(soilPh) or None,
        "soilMoisture": _val(soilMoisture) or None,
    }

    is_user_crop_known = bool(user_crop_clean and user_crop_clean.lower() not in ("", "unknown", "general", "none"))

    # ── Handle Uncertain or Low-Confidence (<60%) Cases with AI Vision Fallback ──
    if class_label == "Uncertain" or raw_confidence < 0.60:
        top_k_formatted = [
            {
                "label": _format_name(lbl.replace("___", " - ")) if "___" in lbl else lbl,
                "confidence": round(c * 100),
            }
            for lbl, c in top_k
        ]

        ai_inspection = _inspect_image_with_gemini(str(persistent_path), user_crop=user_crop_clean)

        # Case 1: Image is detected as NOT a plant leaf
        if ai_inspection and not ai_inspection.get("is_plant_leaf", True):
            rejection_text = (
                ai_inspection.get("rejection_reason")
                or "The uploaded photo does not appear to be a crop or plant leaf."
            )
            res = {
                "id": scan_id,
                "crop": "Non-Plant",
                "disease": "Invalid Image (Not a Plant Leaf)",
                "confidence": 0,
                "severity": "Unknown",
                "status": "Rejected",
                "symptoms": [rejection_text],
                "sustainabilityScore": None,
                "date": now_iso,
                "recommendations": [
                    "The photo uploaded was not recognized as a plant leaf.",
                    "Please take a focused, well-lit photo of an actual crop leaf.",
                    "Ensure the leaf fills most of the camera frame with minimal background clutter.",
                    "Avoid uploading photos of pets, people, furniture, or non-agricultural objects.",
                ],
                "is_uncertain": True,
                "is_invalid_image": True,
                "diagnosisSource": "invalid_image",
                "top_k_predictions": [],
                "farmContext": farm_context,
                "imageUrl": image_url,
            }
            with db_session() as conn:
                conn.execute(
                    """
                    INSERT INTO scans (
                        id, crop, disease, confidence, severity, status,
                        symptoms, recommendations, sustainability_score, image_url, date, farm_context, diagnosis_source
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        scan_id, res["crop"], res["disease"], 0,
                        "Unknown", "Rejected", json.dumps(res["symptoms"]),
                        json.dumps(res["recommendations"]), None, image_url,
                        display_date, json.dumps(farm_context), "invalid_image",
                    ),
                )
            return res

        # Case 2: Image IS a leaf, but local ML model was uncertain -> AI Vision fallback
        if ai_inspection and ai_inspection.get("is_plant_leaf", True):
            ai_crop = ai_inspection.get("identified_crop") or (user_crop_clean if is_user_crop_known else "General")
            ai_disease = ai_inspection.get("condition_summary") or "Inconclusive Leaf Condition"
            ai_severity = ai_inspection.get("severity") or "Medium Risk"
            is_healthy = "healthy" in ai_disease.lower()
            ai_status = "Healthy" if is_healthy else "Detected"
            ai_symptoms = ai_inspection.get("observed_symptoms") or []
            ai_recs = ai_inspection.get("recommendations") or [
                "Inspect the affected leaves in clear natural light.",
                "Ensure proper irrigation and avoid excess leaf wetness.",
                "Consult a local agronomist if symptoms persist or spread.",
            ]

            res = {
                "id": scan_id,
                "crop": ai_crop,
                "disease": ai_disease,
                "confidence": 75,
                "severity": ai_severity,
                "status": ai_status,
                "symptoms": ai_symptoms,
                "sustainabilityScore": 70,
                "date": now_iso,
                "recommendations": ai_recs,
                "is_uncertain": False,
                "is_invalid_image": False,
                "diagnosisSource": "ai_vision",
                "top_k_predictions": [
                    {"label": f"{ai_crop} - {ai_disease}", "confidence": 75}
                ],
                "farmContext": farm_context,
                "imageUrl": image_url,
            }

            with db_session() as conn:
                conn.execute(
                    """
                    INSERT INTO scans (
                        id, crop, disease, confidence, severity, status,
                        symptoms, recommendations, sustainability_score, image_url, date, farm_context, diagnosis_source
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        scan_id, ai_crop, ai_disease, 75,
                        ai_severity, ai_status, json.dumps(ai_symptoms),
                        json.dumps(ai_recs), 70, image_url,
                        display_date, json.dumps(farm_context), "ai_vision",
                    ),
                )
            return res

        # Case 3: AI Vision unavailable (e.g. offline) -> standard uncertain fallback
        uncertain_crop = _format_name(user_crop_clean) if is_user_crop_known else "General"
        res = {
            "id": scan_id,
            "crop": uncertain_crop,
            "disease": "Inconclusive",
            "confidence": confidence_pct,
            "severity": "Unknown",
            "status": "Inconclusive",
            "symptoms": [],
            "sustainabilityScore": None,
            "date": now_iso,
            "recommendations": [
                "The image could not be identified with sufficient confidence.",
                "Please retake the photo in better lighting, with a clear view of the leaf.",
                "Ensure the leaf fills most of the frame against a plain background.",
                "If symptoms persist, consult a local agronomist for an in-person diagnosis.",
            ],
            "is_uncertain": True,
            "is_invalid_image": False,
            "diagnosisSource": "ml_model",
            "top_k_predictions": top_k_formatted,
            "farmContext": farm_context,
            "imageUrl": image_url,
        }
        with db_session() as conn:
            conn.execute(
                """
                INSERT INTO scans (
                    id, crop, disease, confidence, severity, status,
                    symptoms, recommendations, sustainability_score, image_url, date, farm_context, diagnosis_source
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    scan_id, res["crop"], res["disease"], confidence_pct,
                    "Unknown", "Inconclusive", json.dumps([]),
                    json.dumps(res["recommendations"]), None, image_url,
                    display_date, json.dumps(farm_context), "ml_model",
                ),
            )
        return res

    # ── Normal (confident >= 60%) PyTorch prediction ──
    predicted_crop, disease_name, is_healthy = _parse_class_label(class_label)
    kb_info = get_disease_info(class_label)

    severity = _derive_severity(confidence_pct, is_healthy, kb_info["severity_hint"])
    sustainability = _derive_sustainability_score(is_healthy, severity)

    # If the user explicitly provided a known crop name, honor it; otherwise use the model's detected crop
    if is_user_crop_known:
        display_crop = _format_name(user_crop_clean)
    else:
        display_crop = predicted_crop

    status = "Healthy" if is_healthy else "Detected"
    disease_display = "Healthy" if is_healthy else disease_name

    top_k_formatted = [
        {
            "label": _format_name(lbl.replace("___", " - ")) if "___" in lbl else lbl,
            "confidence": round(c * 100),
        }
        for lbl, c in top_k
    ]

    res = {
        "id": scan_id,
        "crop": display_crop,
        "disease": disease_display,
        "confidence": confidence_pct,
        "severity": severity,
        "status": status,
        "symptoms": kb_info["symptoms"],
        "sustainabilityScore": sustainability,
        "date": now_iso,
        "recommendations": kb_info["precautions"],
        "is_uncertain": False,
        "is_invalid_image": False,
        "diagnosisSource": "ml_model",
        "top_k_predictions": top_k_formatted,
        "farmContext": farm_context,
        "imageUrl": image_url,
    }

    with db_session() as conn:
        conn.execute(
            """
            INSERT INTO scans (
                id, crop, disease, confidence, severity, status,
                symptoms, recommendations, sustainability_score, image_url, date, farm_context, diagnosis_source
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                scan_id, display_crop, disease_display, confidence_pct,
                severity, status, json.dumps(kb_info["symptoms"]),
                json.dumps(kb_info["precautions"]), sustainability, image_url,
                display_date, json.dumps(farm_context), "ml_model",
            ),
        )

    return res


@router.get("/scan/{scan_id}")
async def get_scan(scan_id: str):
    """Retrieve an existing scan result by its unique scan ID, with automatic crop recovery if recorded as Unknown."""
    with db_session() as conn:
        row = conn.execute("SELECT * FROM scans WHERE id = ?", (scan_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Scan not found")

        resolved_crop = row["crop"]
        # If crop is recorded as 'Unknown' or 'General', recover the crop from KNOWLEDGE_BASE symptoms & disease
        if resolved_crop in ("Unknown", "General", "", None) and row["disease"] and row["disease"] not in ("None", "No Data", "Inconclusive"):
            row_syms = json.loads(row["symptoms"] or "[]")
            for kb_key, kb_val in KNOWLEDGE_BASE.items():
                k_crop, k_disease, _ = _parse_class_label(kb_key)
                if k_disease.lower() == str(row["disease"]).lower():
                    if row_syms and set(row_syms) == set(kb_val.get("symptoms", [])):
                        resolved_crop = k_crop
                        conn.execute("UPDATE scans SET crop = ? WHERE id = ?", (resolved_crop, scan_id))
                        break
                    elif not row_syms:
                        resolved_crop = k_crop
                        conn.execute("UPDATE scans SET crop = ? WHERE id = ?", (resolved_crop, scan_id))
                        break

        diagnosis_source = row.get("diagnosis_source") if isinstance(row, dict) else (row["diagnosis_source"] if "diagnosis_source" in row.keys() else "ml_model")
        if not diagnosis_source:
            diagnosis_source = "ml_model"

        return {
            "id": row["id"],
            "crop": resolved_crop,
            "disease": row["disease"],
            "confidence": row["confidence"],
            "severity": row["severity"],
            "status": row["status"],
            "symptoms": json.loads(row["symptoms"] or "[]"),
            "recommendations": json.loads(row["recommendations"] or "[]"),
            "sustainabilityScore": row["sustainability_score"],
            "imageUrl": row["image_url"],
            "date": row["date"],
            "farmContext": json.loads(row["farm_context"] or "{}"),
            "diagnosisSource": diagnosis_source,
        }
