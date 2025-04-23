from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime, timedelta
from typing import List, Optional
import logging

from ..models.website import Website, WebsiteStatus
from ..schemas.website import WebsiteCreate, WebsiteUpdate
from ..core.logger import logger

def get_website(db: Session, website_id: int) -> Optional[Website]:
    """Get a single website by ID with owner relationship loaded"""
    try:
        return db.query(Website)\
               .options(joinedload(Website.owner))\
               .filter(Website.id == website_id)\
               .first()
    except SQLAlchemyError as e:
        logger.error(f"Error fetching website {website_id}: {str(e)}")
        raise

def get_websites_by_user(
    db: Session, 
    user_id: int, 
    skip: int = 0, 
    limit: int = 100,
    include_expired: bool = False
) -> List[Website]:
    """Get paginated websites for a specific user"""
    try:
        query = db.query(Website)\
                 .filter(Website.user_id == user_id)
        
        if not include_expired:
            query = query.filter(
                (Website.expires_at.is_(None)) | 
                (Website.expires_at >= datetime.utcnow())
            )
        
        return query.order_by(Website.created_at.desc())\
                   .offset(skip)\
                   .limit(limit)\
                   .all()
    except SQLAlchemyError as e:
        logger.error(f"Error fetching websites for user {user_id}: {str(e)}")
        raise

def get_all_websites(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    only_active: bool = True
) -> List[Website]:
    """Get all websites with optional filtering"""
    try:
        query = db.query(Website)
        
        if only_active:
            query = query.filter(
                (Website.expires_at.is_(None)) | 
                (Website.expires_at >= datetime.utcnow())
            )
        
        return query.order_by(Website.created_at.desc())\
                   .offset(skip)\
                   .limit(limit)\
                   .all()
    except SQLAlchemyError as e:
        logger.error(f"Error fetching all websites: {str(e)}")
        raise

def create_website(
    db: Session, 
    website: WebsiteCreate, 
    user_id: int, 
    port: int,
    expires_in_days: Optional[int] = None
) -> Website:
    """Create a new website with automatic expiration if specified"""
    try:
        expires_at = None
        if expires_in_days:
            expires_at = datetime.utcnow() + timedelta(days=expires_in_days)
        
        db_website = Website(
            name=website.name,
            git_repo=website.git_repo,
            port=port,
            user_id=user_id,
            status=WebsiteStatus.STOPPED,
            expires_at=expires_at
        )
        
        db.add(db_website)
        db.commit()
        db.refresh(db_website)
        return db_website
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error creating website: {str(e)}")
        raise

def update_website(
    db: Session, 
    website_id: int, 
    website_update: WebsiteUpdate
) -> Optional[Website]:
    """Update website details with proper change tracking"""
    try:
        db_website = get_website(db, website_id)
        if not db_website:
            return None
        
        update_data = website_update.dict(exclude_unset=True)
        
        # Track changes for logging
        changes = []
        for key, value in update_data.items():
            if getattr(db_website, key) != value:
                changes.append(f"{key}: {getattr(db_website, key)} → {value}")
                setattr(db_website, key, value)
        
        if changes:
            logger.info(f"Updating website {website_id}: {', '.join(changes)}")
            db.commit()
            db.refresh(db_website)
        
        return db_website
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error updating website {website_id}: {str(e)}")
        raise

def delete_website(db: Session, website_id: int) -> bool:
    """Delete a website with proper transaction handling"""
    try:
        db_website = get_website(db, website_id)
        if not db_website:
            return False
        
        db.delete(db_website)
        db.commit()
        logger.info(f"Deleted website {website_id}")
        return True
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error deleting website {website_id}: {str(e)}")
        raise

def update_website_status(
    db: Session,
    website_id: int,
    status: WebsiteStatus,
    pid: Optional[int] = None
) -> Optional[Website]:
    """Update website status and process ID atomically"""
    try:
        db_website = get_website(db, website_id)
        if not db_website:
            return None
        
        db_website.status = status
        if pid is not None:
            db_website.pid = pid
        
        db.commit()
        db.refresh(db_website)
        return db_website
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(
            f"Error updating status for website {website_id} "
            f"to {status}: {str(e)}"
        )
        raise

def get_websites_by_status(
    db: Session,
    status: WebsiteStatus,
    skip: int = 0,
    limit: int = 100
) -> List[Website]:
    """Get websites filtered by status"""
    try:
        return db.query(Website)\
               .filter(Website.status == status)\
               .offset(skip)\
               .limit(limit)\
               .all()
    except SQLAlchemyError as e:
        logger.error(f"Error fetching {status} websites: {str(e)}")
        raise