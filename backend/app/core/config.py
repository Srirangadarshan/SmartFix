import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from typing import List, Optional
import secrets

# Load environment variables
load_dotenv()

class Settings(BaseSettings):
    # Application Settings
    APP_NAME: str = "SmartFix-AI"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Security Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    
    # Database Settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./smartfix_ai.db")
    DB_FILE: str = os.getenv("DB_FILE", "./smartfix_ai.db")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # API Keys (must be provided via environment variables)
    HUGGINGFACE_API_KEY: str = os.getenv("HUGGINGFACE_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    SERPAPI_KEY: str = os.getenv("SERPAPI_KEY", "")
    TWILIO_SID: str = os.getenv("TWILIO_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_FROM_PHONE: str = os.getenv("TWILIO_FROM_PHONE", "")
    TWILIO_TO_PHONE: str = os.getenv("TWILIO_TO_PHONE", "")
    
    # Service availability flags (computed from API keys)
    HUGGINGFACE_AVAILABLE: bool = False
    GEMINI_AVAILABLE: bool = False
    SERPAPI_AVAILABLE: bool = False
    NOTIFICATIONS_AVAILABLE: bool = False
    
    # CORS Settings
    CORS_ORIGINS: List[str] = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:8000").split(",")
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
    
    # Monitoring
    SENTRY_DSN: Optional[str] = os.getenv("SENTRY_DSN")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    
    # Retry Settings
    MAX_RETRIES: int = int(os.getenv("MAX_RETRIES", "3"))
    RETRY_DELAY: float = float(os.getenv("RETRY_DELAY", "1.0"))
    
    # Backup Settings
    BACKUP_ENABLED: bool = os.getenv("BACKUP_ENABLED", "True").lower() == "true"
    BACKUP_INTERVAL_HOURS: int = int(os.getenv("BACKUP_INTERVAL_HOURS", "24"))
    BACKUP_RETENTION_DAYS: int = int(os.getenv("BACKUP_RETENTION_DAYS", "30"))
    
    # Health Check Settings
    HEALTH_CHECK_INTERVAL: int = int(os.getenv("HEALTH_CHECK_INTERVAL", "30"))
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._validate_required_keys()
    
    def _validate_required_keys(self):
        """Validate that required API keys are provided and set service availability"""
        # Core required keys
        if not self.SECRET_KEY:
            raise ValueError("SECRET_KEY is required for application security")

        # Optional service keys - set availability flags
        self.HUGGINGFACE_AVAILABLE = bool(self.HUGGINGFACE_API_KEY)
        self.GEMINI_AVAILABLE = bool(self.GEMINI_API_KEY)
        self.SERPAPI_AVAILABLE = bool(self.SERPAPI_KEY)
        self.NOTIFICATIONS_AVAILABLE = all([
            self.TWILIO_SID,
            self.TWILIO_AUTH_TOKEN,
            self.TWILIO_FROM_PHONE
        ])

        # Log service availability
        import logging
        logger = logging.getLogger(__name__)
        logger.info("Service availability:")
        logger.info(f"- HuggingFace AI: {'✓' if self.HUGGINGFACE_AVAILABLE else '✗'}")
        logger.info(f"- Google Gemini: {'✓' if self.GEMINI_AVAILABLE else '✗'}")
        logger.info(f"- SerpAPI Search: {'✓' if self.SERPAPI_AVAILABLE else '✗'}")
        logger.info(f"- Notifications: {'✓' if self.NOTIFICATIONS_AVAILABLE else '✗'}")

settings = Settings()