"""
routes/rooms.py
RESTful CRUD endpoints for rooms (syllabus: Unit 6 — GET/POST/PUT/DELETE)
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from app.controllers.room_controller import RoomController
from app.models.room import RoomCreate, RoomUpdate
from app.config.database import get_database
from app.middleware.auth import get_current_user, require_admin

router = APIRouter(prefix="/api/v1/rooms", tags=["Rooms"])


def get_room_ctrl():
    return RoomController(get_database())


@router.get("/")
async def list_rooms(
    check_in: Optional[str] = Query(default=None),
    check_out: Optional[str] = Query(default=None),
    room_type: Optional[str] = Query(default=None),
    min_price: Optional[float] = Query(default=None),
    max_price: Optional[float] = Query(default=None),
    ctrl: RoomController = Depends(get_room_ctrl),
):
    """GET all available rooms with optional filters."""
    rooms = await ctrl.get_all(check_in, check_out, room_type, min_price, max_price)
    return {"data": rooms, "count": len(rooms)}


@router.get("/{room_id}")
async def get_room(room_id: str, ctrl: RoomController = Depends(get_room_ctrl)):
    """GET a single room by ID."""
    room = await ctrl.get_by_id(room_id)
    return {"data": room}


@router.post("/", status_code=201)
async def create_room(
    data: RoomCreate,
    ctrl: RoomController = Depends(get_room_ctrl),
    _admin: dict = Depends(require_admin),
):
    """POST create a new room — admin only."""
    room = await ctrl.create(data)
    return {"data": room, "message": "Room created successfully"}


@router.put("/{room_id}")
async def update_room(
    room_id: str,
    data: RoomUpdate,
    ctrl: RoomController = Depends(get_room_ctrl),
    _admin: dict = Depends(require_admin),
):
    """PUT update a room — admin only."""
    room = await ctrl.update(room_id, data)
    return {"data": room, "message": "Room updated successfully"}


@router.delete("/{room_id}")
async def delete_room(
    room_id: str,
    ctrl: RoomController = Depends(get_room_ctrl),
    _admin: dict = Depends(require_admin),
):
    """DELETE a room — admin only."""
    return await ctrl.delete(room_id)
