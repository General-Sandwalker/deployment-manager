from sqlalchemy.orm import Session
from ..models.review import Review
from datetime import datetime, timedelta
from typing import Optional
from app.schemas import review

def get_review(db: Session, review_id: int):
    return db.query(Review).filter(Review.id == review_id).first()

def get_reviews_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(Review).filter(Review.user_id == user_id).offset(skip).limit(limit).all()

def get_all_reviews(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Review).offset(skip).limit(limit).all()

def create_review(db: Session, review: review.ReviewCreate, user_id: int):
    db_review = Review(**review.dict(), user_id=user_id)
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

def update_review(db: Session, review_id: int, review_update: review.ReviewUpdate):
    db_review = get_review(db, review_id)
    if not db_review:
        return None
    update_data = review_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_review, key, value)
    db.commit()
    db.refresh(db_review)
    return db_review

def delete_review(db: Session, review_id: int):
    db_review = get_review(db, review_id)
    if not db_review:
        return None
    db.delete(db_review)
    db.commit()
    return True