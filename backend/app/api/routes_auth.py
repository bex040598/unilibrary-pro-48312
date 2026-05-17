from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.api.deps import get_current_user, get_db
from backend.app.core.security import create_access_token, get_password_hash, verify_password
from backend.app.models import Role, User
from backend.app.schemas import AuthLogin, AuthRegister, TokenResponse, UserRead
from backend.app.services.audit import log_action


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead)
def register(payload: AuthRegister, db: Session = Depends(get_db)) -> User:
    existing = db.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    viewer_role = db.scalar(select(Role).where(Role.name == "Viewer"))
    user = User(
        full_name=payload.full_name,
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        department=payload.department,
        title=payload.title,
        locale=payload.locale,
    )
    if viewer_role:
        user.roles.append(viewer_role)
    db.add(user)
    db.commit()
    db.refresh(user)
    log_action(
        db,
        action="register",
        entity_type="user",
        entity_id=str(user.id),
        actor=user,
        details={"email": user.email},
    )
    return user


@router.post("/login", response_model=TokenResponse)
def login(payload: AuthLogin, db: Session = Depends(get_db)) -> TokenResponse:
    statement = select(User).where(User.email == payload.email)
    user = db.scalar(statement)
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    user.last_login = datetime.utcnow()
    db.add(user)
    db.commit()
    db.refresh(user)

    role_names = [role.name for role in user.roles]
    token = create_access_token(subject=user.email, role_names=role_names)
    log_action(
        db,
        action="login",
        entity_type="auth",
        entity_id=str(user.id),
        actor=user,
        details={"roles": role_names},
    )
    return TokenResponse(access_token=token, user=user)


@router.get("/me", response_model=UserRead)
def me(user: User = Depends(get_current_user)) -> User:
    return user


@router.post("/logout")
def logout(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    log_action(
        db,
        action="logout",
        entity_type="auth",
        entity_id=str(user.id),
        actor=user,
        details={},
    )
    return {"message": "Logout recorded on the server"}
