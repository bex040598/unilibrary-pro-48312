from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.api.deps import get_db, require_roles
from backend.app.models import Role, User
from backend.app.schemas import UserRead, UserUpdate
from backend.app.services.audit import log_action


router = APIRouter(prefix="/admin/users", tags=["users"])


@router.get("", response_model=list[UserRead])
def list_users(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin")),
) -> list[User]:
    return list(db.scalars(select(User).order_by(User.created_at.desc())))


@router.patch("/{user_id}", response_model=UserRead)
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    actor: User = Depends(require_roles("Admin")),
) -> User:
    user = db.scalar(select(User).where(User.id == user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    updates = payload.model_dump(exclude_unset=True)
    role_names = updates.pop("role_names", None)
    for key, value in updates.items():
        setattr(user, key, value)
    if role_names is not None:
        roles = list(db.scalars(select(Role).where(Role.name.in_(role_names))))
        user.roles = roles
    db.add(user)
    db.commit()
    db.refresh(user)
    log_action(db, action="update", entity_type="user", entity_id=str(user.id), actor=actor, details=payload.model_dump(exclude_unset=True))
    return user
