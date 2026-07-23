from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Website, AlertRule
from app.schemas import AlertRuleCreate, AlertRuleResponse
from app.routers.auth import get_current_user

router = APIRouter(prefix="/websites/{site_id}/alerts", tags=["Alerts"])

@router.get("", response_model=List[AlertRuleResponse])
def get_alerts(
    site_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    site = db.query(Website).filter(Website.id == site_id, Website.user_id == current_user.id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Website not found")
    
    return db.query(AlertRule).filter(AlertRule.website_id == site.id).all()

@router.post("", response_model=AlertRuleResponse, status_code=status.HTTP_201_CREATED)
def create_alert(
    site_id: int,
    alert_in: AlertRuleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    site = db.query(Website).filter(Website.id == site_id, Website.user_id == current_user.id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Website not found")
    
    alert = AlertRule(
        website_id=site.id,
        alert_type=alert_in.alert_type,
        target=alert_in.target,
        notify_on_down=alert_in.notify_on_down,
        notify_on_broken_link=alert_in.notify_on_broken_link,
        is_active=True
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert

@router.delete("/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_alert(
    site_id: int,
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    site = db.query(Website).filter(Website.id == site_id, Website.user_id == current_user.id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Website not found")
    
    alert = db.query(AlertRule).filter(AlertRule.id == alert_id, AlertRule.website_id == site.id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert rule not found")
    
    db.delete(alert)
    db.commit()
    return None
