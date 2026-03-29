"""
routes/auth.py
RESTful API endpoints for authentication (syllabus: Unit 6 RESTful APIs)
HTTP methods: POST for register/login, GET for profile
"""
from fastapi import APIRouter, Depends
from app.models.user import UserCreate, TokenResponse, UserResponse
from app.controllers.auth_controller import AuthController
from app.config.database import get_database
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


def get_auth_controller():
    db = get_database()
    return AuthController(db)


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(data: UserCreate, ctrl: AuthController = Depends(get_auth_controller)):
    """Register a new user account."""
    return await ctrl.register(data)


@router.post("/login", response_model=TokenResponse)
async def login(data: UserCreate, ctrl: AuthController = Depends(get_auth_controller)):
    """Login and receive a JWT token."""
    return await ctrl.login(data.email, data.password)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current authenticated user's profile."""
    return UserResponse(
        _id=str(current_user["_id"]),
        name=current_user["name"],
        email=current_user["email"],
        role=current_user["role"],
        is_active=current_user.get("is_active", True),
    )
