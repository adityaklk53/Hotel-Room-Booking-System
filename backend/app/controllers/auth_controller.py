"""
controllers/auth_controller.py
Business logic for authentication (syllabus: Flask-Login equivalent, RESTful APIs)
OOPs: Encapsulation — passwords hashed before storage, never returned
Exception Handling: custom HTTP exceptions for all error cases
"""
from datetime import datetime, timezone
from bson import ObjectId
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.user import UserCreate, UserInDB, UserResponse, TokenResponse
from app.utils.hashing import hash_password, verify_password
from app.utils.jwt import create_access_token


class AuthController:
    """
    OOPs: Encapsulation — all auth logic lives inside this class.
    Polymorphism: methods handle different input shapes uniformly.
    """

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db["users"]

    async def register(self, data: UserCreate) -> TokenResponse:
        """Register a new user. Raises 409 if email already exists."""
        existing = await self.collection.find_one({"email": data.email})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )

        now = datetime.now(timezone.utc)
        user_doc = {
            "name": data.name,
            "email": data.email,
            "hashed_password": hash_password(data.password),
            "role": "user",
            "is_active": True,
            "created_at": now,
            "updated_at": now,
        }

        result = await self.collection.insert_one(user_doc)
        user_doc["_id"] = result.inserted_id

        return self._build_token_response(user_doc)

    async def login(self, email: str, password: str) -> TokenResponse:
        """Authenticate user and return JWT. Raises 401 on bad credentials."""
        user = await self.collection.find_one({"email": email})

        # Exception Handling: wrong email or password — same message (security)
        if not user or not verify_password(password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )

        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated",
            )

        return self._build_token_response(user)

    def _build_token_response(self, user: dict) -> TokenResponse:
        """Private helper — build TokenResponse from a user document."""
        token = create_access_token({"sub": str(user["_id"]), "role": user["role"]})
        user_resp = UserResponse(
            _id=str(user["_id"]),
            name=user["name"],
            email=user["email"],
            role=user["role"],
            is_active=user.get("is_active", True),
        )
        return TokenResponse(access_token=token, user=user_resp)
