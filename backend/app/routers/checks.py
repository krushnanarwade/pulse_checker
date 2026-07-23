from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Website, UptimeLog, LinkAudit, BrokenLink
from app.schemas import UptimeLogResponse, LinkAuditResponse
from app.routers.auth import get_current_user
from app.services.checker import run_website_check

router = APIRouter(prefix="/websites", tags=["Checks & Audits"])

@router.post("/{site_id}/check")
def trigger_manual_check(
    site_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    site = db.query(Website).filter(Website.id == site_id, Website.user_id == current_user.id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Website not found")
    
    result = run_website_check(db, site.id)
    return result

@router.get("/{site_id}/logs", response_model=List[UptimeLogResponse])
def get_uptime_logs(
    site_id: int,
    limit: int = Query(50, ge=1, le=500),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    site = db.query(Website).filter(Website.id == site_id, Website.user_id == current_user.id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Website not found")
    
    logs = db.query(UptimeLog).filter(UptimeLog.website_id == site.id).order_by(UptimeLog.checked_at.desc()).limit(limit).all()
    return logs

@router.get("/{site_id}/audits", response_model=List[LinkAuditResponse])
def get_link_audits(
    site_id: int,
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    site = db.query(Website).filter(Website.id == site_id, Website.user_id == current_user.id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Website not found")
    
    audits = db.query(LinkAudit).filter(LinkAudit.website_id == site.id).order_by(LinkAudit.created_at.desc()).limit(limit).all()
    for audit in audits:
        audit.broken_links = db.query(BrokenLink).filter(BrokenLink.audit_id == audit.id).all()
    return audits
