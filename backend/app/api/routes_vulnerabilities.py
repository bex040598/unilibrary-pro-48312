from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.api.deps import get_db, require_roles
from backend.app.models import Asset, User, Vulnerability
from backend.app.schemas import VulnerabilityCreate, VulnerabilityRead, VulnerabilityUpdate
from backend.app.services.audit import log_action


router = APIRouter(prefix="/vulnerabilities", tags=["vulnerabilities"])


@router.get("", response_model=list[VulnerabilityRead])
def list_vulnerabilities(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst", "Auditor", "Manager", "Viewer")),
) -> list[Vulnerability]:
    return list(db.scalars(select(Vulnerability).order_by(Vulnerability.id.desc())))


@router.post("", response_model=VulnerabilityRead, status_code=status.HTTP_201_CREATED)
def create_vulnerability(
    payload: VulnerabilityCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst")),
) -> Vulnerability:
    if not db.get(Asset, payload.asset_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
    vulnerability = Vulnerability(**payload.model_dump())
    db.add(vulnerability)
    db.commit()
    db.refresh(vulnerability)
    log_action(db, action="create", entity_type="vulnerability", entity_id=str(vulnerability.id), actor=user, details=payload.model_dump())
    return vulnerability


@router.get("/{vulnerability_id}", response_model=VulnerabilityRead)
def get_vulnerability(
    vulnerability_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst", "Auditor", "Manager", "Viewer")),
) -> Vulnerability:
    vulnerability = db.get(Vulnerability, vulnerability_id)
    if not vulnerability:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vulnerability not found")
    return vulnerability


@router.patch("/{vulnerability_id}", response_model=VulnerabilityRead)
def update_vulnerability(
    vulnerability_id: int,
    payload: VulnerabilityUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst")),
) -> Vulnerability:
    vulnerability = db.get(Vulnerability, vulnerability_id)
    if not vulnerability:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vulnerability not found")
    updates = payload.model_dump(exclude_unset=True)
    if "asset_id" in updates and not db.get(Asset, updates["asset_id"]):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
    for key, value in updates.items():
        setattr(vulnerability, key, value)
    db.add(vulnerability)
    db.commit()
    db.refresh(vulnerability)
    log_action(db, action="update", entity_type="vulnerability", entity_id=str(vulnerability.id), actor=user, details=updates)
    return vulnerability


@router.delete("/{vulnerability_id}")
def delete_vulnerability(
    vulnerability_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst")),
) -> dict:
    vulnerability = db.get(Vulnerability, vulnerability_id)
    if not vulnerability:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vulnerability not found")
    db.delete(vulnerability)
    db.commit()
    log_action(db, action="delete", entity_type="vulnerability", entity_id=str(vulnerability_id), actor=user, details={})
    return {"message": "Vulnerability deleted"}
