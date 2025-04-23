from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..deps import get_db, get_current_user
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