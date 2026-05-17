from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.api.deps import get_db, require_roles
from backend.app.models import Mitigation, RiskAssessment, User
from backend.app.schemas import MitigationCreate, MitigationRead, MitigationUpdate
from backend.app.services.audit import log_action


router = APIRouter(prefix="/mitigations", tags=["mitigations"])


@router.get("", response_model=list[MitigationRead])
def list_mitigations(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst", "Auditor", "Manager", "Viewer")),
) -> list[Mitigation]:
    return list(db.scalars(select(Mitigation).order_by(Mitigation.updated_at.desc())))


@router.post("", response_model=MitigationRead, status_code=status.HTTP_201_CREATED)
def create_mitigation(
    payload: MitigationCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst", "Manager")),
) -> Mitigation:
    risk = db.get(RiskAssessment, payload.risk_id)
    if not risk:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Risk assessment not found")
    residual_after_action = max(risk.residual_risk - payload.expected_risk_reduction, 0)
    mitigation = Mitigation(
        **payload.model_dump(),
        residual_risk_after_action=residual_after_action,
    )
    db.add(mitigation)
    db.commit()
    db.refresh(mitigation)
    log_action(db, action="create", entity_type="mitigation", entity_id=str(mitigation.id), actor=user, details=payload.model_dump())
    return mitigation


@router.patch("/{mitigation_id}", response_model=MitigationRead)
def update_mitigation(
    mitigation_id: int,
    payload: MitigationUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst", "Manager")),
) -> Mitigation:
    mitigation = db.get(Mitigation, mitigation_id)
    if not mitigation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mitigation not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(mitigation, key, value)
    risk = db.get(RiskAssessment, mitigation.risk_id)
    if risk:
        mitigation.residual_risk_after_action = max(
            risk.residual_risk - mitigation.expected_risk_reduction, 0
        )
    db.add(mitigation)
    db.commit()
    db.refresh(mitigation)
    log_action(db, action="update", entity_type="mitigation", entity_id=str(mitigation.id), actor=user, details=payload.model_dump(exclude_unset=True))
    return mitigation
