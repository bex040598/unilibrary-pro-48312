from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api import (
    routes_assets,
    routes_audit,
    routes_auth,
    routes_dashboard,
    routes_mitigations,
    routes_reports,
    routes_risk,
    routes_settings,
    routes_simulations,
    routes_threats,
    routes_users,
    routes_vulnerabilities,
)
from backend.app.core.config import settings
from backend.app.core.database import SessionLocal, engine
from backend.app.models import Base
from backend.app.services.seed import seed_database


app = FastAPI(
    title=settings.app_name,
    description=settings.app_description,
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes_auth.router)
app.include_router(routes_assets.router)
app.include_router(routes_threats.router)
app.include_router(routes_vulnerabilities.router)
app.include_router(routes_risk.router)
app.include_router(routes_simulations.router)
app.include_router(routes_mitigations.router)
app.include_router(routes_reports.router)
app.include_router(routes_dashboard.router)
app.include_router(routes_audit.router)
app.include_router(routes_users.router)
app.include_router(routes_settings.router)


def initialize_data() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_database(db)


@app.on_event("startup")
def startup() -> None:
    initialize_data()


@app.get("/health", tags=["health"])
def health() -> dict:
    return {"status": "ok", "service": settings.app_name}


initialize_data()
