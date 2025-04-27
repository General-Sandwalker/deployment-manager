from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
import sys

from ..deps import get_db, get_current_user, get_current_admin
from ...models.user import User as DBUser
from ...schemas.website import (
    WebsiteCreate, 
    WebsiteUpdate, 
    Website as WebsiteSchema,
    WebsiteStatus
)
from ...crud.website import (
    create_website,
    get_website,
    get_websites_by_user,
    update_website,
    delete_website,
    get_all_websites,
)
from ...services.deployment import WebsiteProcessManager
from ...core.config import settings

router = APIRouter(tags=["websites"])

@router.post("/websites/", response_model=WebsiteSchema, status_code=status.HTTP_201_CREATED)
async def create_new_website(
    website: WebsiteCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    """Create a new website with automatic port assignment"""
    if current_user.plan_expires_at and current_user.plan_expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your subscription has expired"
        )
    
    manager = WebsiteProcessManager()
    try:
        port = manager.get_available_port(db)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    db_website = create_website(db, website, current_user.id, port)
    
    background_tasks.add_task(
        manager.deploy_static_site,
        db,
        db_website.git_repo,
        db_website.name,
        current_user.id
    )
    
    return db_website

@router.get("/websites/", response_model=List[WebsiteSchema])
def read_user_websites(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    """Get all websites for the current user"""
    return get_websites_by_user(db, current_user.id, skip=skip, limit=limit)

@router.get(
    "/websites/{website_id}",
    response_model=WebsiteSchema,
    responses={404: {"description": "Website not found"}}
)
def read_website(
    website_id: int,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    """Get a specific website by ID"""
    db_website = get_website(db, website_id)
    if not db_website or db_website.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Website not found"
        )
    return db_website

@router.put(
    "/websites/{website_id}",
    response_model=WebsiteSchema,
    responses={404: {"description": "Website not found"}}
)
def update_website_route(
    website_id: int,
    website_update: WebsiteUpdate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    """Update website details"""
    db_website = get_website(db, website_id)
    if not db_website or db_website.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Website not found"
        )
    return update_website(db, website_id, website_update)

@router.delete(
    "/websites/{website_id}",
    responses={
        404: {"description": "Website not found"},
        500: {"description": "Failed to cleanup website"}
    }
)
async def delete_website_route(
    website_id: int,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    """Delete a website and cleanup resources"""
    db_website = get_website(db, website_id)
    if not db_website or db_website.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Website not found"
        )
    
    manager = WebsiteProcessManager()
    if not manager.delete_site(db, db_website.name, db_website.port, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cleanup website resources"
        )
    
    delete_website(db, website_id)
    return {"ok": True}

@router.get("/admin/websites/", response_model=List[WebsiteSchema])
def admin_read_all_websites(
    skip: int = 0,
    limit: int = 100,
    include_expired: bool = False,
    status: Optional[WebsiteStatus] = None,
    db: Session = Depends(get_db),
    admin_user: DBUser = Depends(get_current_admin)
):
    """
    ADMIN ONLY: Get all websites with filtering options
    """
    # Import the function here to avoid circular import
    from ...crud.website import get_websites_by_status
    
    if status:
        return get_websites_by_status(db, status, skip=skip, limit=limit)
    else:
        return get_all_websites(db, skip=skip, limit=limit, only_active=not include_expired)

@router.get(
    "/admin/websites/{website_id}",
    response_model=WebsiteSchema,
    responses={404: {"description": "Website not found"}}
)
def admin_read_website(
    website_id: int,
    db: Session = Depends(get_db),
    admin_user: DBUser = Depends(get_current_admin)
):
    """
    ADMIN ONLY: Get any website details
    """
    db_website = get_website(db, website_id)
    if not db_website:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Website not found"
        )
    return db_website

@router.put(
    "/admin/websites/{website_id}",
    response_model=WebsiteSchema,
    responses={404: {"description": "Website not found"}}
)
def admin_update_website(
    website_id: int,
    website_update: WebsiteUpdate,
    db: Session = Depends(get_db),
    admin_user: DBUser = Depends(get_current_admin)
):
    """
    ADMIN ONLY: Update any website details
    """
    db_website = get_website(db, website_id)
    if not db_website:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Website not found"
        )
    return update_website(db, website_id, website_update)

@router.post(
    "/admin/websites/{website_id}/start",
    response_model=WebsiteSchema,
    responses={
        400: {"description": "Website already running"},
        404: {"description": "Website not found"},
        500: {"description": "Deployment failed"}
    }
)
async def admin_start_website(
    website_id: int,
    db: Session = Depends(get_db),
    admin_user: DBUser = Depends(get_current_admin)
):
    """
    ADMIN ONLY: Start any website
    """
    db_website = get_website(db, website_id)
    if not db_website:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Website not found"
        )
    
    if db_website.status == WebsiteStatus.RUNNING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Website already running"
        )
    
    try:
        # Get the website owner's info for deploying
        owner = db_website.owner
        
        manager = WebsiteProcessManager()
        port = manager.deploy_static_site(
            db,
            db_website.git_repo,
            db_website.name,
            owner.id
        )
        
        db_website.status = WebsiteStatus.RUNNING
        db_website.pid = port  # This should be the process ID
        db.commit()
        db.refresh(db_website)
        
        return db_website
    except Exception as e:
        db_website.status = WebsiteStatus.ERROR
        db_website.deployment_log = str(e)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Deployment failed: {str(e)}"
        )

@router.post(
    "/admin/websites/{website_id}/stop",
    response_model=WebsiteSchema,
    responses={
        400: {"description": "Website not running"},
        404: {"description": "Website not found"},
        500: {"description": "Failed to stop website"}
    }
)
async def admin_stop_website(
    website_id: int,
    db: Session = Depends(get_db),
    admin_user: DBUser = Depends(get_current_admin)
):
    """
    ADMIN ONLY: Stop any running website
    """
    db_website = get_website(db, website_id)
    if not db_website:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Website not found"
        )
    
    if db_website.status != WebsiteStatus.RUNNING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Website not running"
        )
    
    manager = WebsiteProcessManager()
    stopped = manager.stop_site(db_website.port)
    
    db_website.status = WebsiteStatus.STOPPED
    db_website.pid = None
    db.commit()
    db.refresh(db_website)
    
    return db_website

@router.post(
    "/websites/{website_id}/redeploy",
    response_model=WebsiteSchema,
    responses={
        404: {"description": "Website not found"},
        500: {"description": "Redeployment failed"}
    }
)
async def redeploy_website(
    website_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    """Redeploy a website (stop and start again)"""
    db_website = get_website(db, website_id)
    if not db_website or db_website.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Website not found"
        )
    
    manager = WebsiteProcessManager()
    
    # Stop if running
    if db_website.status == WebsiteStatus.RUNNING:
        if not manager.stop_site(db_website.port):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to stop website for redeployment"
            )
    
    # Deploy in background
    try:
        background_tasks.add_task(
            manager.deploy_static_site,
            db,
            db_website.git_repo,
            db_website.name,
            current_user.id
        )
        
        db_website.status = WebsiteStatus.DEPLOYING
        db.commit()
        db.refresh(db_website)
        
        return db_website
    except Exception as e:
        db_website.status = WebsiteStatus.ERROR
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Redeployment failed: {str(e)}"
        )