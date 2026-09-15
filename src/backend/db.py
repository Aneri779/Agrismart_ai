"""
AgriSmart AI — Unified Database Engine
Supports both PostgreSQL (via psycopg2) and SQLite with automatic schema creation,
connection pooling, query placeholder normalization, and DictRow access.
"""

import os
import sys
import sqlite3
import bcrypt
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Optional, Dict, List, Tuple
from dotenv import load_dotenv

# Ensure .env is loaded
_BACKEND_DIR = Path(__file__).resolve().parent
_REPO_ROOT = _BACKEND_DIR.parent
load_dotenv(_BACKEND_DIR / ".env")
load_dotenv(_REPO_ROOT / ".env")

SQLITE_PATH = _BACKEND_DIR / "users.db"


class DictRow(dict):
    """Row wrapper that supports both key access (row['col']) and index access (row[0])."""
    def __init__(self, data: Dict[str, Any]):
        super().__init__(data)
        self._vals = list(data.values())

    def __getitem__(self, key: Any) -> Any:
        if isinstance(key, int):
            return self._vals[key]
        return super().__getitem__(key)


class DbCursorWrapper:
    """Cursor wrapper that normalizes query placeholders (? vs %s) and returns DictRow."""
    def __init__(self, cursor, is_postgres: bool = False):
        self.cursor = cursor
        self.is_postgres = is_postgres
        self.lastrowid = None

    def execute(self, sql: str, params: Optional[Tuple] = None):
        if self.is_postgres:
            # Convert SQLite-style ? placeholders to PostgreSQL %s
            if "?" in sql:
                sql = sql.replace("?", "%s")
            # If INSERT into users without RETURNING, append RETURNING id to capture lastrowid
            sql_stripped = sql.strip().rstrip(";")
            if sql_stripped.upper().startswith("INSERT INTO USERS") and "RETURNING" not in sql_stripped.upper():
                sql = sql_stripped + " RETURNING id"
                self.cursor.execute(sql, params or ())
                ret = self.cursor.fetchone()
                if ret:
                    self.lastrowid = ret.get("id") if isinstance(ret, dict) else ret[0]
                return self

        self.cursor.execute(sql, params or ())
        if not self.is_postgres:
            self.lastrowid = getattr(self.cursor, "lastrowid", None)
        return self

    def fetchone(self) -> Optional[DictRow]:
        row = self.cursor.fetchone()
        if row is None:
            return None
        if isinstance(row, dict):
            return DictRow(row)
        if isinstance(row, sqlite3.Row):
            return DictRow(dict(row))
        if getattr(self.cursor, "description", None):
            cols = [col[0] for col in self.cursor.description]
            return DictRow(dict(zip(cols, row)))
        return row

    def fetchall(self) -> List[DictRow]:
        rows = self.cursor.fetchall()
        if not rows:
            return []
        res = []
        for row in rows:
            if isinstance(row, dict):
                res.append(DictRow(row))
            elif isinstance(row, sqlite3.Row):
                res.append(DictRow(dict(row)))
            elif getattr(self.cursor, "description", None):
                cols = [col[0] for col in self.cursor.description]
                res.append(DictRow(dict(zip(cols, row))))
            else:
                res.append(row)
        return res

    @property
    def rowcount(self):
        return self.cursor.rowcount


class DbConnectionWrapper:
    """Connection wrapper providing a uniform interface for SQLite and PostgreSQL."""
    def __init__(self, raw_conn, is_postgres: bool = False, engine_name: str = "sqlite"):
        self.raw_conn = raw_conn
        self.is_postgres = is_postgres
        self.engine_name = engine_name

    def cursor(self):
        if self.is_postgres:
            import psycopg2.extras
            return DbCursorWrapper(self.raw_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor), is_postgres=True)
        else:
            return DbCursorWrapper(self.raw_conn.cursor(), is_postgres=False)

    def execute(self, sql: str, params: Optional[Tuple] = None):
        cur = self.cursor()
        cur.execute(sql, params)
        return cur
        
    def commit(self):
        self.raw_conn.commit()

    def rollback(self):
        self.raw_conn.rollback()

    def close(self):
        self.raw_conn.close()


