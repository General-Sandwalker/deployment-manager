from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from ..deps import get_db, get_current_user, get_current_admin
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

# Create two separate routers for better organization
router = APIRouter(tags=["reviews"])
admin_router = APIRouter(prefix="/admin", tags=["admin"])

# User review routes
@router.post("/reviews/", response_model=ReviewSchema, status_code=status.HTTP_201_CREATED)
def create_review_for_website(
    review: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    """Create a new review for a website"""
    return create_review(db, review, current_user.id)

@router.get("/reviews/", response_model=List[ReviewSchema])
def read_user_reviews(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    """Get all reviews created by the current user"""
    reviews = get_reviews_by_user(db, current_user.id, skip=skip, limit=limit)
    return reviews

@router.get("/reviews/{review_id}", response_model=ReviewSchema)
def read_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    """Get a specific review by ID (only if created by the current user)"""
    db_review = get_review(db, review_id)
    if not db_review or db_review.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Review not found"
        )
    return db_review

@router.put("/reviews/{review_id}", response_model=ReviewSchema)
def update_review_route(
    review_id: int,
    review_update: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    """Update a specific review (only if created by the current user)"""
    db_review = get_review(db, review_id)
    if not db_review or db_review.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Review not found"
        )
    return update_review(db, review_id, review_update)

@router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review_route(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    """Delete a specific review (only if created by the current user)"""
    db_review = get_review(db, review_id)
    if not db_review or db_review.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Review not found"
        )
    delete_review(db, review_id)
    return {"ok": True}

# Public reviews endpoint - allow accessing all published reviews
@router.get("/reviews/public/all", response_model=List[ReviewSchema])
def read_all_public_reviews(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all public reviews (no authentication required)"""
    return get_all_reviews(db, skip=skip, limit=limit)

# Admin review routes
@admin_router.get("/reviews/", response_model=List[ReviewSchema])
def admin_read_all_reviews(
    skip: int = 0,
    limit: int = 100,
    website_id: Optional[int] = None,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
    admin_user: DBUser = Depends(get_current_admin)
):
    """ADMIN ONLY: Get all reviews with filtering options"""
    reviews = get_all_reviews(db, skip=skip, limit=limit)
    
    # Filter by website if specified
    if website_id is not None:
        reviews = [r for r in reviews if r.website_id == website_id]
    
    # Filter by user if specified
    if user_id is not None:
        reviews = [r for r in reviews if r.user_id == user_id]
    
    return reviews

@admin_router.get(
    "/reviews/{review_id}",
    response_model=ReviewSchema, 
    responses={404: {"description": "Review not found"}}
)
def admin_read_review(
    review_id: int,
    db: Session = Depends(get_db),
    admin_user: DBUser = Depends(get_current_admin)
):
    """ADMIN ONLY: Get any review details"""
    db_review = get_review(db, review_id)
    if not db_review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Review not found"
        )
    return db_review

@admin_router.delete(
    "/reviews/{review_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={404: {"description": "Review not found"}}
)
def admin_delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    admin_user: DBUser = Depends(get_current_admin)
):
    """ADMIN ONLY: Delete any review (e.g., inappropriate content)"""
    db_review = get_review(db, review_id)
    if not db_review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Review not found"
        )
    delete_review(db, review_id)
    return {"ok": True, "message": f"Review {review_id} successfully deleted"}