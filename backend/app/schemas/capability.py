from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class CapabilityBase(BaseModel):
    """Base schema for capability data."""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class CapabilityCreate(CapabilityBase):
    """Schema for creating a capability."""
    application_id: int
    tags: list[str] = Field(default_factory=list)


class CapabilityUpdate(BaseModel):
    """Schema for updating a capability."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    tags: Optional[list[str]] = None


class CapabilityResponse(CapabilityBase):
    """Schema for capability response."""
    id: int
    application_id: int
    created_at: datetime
    updated_at: datetime
    tags: list[str] = Field(default_factory=list)

    class Config:
        from_attributes = True
