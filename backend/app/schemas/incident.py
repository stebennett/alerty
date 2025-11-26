from pydantic import BaseModel, Field, field_validator
from typing import Optional
from enum import Enum


class Severity(str, Enum):
    """Internal severity levels."""
    P1 = "P1"
    P2 = "P2"
    P3 = "P3"
    P4 = "P4"


class IncidentCreate(BaseModel):
    """Schema for creating an incident."""
    title: str = Field(..., min_length=1, max_length=500)
    severity: Severity
    application_ids: list[int] = Field(default_factory=list)
    capability_ids: list[int] = Field(default_factory=list)

    @field_validator("application_ids", "capability_ids", mode="after")
    @classmethod
    def validate_at_least_one_selected(cls, v, info):
        # This validator runs on each field, we need to check both together
        return v

    def model_post_init(self, __context) -> None:
        """Validate that at least one application or capability is selected."""
        if not self.application_ids and not self.capability_ids:
            raise ValueError("At least one application or capability must be selected")


class IncidentResponse(BaseModel):
    """Schema for incident creation response."""
    status: str
    grafana_incident_id: Optional[str] = None
    grafana_incident_url: Optional[str] = None
    message: Optional[str] = None
