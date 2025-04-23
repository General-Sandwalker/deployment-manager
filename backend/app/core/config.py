from pydantic_settings import BaseSettings
from pydantic import Field, HttpUrl
from typing import Optional
from pathlib import Path

class Settings(BaseSettings):
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    STATIC_SITES_DIR: str = Field("/app/static_sites", env="STATIC_SITES_DIR")
    WEBSITE_MIN_PORT: int = Field(8000, env="WEBSITE_MIN_PORT")
    
    # JWT Configuration
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    ALGORITHM: str = Field("HS256", env="ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(60, env="ACCESS_TOKEN_EXPIRE_MINUTES")

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()