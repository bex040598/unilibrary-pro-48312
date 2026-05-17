from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.api.deps import get_db, require_roles
from backend.app.models import Asset, User
from backend.app.schemas import AssetCreate, AssetRead, AssetUpdate
from backend.app.services.audit import log_action


router = APIRouter(prefix="/assets", tags=["assets"])


@router.get("", response_model=list[AssetRead])
def list_assets(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst", "Auditor", "Manager", "Viewer")),
) -> list[Asset]:
    return list(db.scalars(select(Asset).order_by(Asset.asset_name)))


@router.post("", response_model=AssetRead, status_code=status.HTTP_201_CREATED)
def create_asset(
    payload: AssetCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst")),
) -> Asset:
    asset = Asset(**payload.model_dump())
    db.add(asset)
    db.commit()
    db.refresh(asset)
    log_action(db, action="create", entity_type="asset", entity_id=str(asset.id), actor=user, details=payload.model_dump())
    return asset


@router.get("/{asset_id}", response_model=AssetRead)
def get_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst", "Auditor", "Manager", "Viewer")),
) -> Asset:
    asset = db.get(Asset, asset_id)
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
    return asset


@router.patch("/{asset_id}", response_model=AssetRead)
def update_asset(
    asset_id: int,
    payload: AssetUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst")),
) -> Asset:
    asset = db.get(Asset, asset_id)
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(asset, key, value)
    db.add(asset)
    db.commit()
    db.refresh(asset)
    log_action(db, action="update", entity_type="asset", entity_id=str(asset.id), actor=user, details=payload.model_dump(exclude_unset=True))
    return asset


@router.delete("/{asset_id}")
def delete_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst")),
) -> dict:
    asset = db.get(Asset, asset_id)
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
    db.delete(asset)
    db.commit()
    log_action(db, action="delete", entity_type="asset", entity_id=str(asset_id), actor=user, details={})
    return {"message": "Asset deleted"}
