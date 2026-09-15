"""
AgriSmart AI — Stub Endpoints
Minimal placeholders for features that don't have persistent storage yet.
"""

from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter()


from db import db_session

@router.get("/history")
async def get_history():
    """Retrieve scan history from SQLite database with image URLs."""
    with db_session() as conn:
        rows = conn.execute("SELECT * FROM scans ORDER BY created_at DESC").fetchall()
        return [
            {
                "id": r["id"],
                "crop": r["crop"],
                "disease": r["disease"],
                "confidence": r["confidence"],
                "severity": r["severity"],
                "status": r["status"],
                "sustainability": f"{r['sustainability_score']}/100" if r["sustainability_score"] is not None else "N/A",
                "date": r["date"],
                "imageUrl": r["image_url"],
            }
            for r in rows
        ]


@router.get("/dashboard")
async def get_dashboard():
    """
    Returns an empty object so the frontend doesn't crash on a missing
    endpoint. The DashboardPage currently uses hardcoded UI data anyway.
    """
    return {}


@router.get("/sustainability")
async def get_sustainability():
    """
    Real sustainability score computed from live database records.

    Weighted formula:
      Crop Health Index       (35%) — ratio of healthy scans vs detected
      Water Efficiency Index  (30%) — derived from irrigation variance vs AI recommendation
      Resource Use Index      (20%) — irrigation cycles completed as a proxy for consistent resource use
      Environmental Impact    (15%) — inverse of high-severity disease detections

    When no scans exist yet, returns scansAnalyzed=0 and a neutral baseline score of 50
    so the frontend can render an honest empty state.
    """
    with db_session() as conn:
        # ── Crop Health ────────────────────────────────────────────────────────
        total_scans = (conn.execute("SELECT COUNT(*) FROM scans").fetchone()[0] or 0)
        detected = (conn.execute(
            "SELECT COUNT(*) FROM scans WHERE status = 'Detected'"
        ).fetchone()[0] or 0)
        healthy = total_scans - detected

        if total_scans == 0:
            # No data yet — honest empty state baseline
            return {
                "score": 50,
                "waterEfficiencyIndex": 50,
                "cropHealthIndex": 50,
                "resourceUseIndex": 50,
                "environmentalImpactIndex": 50,
                "scansAnalyzed": 0,
                "cyclesCompleted": 0,
                "variancePercent": None,
                "breakdown": [],
                "generatedAt": datetime.now(timezone.utc).isoformat(),
            }

        crop_health = round((healthy / total_scans) * 100)

        # ── Environmental Impact ────────────────────────────────────────────────
        high_severity = (conn.execute(
            "SELECT COUNT(*) FROM scans WHERE severity IN ('High', 'Critical')"
        ).fetchone()[0] or 0)
        env_impact = max(0, round(100 - (high_severity / total_scans) * 100))

        # ── Water Efficiency & Resource Use (from irrigation_log) ──────────────
        from datetime import timedelta
        thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
        completed = conn.execute(
            "SELECT actual_liters, recommended_liters, duration_hours FROM irrigation_log "
            "WHERE status = 'Completed' AND created_at >= ?", (thirty_days_ago,)
        ).fetchall()

        cycle_count = len(completed)
        total_actual = sum(r["actual_liters"] or 0 for r in completed)
        total_recommended = sum(r["recommended_liters"] or 0 for r in completed)

        # Water efficiency: 50 = neutral (no data), improves when usage ≤ recommendation
        if total_recommended > 0:
            variance = (total_actual - total_recommended) / total_recommended
            # Clamp variance to [-1, 1] and map: -1 (used 100% less) → 100, +1 (used 100% more) → 0
            water_efficiency = round(max(0, min(100, 50 - (variance * 50))))
            variance_pct = round(variance * 100, 1)
        else:
            water_efficiency = 50   # neutral — no recommendation baseline yet
            variance_pct = None

        # Resource use: reward consistent irrigation (up to 10 cycles = full score)
        resource_use = round(min(100, (cycle_count / 10) * 100)) if cycle_count > 0 else 50

        # ── Composite Score ────────────────────────────────────────────────────
        score = round(
            crop_health       * 0.35 +
            water_efficiency  * 0.30 +
            resource_use      * 0.20 +
            env_impact        * 0.15
        )

        return {
            "score": score,
            "waterEfficiencyIndex": water_efficiency,
            "cropHealthIndex": crop_health,
            "resourceUseIndex": resource_use,
            "environmentalImpactIndex": env_impact,
            "scansAnalyzed": total_scans,
            "cyclesCompleted": cycle_count,
            "variancePercent": variance_pct,
            "breakdown": [
                {"label": "Crop Health", "value": crop_health, "weight": 35},
                {"label": "Water Efficiency", "value": water_efficiency, "weight": 30},
                {"label": "Resource Use", "value": resource_use, "weight": 20},
                {"label": "Environmental Impact", "value": env_impact, "weight": 15},
            ],
            "generatedAt": datetime.now(timezone.utc).isoformat(),
        }
