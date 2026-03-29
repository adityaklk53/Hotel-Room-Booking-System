"""
controllers/booking_controller.py
CRUD operations for bookings (syllabus: MongoDB CRUD, RESTful API Unit 6)
OOPs: Encapsulation, Exception Handling (Unit 2)
"""
from datetime import datetime, timezone, date
from typing import List, Optional
from bson import ObjectId
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.booking import BookingCreate, BookingInDB, BookingStatusUpdate


def _serialize(doc: dict) -> dict:
    doc["_id"] = str(doc["_id"])
    if "check_in" in doc and isinstance(doc["check_in"], datetime):
        doc["check_in"] = doc["check_in"].date().isoformat()
    if "check_out" in doc and isinstance(doc["check_out"], datetime):
        doc["check_out"] = doc["check_out"].date().isoformat()
    return doc


class BookingController:
    """
    OOPs: Encapsulation — all booking DB logic lives here.
    Exception Handling: every error case raises explicit HTTPException.
    """

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db["bookings"]

    async def create(self, data: BookingCreate, user_id: str) -> dict:
        """
        POST /api/v1/bookings
        Validates room availability, calculates price, creates booking.
        """
        # 1. Validate room exists
        try:
            room_oid = ObjectId(data.room_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid room ID")

        room = await self.db["rooms"].find_one({"_id": room_oid})
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
        if not room.get("is_available", True):
            raise HTTPException(status_code=400, detail="Room is not available for booking")

        # 2. Validate guest count
        if data.guests > room.get("capacity", 1):
            raise HTTPException(
                status_code=400,
                detail=f"Room capacity is {room['capacity']} guests maximum"
            )

        # 3. Check date conflicts (Exception Handling)
        ci_str = data.check_in.isoformat()
        co_str = data.check_out.isoformat()
        conflict = await self.collection.find_one({
            "room_id": data.room_id,
            "status": {"$in": ["pending", "confirmed"]},
            "$or": [{"check_in": {"$lt": co_str}, "check_out": {"$gt": ci_str}}],
        })
        if conflict:
            raise HTTPException(status_code=409, detail="Room already booked for selected dates")

        # 4. Calculate total price
        nights = (data.check_out - data.check_in).days
        if nights < 1:
            raise HTTPException(status_code=400, detail="Minimum stay is 1 night")
        total_price = nights * room["price_per_night"]

        now = datetime.now(timezone.utc)
        doc = {
            "user_id": user_id,
            "room_id": data.room_id,
            "check_in": ci_str,
            "check_out": co_str,
            "guests": data.guests,
            "total_price": total_price,
            "status": "pending",
            "special_requests": data.special_requests,
            "room_name": room.get("name"),
            "room_type": room.get("room_type"),
            "room_image": room.get("images", [None])[0],
            "created_at": now,
            "updated_at": now,
        }
        result = await self.collection.insert_one(doc)
        created = await self.collection.find_one({"_id": result.inserted_id})
        return _serialize(created)

    async def get_user_bookings(self, user_id: str) -> List[dict]:
        """GET /api/v1/bookings/my — current user's bookings."""
        cursor = self.collection.find({"user_id": user_id}).sort("created_at", -1)
        docs = await cursor.to_list(length=100)
        return [_serialize(d) for d in docs]

    async def get_all(self) -> List[dict]:
        """GET /api/v1/bookings — admin: all bookings."""
        cursor = self.collection.find().sort("created_at", -1)
        docs = await cursor.to_list(length=500)
        return [_serialize(d) for d in docs]

    async def cancel(self, booking_id: str, user_id: str, role: str) -> dict:
        """PATCH /api/v1/bookings/{id}/cancel — user cancels own, admin cancels any."""
        booking = await self._get_or_404(booking_id)
        if role != "admin" and booking["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorised to cancel this booking")
        if booking["status"] == "cancelled":
            raise HTTPException(status_code=400, detail="Booking already cancelled")
        await self.collection.update_one(
            {"_id": ObjectId(booking_id)},
            {"$set": {"status": "cancelled", "updated_at": datetime.now(timezone.utc)}}
        )
        return await self._get_or_404(booking_id)

    async def update_status(self, booking_id: str, data: BookingStatusUpdate) -> dict:
        """PATCH /api/v1/bookings/{id}/status — admin only."""
        await self._get_or_404(booking_id)
        await self.collection.update_one(
            {"_id": ObjectId(booking_id)},
            {"$set": {"status": data.status, "updated_at": datetime.now(timezone.utc)}}
        )
        return await self._get_or_404(booking_id)

    async def _get_or_404(self, booking_id: str) -> dict:
        try:
            oid = ObjectId(booking_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid booking ID")
        doc = await self.collection.find_one({"_id": oid})
        if not doc:
            raise HTTPException(status_code=404, detail="Booking not found")
        return _serialize(doc)
