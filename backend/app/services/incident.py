import json
import logging
from sqlalchemy.orm import Session
from app.models import Application, Capability, IncidentLog
from app.schemas.incident import Severity
from app.services.grafana import GrafanaIRMClient

logger = logging.getLogger(__name__)


# Severity mapping from internal to Grafana
SEVERITY_MAPPING = {
    Severity.P1: "critical",
    Severity.P2: "major",
    Severity.P3: "minor",
    Severity.P4: "minor",
}


class IncidentService:
    """Service for incident creation and management."""

    def __init__(self, db: Session):
        self.db = db
        self.grafana_client = GrafanaIRMClient()

    def map_severity(self, severity: Severity) -> str:
        """Map internal severity to Grafana severity."""
        return SEVERITY_MAPPING[severity]

    def aggregate_tags(
        self,
        application_ids: list[int],
        capability_ids: list[int],
    ) -> list[str]:
        """
        Aggregate and deduplicate tags from selected applications and capabilities.

        Tags are deduplicated case-insensitively, preserving the first occurrence's case.
        """
        tags_seen: dict[str, str] = {}  # lowercase -> original case

        # Get tags from applications
        if application_ids:
            apps = self.db.query(Application).filter(Application.id.in_(application_ids)).all()
            for app in apps:
                for tag in app.tags:
                    lower_value = tag.value.lower()
                    if lower_value not in tags_seen:
                        tags_seen[lower_value] = tag.value

        # Get tags from capabilities
        if capability_ids:
            caps = self.db.query(Capability).filter(Capability.id.in_(capability_ids)).all()
            for cap in caps:
                for tag in cap.tags:
                    lower_value = tag.value.lower()
                    if lower_value not in tags_seen:
                        tags_seen[lower_value] = tag.value

        return list(tags_seen.values())

    async def create_incident(
        self,
        title: str,
        severity: Severity,
        application_ids: list[int],
        capability_ids: list[int],
    ) -> dict:
        """
        Create an incident in Grafana IRM.

        Args:
            title: Incident title
            severity: Internal severity (P1-P4)
            application_ids: List of selected application IDs
            capability_ids: List of selected capability IDs

        Returns:
            Dict with status, incident_id, and incident_url
        """
        # Map severity
        grafana_severity = self.map_severity(severity)

        # Aggregate tags
        tags = self.aggregate_tags(application_ids, capability_ids)

        logger.info(f"Creating incident: {title}, severity: {severity.value} -> {grafana_severity}, tags: {tags}")

        try:
            # Call Grafana IRM API
            result = await self.grafana_client.create_incident(
                title=title,
                severity=grafana_severity,
                tags=tags,
            )

            # Log the incident
            incident_log = IncidentLog(
                grafana_incident_id=result["incident_id"],
                title=title,
                severity_internal=severity.value,
                severity_grafana=grafana_severity,
                tags=json.dumps(tags),
            )
            self.db.add(incident_log)
            self.db.commit()

            return {
                "status": "ok",
                "grafana_incident_id": result["incident_id"],
                "grafana_incident_url": result["incident_url"],
            }

        except Exception as e:
            logger.error(f"Failed to create incident: {e}")
            return {
                "status": "error",
                "message": str(e),
            }
