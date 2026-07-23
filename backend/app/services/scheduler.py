import logging
from apscheduler.schedulers.background import BackgroundScheduler
from app.database import SessionLocal
from app.models import Website
from app.services.checker import run_website_check

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("scheduler")

scheduler = BackgroundScheduler()

def periodic_monitoring_job():
    """Runs periodic checks for active websites based on interval"""
    db = SessionLocal()
    try:
        active_websites = db.query(Website).filter(Website.is_active == True).all()
        logger.info(f"Running periodic check for {len(active_websites)} active website(s)...")
        for website in active_websites:
            try:
                result = run_website_check(db, website.id)
                logger.info(f"Check finished for {website.name}: Status={result.get('status')}")
            except Exception as e:
                logger.error(f"Error checking website {website.id}: {e}")
    finally:
        db.close()

def start_scheduler():
    if not scheduler.running:
        # Run every 5 minutes by default
        scheduler.add_job(periodic_monitoring_job, 'interval', minutes=5, id='uptime_periodic_check')
        scheduler.start()
        logger.info("Background periodic website uptime scheduler started.")

def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Background periodic scheduler stopped.")
