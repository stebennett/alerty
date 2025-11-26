from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.incident import IncidentCreate, IncidentResponse
from app.services.incident import IncidentService

router = APIRouter(prefix="/api", tags=["incidents"])


@router.post("/incidents", response_model=IncidentResponse)
async def create_incident(
    incident: IncidentCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new incident in Grafana IRM.

    Validates input, aggregates tags from selected applications/capabilities,
    maps severity, and calls the Grafana IRM API.
    """
    service = IncidentService(db)

    result = await service.create_incident(
        title=incident.title,
        severity=incident.severity,
        application_ids=incident.application_ids,
        capability_ids=incident.capability_ids,
    )

    return IncidentResponse(**result)
