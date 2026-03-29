"""
controllers/room_controller.py
CRUD operations for hotel rooms (syllabus: MongoDB CRUD, RESTful API Unit 6)
OOPs: Encapsulation — DB logic inside controller class
Exception Handling: 404/400 raised explicitly
"""
from datetime import datetime, timezone
from typing import List, Optional
from bson import ObjectId
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.room import RoomCreate, RoomUpdate, RoomInDB


def _serialize_room(doc: dict) -> dict:
    """Convert MongoDB document to serialisable dict."""
    doc["_id"] = str(doc["_id"])
    return doc


class RoomController:
    """
    OOPs: Encapsulation — all room DB operations encapsulated here.
    Inheritance: methods share common _get_or_404 helper.
    """

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db["rooms"]

    async def get_all(
        self,
        check_in: Optional[str] = None,
        check_out: Optional[str] = None,
        room_type: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
    ) -> List[dict]:
        """
        List available rooms with optional filters.
        RESTful: GET /api/v1/rooms
        """
        query: dict = {"is_available": True}

        if room_type:
            query["room_type"] = room_type
        if min_price is not None or max_price is not None:
            query["price_per_night"] = {}
            if min_price is not None:
                query["price_per_night"]["$gte"] = min_price
            if max_price is not None:
                query["price_per_night"]["$lte"] = max_price

        # Exclude rooms with overlapping confirmed bookings
        if check_in and check_out:
            booked_ids = await self.db["bookings"].distinct(
                "room_id",
                {
                    "status": {"$in": ["pending", "confirmed"]},
                    "$or": [
                        {"check_in": {"$lt": check_out}, "check_out": {"$gt": check_in}}
                    ],
                },
            )
            if booked_ids:
                query["_id"] = {"$nin": [ObjectId(rid) for rid in booked_ids if ObjectId.is_valid(rid)]}

        cursor = self.collection.find(query)
        rooms = await cursor.to_list(length=100)
        return [_serialize_room(r) for r in rooms]

    async def get_by_id(self, room_id: str) -> dict:
        """GET /api/v1/rooms/{id} — raises 404 if not found."""
        return await self._get_or_404(room_id)

    async def create(self, data: RoomCreate) -> dict:
        """POST /api/v1/rooms — admin only."""
        now = datetime.now(timezone.utc)
        doc = data.model_dump(by_alias=True, exclude={"id", "created_at", "updated_at"})
        doc["created_at"] = now
        doc["updated_at"] = now
        result = await self.collection.insert_one(doc)
        created = await self.collection.find_one({"_id": result.inserted_id})
        return _serialize_room(created)

    async def update(self, room_id: str, data: RoomUpdate) -> dict:
        """PUT /api/v1/rooms/{id} — admin only."""
        await self._get_or_404(room_id)
        updates = {k: v for k, v in data.model_dump(by_alias=True, exclude_none=True).items()
                   if k not in ("_id", "created_at", "updated_at")}
        updates["updated_at"] = datetime.now(timezone.utc)
        await self.collection.update_one({"_id": ObjectId(room_id)}, {"$set": updates})
        return await self._get_or_404(room_id)

    async def delete(self, room_id: str) -> dict:
        """DELETE /api/v1/rooms/{id} — admin only."""
        await self._get_or_404(room_id)
        await self.collection.delete_one({"_id": ObjectId(room_id)})
        return {"message": "Room deleted successfully"}

    async def _get_or_404(self, room_id: str) -> dict:
        """Shared helper — raises 404 if room not found. Exception Handling pattern."""
        try:
            oid = ObjectId(room_id)
        except Exception:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid room ID format")

        room = await self.collection.find_one({"_id": oid})
        if not room:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
        return _serialize_room(room)
