from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Capability(Base):
    """Capability model - child nodes under applications."""

    __tablename__ = "capabilities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    # Unique constraint: name must be unique within an application
    __table_args__ = (
        UniqueConstraint("application_id", "name", name="uq_capability_app_name"),
    )

    # Relationships
    application = relationship("Application", back_populates="capabilities")
    tags = relationship(
        "Tag",
        secondary="capability_tags",
        back_populates="capabilities",
    )

    def __repr__(self):
        return f"<Capability(id={self.id}, name='{self.name}', app_id={self.application_id})>"
