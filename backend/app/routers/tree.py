from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Application
from app.schemas.tree import TreeNode, CapabilityNode

router = APIRouter(prefix="/api", tags=["tree"])


@router.get("/tree", response_model=list[TreeNode])
def get_tree(db: Session = Depends(get_db)):
    """
    Get the full application/capability tree for the main page.

    Returns all applications with their capabilities.
    """
    applications = db.query(Application).order_by(Application.name).all()

    tree = []
    for app in applications:
        capabilities = [
            CapabilityNode(
                id=cap.id,
                name=cap.name,
                description=cap.description,
            )
            for cap in sorted(app.capabilities, key=lambda c: c.name)
        ]

        tree.append(TreeNode(
            id=app.id,
            name=app.name,
            description=app.description,
            capabilities=capabilities,
        ))

    return tree
