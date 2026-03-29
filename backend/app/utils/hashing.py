"""
utils/hashing.py
Bcrypt password hashing (syllabus: Security, Modules & Packages Unit 3)
OOPs: Encapsulation — raw password never stored or returned
"""
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    """Hash a plain-text password using bcrypt."""
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Verify plain password against its hash. Returns bool."""
    return pwd_context.verify(plain, hashed)
