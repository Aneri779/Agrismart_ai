"""
AgriSmart AI — Assistant Router
POST /api/farmer/assistant/chat

Multi-turn conversational agricultural AI assistant.
Supports:
  - Full conversation history for natural chat continuity
  - Report mode: structured, grounded scan diagnostic report (anti-hallucination)
  - General farm/agriculture Q&A via Google Gemini
"""

import os
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from knowledge_base import KNOWLEDGE_BASE

router = APIRouter()
logger = logging.getLogger(__name__)

# Current Gemini model ID for this project
GEMINI_MODEL = "gemini-3.6-flash"


# ─── Request / Response models ────────────────────────────────

class ChatMessage(BaseModel):
    role: str   # "user" or "assistant"
    text: str


class ChatRequest(BaseModel):
    message: str
    context: dict | None = None         # scan context from the frontend
    history: list[ChatMessage] = []     # previous turns for multi-turn conversation
    report_mode: bool = False           # if True, generate a structured scan report
    language: str = "English"           # "English", "ગુજરાતી" / "Gujarati", "हिंदी" / "Hindi"


class ChatResponse(BaseModel):
    answer: str
    timestamp: str


# ─── Gemini client (lazy-loaded) ──────────────────────────────

_gemini_client = None


def _get_gemini_client():
    """Lazy-initialise the Gemini client so the import doesn't fail at
    module load time if the key isn't set (e.g. during tests)."""
    global _gemini_client
    if _gemini_client is not None:
        return _gemini_client

    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        pass

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="GEMINI_API_KEY environment variable is not set. "
                   "The AI assistant is unavailable.",
        )

    from google import genai
    _gemini_client = genai.Client(api_key=api_key)
    return _gemini_client


# ─── Knowledge Base Search ────────────────────────────────────

def _resolve_context_crop(context: dict | None) -> str:
    """Ensure we provide the actual crop name even if context has 'Unknown' or 'General'."""
    if not context:
        return "Unknown"
    crop = (context.get("crop") or "").strip()
    if crop and crop.lower() not in ("unknown", "general", "none"):
        return crop

    # Infer crop from disease and symptoms in KNOWLEDGE_BASE
    disease = (context.get("disease") or "").strip().lower()
    symptoms = set(context.get("symptoms") or [])
    if disease and disease not in ("none", "no data", "inconclusive"):
        candidates = []
        for kb_key, kb_val in KNOWLEDGE_BASE.items():
            parts = kb_key.split("___")
            k_crop = parts[0].replace("_", " ").title()
            k_disease = parts[1].replace("_", " ").lower() if len(parts) > 1 else ""
            if k_disease == disease:
                if symptoms and set(kb_val.get("symptoms", [])) == symptoms:
                    return k_crop
                candidates.append(k_crop)
        if len(candidates) == 1:
            return candidates[0]
        elif "Potato" in candidates and "potato" in disease:
            return "Potato"
        elif "Tomato" in candidates and "tomato" in disease:
            return "Tomato"
        elif candidates:
            return candidates[0]

    return crop or "Unknown"


def _get_relevant_kb_snippets(query: str, max_items: int = 3) -> list[str]:
    """Find verified disease/crop facts from knowledge_base.py matching query terms."""
    q = query.lower()
    snippets = []
    for class_name, data in KNOWLEDGE_BASE.items():
        parts = class_name.split("___")
        crop = parts[0].replace("_", " ").lower()
        disease = parts[1].replace("_", " ").lower() if len(parts) > 1 else ""

        # Don't match healthy entries unless specifically asked
        if disease == "healthy" and "healthy" not in q:
            continue

        is_match = False
        if crop in q and disease and disease in q:
            is_match = True
        elif disease and len(disease) > 4 and disease in q:
            is_match = True

        if is_match:
            crop_fmt = crop.title()
            disease_fmt = disease.title()
            syms = "; ".join(data.get("symptoms", [])) or "None listed"
            precs = "; ".join(data.get("precautions", [])) or "Consult local agronomist"
            snippets.append(
                f"• [{crop_fmt} — {disease_fmt}] (Verified Reference Data)\n"
                f"  Symptoms: {syms}\n"
                f"  Recommended Management: {precs}"
            )
            if len(snippets) >= max_items:
                break
    return snippets


# ─── System prompt builders ───────────────────────────────────

