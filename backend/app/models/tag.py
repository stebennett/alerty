from sqlalchemy import Column, Integer, String, Table, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


# Junction table for Application <-> Tag many-to-many relationship
application_tags = Table(
    "application_tags",
    Base.metadata,
    Column("application_id", Integer, ForeignKey("applications.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)

# Junction table for Capability <-> Tag many-to-many relationship
capability_tags = Table(
    "capability_tags",
    Base.metadata,
    Column("capability_id", Integer, ForeignKey("capabilities.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class Tag(Base):
    """Tag model - used for routing incidents to operations teams."""

    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, autoincrement=True)
    value = Column(String(255), unique=True, nullable=False)

    # Relationships
    applications = relationship(
        "Application",
        secondary=application_tags,
        back_populates="tags",
    )
    capabilities = relationship(
        "Capability",
        secondary=capability_tags,
        back_populates="tags",
    )

    def __repr__(self):
        return f"<Tag(id={self.id}, value='{self.value}')>"
