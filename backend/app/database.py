from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
assert DATABASE_URL, "DATABASE_URL must be set in environment variables"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Recommended for PostgreSQL
)

# Explicitly create the public schema if it doesn't exist
try:
    with engine.connect() as conn:
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS public"))
        conn.commit()
except Exception as e:
    print(f"Warning: Could not create schema: {e}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

__all__ = ["SessionLocal", "engine", "Base", "get_db"]