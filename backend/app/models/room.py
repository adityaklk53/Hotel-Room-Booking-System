"""
models/room.py
OOPs: Inheritance — RoomInDB extends BaseDocument
Syllabus: MongoDB CRUD operations, Pydantic validation
"""
from typing import Optional, Literal, List
from pydantic import Field
from app.models.base import BaseDocument


class RoomBase(BaseDocument):
    """Shared room fields — base for create/update/response."""
    name: str = Field(..., min_length=2, max_length=100)
    room_type: Literal["standard", "deluxe", "suite"] = Field(..., alias="type")
    description: str = Field(..., min_length=10)
    price_per_night: float = Field(..., gt=0, description="Price in INR per night")
    capacity: int = Field(..., ge=1, le=10)
    amenities: List[str] = []
    images: List[str] = []
    is_available: bool = True

    model_config = RoomBase.model_config if hasattr(BaseDocument, 'model_config') else {}


class RoomCreate(BaseDocument):
    """Schema for creating a new room (admin only)."""
    name: str = Field(..., min_length=2, max_length=100)
    room_type: str = Field(..., alias="type")
    description: str = Field(..., min_length=10)
    price_per_night: float = Field(..., gt=0)
    capacity: int = Field(..., ge=1, le=10)
    amenities: List[str] = []
    images: List[str] = []
    is_available: bool = True


class RoomUpdate(BaseDocument):
    """Partial update schema — all fields optional."""
    name: Optional[str] = None
    room_type: Optional[str] = Field(default=None, alias="type")
    description: Optional[str] = None
    price_per_night: Optional[float] = None
    capacity: Optional[int] = None
    amenities: Optional[List[str]] = None
    images: Optional[List[str]] = None
    is_available: Optional[bool] = None


class RoomInDB(BaseDocument):
    """
    Full room document as stored in MongoDB.
    Inheritance: extends BaseDocument → gets id, timestamps.
    """
    name: str
    room_type: str
    description: str
    price_per_night: float
    capacity: int
    amenities: List[str] = []
    images: List[str] = []
    is_available: bool = True
