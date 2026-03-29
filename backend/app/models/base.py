"""
models/base.py
Demonstrates OOPs concepts from syllabus:
- Abstraction: BaseDocument hides MongoDB _id / serialisation complexity
- Encapsulation: internal _id handled via property
- Inheritance: all models inherit from BaseDocument
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from bson import ObjectId


class PyObjectId(str):
    """Custom type to handle MongoDB ObjectId serialisation."""

    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, _info=None):
        if isinstance(v, ObjectId):
            return str(v)
        if isinstance(v, str) and ObjectId.is_valid(v):
            return v
        raise ValueError(f"Invalid ObjectId: {v}")


class BaseDocument(BaseModel):
    """
    Abstract base class for all MongoDB documents.
    Demonstrates: Abstraction + Encapsulation (syllabus Unit 2)
    """
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )
