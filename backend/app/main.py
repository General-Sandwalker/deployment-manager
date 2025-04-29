from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import auth
from .api.routes.users import router as users_router
from .api.routes.users import admin_router as users_admin_router
from .api.routes.websites import router as websites_router
from .api.routes.websites import admin_router as websites_admin_router
from .api.routes.reviews import router as reviews_router
from .api.routes.reviews import admin_router as reviews_admin_router
from .database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Deployment Manager API")

# Add CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include authentication router
app.include_router(auth.router)

# Include user routes
app.include_router(users_router)
app.include_router(websites_router)
app.include_router(reviews_router)

# Include admin routes
app.include_router(users_admin_router)
app.include_router(websites_admin_router)
app.include_router(reviews_admin_router)

@app.get("/")
def read_root():
    return {"message": "Deployment Manager API"}