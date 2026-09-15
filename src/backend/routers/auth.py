"""Minimal local authentication for the AgriSmart demo application."""

import hashlib
import hmac
import secrets
import sqlite3
from contextlib import contextmanager
from pathlib import Path

import bcrypt
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()

from db import db_session as _connection


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(4)).decode("utf-8")


def _verify_password(password: str, password_hash: str, salt: str | None) -> tuple[bool, bool]:
    """Return (valid, needs_bcrypt_upgrade).

    The legacy SHA-256 branch only upgrades existing local demo accounts after a
    successful login. Every newly registered password is bcrypt-hashed.
    """
    if password_hash.startswith("$2"):
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8")), False
    if not salt:
        return False, False
    legacy_hash = hashlib.sha256((password + salt).encode("utf-8")).hexdigest()
    return hmac.compare_digest(legacy_hash, password_hash), True


def _create_session(conn, user_id: int) -> str:
    """Create a server-stored opaque session token without storing it in plaintext."""
    token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    conn.execute(
        "INSERT INTO sessions (token_hash, user_id) VALUES (?, ?)",
        (token_hash, user_id),
    )
    return token


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=8, max_length=128)
    cropType: str | None = None
    soilType: str | None = None
    location: str | None = None


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=1, max_length=128)


def _normalise_email(email: str) -> str:
    return email.strip().lower()


@router.post("/register")
async def register(req: RegisterRequest):
    name = req.name.strip()
    email = _normalise_email(req.email)
    if not name or "@" not in email:
        raise HTTPException(status_code=422, detail="Enter a valid name and email address.")

    crop_type = req.cropType or "Tomato"
    soil_type = req.soilType or "Loamy Soil"
    loc = req.location or "Ahmedabad, Gujarat"

    with _connection() as conn:
        if conn.execute("SELECT 1 FROM users WHERE email = ?", (email,)).fetchone():
            raise HTTPException(status_code=409, detail="Email already registered")
        cursor = conn.execute(
            "INSERT INTO users (name, email, password_hash, salt, role, crop_type, soil_type, location) VALUES (?, ?, ?, NULL, ?, ?, ?, ?)",
            (name, email, _hash_password(req.password), "farmer", crop_type, soil_type, loc),
        )
        token = _create_session(conn, cursor.lastrowid)

    return {
        "accessToken": token,
        "user": {
            "name": name,
            "email": email,
            "role": "farmer",
            "cropType": crop_type,
            "soilType": soil_type,
            "location": loc,
        },
    }


@router.post("/login")
async def login(req: LoginRequest):
    email = _normalise_email(req.email)
    with _connection() as conn:
        user = conn.execute(
            "SELECT id, name, email, password_hash, salt, role, crop_type, soil_type, location FROM users WHERE email = ?", (email,)
        ).fetchone()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        valid, needs_upgrade = _verify_password(req.password, user["password_hash"], user["salt"])
        if not valid:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        if needs_upgrade:
            conn.execute(
                "UPDATE users SET password_hash = ?, salt = NULL WHERE id = ?",
                (_hash_password(req.password), user["id"]),
            )
        token = _create_session(conn, user["id"])

    return {
        "accessToken": token,
        "user": {
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "cropType": user["crop_type"] or "Tomato",
            "soilType": user["soil_type"] or "Loamy Soil",
            "location": user["location"] or "Ahmedabad, Gujarat",
        },
    }