def _build_system_prompt(context: dict | None, user_query: str, report_mode: bool) -> str:
    """
    Build the system prompt for the assistant.
    - report_mode=True : strict, grounded report generator — only uses provided data.
    - report_mode=False: natural conversational agronomist.
    """
    if report_mode:
        return _build_report_system_prompt(context)

    # ── General conversational agronomist prompt ──
    base = (
        "You are AgriSmart AI, a friendly and knowledgeable expert agronomist assistant. "
        "You help farmers and growers with all aspects of farming and agriculture in a warm, "
        "conversational way — like a trusted advisor, not a textbook.\n\n"

        "## YOUR PERSONALITY & STYLE\n"
        "- Talk naturally and helpfully, like a knowledgeable friend who happens to be an agronomist.\n"
        "- Keep answers focused and practical. Don't pad with unnecessary disclaimers.\n"
        "- Use bullet points, bold, and short paragraphs to make answers easy to scan.\n"
        "- Match the complexity of your answer to the question — simple questions get concise answers, "
        "complex ones get thorough treatment.\n"
        "- If continuing a conversation, refer back to what was discussed — never treat it as a fresh start.\n\n"

        "## EXPERTISE\n"
        "You can confidently answer anything in these areas:\n"
        "- **Crop diseases & pests**: diagnosis, life cycles, severity, treatment (organic & chemical)\n"
        "- **Soil & nutrients**: pH, NPK, micronutrients, amendments, composting\n"
        "- **Irrigation & water**: drip/sprinkler systems, moisture management, scheduling\n"
        "- **Agronomy**: sowing, crop rotation, intercropping, harvesting, post-harvest\n"
        "- **Weather & climate**: adapting to conditions, frost, heat stress, drought management\n"
        "- **Organic & sustainable farming**: IPM, biofertilizers, green manure\n"
        "- **Seeds & varieties**: selection, treatment, germination\n"
        "- **Market & economics** of farming (basic guidance)\n\n"

        "## ACCURACY RULES\n"
        "- Give evidence-based advice aligned with ICAR, FAO, and agricultural extension services.\n"
        "- NEVER fabricate statistics, product names, or dosages you are not confident about — "
        "instead say 'consult your local agronomist for precise dosing'.\n"
        "- NEVER invent scan data, disease names, or confidence scores that were not provided to you.\n"
        "- If a question is completely outside farming/agriculture/rural life, politely say: "
        "'I'm focused on farming and agriculture — happy to help with anything in that area!'\n\n"
    )

    # Inject active scan context if available
    if context:
        resolved_crop = _resolve_context_crop(context)
        has_real_scan = (
            resolved_crop not in ("General", "Unknown") and
            context.get("disease") and context["disease"] not in ("None", "No Data", "Healthy")
        )
        if resolved_crop not in ("General", "Unknown"):
            base += "## ACTIVE SCAN CONTEXT\n"
            base += "(The farmer has an active plant scan. Use this data to ground your answers.)\n"
            base += f"- **Crop**: {resolved_crop}\n"
            if context.get("disease") and context["disease"] not in ("None", "No Data"):
                base += f"- **Detected Condition**: {context['disease']}\n"
            if context.get("confidence") is not None:
                base += f"- **Detection Confidence**: {context['confidence']}%\n"
            if context.get("severity"):
                base += f"- **Severity**: {context['severity']}\n"
            if context.get("symptoms") and isinstance(context["symptoms"], list):
                base += "- **Observed Symptoms**: " + "; ".join(context["symptoms"]) + "\n"
            if context.get("recommendations") and isinstance(context["recommendations"], list):
                base += "- **Verified Recommendations**:\n"
                for r in context["recommendations"]:
                    base += f"  * {r}\n"
            if context.get("weather"):
                w = context["weather"]
                base += (
                    f"- **Local Weather**: {w.get('temperature', '?')}°C, "
                    f"{w.get('condition', '?')}, "
                    f"Rain Probability: {w.get('rainProbability', '?')}%, "
                    f"Humidity: {w.get('humidity', '?')}%\n"
                )
            if context.get("irrigation"):
                irr = context["irrigation"]
                base += (
                    f"- **Irrigation Status**: {irr.get('title', '?')} "
                    f"({irr.get('durationHours', '?')} hrs recommended)\n"
                )
            if has_real_scan:
                base += (
                    "\n*When answering about this scan*: Never contradict the detected condition above. "
                    "Always reference it when relevant. Do not invent any data not listed here.\n\n"
                )

    # Inject verified knowledge base snippets matched from user query
    kb_snippets = _get_relevant_kb_snippets(user_query)
    if kb_snippets:
        base += "## VERIFIED KNOWLEDGE BASE DATA\n"
        base += "Use these verified facts to ensure accuracy:\n"
        for snip in kb_snippets:
            base += f"{snip}\n\n"

    return base


