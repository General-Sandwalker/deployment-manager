from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..deps import get_db, get_current_user, get_current_admin
from ...schemas.user import UserCreate, UserUpdate, User as UserSchema
from ...crud.user import (
    create_user,
    get_user,
    get_users,
    update_user,
    delete_user,
)
from ...models.user import User as DBUser

# Create two separate routers for better organization
router = APIRouter(tags=["users"])
admin_router = APIRouter(prefix="/admin", tags=["admin"])

# Public routes - Registration
@router.post("/users/", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
def create_new_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    """Register a new user"""
    db_user = create_user(db, user)
    return db_user

# Current user routes - only allow operations on the current user
@router.get("/users/me", response_model=UserSchema)
def read_current_user(
    current_user: DBUser = Depends(get_current_user)
):
    """Get the current logged-in user profile"""
    return current_user

@router.put("/users/me", response_model=UserSchema)
def update_current_user(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    """Update the current user's own profile"""
    return update_user(db, current_user.id, user_update)

@router.post("/users/me/settings", response_model=UserSchema)
def update_user_settings(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    """Update the current user's settings"""
    return update_user(db, current_user.id, user_update)

@router.delete("/users/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_current_user(
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    """Delete the current user's own account"""
    delete_user(db, current_user.id)
    return {"ok": True}

# Admin routes - for user management by administrators
@admin_router.get("/users/", response_model=list[UserSchema])
def admin_read_all_users(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False,
    db: Session = Depends(get_db),
    admin_user: DBUser = Depends(get_current_admin)
):
    """ADMIN ONLY: Get all users with optional filtering"""
    users = get_users(db, skip=skip, limit=limit)
    if active_only:
        return [user for user in users if user.is_active]
    return users

@admin_router.get("/users/{user_id}", response_model=UserSchema)
def admin_read_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: DBUser = Depends(get_current_admin)
):
    """ADMIN ONLY: Get any user by ID"""
    db_user = get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return db_user

@admin_router.put("/users/{user_id}", response_model=UserSchema)
def admin_update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    admin_user: DBUser = Depends(get_current_admin)
):
    """ADMIN ONLY: Update any user's profile including admin status"""
    db_user = get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return update_user(db, user_id, user_update)

@admin_router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: DBUser = Depends(get_current_admin)
):
    """ADMIN ONLY: Delete any user account"""
    db_user = get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Don't allow admins to delete themselves
    if db_user.id == admin_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own admin account"
        )
    
    delete_user(db, user_id)
    return {"ok": True, "message": f"User {user_id} successfully deleted"}

@admin_router.post("/users/{user_id}/toggle-admin", status_code=status.HTTP_200_OK)
def admin_toggle_admin_status(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: DBUser = Depends(get_current_admin)
):
    """ADMIN ONLY: Toggle admin status for a user"""
    db_user = get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Don't allow admins to remove their own admin status
    if db_user.id == admin_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove your own admin privileges"
        )
    
    db_user.is_admin = not db_user.is_admin
    db.commit()
    db.refresh(db_user)
    
    status_msg = "granted" if db_user.is_admin else "revoked"
    return {
        "ok": True, 
        "message": f"Admin privileges {status_msg} for user {db_user.email}",
        "is_admin": db_user.is_admin
    }