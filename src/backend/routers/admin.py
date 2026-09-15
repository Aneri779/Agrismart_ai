"""
AgriSmart AI — Admin Router
Endpoints for Admin Dashboard and User Management querying SQLite users.db.
"""
import bcrypt
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from db import db_session

router = APIRouter()


@router.get("/overview")
async def get_overview():
    with db_session() as conn:
        total_users = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        total_farms = conn.execute(
            "SELECT COUNT(*) FROM users WHERE location IS NOT NULL AND location != ''"
        ).fetchone()[0]
        crops_count = conn.execute("SELECT COUNT(DISTINCT crop) FROM scans").fetchone()[0]
        if crops_count == 0:
            crops_count = conn.execute(
                "SELECT COUNT(DISTINCT crop_type) FROM users WHERE crop_type IS NOT NULL"
            ).fetchone()[0]
        disease_alerts = conn.execute(
            "SELECT COUNT(*) FROM scans WHERE status = 'Detected'"
        ).fetchone()[0]

        recent_scans = conn.execute(
            "SELECT id, crop, disease, status, date, image_url FROM scans ORDER BY created_at DESC LIMIT 5"
        ).fetchall()

        return {
            "totalUsers": total_users,
            "totalFarms": max(total_farms, total_users - 1 if total_users > 1 else 1),
            "cropsMonitored": max(crops_count, 1),
            "diseaseAlerts": disease_alerts,
            "databaseEngine": "PostgreSQL" if getattr(conn, "is_postgres", False) else "SQLite",
            "recentScans": [
                {
                    "id": r["id"],
                    "crop": r["crop"],
                    "disease": r["disease"],
                    "status": r["status"],
                    "date": r["date"],
                    "imageUrl": r["image_url"],
                }
                for r in recent_scans
            ],
        }


@router.get("/users")
async def get_all_users():
    with db_session() as conn:
        rows = conn.execute(
            "SELECT id, name, email, role, location, crop_type, soil_type FROM users ORDER BY id DESC"
        ).fetchall()
        return [
            {
                "id": f"#U{r['id']:03d}",
                "name": r["name"],
                "email": r["email"],
                "role": "Admin" if r["role"] == "admin" else "Farmer",
                "location": r["location"] or "Ahmedabad, Gujarat",
                "status": "Active",
                "crop": r["crop_type"] or "Tomato",
                "soil": r["soil_type"] or "Loamy Soil",
                "phone": "+91 98765 43210",
            }
            for r in rows
        ]


