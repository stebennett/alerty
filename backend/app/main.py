from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import get_settings
from app.database import create_tables
from app.routers import tree_router, incidents_router, admin_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    logger.info("Starting Incident Bridge App...")
    create_tables()
    logger.info("Database tables created/verified")
    yield
    # Shutdown
    logger.info("Shutting down Incident Bridge App...")


app = FastAPI(
    title=settings.app_name,
    description="Internal SaaS app for raising incidents in Grafana IRM",
    version="0.1.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tree_router)
app.include_router(incidents_router)
app.include_router(admin_router)


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "app": settings.app_name}