def _build_report_system_prompt(context: dict | None) -> str:
    """
    Strict system prompt for scan report generation.
    The AI MUST only use data from the provided context — no hallucination allowed.
    """
    resolved_crop = _resolve_context_crop(context)
    has_active_disease = bool(context and context.get("disease") and context["disease"] not in (None, "None", "No Data"))

    prompt = (
        "You are AgriSmart AI Report Generator. Your ONLY job right now is to produce a "
        "clean, structured diagnostic report for the farmer.\n\n"

        "## STRICT RULES FOR REPORT GENERATION\n"
        "1. ONLY use data explicitly provided in the SCAN CONTEXT below. Do not invent, assume, "
        "or extrapolate any values (confidence percentages, disease names, weather readings).\n"
        "2. If a data field is missing or 'None', write 'Not available' — never make up a value.\n"
        "3. Format the report using clean markdown: use ## headers, bullet points, and **bold** labels.\n"
        "4. Keep the tone professional and farmer-friendly.\n"
        "5. Do NOT add generic advice not grounded in the scan data provided.\n"
        "6. End with a short 'Next Steps' section using only the verified recommendations from the context.\n\n"
    )

    if not context or (
        resolved_crop in (None, "General", "Unknown") and not has_active_disease
    ):
        prompt += (
            "## NO SCAN DATA AVAILABLE\n"
            "Tell the farmer clearly and politely that you cannot generate a report without an "
            "active scan. Suggest they go to the Scan page to scan a crop image first. "
            "Do not fabricate a report."
        )
        return prompt

    prompt += "## SCAN CONTEXT (USE ONLY THIS DATA)\n"
    if resolved_crop and resolved_crop != "Unknown":
        prompt += f"- **Crop**: {resolved_crop}\n"
    elif context.get("crop") and context["crop"] != "Unknown":
        prompt += f"- **Crop**: {context['crop']}\n"
    if context.get("disease"):
        prompt += f"- **Detected Condition**: {context['disease']}\n"
    diag_source = context.get("diagnosisSource") or context.get("diagnosis_source")
    if diag_source == "ai_vision":
        prompt += "- **Diagnostic Engine**: Gemini Multimodal AI Vision Fallback\n"
    elif diag_source == "invalid_image":
        prompt += "- **Diagnostic Engine**: AI Image Validation (Non-Leaf Upload)\n"
    elif diag_source == "ml_model":
        prompt += "- **Diagnostic Engine**: Trained PyTorch Neural Network (EfficientNet-B0)\n"

    if context.get("confidence") is not None:
        prompt += f"- **Model Confidence**: {context['confidence']}%\n"
    if context.get("severity"):
        prompt += f"- **Severity Level**: {context['severity']}\n"
    if context.get("symptoms") and isinstance(context["symptoms"], list) and context["symptoms"]:
        prompt += "- **Symptoms Identified**:\n"
        for s in context["symptoms"]:
            prompt += f"  * {s}\n"
    if context.get("recommendations") and isinstance(context["recommendations"], list) and context["recommendations"]:
        prompt += "- **Verified Management Recommendations**:\n"
        for r in context["recommendations"]:
            prompt += f"  * {r}\n"
    if context.get("weather"):
        w = context["weather"]
        prompt += (
            f"- **Weather at Scan Time**: {w.get('temperature', 'N/A')}°C, "
            f"{w.get('condition', 'N/A')}, "
            f"Humidity: {w.get('humidity', 'N/A')}%, "
            f"Rain Probability: {w.get('rainProbability', 'N/A')}%\n"
        )
    if context.get("irrigation"):
        irr = context["irrigation"]
        prompt += f"- **Irrigation Recommendation**: {irr.get('title', 'N/A')} ({irr.get('durationHours', 'N/A')} hrs)\n"

    prompt += (
        "\n## REPORT FORMAT\n"
        "Generate the report with these sections (skip any section where data is unavailable):\n"
        "1. **Diagnostic Summary** — crop, detected condition, diagnostic engine (PyTorch Neural Net or Gemini AI Vision), confidence, severity\n"
        "2. **Symptoms Observed** — list from context only\n"
        "3. **Weather & Irrigation Context** — from context only\n"
        "4. **Recommended Actions** — from the verified recommendations only\n"
        "5. **Next Steps** — 2-3 short actionable bullet points\n"
    )

    return prompt


# ─── Multi-turn contents builder ──────────────────────────────

def _build_contents(history: list[ChatMessage], user_message: str) -> list[dict]:
    """Convert message history + current message into Gemini multi-turn contents format."""
    contents = []
    for msg in history:
        gemini_role = "user" if msg.role == "user" else "model"
        contents.append({"role": gemini_role, "parts": [{"text": msg.text}]})
    # Add the current user message
    contents.append({"role": "user", "parts": [{"text": user_message}]})
    return contents


# ─── Endpoint ────────────────────────────────────────────────

@router.post("/assistant/chat", response_model=ChatResponse)
async def assistant_chat(req: ChatRequest):
    """
    Multi-turn agricultural advisory chat endpoint.
    Maintains conversation history for natural, continuous dialogue.
    Supports report_mode for structured, grounded scan reports.
    """
    client = _get_gemini_client()
    system_prompt = _build_system_prompt(req.context, req.message, req.report_mode)

    # Temperature: lower for reports (stricter), slightly relaxed for natural chat
    temperature = 0.15 if req.report_mode else 0.4

    try:
        from google.genai import types

        # Build multi-turn contents from history + current message
        contents = _build_contents(req.history, req.message)

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=temperature,
                max_output_tokens=2048,
            ),
        )
        answer = response.text or "I'm sorry, I couldn't generate a response. Please try rephrasing your farming question."
    except Exception as exc:
        answer = (
            "I'm having trouble connecting to the AI service right now. "
            "Please check your network and try again in a moment."
        )
        logger.exception(
            "Gemini generation failed (%s): %s", type(exc).__name__, exc
        )

    return ChatResponse(
        answer=answer,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
