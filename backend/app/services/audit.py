from __future__ import annotations

from datetime import date, datetime

from sqlalchemy.orm import Session

from backend.app.models import AuditLog, User


def _json_safe(value):
    if isinstance(value, dict):
        return {key: _json_safe(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_json_safe(item) for item in value]
    if isinstance(value, tuple):
        return [_json_safe(item) for item in value]
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    return value


def log_action(
    db: Session,
    *,
    action: str,
    entity_type: str,
    entity_id: str = "",
    actor: User | None = None,
    details: dict | None = None,
) -> AuditLog:
    entry = AuditLog(
        actor_id=actor.id if actor else None,
        actor_email=actor.email if actor else "system",
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=_json_safe(details or {}),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