@router.post("/users")
async def add_user(user: dict):
    with db_session() as conn:
        email = user.get("email")
        existing = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="User with this email already exists")
        
        name = user.get("name", "Farmer")
        role_val = "admin" if user.get("role", "").lower() == "admin" else "farmer"
        loc = user.get("location", "Ahmedabad, Gujarat")
        crop = user.get("crop", "Tomato")
        soil = user.get("soil", "Loamy Soil")
        pw_hash = bcrypt.hashpw(b"Farmer@123", bcrypt.gensalt()).decode("utf-8")
        cur = conn.execute(
            """
            INSERT INTO users (email, password_hash, name, role, crop_type, soil_type, location)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (email, pw_hash, name, role_val, crop, soil, loc)
        )
        conn.commit()
        new_id = cur.lastrowid
        return {
            "id": f"#U{new_id:03d}",
            "name": name,
            "email": email,
            "role": user.get("role", "Farmer"),
            "location": loc,
            "status": "Active",
            "crop": crop,
            "soil": soil,
            "phone": user.get("phone", "+91 98765 43210"),
        }


@router.delete("/users/{user_id}")
async def delete_user(user_id: str):
    clean_id = user_id.replace("#U", "").lstrip("0") or "0"
    try:
        uid = int(clean_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    with db_session() as conn:
        conn.execute("DELETE FROM users WHERE id = ?", (uid,))
        conn.commit()
        return {"status": "success", "deleted_id": user_id}


# ─── Irrigation Log CRUD ──────────────────────────────────────────────────────

@router.get("/irrigation")
async def get_irrigation_schedule():
    """Return all irrigation_log rows, newest first."""
    with db_session() as conn:
        rows = conn.execute(
            "SELECT * FROM irrigation_log ORDER BY created_at DESC"
        ).fetchall()
        return [
            {
                "id": r["id"],
                "farm": r["farm"],
                "crop": r["crop"],
                "scheduledDate": r["scheduled_date"],
                "recommendedLiters": r["recommended_liters"],
                "actualLiters": r["actual_liters"],
                "durationHours": r["duration_hours"],
                "method": r["method"],
                "status": r["status"],
                "reason": r["recommendation_reason"],
                "triggeredBy": r["triggered_by"],
                "createdAt": r["created_at"],
            }
            for r in rows
        ]


@router.post("/irrigation")
async def create_irrigation_entry(body: dict):
    """Insert a new irrigation_log row; return the created row with its real id."""
    farm = body.get("farm", "")
    if not farm:
        raise HTTPException(status_code=400, detail="'farm' field is required")

    crop = body.get("crop")
    date = body.get("date") or body.get("scheduledDate")
    recommended_liters = int(body.get("recommendedLiters", 0) or 0)
    actual_liters = int(body.get("actualLiters", 0) or 0)
    duration_hours = float(body.get("durationHours", 0) or 0)
    method = body.get("method", "Drip System")
    status = body.get("status", "Scheduled")
    reason = body.get("reason") or body.get("recommendationReason")
    triggered_by = body.get("triggeredBy", "manual")

    with db_session() as conn:
        cur = conn.execute(
            """
            INSERT INTO irrigation_log
                (farm, crop, scheduled_date, recommended_liters, actual_liters,
                 duration_hours, method, status, recommendation_reason, triggered_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (farm, crop, date, recommended_liters, actual_liters,
             duration_hours, method, status, reason, triggered_by),
        )
        conn.commit()
        new_id = cur.lastrowid
        row = conn.execute(
            "SELECT * FROM irrigation_log WHERE id = ?", (new_id,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=500, detail="Failed to retrieve created row")
        return {
            "id": row["id"],
            "farm": row["farm"],
            "crop": row["crop"],
            "scheduledDate": row["scheduled_date"],
            "recommendedLiters": row["recommended_liters"],
            "actualLiters": row["actual_liters"],
            "durationHours": row["duration_hours"],
            "method": row["method"],
            "status": row["status"],
            "reason": row["recommendation_reason"],
            "triggeredBy": row["triggered_by"],
            "createdAt": row["created_at"],
        }


@router.patch("/irrigation/{entry_id}")
async def update_irrigation_entry(entry_id: int, body: dict):
    """Update status, actualLiters, durationHours, and/or method on one row."""
    with db_session() as conn:
        existing = conn.execute(
            "SELECT id FROM irrigation_log WHERE id = ?", (entry_id,)
        ).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Irrigation entry not found")

        updates = []
        values = []
        if "status" in body:
            updates.append("status = ?")
            values.append(body["status"])
        if "actualLiters" in body:
            updates.append("actual_liters = ?")
            values.append(int(body["actualLiters"]))
        if "durationHours" in body:
            updates.append("duration_hours = ?")
            values.append(float(body["durationHours"]))
        if "method" in body:
            updates.append("method = ?")
            values.append(body["method"])

        if not updates:
            raise HTTPException(status_code=400, detail="No updatable fields provided")

        values.append(entry_id)
        conn.execute(
            f"UPDATE irrigation_log SET {', '.join(updates)} WHERE id = ?",
            tuple(values),
        )
        conn.commit()

        updated = conn.execute(
            "SELECT * FROM irrigation_log WHERE id = ?", (entry_id,)
        ).fetchone()
        return {
            "id": updated["id"],
            "farm": updated["farm"],
            "crop": updated["crop"],
            "scheduledDate": updated["scheduled_date"],
            "recommendedLiters": updated["recommended_liters"],
            "actualLiters": updated["actual_liters"],
            "durationHours": updated["duration_hours"],
            "method": updated["method"],
            "status": updated["status"],
            "reason": updated["recommendation_reason"],
            "triggeredBy": updated["triggered_by"],
            "createdAt": updated["created_at"],
        }


@router.delete("/irrigation/{entry_id}")
async def delete_irrigation_entry(entry_id: int):
    """Delete a single irrigation_log row."""
    with db_session() as conn:
        existing = conn.execute(
            "SELECT id FROM irrigation_log WHERE id = ?", (entry_id,)
        ).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Irrigation entry not found")
        conn.execute("DELETE FROM irrigation_log WHERE id = ?", (entry_id,))
        conn.commit()
        return {"status": "success", "deletedId": entry_id}


@router.get("/irrigation/usage-summary")
async def get_irrigation_usage_summary(days: int = 30):
    """
    Aggregate COMPLETED irrigation_log rows over the past `days` days.
    All numbers come from real actual_liters recorded when a cycle is marked
    Completed — never from estimates or fabricated defaults.
    """
    with db_session() as conn:
        from datetime import datetime, timedelta
        cutoff = datetime.now() - timedelta(days=days)
        cutoff_str = cutoff.strftime('%Y-%m-%d %H:%M:%S')

        completed = conn.execute(
            "SELECT farm, crop, actual_liters, recommended_liters, duration_hours, "
            "status, scheduled_date, created_at FROM irrigation_log "
            "WHERE status = 'Completed' AND created_at >= ? "
            "ORDER BY created_at ASC",
            (cutoff_str,),
        ).fetchall()

        total_liters = sum(r["actual_liters"] or 0 for r in completed)
        total_hours = sum(r["duration_hours"] or 0 for r in completed)
        total_recommended = sum(r["recommended_liters"] or 0 for r in completed)
        cycle_count = len(completed)

        # Real daily breakdown grouped by created_at date
        daily_totals: dict = {}
        for r in completed:
            day_key = (r["created_at"] or "")[:10]   # YYYY-MM-DD
            daily_totals[day_key] = daily_totals.get(day_key, 0) + (r["actual_liters"] or 0)
        daily_series = [{"date": d, "liters": v} for d, v in sorted(daily_totals.items())]

        variance_pct = None
        if total_recommended > 0:
            variance_pct = round(
                ((total_liters - total_recommended) / total_recommended) * 100, 1
            )

        by_crop: dict = {}
        for r in completed:
            key = r["crop"] or "Unspecified"
            by_crop[key] = by_crop.get(key, 0) + (r["actual_liters"] or 0)

        return {
            "periodDays": days,
            "totalLitersUsed": total_liters,
            "totalHoursRun": round(total_hours, 1),
            "totalRecommendedLiters": total_recommended,
            "variancePercent": variance_pct,
            "cyclesCompleted": cycle_count,
            "dailySeries": daily_series,
            "byCrop": [{"crop": k, "liters": v} for k, v in by_crop.items()],
            "generatedAt": datetime.now(timezone.utc).isoformat(),
        }
