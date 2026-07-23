import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    websites = relationship("Website", back_populates="owner", cascade="all, delete-orphan")

class Website(Base):
    __tablename__ = "websites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    url = Column(String, nullable=False, index=True)
    check_interval_minutes = Column(Integer, default=5)
    max_depth = Column(Integer, default=1)
    timeout_seconds = Column(Integer, default=10)
    is_active = Column(Boolean, default=True)
    status = Column(String, default="PENDING")  # UP, DOWN, DEGRADED, PENDING
    last_check_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="websites")
    uptime_logs = relationship("UptimeLog", back_populates="website", cascade="all, delete-orphan", order_by="desc(UptimeLog.checked_at)")
    link_audits = relationship("LinkAudit", back_populates="website", cascade="all, delete-orphan", order_by="desc(LinkAudit.created_at)")
    alert_rules = relationship("AlertRule", back_populates="website", cascade="all, delete-orphan")

class UptimeLog(Base):
    __tablename__ = "uptime_logs"

    id = Column(Integer, primary_key=True, index=True)
    website_id = Column(Integer, ForeignKey("websites.id"), nullable=False)
    status_code = Column(Integer, nullable=True)
    response_time_ms = Column(Float, nullable=False)
    is_up = Column(Boolean, nullable=False)
    error_message = Column(Text, nullable=True)
    checked_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    website = relationship("Website", back_populates="uptime_logs")

class LinkAudit(Base):
    __tablename__ = "link_audits"

    id = Column(Integer, primary_key=True, index=True)
    website_id = Column(Integer, ForeignKey("websites.id"), nullable=False)
    total_links = Column(Integer, default=0)
    checked_links = Column(Integer, default=0)
    broken_links_count = Column(Integer, default=0)
    execution_time_seconds = Column(Float, default=0.0)
    status = Column(String, default="COMPLETED") # COMPLETED, RUNNING, FAILED
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    website = relationship("Website", back_populates="link_audits")
    broken_links = relationship("BrokenLink", back_populates="audit", cascade="all, delete-orphan")

class BrokenLink(Base):
    __tablename__ = "broken_links"

    id = Column(Integer, primary_key=True, index=True)
    audit_id = Column(Integer, ForeignKey("link_audits.id"), nullable=False)
    source_url = Column(String, nullable=False)
    target_url = Column(String, nullable=False)
    status_code = Column(Integer, nullable=True)
    error_message = Column(Text, nullable=True)
    anchor_text = Column(String, nullable=True)
    checked_at = Column(DateTime, default=datetime.datetime.utcnow)

    audit = relationship("LinkAudit", back_populates="broken_links")

class AlertRule(Base):
    __tablename__ = "alert_rules"

    id = Column(Integer, primary_key=True, index=True)
    website_id = Column(Integer, ForeignKey("websites.id"), nullable=False)
    alert_type = Column(String, default="WEBHOOK")  # WEBHOOK, EMAIL
    target = Column(String, nullable=False)  # Webhook URL or Email address
    notify_on_down = Column(Boolean, default=True)
    notify_on_broken_link = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    website = relationship("Website", back_populates="alert_rules")
