from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Application(Base):
    """Application model - top-level nodes in the tree."""

    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    # Relationships
    capabilities = relationship(
        "Capability",
        back_populates="application",
        cascade="all, delete-orphan",
    )
    tags = relationship(
        "Tag",
        secondary="application_tags",
        back_populates="applications",
    )

    def __repr__(self):
        return f"<Application(id={self.id}, name='{self.name}')>"
