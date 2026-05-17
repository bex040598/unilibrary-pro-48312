from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.api.deps import get_db, require_roles
from backend.app.models import Threat, User
from backend.app.schemas import ThreatCreate, ThreatRead, ThreatUpdate
from backend.app.services.audit import log_action


router = APIRouter(prefix="/threats", tags=["threats"])


@router.get("", response_model=list[ThreatRead])
def list_threats(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst", "Auditor", "Manager", "Viewer")),
) -> list[Threat]:
    return list(db.scalars(select(Threat).order_by(Threat.threat_name)))


@router.post("", response_model=ThreatRead, status_code=status.HTTP_201_CREATED)
def create_threat(
    payload: ThreatCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst")),
) -> Threat:
    threat = Threat(**payload.model_dump())
    db.add(threat)
    db.commit()
    db.refresh(threat)
    log_action(db, action="create", entity_type="threat", entity_id=str(threat.id), actor=user, details=payload.model_dump())
    return threat


@router.get("/{threat_id}", response_model=ThreatRead)
def get_threat(
    threat_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst", "Auditor", "Manager", "Viewer")),
) -> Threat:
    threat = db.get(Threat, threat_id)
    if not threat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Threat not found")
    return threat


@router.patch("/{threat_id}", response_model=ThreatRead)
def update_threat(
    threat_id: int,
    payload: ThreatUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst")),
) -> Threat:
    threat = db.get(Threat, threat_id)
    if not threat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Threat not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(threat, key, value)
    db.add(threat)
    db.commit()
    db.refresh(threat)
    log_action(db, action="update", entity_type="threat", entity_id=str(threat.id), actor=user, details=payload.model_dump(exclude_unset=True))
    return threat


@router.delete("/{threat_id}")
def delete_threat(
    threat_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst")),
) -> dict:
    threat = db.get(Threat, threat_id)
    if not threat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Threat not found")
    db.delete(threat)
    db.commit()
    log_action(db, action="delete", entity_type="threat", entity_id=str(threat_id), actor=user, details={})
    return {"message": "Threat deleted"}
