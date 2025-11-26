from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class ApplicationBase(BaseModel):
    """Base schema for application data."""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class ApplicationCreate(ApplicationBase):
    """Schema for creating an application."""
    tags: list[str] = Field(default_factory=list)


class ApplicationUpdate(BaseModel):
    """Schema for updating an application."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    tags: Optional[list[str]] = None


class ApplicationResponse(ApplicationBase):
    """Schema for application response."""
    id: int
    created_at: datetime
    updated_at: datetime
    tags: list[str] = Field(default_factory=list)

    class Config:
        from_attributes = True


class ApplicationWithCapabilities(ApplicationResponse):
    """Schema for application with its capabilities."""
    capabilities: list["CapabilityResponse"] = Field(default_factory=list)


# Import at bottom to avoid circular imports
from app.schemas.capability import CapabilityResponse
ApplicationWithCapabilities.model_rebuild()
