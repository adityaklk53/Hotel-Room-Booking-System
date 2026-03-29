"""
utils/seed.py
Seed the database with sample rooms and admin user.
Run: python -m app.utils.seed
Syllabus: Python connectivity with MongoDB CRUD operations (Unit 3)
"""
import asyncio
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "hotel_booking")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ROOMS = [
    {
        "name": "Standard Single Room",
        "room_type": "standard",
        "description": "A cozy and comfortable single room with all essential amenities. Ideal for solo travelers on business or leisure.",
        "price_per_night": 1500.0,
        "capacity": 1,
        "amenities": ["Free WiFi", "Air Conditioning", "TV", "Hot Water", "24hr Room Service"],
        "images": ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&auto=format&fit=crop"],
        "is_available": True,
    },
    {
        "name": "Standard Double Room",
        "room_type": "standard",
        "description": "Comfortable double room with a queen-size bed, perfect for couples or friends traveling together.",
        "price_per_night": 2500.0,
        "capacity": 2,
        "amenities": ["Free WiFi", "Air Conditioning", "Smart TV", "Hot Water", "Mini Fridge", "Work Desk"],
        "images": ["https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&auto=format&fit=crop"],
        "is_available": True,
    },
    {
        "name": "Deluxe King Room",
        "room_type": "deluxe",
        "description": "Spacious deluxe room with premium furnishings and a stunning city view. Enjoy luxury at an affordable price.",
        "price_per_night": 4500.0,
        "capacity": 2,
        "amenities": ["Free WiFi", "Air Conditioning", "Smart TV", "Hot Water", "Mini Bar", "City View", "Bathtub", "King Bed"],
        "images": ["https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop"],
        "is_available": True,
    },
    {
        "name": "Deluxe Twin Room",
        "room_type": "deluxe",
        "description": "Elegant twin room with modern interiors and premium amenities, perfect for colleagues or friends.",
        "price_per_night": 4000.0,
        "capacity": 2,
        "amenities": ["Free WiFi", "Air Conditioning", "Smart TV", "Hot Water", "Mini Bar", "Work Desk", "Twin Beds"],
        "images": ["https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&auto=format&fit=crop"],
        "is_available": True,
    },
    {
        "name": "Family Suite",
        "room_type": "suite",
        "description": "A luxurious suite with a separate living area, two bedrooms, and premium amenities ideal for families.",
        "price_per_night": 8000.0,
        "capacity": 4,
        "amenities": ["Free WiFi", "Air Conditioning", "Smart TV", "Hot Water", "Full Bar", "Jacuzzi", "Living Room", "Breakfast Included", "2 Bedrooms"],
        "images": ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop"],
        "is_available": True,
    },
    {
        "name": "Presidential Suite",
        "room_type": "suite",
        "description": "The pinnacle of luxury. Panoramic city views, private pool, butler service and unmatched opulence await you.",
        "price_per_night": 15000.0,
        "capacity": 4,
        "amenities": ["Free WiFi", "Air Conditioning", "Smart TV", "Hot Water", "Full Bar", "Private Pool", "Butler Service", "All Meals Included", "Panoramic View", "Private Terrace"],
        "images": ["https://images.unsplash.com/photo-1560200353-ce0a817f0571?w=800&auto=format&fit=crop"],
        "is_available": True,
    },
]


async def seed():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]

    # Seed rooms
    await db["rooms"].delete_many({})
    now = datetime.now(timezone.utc)
    for room in ROOMS:
        room["created_at"] = now
        room["updated_at"] = now
    await db["rooms"].insert_many(ROOMS)
    print(f"✅ Seeded {len(ROOMS)} rooms")

    # Seed admin user
    admin = await db["users"].find_one({"email": "admin@hotel.com"})
    if not admin:
        await db["users"].insert_one({
            "name": "Admin",
            "email": "admin@hotel.com",
            "hashed_password": pwd_context.hash("Admin@123456"),
            "role": "admin",
            "is_active": True,
            "created_at": now,
            "updated_at": now,
        })
        print("✅ Admin user created")
        print("   📧 Email:    admin@hotel.com")
        print("   🔑 Password: Admin@123456")
    else:
        print("ℹ️  Admin user already exists")

    client.close()
    print("\n🎉 Database seeded successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
