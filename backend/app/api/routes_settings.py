from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.api.deps import get_db, require_roles
from backend.app.models import Setting, User
from backend.app.schemas import SettingRead, SettingUpdate
from backend.app.services.audit import log_action


router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=list[SettingRead])
def list_settings(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Manager")),
) -> list[Setting]:
    return list(db.scalars(select(Setting).order_by(Setting.key.asc())))


@router.patch("/{setting_id}", response_model=SettingRead)
def update_setting(
    setting_id: int,
    payload: SettingUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin")),
) -> Setting:
    setting = db.get(Setting, setting_id)
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    setting.value = payload.value
    if payload.description is not None:
        setting.description = payload.description
    db.add(setting)
    db.commit()
    db.refresh(setting)
    log_action(db, action="update", entity_type="setting", entity_id=str(setting.id), actor=user, details=payload.model_dump())
    return setting
