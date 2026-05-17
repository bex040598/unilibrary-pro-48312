from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[3]
BACKEND_DIR = ROOT_DIR / "backend"
DEFAULT_SQLITE_PATH = ROOT_DIR / "cyberrisk.db"


@dataclass(slots=True)
class Settings:
    app_name: str = "CyberRisk Probability Assessment Platform"
    app_description: str = (
        "Scientific-practical cybersecurity risk assessment platform for digital systems."
    )
    api_prefix: str = ""
    secret_key: str = os.getenv("CYBERRISK_SECRET_KEY", "cyberrisk-dev-secret-key")
    access_token_expire_minutes: int = int(
        os.getenv("CYBERRISK_TOKEN_EXPIRE_MINUTES", "720")
    )
    jwt_algorithm: str = "HS256"
    database_url: str = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{DEFAULT_SQLITE_PATH.as_posix()}",
    )
    cors_origins: list[str] = None  # type: ignore[assignment]
    static_dir: Path = BACKEND_DIR / "app" / "static"

    def __post_init__(self) -> None:
        if self.cors_origins is None:
            raw = os.getenv("CYBERRISK_CORS_ORIGINS", "*")
            self.cors_origins = [origin.strip() for origin in raw.split(",") if origin.strip()]


settings = Settings()
