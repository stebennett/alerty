from pydantic import BaseModel
from typing import Optional


class CapabilityNode(BaseModel):
    """Schema for capability in tree view."""
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class TreeNode(BaseModel):
    """Schema for application node in tree view."""
    id: int
    name: str
    description: Optional[str] = None
    capabilities: list[CapabilityNode] = []

    class Config:
        from_attributes = True
