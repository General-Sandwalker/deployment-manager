from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from ..models.user import User
from ..schemas.user import UserCreate, UserUpdate
from ..core.security import get_password_hash
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

def get_user(db: Session, user_id: int) -> Optional[User]:
    """Get a single user by ID"""
    try:
        return db.query(User).filter(User.id == user_id).first()
    except SQLAlchemyError as e:
        logger.error(f"Error getting user {user_id}: {str(e)}")
        raise

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get a user by email address"""
    try:
        return db.query(User).filter(User.email == email).first()
    except SQLAlchemyError as e:
        logger.error(f"Error getting user by email {email}: {str(e)}")
        raise

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    """Get list of users with pagination"""
    try:
        return db.query(User).offset(skip).limit(limit).all()
    except SQLAlchemyError as e:
        logger.error(f"Error getting users: {str(e)}")
        raise

def create_user(db: Session, user: UserCreate) -> User:
    """Create a new user"""
    try:
        # Check if user already exists
        if get_user_by_email(db, user.email):
            raise ValueError(f"User with email {user.email} already exists")
        
        db_user = User(
            email=user.email,
            hashed_password=get_password_hash(user.password),
            full_name=user.full_name,
            is_admin=False  # Default to non-admin
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        logger.info(f"Created new user with ID {db_user.id}")
        return db_user
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error creating user: {str(e)}")
        raise

def update_user(db: Session, user_id: int, user_update: UserUpdate) -> Optional[User]:
    """Update user information"""
    try:
        db_user = get_user(db, user_id)
        if not db_user:
            return None
        
        update_data = user_update.dict(exclude_unset=True)
        
        if "password" in update_data:
            db_user.hashed_password = get_password_hash(update_data["password"])
        
        for key, value in update_data.items():
            setattr(db_user, key, value)
        
        db.commit()
        db.refresh(db_user)
        logger.info(f"Updated user {user_id}")
        return db_user
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error updating user {user_id}: {str(e)}")
        raise

def delete_user(db: Session, user_id: int) -> bool:
    """Delete a user"""
    try:
        db_user = get_user(db, user_id)
        if not db_user:
            return False
        
        db.delete(db_user)
        db.commit()
        logger.info(f"Deleted user {user_id}")
        return True
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error deleting user {user_id}: {str(e)}")
        raise

def set_admin_status(db: Session, user_id: int, is_admin: bool) -> Optional[User]:
    """Set admin status for a user"""
    try:
        db_user = get_user(db, user_id)
        if not db_user:
            return None
        
        db_user.is_admin = is_admin
        db.commit()
        db.refresh(db_user)
        logger.info(f"Set admin status for user {user_id} to {is_admin}")
        return db_user
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error setting admin status for user {user_id}: {str(e)}")
        raise