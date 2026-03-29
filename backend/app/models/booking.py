"""
models/booking.py
OOPs: Inheritance — BookingInDB extends BaseDocument
Syllabus: RESTful API design, MongoDB CRUD
"""
from datetime import date
from typing import Optional, Literal
from pydantic import Field, model_validator
from app.models.base import BaseDocument


class BookingCreate(BaseDocument):
    """Request schema for creating a booking."""
    room_id: str
    check_in: date
    check_out: date
    guests: int = Field(..., ge=1)
    special_requests: Optional[str] = Field(default=None, max_length=500)

    @model_validator(mode="after")
    def check_dates(self):
        """Exception handling: validate checkout is after checkin."""
        if self.check_out <= self.check_in:
            raise ValueError("check_out must be after check_in")
        return self


class BookingInDB(BaseDocument):
    """
    Full booking document stored in MongoDB.
    Inheritance: extends BaseDocument → gets id, timestamps.
    """
    user_id: str
    room_id: str
    check_in: date
    check_out: date
    guests: int
    total_price: float
    status: Literal["pending", "confirmed", "cancelled", "completed"] = "pending"
    special_requests: Optional[str] = None


class BookingResponse(BaseDocument):
    """Booking response enriched with room & user info."""
    user_id: str
    room_id: str
    check_in: date
    check_out: date
    guests: int
    total_price: float
    status: str
    special_requests: Optional[str] = None
    room_name: Optional[str] = None
    room_type: Optional[str] = None
    room_image: Optional[str] = None


class BookingStatusUpdate(BaseDocument):
    """Admin-only status change."""
    status: Literal["pending", "confirmed", "cancelled", "completed"]