_PG_SERVER = None


def is_postgres_configured() -> bool:
    return True


def get_connection() -> DbConnectionWrapper:
    global _PG_SERVER
    #    # URL-encoded the @ symbol in your password as %40
    db_url = "postgresql://postgres:Admin%40123@localhost:5432/postgres"

    import psycopg2
    try:
        conn = psycopg2.connect(db_url)
        # We print this once on startup to confirm it's working
        if getattr(get_connection, "has_printed", False) is False:
            print("[AgriSmart DB] Successfully connected to PostgreSQL!")
            get_connection.has_printed = True
        return DbConnectionWrapper(conn, is_postgres=True, engine_name="postgresql")
    except Exception as e:
        print(f"[AgriSmart DB] Custom PostgreSQL failed ({e}). Falling back to SQLite.", file=sys.stderr)

    # Fallback: SQLite
    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    return DbConnectionWrapper(conn, is_postgres=False, engine_name="sqlite")


@contextmanager
def db_session():
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def get_active_engine() -> str:
    with db_session() as conn:
        return "postgresql" if conn.is_postgres else "sqlite"


def init_db():
    """Initializes tables for either PostgreSQL or SQLite."""
    with db_session() as conn:
        if conn.is_postgres:
            conn.execute(
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
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS sessions (
                    token_hash TEXT PRIMARY KEY,
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                """
            )
            conn.execute(
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
                    diagnosis_source TEXT DEFAULT 'ml_model',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS irrigation_log (
                    id SERIAL PRIMARY KEY,
                    farm TEXT NOT NULL,
                    crop TEXT,
                    scheduled_date TEXT,
                    recommended_liters INTEGER DEFAULT 0,
                    actual_liters INTEGER DEFAULT 0,
                    duration_hours REAL DEFAULT 0,
                    method TEXT DEFAULT 'Drip System',
                    status TEXT NOT NULL DEFAULT 'Scheduled',
                    recommendation_reason TEXT,
                    triggered_by TEXT DEFAULT 'manual',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                """
            )
        else:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS sessions (
                    token_hash TEXT PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                );
                """
            )
            conn.execute(
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
                    diagnosis_source TEXT DEFAULT 'ml_model',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS irrigation_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    farm TEXT NOT NULL,
                    crop TEXT,
                    scheduled_date TEXT,
                    recommended_liters INTEGER DEFAULT 0,
                    actual_liters INTEGER DEFAULT 0,
                    duration_hours REAL DEFAULT 0,
                    method TEXT DEFAULT 'Drip System',
                    status TEXT NOT NULL DEFAULT 'Scheduled',
                    recommendation_reason TEXT,
                    triggered_by TEXT DEFAULT 'manual',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                """
            )

        # Ensure diagnosis_source column exists in scans table (migration for existing DBs)
        try:
            if conn.is_postgres:
                conn.execute("SAVEPOINT alter_scans")
            conn.execute("ALTER TABLE scans ADD COLUMN diagnosis_source TEXT DEFAULT 'ml_model'")
            if conn.is_postgres:
                conn.execute("RELEASE SAVEPOINT alter_scans")
        except Exception:
            if conn.is_postgres:
                conn.execute("ROLLBACK TO SAVEPOINT alter_scans")

        # Seed default admin user if none exists
        admin_email = "admin@agrismart.ai"
        admin = conn.execute("SELECT id FROM users WHERE email = ?", (admin_email,)).fetchone()
        if not admin:
            pw_hash = bcrypt.hashpw(b"Admin@123", bcrypt.gensalt()).decode("utf-8")
            conn.execute(
                """
                INSERT INTO users (name, email, password_hash, salt, role, crop_type, soil_type, location)
                VALUES (?, ?, ?, NULL, ?, ?, ?, ?)
                """,
                ("Admin", admin_email, pw_hash, "admin", "Tomato", "Loamy Soil", "Ahmedabad, Gujarat"),
            )


# Initialize DB on module load
init_db()

