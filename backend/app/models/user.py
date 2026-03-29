"""
models/user.py
OOPs: Inheritance — UserInDB extends BaseDocument
Syllabus Unit 2: Classes, Encapsulation, Inheritance
"""
from typing import Optional, Literal
from pydantic import EmailStr, Field
from app.models.base import BaseDocument


# ── Pydantic schemas used across the app ──────────────────────────────────────

class UserCreate(BaseDocument):
    """Schema for registering a new user."""
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)


class UserLogin(BaseDocument):
    """Schema for login request."""
    email: EmailStr
    password: str


class UserInDB(BaseDocument):
    """
    Full user document stored in MongoDB.
    Encapsulation: hashed_password is never exposed in API responses.
    Inheritance: extends BaseDocument → gets id, created_at, updated_at.
    """
    name: str
    email: EmailStr
    hashed_password: str          # ← encapsulated; excluded from responses
    role: Literal["user", "admin"] = "user"
    is_active: bool = True


class UserResponse(BaseDocument):
    """Safe public representation — hashed_password intentionally excluded."""
    name: str
    email: EmailStr
    role: Literal["user", "admin"] = "user"
    is_active: bool = True


class TokenResponse(BaseDocument):
    """JWT token response payload."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
