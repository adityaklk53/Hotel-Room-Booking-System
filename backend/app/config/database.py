"""
config/database.py
Async MongoDB connection using Motor (syllabus: Python connectivity with MongoDB CRUD operations)
"""
from motor.motor_asyncio import AsyncIOMotorClient
from app.config.settings import settings

client: AsyncIOMotorClient = None  # type: ignore


def get_database():
    return client[settings.DB_NAME]


async def connect_db():
    global client
    client = AsyncIOMotorClient(settings.MONGO_URI)
    # Verify connection
    await client.admin.command("ping")
    print("✅ Connected to MongoDB")


async def close_db():
    global client
    if client:
        client.close()
        print("🔌 MongoDB connection closed")
