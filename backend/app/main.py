from fastapi import FastAPI
from .api.routes import auth, users, websites, reviews
from .database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(websites.router)
app.include_router(reviews.router)

@app.get("/")
def read_root():
    return {"message": "Deployment Manager API"}