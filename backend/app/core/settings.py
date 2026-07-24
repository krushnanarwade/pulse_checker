import os
from enum import Enum
from pydantic_settings import BaseSettings, SettingsConfigDict


class Environment(str, Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"


def _get_env_file():
    """Determine which .env file to load based on ENVIRONMENT variable."""
    environment = os.getenv("ENVIRONMENT", "development").strip().lower()
    env_file = f".env.{environment}"
    
    # If environment-specific file exists, use it; otherwise use .env
    if os.path.exists(env_file):
        return env_file
    return ".env"


class Settings(BaseSettings):
    """
    Application settings with environment-based configuration.
    Loads from .env files in order of precedence:
    1. Environment variables
    2. .env.{ENVIRONMENT} file (e.g., .env.production)
    3. .env file
    4. Default values
    """

    # Environment
    ENVIRONMENT: Environment = Environment.DEVELOPMENT
    DEBUG: bool = False

    # Project
    PROJECT_NAME: str = "Automated Website Uptime & Link Checker"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Security
    SECRET_KEY: str = "SUPER_SECRET_JWT_KEY_FOR_UPTIME_CHECKER_APP_2026_SECURE_TOKEN"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    DATABASE_URL: str = "sqlite:///./uptime.db"

    # CORS
    CORS_ORIGINS: list = ["*"]  # Should be restricted in production
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: list = ["*"]
    CORS_ALLOW_HEADERS: list = ["*"]

    # Crawler Settings
    DEFAULT_TIMEOUT: int = 10
    MAX_CRAWL_LINKS: int = 50
    USER_AGENT: str = "AntigravityUptimeBot/1.0 (+https://github.com/uptime-link-checker)"

    # Scheduler
    SCHEDULER_ENABLED: bool = True
    CHECK_INTERVAL_MINUTES: int = 30

    # Alerts/Webhooks
    SLACK_WEBHOOK_URL: str = ""
    DISCORD_WEBHOOK_URL: str = ""

    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=_get_env_file(),
        extra="allow",
    )

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == Environment.PRODUCTION

    @property
    def is_staging(self) -> bool:
        return self.ENVIRONMENT == Environment.STAGING

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == Environment.DEVELOPMENT


environment = os.getenv("ENVIRONMENT", "development")
# Load settings based on ENVIRONMENT variable
environment = os.getenv("ENVIRONMENT", "development").strip().lower()
settings = Settings(ENVIRONMENT=environment)
