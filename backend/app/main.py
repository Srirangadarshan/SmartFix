from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import logging

from .api.api import api_router
from .core.config import settings
from .services.database import JSONDatabase
from .database import init_db, check_db_connection

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database directory if it doesn't exist
os.makedirs(os.path.dirname(settings.DB_FILE), exist_ok=True)

try:
    # Initialize database
    db = JSONDatabase()
    logger.info("Database initialized successfully")
except Exception as e:
    logger.error(f"Error initializing database: {e}")
    raise

app = FastAPI(
    title=settings.APP_NAME,
    description="Multimodal troubleshooting assistant API",
    version="1.0.0",
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Application startup event
@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting {settings.APP_NAME} API server")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    
    # Initialize SQLAlchemy database
    try:
        init_db()
        if check_db_connection():
            logger.info("SQLAlchemy database initialized successfully")
        else:
            logger.warning("SQLAlchemy database connection check failed")
    except Exception as e:
        logger.error(f"Error initializing SQLAlchemy database: {e}")
        # Continue startup even if DB init fails (fallback to JSON)

# Application shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down SmartFix-AI API server")