from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ReviewBase(BaseModel):
    content: str
    rating: int

class ReviewCreate(ReviewBase):
    pass

class ReviewUpdate(BaseModel):
    content: Optional[str] = None
    rating: Optional[int] = None

class Review(ReviewBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True