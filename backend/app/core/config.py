import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Automated Website Uptime & Link Checker"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "SUPER_SECRET_JWT_KEY_FOR_UPTIME_CHECKER_APP_2026_SECURE_TOKEN"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = "sqlite:///./uptime.db"

    # Default Crawl Settings
    DEFAULT_TIMEOUT: int = 10
    MAX_CRAWL_LINKS: int = 50
    USER_AGENT: str = "AntigravityUptimeBot/1.0 (+https://github.com/uptime-link-checker)"

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")

settings = Settings()
