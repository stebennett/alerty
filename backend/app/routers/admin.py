from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Application, Capability, Tag
from app.schemas.application import (
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationResponse,
    ApplicationWithCapabilities,
)
from app.schemas.capability import (
    CapabilityCreate,
    CapabilityUpdate,
    CapabilityResponse,
)

router = APIRouter(prefix="/api/admin", tags=["admin"])


# Helper function to sync tags
def sync_tags(db: Session, tag_values: list[str]) -> list[Tag]:
    """Get or create tags and return them."""
    tags = []
    for value in tag_values:
        # Case-insensitive lookup
        tag = db.query(Tag).filter(Tag.value.ilike(value)).first()
        if not tag:
            tag = Tag(value=value)
            db.add(tag)
            db.flush()
        tags.append(tag)
    return tags


def serialize_tags(entity) -> list[str]:
    """Extract tag values from an entity."""
    return [tag.value for tag in entity.tags]


# Application endpoints
@router.get("/apps", response_model=list[ApplicationResponse])
def list_applications(db: Session = Depends(get_db)):
    """List all applications."""
    apps = db.query(Application).order_by(Application.name).all()
    return [
        ApplicationResponse(
            id=app.id,
            name=app.name,
            description=app.description,
            created_at=app.created_at,
            updated_at=app.updated_at,
            tags=serialize_tags(app),
        )
        for app in apps
    ]


@router.post("/apps", response_model=ApplicationResponse, status_code=201)
def create_application(app_data: ApplicationCreate, db: Session = Depends(get_db)):
    """Create a new application."""
    # Check for duplicate name
    existing = db.query(Application).filter(Application.name == app_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Application name already exists")

    app = Application(
        name=app_data.name,
        description=app_data.description,
    )

    if app_data.tags:
        app.tags = sync_tags(db, app_data.tags)

    db.add(app)
    db.commit()
    db.refresh(app)

    return ApplicationResponse(
        id=app.id,
        name=app.name,
        description=app.description,
        created_at=app.created_at,
        updated_at=app.updated_at,
        tags=serialize_tags(app),
    )


@router.get("/apps/{app_id}", response_model=ApplicationWithCapabilities)
def get_application(app_id: int, db: Session = Depends(get_db)):
    """Get application details including capabilities."""
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    return ApplicationWithCapabilities(
        id=app.id,
        name=app.name,
        description=app.description,
        created_at=app.created_at,
        updated_at=app.updated_at,
        tags=serialize_tags(app),
        capabilities=[
            CapabilityResponse(
                id=cap.id,
                application_id=cap.application_id,
                name=cap.name,
                description=cap.description,
                created_at=cap.created_at,
                updated_at=cap.updated_at,
                tags=serialize_tags(cap),
            )
            for cap in app.capabilities
        ],
    )


@router.put("/apps/{app_id}", response_model=ApplicationResponse)
def update_application(app_id: int, app_data: ApplicationUpdate, db: Session = Depends(get_db)):
    """Update an application."""
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if app_data.name is not None:
        # Check for duplicate name
        existing = db.query(Application).filter(
            Application.name == app_data.name,
            Application.id != app_id,
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Application name already exists")
        app.name = app_data.name

    if app_data.description is not None:
        app.description = app_data.description

    if app_data.tags is not None:
        app.tags = sync_tags(db, app_data.tags)

    db.commit()
    db.refresh(app)

    return ApplicationResponse(
        id=app.id,
        name=app.name,
        description=app.description,
        created_at=app.created_at,
        updated_at=app.updated_at,
        tags=serialize_tags(app),
    )


@router.delete("/apps/{app_id}", status_code=204)
def delete_application(app_id: int, db: Session = Depends(get_db)):
    """Delete an application (cascades to capabilities)."""
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    db.delete(app)
    db.commit()


# Capability endpoints
@router.post("/capabilities", response_model=CapabilityResponse, status_code=201)
def create_capability(cap_data: CapabilityCreate, db: Session = Depends(get_db)):
    """Create a new capability."""
    # Check application exists
    app = db.query(Application).filter(Application.id == cap_data.application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    # Check for duplicate name within application
    existing = db.query(Capability).filter(
        Capability.application_id == cap_data.application_id,
        Capability.name == cap_data.name,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Capability name already exists for this application")

    cap = Capability(
        application_id=cap_data.application_id,
        name=cap_data.name,
        description=cap_data.description,
    )

    if cap_data.tags:
        cap.tags = sync_tags(db, cap_data.tags)

    db.add(cap)
    db.commit()
    db.refresh(cap)

    return CapabilityResponse(
        id=cap.id,
        application_id=cap.application_id,
        name=cap.name,
        description=cap.description,
        created_at=cap.created_at,
        updated_at=cap.updated_at,
        tags=serialize_tags(cap),
    )


@router.get("/capabilities/{cap_id}", response_model=CapabilityResponse)
def get_capability(cap_id: int, db: Session = Depends(get_db)):
    """Get capability details."""
    cap = db.query(Capability).filter(Capability.id == cap_id).first()
    if not cap:
        raise HTTPException(status_code=404, detail="Capability not found")

    return CapabilityResponse(
        id=cap.id,
        application_id=cap.application_id,
        name=cap.name,
        description=cap.description,
        created_at=cap.created_at,
        updated_at=cap.updated_at,
        tags=serialize_tags(cap),
    )


@router.put("/capabilities/{cap_id}", response_model=CapabilityResponse)
def update_capability(cap_id: int, cap_data: CapabilityUpdate, db: Session = Depends(get_db)):
    """Update a capability."""
    cap = db.query(Capability).filter(Capability.id == cap_id).first()
    if not cap:
        raise HTTPException(status_code=404, detail="Capability not found")

    if cap_data.name is not None:
        # Check for duplicate name within application
        existing = db.query(Capability).filter(
            Capability.application_id == cap.application_id,
            Capability.name == cap_data.name,
            Capability.id != cap_id,
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Capability name already exists for this application")
        cap.name = cap_data.name

    if cap_data.description is not None:
        cap.description = cap_data.description

    if cap_data.tags is not None:
        cap.tags = sync_tags(db, cap_data.tags)

    db.commit()
    db.refresh(cap)

    return CapabilityResponse(
        id=cap.id,
        application_id=cap.application_id,
        name=cap.name,
        description=cap.description,
        created_at=cap.created_at,
        updated_at=cap.updated_at,
        tags=serialize_tags(cap),
    )


@router.delete("/capabilities/{cap_id}", status_code=204)
def delete_capability(cap_id: int, db: Session = Depends(get_db)):
    """Delete a capability."""
    cap = db.query(Capability).filter(Capability.id == cap_id).first()
    if not cap:
        raise HTTPException(status_code=404, detail="Capability not found")

    db.delete(cap)
    db.commit()
