from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # Add this import
from .api.routes import auth, users, websites, reviews
from .database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Add CORS middleware configuration here
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your Next.js frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(websites.router)
app.include_router(reviews.router)

@app.get("/")
def read_root():
    return {"message": "Deployment Manager API"}