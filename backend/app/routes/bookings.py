"""
routes/bookings.py
RESTful endpoints for bookings (syllabus: Unit 6 — HTTP methods, status codes)
"""
from fastapi import APIRouter, Depends
from app.controllers.booking_controller import BookingController
from app.models.booking import BookingCreate, BookingStatusUpdate
from app.config.database import get_database
from app.middleware.auth import get_current_user, require_admin

router = APIRouter(prefix="/api/v1/bookings", tags=["Bookings"])


def get_booking_ctrl():
    return BookingController(get_database())


@router.post("/", status_code=201)
async def create_booking(
    data: BookingCreate,
    ctrl: BookingController = Depends(get_booking_ctrl),
    current_user: dict = Depends(get_current_user),
):
    """POST create a new booking."""
    booking = await ctrl.create(data, str(current_user["_id"]))
    return {"data": booking, "message": "Booking created successfully"}


@router.get("/my")
async def my_bookings(
    ctrl: BookingController = Depends(get_booking_ctrl),
    current_user: dict = Depends(get_current_user),
):
    """GET current user's bookings."""
    bookings = await ctrl.get_user_bookings(str(current_user["_id"]))
    return {"data": bookings, "count": len(bookings)}


@router.get("/")
async def all_bookings(
    ctrl: BookingController = Depends(get_booking_ctrl),
    _admin: dict = Depends(require_admin),
):
    """GET all bookings — admin only."""
    bookings = await ctrl.get_all()
    return {"data": bookings, "count": len(bookings)}


@router.patch("/{booking_id}/cancel")
async def cancel_booking(
    booking_id: str,
    ctrl: BookingController = Depends(get_booking_ctrl),
    current_user: dict = Depends(get_current_user),
):
    """PATCH cancel a booking."""
    booking = await ctrl.cancel(booking_id, str(current_user["_id"]), current_user["role"])
    return {"data": booking, "message": "Booking cancelled"}


@router.patch("/{booking_id}/status")
async def update_status(
    booking_id: str,
    data: BookingStatusUpdate,
    ctrl: BookingController = Depends(get_booking_ctrl),
    _admin: dict = Depends(require_admin),
):
    """PATCH update booking status — admin only."""
    booking = await ctrl.update_status(booking_id, data)
    return {"data": booking, "message": "Status updated"}
