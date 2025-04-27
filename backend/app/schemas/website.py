from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional
from enum import Enum
from ..core.config import settings
from .user import User

class WebsiteStatus(str, Enum):
    STOPPED = "stopped"
    RUNNING = "running"
    DEPLOYING = "deploying"
    ERROR = "error"

class WebsiteBase(BaseModel):
    name: str = Field(..., max_length=255, example="My Awesome Site")
    git_repo: str = Field(..., description="Git repository URL")

class WebsiteCreate(WebsiteBase):
    pass

class WebsiteUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    git_repo: Optional[str] = Field(None, description="New Git repository URL")
    status: Optional[WebsiteStatus] = None
    expires_at: Optional[datetime] = None
    custom_domain: Optional[str] = None

class Website(WebsiteBase):
    id: int
    port: int = Field(..., ge=settings.WEBSITE_MIN_PORT)
    status: WebsiteStatus
    pid: Optional[int] = None
    deployment_log: Optional[str] = None
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    url: Optional[str] = None
    custom_domain: Optional[str] = None
    owner: Optional[User] = None
    
    @validator('port')
    def validate_port(cls, port):
        if port < settings.WEBSITE_MIN_PORT:
            raise ValueError(f"Port must be at least {settings.WEBSITE_MIN_PORT}")
        return port

    @validator('git_repo')
    def validate_git_repo(cls, repo):
        if not repo.startswith(('http://', 'https://', 'git@')):
            raise ValueError("Git repository must be a valid HTTP/HTTPS/SSH URL")
        return repo

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }