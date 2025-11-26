import httpx
import logging
from typing import Optional
from app.config import get_settings

logger = logging.getLogger(__name__)


class GrafanaIRMClient:
    """Client for interacting with Grafana IRM API."""

    def __init__(self):
        settings = get_settings()
        self.base_url = settings.grafana_irm_base_url.rstrip("/")
        self.api_token = settings.grafana_irm_api_token

    def _get_headers(self) -> dict:
        """Get headers for API requests."""
        return {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
        }

    async def create_incident(
        self,
        title: str,
        severity: str,
        tags: list[str],
    ) -> dict:
        """
        Create an incident in Grafana IRM.

        Args:
            title: Incident title
            severity: Grafana severity (critical, major, minor)
            tags: List of tags for routing

        Returns:
            Dict with incident_id and incident_url on success

        Raises:
            Exception on failure
        """
        if not self.api_token:
            raise ValueError("Grafana IRM API token is not configured")

        # Parse tags in "key:value" format for Grafana IRM labels
        labels = []
        for tag in tags:
            if ":" in tag:
                key, value = tag.split(":", 1)
                labels.append({"key": key, "label": value})
            else:
                # If no colon, use tag as both key and label
                labels.append({"key": tag, "label": tag})

        payload = {
            "title": title,
            "severity": severity,
            "labels": labels,
        }

        url = f"{self.base_url}/api/plugins/grafana-irm-app/resources/api/v1/IncidentsService.CreateIncident"

        logger.info(f"Creating incident in Grafana IRM: {title}")
        logger.debug(f"Payload: {payload}")

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    json=payload,
                    headers=self._get_headers(),
                    timeout=30.0,
                )

                if response.status_code >= 400:
                    logger.error(f"Grafana IRM API error: {response.status_code} - {response.text}")
                    raise Exception(f"Grafana IRM API error: {response.status_code}")

                data = response.json()
                incident = data.get("incident", {})
                incident_id = incident.get("incidentID", "unknown")
                overview_url = incident.get("overviewURL", "")
                incident_url = f"{self.base_url}{overview_url}" if overview_url else f"{self.base_url}/a/grafana-irm-app/incidents/{incident_id}"

                logger.info(f"Incident created successfully: {incident_id}")

                return {
                    "incident_id": str(incident_id),
                    "incident_url": incident_url,
                }

        except httpx.TimeoutException:
            logger.error("Timeout while creating incident in Grafana IRM")
            raise Exception("Request to Grafana IRM timed out")
        except httpx.RequestError as e:
            logger.error(f"Network error while creating incident: {e}")
            raise Exception(f"Failed to connect to Grafana IRM: {e}")
