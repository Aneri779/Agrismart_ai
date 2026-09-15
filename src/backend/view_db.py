"""
AgriSmart AI — PostgreSQL Database Viewer
Inspect all tables and records directly from your terminal.

Usage:
    python backend/view_db.py
"""
import sys
from pathlib import Path

# Add backend directory to sys.path
_BACKEND_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(_BACKEND_DIR))

try:
    import pgserver
    from db import get_connection

    conn = get_connection()
    srv = pgserver.get_server(str(_BACKEND_DIR / "pg_data"))
    info = srv.get_postmaster_info()

    print("=" * 70)
    print("           AGRISMART AI — POSTGRESQL DATABASE INSPECTOR")
    print("=" * 70)
    print(f"[*] Engine:       PostgreSQL 16.2 (Active)")
    print(f"[*] Host:         {info.hostname}")
    print(f"[*] Port:         {info.port}")
    print(f"[*] Database:     postgres")
    print(f"[*] User:         postgres")
    print(f"[*] Connection:   {srv.get_uri()}")
    print("=" * 70)

    print("\n--- [TABLE: users] ---")
    print(srv.psql("SELECT id, name, email, role, location, crop_type, soil_type FROM users ORDER BY id ASC;"))

    print("--- [TABLE: scans] ---")
    print(srv.psql("SELECT id, crop, disease, status, confidence, severity, date FROM scans ORDER BY created_at DESC;"))

    print("=" * 70)
    print("TIP: You can also connect external tools (like DBeaver or pgAdmin) using:")
    print(f"     Host: {info.hostname} | Port: {info.port} | User: postgres | Database: postgres")
    print("=" * 70)

except Exception as e:
    print(f"[Error viewing database]: {e}")

if __name__ == "__main__":
    pass
