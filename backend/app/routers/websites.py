from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import User, Website, UptimeLog, LinkAudit, BrokenLink
from app.schemas import WebsiteCreate, WebsiteUpdate, WebsiteResponse, DashboardMetrics
from app.routers.auth import get_current_user

router = APIRouter(prefix="/websites", tags=["Websites"])

@router.get("", response_model=List[WebsiteResponse])
def get_websites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    websites = db.query(Website).filter(Website.user_id == current_user.id).order_by(Website.created_at.desc()).all()
    
    # Attach latest uptime log and audit
    for site in websites:
        site.latest_uptime = db.query(UptimeLog).filter(UptimeLog.website_id == site.id).order_by(UptimeLog.checked_at.desc()).first()
        site.latest_audit = db.query(LinkAudit).filter(LinkAudit.website_id == site.id).order_by(LinkAudit.created_at.desc()).first()
        if site.latest_audit:
            site.latest_audit.broken_links = db.query(BrokenLink).filter(BrokenLink.audit_id == site.latest_audit.id).all()
            
    return websites

@router.post("", response_model=WebsiteResponse, status_code=status.HTTP_201_CREATED)
def create_website(
    website_in: WebsiteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Ensure URL protocol exists
    url = website_in.url.strip()
    if not (url.startswith("http://") or url.startswith("https://")):
        url = "https://" + url

    new_site = Website(
        user_id=current_user.id,
        name=website_in.name,
        url=url,
        check_interval_minutes=website_in.check_interval_minutes,
        max_depth=website_in.max_depth,
        timeout_seconds=website_in.timeout_seconds,
        is_active=website_in.is_active,
        status="PENDING"
    )
    db.add(new_site)
    db.commit()
    db.refresh(new_site)
    return new_site

@router.get("/{site_id}", response_model=WebsiteResponse)
def get_website(
    site_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    site = db.query(Website).filter(Website.id == site_id, Website.user_id == current_user.id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Website monitor not found.")
    
    site.latest_uptime = db.query(UptimeLog).filter(UptimeLog.website_id == site.id).order_by(UptimeLog.checked_at.desc()).first()
    site.latest_audit = db.query(LinkAudit).filter(LinkAudit.website_id == site.id).order_by(LinkAudit.created_at.desc()).first()
    if site.latest_audit:
        site.latest_audit.broken_links = db.query(BrokenLink).filter(BrokenLink.audit_id == site.latest_audit.id).all()
        
    return site

@router.put("/{site_id}", response_model=WebsiteResponse)
def update_website(
    site_id: int,
    website_in: WebsiteUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    site = db.query(Website).filter(Website.id == site_id, Website.user_id == current_user.id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Website monitor not found.")
    
    update_data = website_in.model_dump(exclude_unset=True)
    if "url" in update_data and update_data["url"]:
        url = update_data["url"].strip()
        if not (url.startswith("http://") or url.startswith("https://")):
            url = "https://" + url
        update_data["url"] = url

    for field, value in update_data.items():
        setattr(site, field, value)

    db.commit()
    db.refresh(site)

    site.latest_uptime = db.query(UptimeLog).filter(UptimeLog.website_id == site.id).order_by(UptimeLog.checked_at.desc()).first()
    site.latest_audit = db.query(LinkAudit).filter(LinkAudit.website_id == site.id).order_by(LinkAudit.created_at.desc()).first()
    return site

@router.delete("/{site_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_website(
    site_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    site = db.query(Website).filter(Website.id == site_id, Website.user_id == current_user.id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Website monitor not found.")
    
    db.delete(site)
    db.commit()
    return None

@router.get("/metrics/summary", response_model=DashboardMetrics)
def get_dashboard_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sites = db.query(Website).filter(Website.user_id == current_user.id).all()
    total_monitored = len(sites)
    
    up_count = sum(1 for s in sites if s.status == "UP")
    down_count = sum(1 for s in sites if s.status == "DOWN")
    
    site_ids = [s.id for s in sites]
    
    overall_uptime_pct = 100.0
    avg_latency = 0.0
    total_broken = 0

    if site_ids:
        total_pings = db.query(func.count(UptimeLog.id)).filter(UptimeLog.website_id.in_(site_ids)).scalar() or 0
        up_pings = db.query(func.count(UptimeLog.id)).filter(UptimeLog.website_id.in_(site_ids), UptimeLog.is_up == True).scalar() or 0
        
        if total_pings > 0:
            overall_uptime_pct = round((up_pings / total_pings) * 100.0, 1)

        avg_lat = db.query(func.avg(UptimeLog.response_time_ms)).filter(UptimeLog.website_id.in_(site_ids)).scalar()
        if avg_lat:
            avg_latency = round(float(avg_lat), 1)

        total_broken = db.query(func.count(BrokenLink.id)).join(LinkAudit).filter(LinkAudit.website_id.in_(site_ids)).scalar() or 0

    return {
        "total_monitored": total_monitored,
        "up_count": up_count,
        "down_count": down_count,
        "overall_uptime_percentage": overall_uptime_pct,
        "average_response_time_ms": avg_latency,
        "total_broken_links": total_broken
    }
