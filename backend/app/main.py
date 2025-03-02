from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine
from . import models
from .routers import expenses_router, recognition_router

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(title="AI Accounting API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, in production this should be restricted
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(expenses_router, prefix="/api/expenses", tags=["expenses"])
app.include_router(recognition_router, prefix="/api/recognition", tags=["recognition"])

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Accounting API"}
