from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from .user import User
from .website import Website

class ReviewBase(BaseModel):
    content: str
    rating: int
    website_id: int

class ReviewCreate(ReviewBase):
    pass

class ReviewUpdate(BaseModel):
    content: Optional[str] = None
    rating: Optional[int] = None

class Review(ReviewBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    user: Optional[User] = None
    website: Optional[Website] = None
    user_email: Optional[str] = None
    user_full_name: Optional[str] = None
    website_name: Optional[str] = None

    class Config:
        from_attributes = True