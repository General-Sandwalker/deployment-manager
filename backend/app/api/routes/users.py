from fastapi import APIRouter, Depends, HTTPException
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

router = APIRouter()

@router.post("/users/", response_model=UserSchema)
def create_new_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    db_user = create_user(db, user)
    return db_user

@router.get("/users/", response_model=list[UserSchema])
def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return get_users(db, skip=skip, limit=limit)

@router.get("/users/me", response_model=UserSchema)
def read_current_user(
    current_user: DBUser = Depends(get_current_user)
):
    return current_user

@router.get("/users/{user_id}", response_model=UserSchema)
def read_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    db_user = get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.put("/users/{user_id}", response_model=UserSchema)
def update_user_route(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return update_user(db, user_id, user_update)

@router.delete("/users/{user_id}")
def delete_user_route(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    delete_user(db, user_id)
    return {"ok": True}

@router.get("/admin/users/", response_model=list[UserSchema])
def admin_read_all_users(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False,
    db: Session = Depends(get_db),
    admin_user: DBUser = Depends(get_current_admin)
):
    """
    ADMIN ONLY: Get all users with optional filtering
    """
    users = get_users(db, skip=skip, limit=limit)
    if active_only:
        return [user for user in users if user.is_active]
    return users

@router.put("/admin/users/{user_id}", response_model=UserSchema)
def admin_update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    admin_user: DBUser = Depends(get_current_admin)
):
    """
    ADMIN ONLY: Update any user's profile including admin status
    """
    db_user = get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Allow admins to update admin status, plan expiration, etc.
    return update_user(db, user_id, user_update)

@router.delete("/admin/users/{user_id}")
def admin_delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: DBUser = Depends(get_current_admin)
):
    """
    ADMIN ONLY: Delete any user account
    """
    db_user = get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Don't allow admins to delete themselves
    if db_user.id == admin_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")
    
    delete_user(db, user_id)
    return {"ok": True, "message": f"User {user_id} successfully deleted"}

@router.post("/admin/users/{user_id}/toggle-admin")
def admin_toggle_admin_status(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: DBUser = Depends(get_current_admin)
):
    """
    ADMIN ONLY: Toggle admin status for a user
    """
    db_user = get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Don't allow admins to remove their own admin status
    if db_user.id == admin_user.id:
        raise HTTPException(status_code=400, detail="Cannot remove your own admin privileges")
    
    db_user.is_admin = not db_user.is_admin
    db.commit()
    db.refresh(db_user)
    
    status = "granted" if db_user.is_admin else "revoked"
    return {
        "ok": True, 
        "message": f"Admin privileges {status} for user {db_user.email}",
        "is_admin": db_user.is_admin
    }