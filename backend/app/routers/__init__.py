from app.routers.tree import router as tree_router
from app.routers.incidents import router as incidents_router
from app.routers.admin import router as admin_router

__all__ = ["tree_router", "incidents_router", "admin_router"]
