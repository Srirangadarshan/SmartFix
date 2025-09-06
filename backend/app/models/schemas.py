from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime
import uuid

# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    TECHNICIAN = "technician"
    USER = "user"
    GUEST = "guest"

class QueryType(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    LOG = "log"

class QueryStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class ConsentType(str, Enum):
    DATA_COLLECTION = "data_collection"
    ANALYTICS = "analytics"
    COMMUNICATIONS = "communications"
    THIRD_PARTY = "third_party"

# Authentication Schemas
class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=2, max_length=100)
    role: UserRole = UserRole.USER
    organization: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    organization: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    username: str
    full_name: str
    role: UserRole
    organization: Optional[str]
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime]
    consents: Dict[str, bool]

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    role: Optional[UserRole] = None

# Query Schemas
class QueryInput(BaseModel):
    text_query: str = Field(..., min_length=1, max_length=2000)
    user_id: str
    input_type: QueryType = QueryType.TEXT
    device_category: Optional[str] = None
    priority: Optional[str] = "normal"

class Solution(BaseModel):
    issue: str
    possible_causes: List[str]
    confidence_score: float
    recommended_steps: List[Dict[str, Any]]
    external_sources: List[Dict[str, Any]]
    additional_notes: Optional[str] = None

class QueryResponse(BaseModel):
    query_id: str
    solution: Solution
    source: str
    query_text: str
    processing_time: float
    models_used: List[str]
    timestamp: datetime
    confidence_score: float

class QueryHistory(BaseModel):
    id: str
    user_id: str
    query_text: str
    input_type: QueryType
    solution: Solution
    status: QueryStatus
    created_at: datetime
    processing_time: float
    confidence_score: float

# Consent Schemas
class ConsentRequest(BaseModel):
    consent_type: ConsentType
    granted: bool
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ConsentResponse(BaseModel):
    user_id: str
    consents: Dict[str, bool]
    last_updated: datetime

# Health Check Schemas
class HealthCheck(BaseModel):
    status: str
    timestamp: datetime
    version: str
    environment: str
    services: Dict[str, Dict[str, Any]]

class ServiceHealth(BaseModel):
    name: str
    status: str
    response_time: float
    last_check: datetime
    error_message: Optional[str] = None

# Monitoring Schemas
class MetricsData(BaseModel):
    timestamp: datetime
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    active_connections: int
    requests_per_minute: float
    error_rate: float

class AlertConfig(BaseModel):
    alert_type: str
    threshold: float
    enabled: bool
    notification_channels: List[str]

# Backup Schemas
class BackupConfig(BaseModel):
    enabled: bool
    interval_hours: int
    retention_days: int
    storage_path: str
    compression_enabled: bool

class BackupStatus(BaseModel):
    last_backup: Optional[datetime]
    next_backup: datetime
    backup_size: Optional[int]
    status: str
    error_message: Optional[str] = None

# Rate Limiting Schemas
class RateLimitInfo(BaseModel):
    remaining_requests: int
    reset_time: datetime
    limit: int

# Error Response Schemas
class ErrorResponse(BaseModel):
    error_code: str
    message: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    request_id: Optional[str] = None

class ValidationError(BaseModel):
    field: str
    message: str
    value: Optional[Any] = None


# Notification Schemas
class NotificationRequest(BaseModel):
    user_id: str
    message: str
    notification_type: str = "sms"
    to_contact: str
    priority: str = "normal"

class NotificationResponse(BaseModel):
    notification_id: str
    status: str
    sent_at: datetime
    delivery_status: Optional[str] = None

# API Response Wrapper
class APIResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    message: Optional[str] = None
    errors: Optional[List[ValidationError]] = None
    metadata: Optional[Dict[str, Any]] = None
