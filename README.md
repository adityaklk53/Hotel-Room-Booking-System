# 🏨 Hotel Room Booking System

A full-stack hotel room booking web application built as part of the **BTech Sem 4 — Programming in Python with Full Stack Development** course at **Parul University**.

---

## 🛠️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | Python · FastAPI · Uvicorn          |
| Database  | MongoDB (Motor async driver)        |
| Auth      | JWT (python-jose) · Bcrypt          |
| Frontend  | React 18 · Vite · TypeScript        |
| Styling   | Tailwind CSS                        |
| State     | Zustand · Axios                     |
| Deploy    | Vercel (frontend) · Render (backend)|

---

## 📚 Syllabus Concepts Demonstrated

| Unit | Concept | Where Used |
|------|---------|------------|
| 1 | Variables, Data Types, Lists, Dicts | Models, seed data |
| 2 | OOPs — Classes, Inheritance, Encapsulation, Abstraction | `BaseDocument`, Controllers |
| 2 | Exception Handling | All controllers, JWT utils |
| 2 | File Handling (via env) | `Settings` class, `.env` |
| 3 | Modules & Packages | All `app/` sub-packages |
| 3 | MongoDB CRUD | Room, Booking, User controllers |
| 4/5 | Web Framework (FastAPI ≈ Flask/Django) | `app/main.py`, Routes |
| 4/5 | Routing, URL Mapping, Auth Middleware | `routes/`, `middleware/` |
| 6 | RESTful APIs — GET/POST/PUT/DELETE/PATCH | All route files |
| 6 | HTTP Status Codes, Error Handling | All controllers |

---

## 📁 Project Structure

```
Hotel-Room-Booking-System/
├── backend/
│   ├── app/
│   │   ├── config/         # DB connection, Settings (Pydantic)
│   │   ├── models/         # Pydantic schemas (OOPs: Inheritance)
│   │   ├── controllers/    # Business logic (OOPs: Encapsulation)
│   │   ├── routes/         # FastAPI routers (RESTful endpoints)
│   │   ├── middleware/     # JWT auth, RBAC
│   │   ├── utils/          # JWT helpers, hashing, seed script
│   │   └── main.py         # App entry point
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── api/            # Axios API client
    │   ├── components/     # Navbar, RoomCard, UI components
    │   ├── pages/          # Home, Rooms, Detail, Bookings, Admin
    │   ├── store/          # Zustand auth store
    │   └── types/          # TypeScript interfaces
    ├── package.json
    └── .env.example
```

---

## ⚙️ Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB running locally **or** a free [MongoDB Atlas](https://cloud.mongodb.com) cluster

---

### 1 — Clone the repo

```bash
git clone https://github.com/adityaklk53/Hotel-Room-Booking-System.git
cd Hotel-Room-Booking-System
```

---

### 2 — Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment variables
cp .env.example .env
# Edit .env and set your MONGO_URI and JWT_SECRET
```

**`.env` file:**
```
MONGO_URI=mongodb://localhost:27017
DB_NAME=hotel_booking
JWT_SECRET=your_super_secret_key_minimum_32_chars
JWT_EXPIRE_MINUTES=10080
FRONTEND_URL=http://localhost:5173
```

```bash
# Seed the database with sample rooms + admin user
python -m app.utils.seed

# Start the backend server
uvicorn app.main:app --reload --port 8000
```

API will be live at: **http://localhost:8000**
Swagger docs at:    **http://localhost:8000/docs**

---

### 3 — Frontend Setup

```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# .env content:
# VITE_API_URL=http://localhost:8000

# Start the dev server
npm run dev
```

Frontend will be live at: **http://localhost:5173**

---

## 🔐 Demo Credentials

| Role  | Email              | Password     |
|-------|--------------------|--------------|
| Admin | admin@hotel.com    | Admin@123456 |
| User  | Register yourself  | —            |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint              | Description           | Auth |
|--------|-----------------------|-----------------------|------|
| POST   | /api/v1/auth/register | Register new user     | ❌   |
| POST   | /api/v1/auth/login    | Login, get JWT        | ❌   |
| GET    | /api/v1/auth/me       | Get current user      | ✅   |

### Rooms
| Method | Endpoint              | Description           | Auth    |
|--------|-----------------------|-----------------------|---------|
| GET    | /api/v1/rooms/        | List rooms (filtered) | ❌      |
| GET    | /api/v1/rooms/{id}    | Get room by ID        | ❌      |
| POST   | /api/v1/rooms/        | Create room           | 🔑 Admin|
| PUT    | /api/v1/rooms/{id}    | Update room           | 🔑 Admin|
| DELETE | /api/v1/rooms/{id}    | Delete room           | 🔑 Admin|

### Bookings
| Method | Endpoint                        | Description          | Auth    |
|--------|---------------------------------|----------------------|---------|
| POST   | /api/v1/bookings/               | Create booking       | ✅      |
| GET    | /api/v1/bookings/my             | My bookings          | ✅      |
| GET    | /api/v1/bookings/               | All bookings         | 🔑 Admin|
| PATCH  | /api/v1/bookings/{id}/cancel    | Cancel booking       | ✅      |
| PATCH  | /api/v1/bookings/{id}/status    | Update status        | 🔑 Admin|

---

## 🚀 Deployment

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"** → Import `Hotel-Room-Booking-System`
3. Set **Root Directory** to `frontend`
4. Add Environment Variable:
   - `VITE_API_URL` = your deployed backend URL (e.g. `https://hotel-api.onrender.com`)
5. Click **Deploy** ✅

### Backend → Render (free)

1. Go to [render.com](https://render.com) and sign in
2. Click **"New Web Service"** → Connect GitHub repo
3. Set:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables (same as `.env`)
5. Use [MongoDB Atlas](https://cloud.mongodb.com) free tier for the database
6. Click **Deploy** ✅

---

## 🔧 First Time Git Setup (if not configured)

```bash
# Configure your identity
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Initialize and push
cd Hotel-Room-Booking-System
git init
git add .
git commit -m "feat: initial commit - Hotel Room Booking System"
git branch -M main
git remote add origin https://github.com/adityaklk53/Hotel-Room-Booking-System.git
git push -u origin main
```

---

## ✨ Features

- 🔐 JWT authentication with role-based access (user / admin)
- 🏨 Browse, filter, and search rooms by type, price, and dates
- 📅 Real-time availability check (blocks already-booked dates)
- 💳 Automatic total price calculation based on nights
- 📋 Users can view and cancel their own bookings
- 🛠️ Admin dashboard — manage all bookings and room status
- 📱 Fully responsive design (mobile-first)
- 📖 Auto-generated API docs (Swagger UI at `/docs`)

---

*Built for BTech Sem 4 · Parul University · Subject: 303105257 — Programming in Python with Full Stack Development*
