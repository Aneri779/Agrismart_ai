"""
AgriSmart AI — SQLite to PostgreSQL Migration Tool
Transfers all existing users (including Mira Patel), sessions, and leaf scan records
from SQLite (backend/users.db) to PostgreSQL.

Usage:
    python migrate_sqlite_to_postgres.py
"""
import os
import sys
import sqlite3
import psycopg2
from pathlib import Path
from dotenv import load_dotenv

# Path and environment resolution
_BACKEND_DIR = Path(__file__).resolve().parent
_REPO_ROOT = _BACKEND_DIR.parent
load_dotenv(_BACKEND_DIR / ".env")
load_dotenv(_REPO_ROOT / ".env")

SQLITE_PATH = _BACKEND_DIR / "users.db"
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()


def run_migration():
    if not SQLITE_PATH.exists():
        print(f"[ERROR] SQLite database file not found at: {SQLITE_PATH}")
        sys.exit(1)

    # URL-encoded the @ symbol in your password as %40
    url = "postgresql://postgres:Admin%40123@localhost:5432/postgres"

    print(f"[*] Connecting to PostgreSQL...")
    try:
        pg_conn = psycopg2.connect(url)
    except Exception as e:
        print(f"[ERROR] Could not connect to PostgreSQL: {e}")
        sys.exit(1)

    print(f"[*] Connecting to source SQLite database: {SQLITE_PATH}")
    sqlite_conn = sqlite3.connect(SQLITE_PATH)
    sqlite_conn.row_factory = sqlite3.Row

    pg_cur = pg_conn.cursor()

    # 1. Ensure tables exist in PostgreSQL
    print("[*] Ensuring PostgreSQL tables exist...")
    pg_cur.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            salt TEXT,
            role TEXT NOT NULL DEFAULT 'farmer',
            crop_type TEXT,
            soil_type TEXT,
            location TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
    )
    pg_cur.execute(
        """
        CREATE TABLE IF NOT EXISTS sessions (
            token_hash TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
    )
    pg_cur.execute(
        """
        CREATE TABLE IF NOT EXISTS scans (
            id TEXT PRIMARY KEY,
            crop TEXT NOT NULL,
            disease TEXT NOT NULL,
            confidence INTEGER NOT NULL,
            severity TEXT NOT NULL,
            status TEXT NOT NULL,
            symptoms TEXT,
            recommendations TEXT,
            sustainability_score INTEGER,
            image_url TEXT,
            date TEXT,
            farm_context TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
    )

    # 2. Migrate Users
    users = sqlite_conn.execute("SELECT * FROM users").fetchall()
    print(f"[*] Migrating {len(users)} users from SQLite to PostgreSQL...")
    for u in users:
        created_at = u["created_at"] if "created_at" in u.keys() else None
        pg_cur.execute(
            """
            INSERT INTO users (id, name, email, password_hash, salt, role, crop_type, soil_type, location, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, COALESCE(%s, CURRENT_TIMESTAMP))
            ON CONFLICT (email) DO UPDATE SET
                name = EXCLUDED.name,
                password_hash = EXCLUDED.password_hash,
                role = EXCLUDED.role,
                crop_type = EXCLUDED.crop_type,
                soil_type = EXCLUDED.soil_type,
                location = EXCLUDED.location;
            """,
            (
                u["id"], u["name"], u["email"], u["password_hash"],
                u["salt"], u["role"], u["crop_type"], u["soil_type"],
                u["location"], created_at
            )
        )
        print(f"    [OK] User '{u['name']}' ({u['email']}) migrated.")

    # Synchronize users_id_seq
    pg_cur.execute("SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));")

    # 3. Migrate Sessions
    sessions = sqlite_conn.execute("SELECT * FROM sessions").fetchall()
    print(f"[*] Migrating {len(sessions)} sessions...")
    for s in sessions:
        pg_cur.execute(
            """
            INSERT INTO sessions (token_hash, user_id, created_at)
            VALUES (%s, %s, %s)
            ON CONFLICT (token_hash) DO NOTHING;
            """,
            (s["token_hash"], s["user_id"], s["created_at"])
        )

    # 4. Migrate Scans
    scans = sqlite_conn.execute("SELECT * FROM scans").fetchall()
    print(f"[*] Migrating {len(scans)} scan records...")
    for sc in scans:
        pg_cur.execute(
            """
            INSERT INTO scans (
                id, crop, disease, confidence, severity, status,
                symptoms, recommendations, sustainability_score, image_url,
                date, farm_context, created_at
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE SET
                crop = EXCLUDED.crop,
                disease = EXCLUDED.disease,
                status = EXCLUDED.status,
                image_url = EXCLUDED.image_url;
            """,
            (
                sc["id"], sc["crop"], sc["disease"], sc["confidence"],
                sc["severity"], sc["status"], sc["symptoms"],
                sc["recommendations"], sc["sustainability_score"],
                sc["image_url"], sc["date"], sc["farm_context"],
                sc["created_at"]
            )
        )
        print(f"    [OK] Scan '{sc['id']}' ({sc['crop']} - {sc['disease']}) migrated.")

    pg_conn.commit()
    pg_cur.close()
    pg_conn.close()
    sqlite_conn.close()
    print("\n[SUCCESS] All data has been successfully migrated from SQLite to PostgreSQL!")


if __name__ == "__main__":
    run_migration()
