"""
app/main.py
FastAPI application entry point (syllabus: RESTful APIs, Flask equivalent)
- Startup/shutdown lifecycle hooks
- CORS for frontend integration
- Versioned API routes
- Auto-generated docs at /docs (Swagger UI)
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config.database import connect_db, close_db
from app.config.settings import settings
from app.routes import auth, rooms, bookings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage DB connection on startup and shutdown."""
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="Hotel Room Booking System API",
    description=(
        "A RESTful API for managing hotel room bookings. "
        "Built with FastAPI + MongoDB. "
        "Covers: OOPs, RESTful APIs, Auth, CRUD — as per BTech Sem 4 Python Full Stack syllabus."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow frontend (React on Vercel) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(auth.router)
app.include_router(rooms.router)
app.include_router(bookings.router)


@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "message": "Hotel Room Booking System API is running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}
