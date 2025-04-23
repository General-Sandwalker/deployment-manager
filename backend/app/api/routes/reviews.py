from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..deps import get_db, get_current_user
from ...models.user import User as DBUser
from ...models.review import Review as DBReview
from ...schemas.review import ReviewCreate, ReviewUpdate, Review as ReviewSchema
from ...crud.review import (
    create_review,
    get_reviews_by_user,
    get_review,
    update_review,
    delete_review,
    get_all_reviews,
)

router = APIRouter(prefix="/reviews", tags=["reviews"])

@router.post("/", response_model=ReviewSchema)
def create_review_for_website(
    review: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    return create_review(db, review, current_user.id)

@router.get("/", response_model=list[ReviewSchema])
def read_user_reviews(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    reviews = get_reviews_by_user(db, current_user.id, skip=skip, limit=limit)
    return reviews

@router.get("/all/", response_model=list[ReviewSchema])
def read_all_reviews(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return get_all_reviews(db, skip=skip, limit=limit)

@router.get("/{review_id}", response_model=ReviewSchema)
def read_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    db_review = get_review(db, review_id)
    if not db_review or db_review.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Review not found")
    return db_review

@router.put("/{review_id}", response_model=ReviewSchema)
def update_review_route(
    review_id: int,
    review_update: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    db_review = get_review(db, review_id)
    if not db_review or db_review.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Review not found")
    return update_review(db, review_id, review_update)

@router.delete("/{review_id}")
def delete_review_route(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    db_review = get_review(db, review_id)
    if not db_review or db_review.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Review not found")
    delete_review(db, review_id)
    return {"ok": True}