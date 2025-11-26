from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.database import Base


class IncidentLog(Base):
    """Incident log for audit and troubleshooting."""

    __tablename__ = "incident_log"

    id = Column(Integer, primary_key=True, autoincrement=True)
    grafana_incident_id = Column(String(255), nullable=True)
    title = Column(Text, nullable=False)
    severity_internal = Column(String(10), nullable=False)  # P1, P2, P3, P4
    severity_grafana = Column(String(20), nullable=False)   # critical, major, minor
    tags = Column(Text, nullable=True)  # JSON-serialized list of tags
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    def __repr__(self):
        return f"<IncidentLog(id={self.id}, grafana_id='{self.grafana_incident_id}')>"
