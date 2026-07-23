import time
import datetime
import requests
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
import concurrent.futures

from app.models import Website, UptimeLog, LinkAudit, BrokenLink, AlertRule
from app.core.config import settings

def normalize_url(base_url: str, link: str) -> str | None:
    if not link or link.startswith(("javascript:", "mailto:", "tel:", "#")):
        return None
    joined = urljoin(base_url, link)
    parsed = urlparse(joined)
    if parsed.scheme not in ("http", "https"):
        return None
    # Strip fragment
    return f"{parsed.scheme}://{parsed.netloc}{parsed.path}" + (f"?{parsed.query}" if parsed.query else "")

def check_link_status(url: str, timeout: int = 8) -> tuple[int | None, str | None]:
    """Checks an individual link and returns (status_code, error_message)"""
    headers = {"User-Agent": settings.USER_AGENT}
    try:
        # Try HEAD request first for efficiency
        resp = requests.head(url, headers=headers, timeout=timeout, allow_redirects=True, verify=False)
        if resp.status_code in (405, 403, 501): # Some servers disallow HEAD requests
            resp = requests.get(url, headers=headers, timeout=timeout, allow_redirects=True, stream=True, verify=False)
        return (resp.status_code, None if resp.status_code < 400 else f"HTTP {resp.status_code}")
    except requests.exceptions.Timeout:
        return (None, "Connection Timeout")
    except requests.exceptions.SSLError:
        return (None, "SSL Verification Failed")
    except requests.exceptions.ConnectionError:
        return (None, "DNS / Connection Failed")
    except Exception as e:
        return (None, str(e)[:250])

def run_website_check(db: Session, website_id: int) -> dict:
    """
    Performs full uptime ping & broken link crawl for a website.
    Updates Database models.
    """
    website = db.query(Website).filter(Website.id == website_id).first()
    if not website:
        return {"error": "Website not found"}

    start_time = time.time()
    headers = {"User-Agent": settings.USER_AGENT}
    
    status_code = None
    is_up = False
    error_message = None
    response_time_ms = 0.0
    html_content = None

    # Step 1: Ping Target Website
    try:
        resp = requests.get(
            website.url,
            headers=headers,
            timeout=website.timeout_seconds,
            verify=False
        )
        response_time_ms = round((time.time() - start_time) * 1000, 2)
        status_code = resp.status_code
        is_up = 200 <= status_code < 400
        if is_up:
            html_content = resp.text
        else:
            error_message = f"Returned HTTP {status_code}"
    except requests.exceptions.Timeout:
        response_time_ms = round((time.time() - start_time) * 1000, 2)
        is_up = False
        error_message = f"Timeout after {website.timeout_seconds} seconds"
    except requests.exceptions.SSLError:
        response_time_ms = round((time.time() - start_time) * 1000, 2)
        is_up = False
        error_message = "SSL Certificate Error"
    except requests.exceptions.ConnectionError:
        response_time_ms = round((time.time() - start_time) * 1000, 2)
        is_up = False
        error_message = "Connection / DNS Lookup Failed"
    except Exception as e:
        response_time_ms = round((time.time() - start_time) * 1000, 2)
        is_up = False
        error_message = str(e)[:250]

    # Save Uptime Log
    uptime_log = UptimeLog(
        website_id=website.id,
        status_code=status_code,
        response_time_ms=response_time_ms,
        is_up=is_up,
        error_message=error_message,
        checked_at=datetime.datetime.utcnow()
    )
    db.add(uptime_log)

    # Step 2: Perform BeautifulSoup Link Crawling if page returned HTML
    found_links = []
    broken_links_found = []
    audit_execution_seconds = 0.0

    if html_content and is_up:
        audit_start = time.time()
        soup = BeautifulSoup(html_content, "html.parser")
        anchor_tags = soup.find_all("a", href=True)

        extracted_urls = []
        for tag in anchor_tags:
            raw_href = tag["href"].strip()
            anchor_text = tag.get_text(strip=True)[:100] or "[Image / Empty]"
            normalized = normalize_url(website.url, raw_href)
            if normalized:
                extracted_urls.append((normalized, anchor_text))

        # Limit max links to check per crawl to prevent excessive load
        extracted_urls = extracted_urls[:settings.MAX_CRAWL_LINKS]

        # Concurrently verify target URLs
        def check_task(item):
            target_url, anchor_txt = item
            code, err = check_link_status(target_url, timeout=website.timeout_seconds)
            return (target_url, anchor_txt, code, err)

        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            results = list(executor.map(check_task, extracted_urls))

        audit_execution_seconds = round(time.time() - audit_start, 2)

        # Create Link Audit entry
        audit = LinkAudit(
            website_id=website.id,
            total_links=len(extracted_urls),
            checked_links=len(results),
            broken_links_count=0,
            execution_time_seconds=audit_execution_seconds,
            status="COMPLETED",
            created_at=datetime.datetime.utcnow()
        )
        db.add(audit)
        db.flush()  # get audit.id

        broken_count = 0
        for target_url, anchor_txt, code, err in results:
            if code is None or code >= 400:
                broken_count += 1
                b_link = BrokenLink(
                    audit_id=audit.id,
                    source_url=website.url,
                    target_url=target_url,
                    status_code=code,
                    error_message=err,
                    anchor_text=anchor_txt,
                    checked_at=datetime.datetime.utcnow()
                )
                db.add(b_link)
                broken_links_found.append({
                    "target_url": target_url,
                    "anchor_text": anchor_txt,
                    "status_code": code,
                    "error_message": err
                })

        audit.broken_links_count = broken_count

    # Update website status
    if not is_up:
        website.status = "DOWN"
    elif broken_links_found:
        website.status = "DEGRADED"
    else:
        website.status = "UP"

    website.last_check_at = datetime.datetime.utcnow()
    db.commit()

    # Trigger alerts if necessary
    trigger_alerts_if_needed(db, website, is_up, len(broken_links_found))

    return {
        "website_id": website.id,
        "status": website.status,
        "is_up": is_up,
        "status_code": status_code,
        "response_time_ms": response_time_ms,
        "links_checked": len(found_links),
        "broken_links_count": len(broken_links_found),
        "broken_links": broken_links_found
    }

def trigger_alerts_if_needed(db: Session, website: Website, is_up: bool, broken_links_count: int):
    """Sends webhook payloads if alert conditions are met"""
    rules = db.query(AlertRule).filter(
        AlertRule.website_id == website.id,
        AlertRule.is_active == True
    ).all()

    for rule in rules:
        should_alert = False
        reason = ""

        if not is_up and rule.notify_on_down:
            should_alert = True
            reason = f"Website {website.name} ({website.url}) is DOWN!"
        elif broken_links_count > 0 and rule.notify_on_broken_link:
            should_alert = True
            reason = f"Website {website.name} has {broken_links_count} broken link(s) detected!"

        if should_alert and rule.alert_type == "WEBHOOK":
            payload = {
                "event": "UPTIME_ALERT",
                "website_id": website.id,
                "website_name": website.name,
                "url": website.url,
                "status": website.status,
                "reason": reason,
                "timestamp": datetime.datetime.utcnow().isoformat()
            }
            try:
                requests.post(rule.target, json=payload, timeout=5)
            except Exception:
                pass  # Avoid crashing checker if external webhook fails
