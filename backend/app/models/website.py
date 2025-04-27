from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship, validates
from datetime import datetime
from enum import Enum
from ..database import Base
from ..core.config import settings

class WebsiteStatus(str, Enum):
    STOPPED = "stopped"
    RUNNING = "running"
    DEPLOYING = "deploying"
    ERROR = "error"

class Website(Base):
    __tablename__ = "websites"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    custom_domain = Column(String(255), unique=True, nullable=True)
    git_repo = Column(String(512), nullable=False)
    port = Column(Integer, unique=True, nullable=False)
    status = Column(String(50), default=WebsiteStatus.STOPPED, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    pid = Column(Integer, nullable=True)  # Process ID
    deployment_log = Column(Text, nullable=True)  # Deployment logs

    owner = relationship("User", back_populates="websites")
    reviews = relationship("Review", back_populates="website", cascade="all, delete-orphan")

    @property
    def url(self):
        base_url = f"http://localhost:{self.port}"
        return base_url
    
    @validates('port')
    def validate_port(self, key, port):
        if port < settings.WEBSITE_MIN_PORT:
            raise ValueError(f"Port must be at least {settings.WEBSITE_MIN_PORT}")
        return port

    @validates('status')
    def validate_status(self, key, status):
        try:
            return WebsiteStatus(status.lower())
        except ValueError:
            raise ValueError(
                f"Invalid status. Must be one of: {', '.join([e.value for e in WebsiteStatus])}"
            )

    @validates('git_repo')
    def validate_git_repo(self, key, repo):
        if not repo.startswith(('http://', 'https://', 'git@')):
            raise ValueError("Git repository must be a valid HTTP/HTTPS/SSH URL")
        return repo