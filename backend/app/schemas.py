from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, HttpUrl, Field, ConfigDict

# Auth Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    full_name: Optional[str]
    is_active: bool
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Website Schemas
class WebsiteBase(BaseModel):
    name: str
    url: str
    check_interval_minutes: int = Field(5, ge=1, le=1440)
    max_depth: int = Field(1, ge=1, le=3)
    timeout_seconds: int = Field(10, ge=3, le=60)
    is_active: bool = True

class WebsiteCreate(WebsiteBase):
    pass

class WebsiteUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    check_interval_minutes: Optional[int] = None
    max_depth: Optional[int] = None
    timeout_seconds: Optional[int] = None
    is_active: Optional[bool] = None

# Log & Audit Schemas
class UptimeLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    website_id: int
    status_code: Optional[int]
    response_time_ms: float
    is_up: bool
    error_message: Optional[str]
    checked_at: datetime

class BrokenLinkResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    audit_id: int
    source_url: str
    target_url: str
    status_code: Optional[int]
    error_message: Optional[str]
    anchor_text: Optional[str]
    checked_at: datetime

class LinkAuditResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    website_id: int
    total_links: int
    checked_links: int
    broken_links_count: int
    execution_time_seconds: float
    status: str
    created_at: datetime
    broken_links: List[BrokenLinkResponse] = []

class WebsiteResponse(WebsiteBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    status: str
    last_check_at: Optional[datetime]
    created_at: datetime
    latest_uptime: Optional[UptimeLogResponse] = None
    latest_audit: Optional[LinkAuditResponse] = None

# Alert Schemas
class AlertRuleCreate(BaseModel):
    alert_type: str = Field("WEBHOOK", pattern="^(WEBHOOK|EMAIL)$")
    target: str
    notify_on_down: bool = True
    notify_on_broken_link: bool = True

class AlertRuleResponse(AlertRuleCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    website_id: int
    is_active: bool
    created_at: datetime

# Dashboard Metrics
class DashboardMetrics(BaseModel):
    total_monitored: int
    up_count: int
    down_count: int
    overall_uptime_percentage: float
    average_response_time_ms: float
    total_broken_links: int
