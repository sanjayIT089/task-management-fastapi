import json
import logging
from datetime import datetime, timezone
from typing import Any

logger = logging.getLogger("app.audit")


def record_task_audit_event(event_type: str, payload: dict[str, Any]) -> None:
    """Write a structured task audit event.

    For this take-home we use application logs. In production, this is usually
    sent to a durable audit sink (database table or event stream/queue).
    """
    event = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "event_type": event_type,
        **payload,
    }
    logger.info(json.dumps(event, default=str))
