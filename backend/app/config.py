from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Grafana IRM Configuration
    grafana_irm_base_url: str = "https://grafana.example.com"
    grafana_irm_api_token: str = ""

    # Database Configuration
    database_url: str = "sqlite:///./data/incident_bridge.db"

    # Application Configuration
    app_name: str = "Incident Bridge"
    debug: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
