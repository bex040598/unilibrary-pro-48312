from __future__ import annotations

from datetime import datetime

from sqlalchemy import Column, JSON, Boolean, DateTime, Float, ForeignKey, Integer, String, Table, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", ForeignKey("users.id"), primary_key=True),
    Column("role_id", ForeignKey("roles.id"), primary_key=True),
)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    description: Mapped[str] = mapped_column(String(255), default="")

    users: Mapped[list["User"]] = relationship(
        "User", secondary=user_roles, back_populates="roles"
    )


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    title: Mapped[str] = mapped_column(String(120), default="")
    department: Mapped[str] = mapped_column(String(120), default="")
    locale: Mapped[str] = mapped_column(String(10), default="uz")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_login: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    roles: Mapped[list[Role]] = relationship("Role", secondary=user_roles, back_populates="users")
    audit_logs: Mapped[list["AuditLog"]] = relationship("AuditLog", back_populates="actor")


class Asset(Base, TimestampMixin):
    __tablename__ = "assets"

    id: Mapped[int] = mapped_column(primary_key=True)
    asset_name: Mapped[str] = mapped_column(String(150), index=True)
    asset_type: Mapped[str] = mapped_column(String(80))
    owner: Mapped[str] = mapped_column(String(120))
    department: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text, default="")
    asset_value: Mapped[float] = mapped_column(Float, default=50.0)
    confidentiality_level: Mapped[int] = mapped_column(Integer, default=3)
    integrity_level: Mapped[int] = mapped_column(Integer, default=3)
    availability_level: Mapped[int] = mapped_column(Integer, default=3)
    business_criticality: Mapped[str] = mapped_column(String(30), default="Medium")
    data_sensitivity: Mapped[str] = mapped_column(String(30), default="Internal")
    internet_exposure: Mapped[str] = mapped_column(String(30), default="Medium")

    vulnerabilities: Mapped[list["Vulnerability"]] = relationship(
        "Vulnerability", back_populates="asset", cascade="all, delete-orphan"
    )
    assessments: Mapped[list["RiskAssessment"]] = relationship("RiskAssessment", back_populates="asset")


class Threat(Base):
    __tablename__ = "threats"

    id: Mapped[int] = mapped_column(primary_key=True)
    threat_name: Mapped[str] = mapped_column(String(150), index=True)
    threat_category: Mapped[str] = mapped_column(String(80), index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    likelihood: Mapped[str] = mapped_column(String(30), default="Medium")
    frequency_per_year: Mapped[float] = mapped_column(Float, default=1.0)
    threat_actor: Mapped[str] = mapped_column(String(120), default="")
    attack_vector: Mapped[str] = mapped_column(String(120), default="")
    historical_incidents: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    assessments: Mapped[list["RiskAssessment"]] = relationship("RiskAssessment", back_populates="threat")


class Vulnerability(Base):
    __tablename__ = "vulnerabilities"

    id: Mapped[int] = mapped_column(primary_key=True)
    vulnerability_name: Mapped[str] = mapped_column(String(150), index=True)
    asset_id: Mapped[int] = mapped_column(ForeignKey("assets.id"), index=True)
    severity: Mapped[str] = mapped_column(String(30), default="Medium")
    exploitability: Mapped[int] = mapped_column(Integer, default=3)
    cvss_score: Mapped[float] = mapped_column(Float, default=5.0)
    description: Mapped[str] = mapped_column(Text, default="")
    remediation: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(30), default="open")
    discovered_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    asset: Mapped[Asset] = relationship("Asset", back_populates="vulnerabilities")
    assessments: Mapped[list["RiskAssessment"]] = relationship(
        "RiskAssessment", back_populates="vulnerability"
    )


class RiskAssessment(Base, TimestampMixin):
    __tablename__ = "risk_assessments"

    id: Mapped[int] = mapped_column(primary_key=True)
    asset_id: Mapped[int] = mapped_column(ForeignKey("assets.id"), index=True)
    threat_id: Mapped[int] = mapped_column(ForeignKey("threats.id"), index=True)
    vulnerability_id: Mapped[int] = mapped_column(ForeignKey("vulnerabilities.id"), index=True)
    probability_score: Mapped[float] = mapped_column(Float)
    probability_label: Mapped[str] = mapped_column(String(30), default="Medium")
    impact_score: Mapped[float] = mapped_column(Float)
    impact_label: Mapped[str] = mapped_column(String(30), default="Significant")
    asset_value_factor: Mapped[float] = mapped_column(Float, default=1.0)
    control_effectiveness: Mapped[float] = mapped_column(Float, default=0.3)
    inherent_risk: Mapped[float] = mapped_column(Float, default=0.0)
    residual_risk: Mapped[float] = mapped_column(Float, default=0.0)
    risk_level: Mapped[str] = mapped_column(String(30), default="Low")
    expected_annual_loss: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String(30), default="active")
    notes: Mapped[str] = mapped_column(Text, default="")
    assessed_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    assessed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    asset: Mapped[Asset] = relationship("Asset", back_populates="assessments")
    threat: Mapped[Threat] = relationship("Threat", back_populates="assessments")
    vulnerability: Mapped[Vulnerability] = relationship("Vulnerability", back_populates="assessments")
    assessor: Mapped[User | None] = relationship("User")
    simulations: Mapped[list["MonteCarloSimulation"]] = relationship(
        "MonteCarloSimulation", back_populates="risk_assessment", cascade="all, delete-orphan"
    )
    bayesian_updates: Mapped[list["BayesianUpdate"]] = relationship(
        "BayesianUpdate", back_populates="risk_assessment", cascade="all, delete-orphan"
    )
    mitigations: Mapped[list["Mitigation"]] = relationship(
        "Mitigation", back_populates="risk_assessment", cascade="all, delete-orphan"
    )


class MonteCarloSimulation(Base):
    __tablename__ = "monte_carlo_simulations"

    id: Mapped[int] = mapped_column(primary_key=True)
    risk_assessment_id: Mapped[int | None] = mapped_column(
        ForeignKey("risk_assessments.id"), nullable=True, index=True
    )
    iterations: Mapped[int] = mapped_column(Integer, default=1000)
    distribution_type: Mapped[str] = mapped_column(String(30), default="uniform")
    average_loss: Mapped[float] = mapped_column(Float, default=0.0)
    median_loss: Mapped[float] = mapped_column(Float, default=0.0)
    var_95: Mapped[float] = mapped_column(Float, default=0.0)
    var_99: Mapped[float] = mapped_column(Float, default=0.0)
    max_loss: Mapped[float] = mapped_column(Float, default=0.0)
    min_loss: Mapped[float] = mapped_column(Float, default=0.0)
    result_json: Mapped[dict] = mapped_column(JSON, default=dict)
    created_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    risk_assessment: Mapped[RiskAssessment | None] = relationship(
        "RiskAssessment", back_populates="simulations"
    )


class BayesianUpdate(Base):
    __tablename__ = "bayesian_updates"

    id: Mapped[int] = mapped_column(primary_key=True)
    risk_assessment_id: Mapped[int] = mapped_column(ForeignKey("risk_assessments.id"), index=True)
    prior_probability: Mapped[float] = mapped_column(Float, default=0.3)
    likelihood_risk: Mapped[float] = mapped_column(Float, default=0.5)
    likelihood_no_risk: Mapped[float] = mapped_column(Float, default=0.2)
    posterior_probability: Mapped[float] = mapped_column(Float, default=0.0)
    explanation: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    risk_assessment: Mapped[RiskAssessment] = relationship(
        "RiskAssessment", back_populates="bayesian_updates"
    )


class Mitigation(Base, TimestampMixin):
    __tablename__ = "mitigations"

    id: Mapped[int] = mapped_column(primary_key=True)
    risk_id: Mapped[int] = mapped_column(ForeignKey("risk_assessments.id"), index=True)
    mitigation_action: Mapped[str] = mapped_column(Text)
    responsible_person: Mapped[str] = mapped_column(String(120))
    deadline: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    cost: Mapped[float] = mapped_column(Float, default=0.0)
    expected_risk_reduction: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String(30), default="planned")
    progress: Mapped[int] = mapped_column(Integer, default=0)
    residual_risk_after_action: Mapped[float] = mapped_column(Float, default=0.0)

    risk_assessment: Mapped[RiskAssessment] = relationship("RiskAssessment", back_populates="mitigations")


class Report(Base, TimestampMixin):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(180))
    report_type: Mapped[str] = mapped_column(String(80))
    prepared_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    report_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    executive_summary: Mapped[str] = mapped_column(Text, default="")
    content_json: Mapped[dict] = mapped_column(JSON, default=dict)

    files: Mapped[list["ReportFile"]] = relationship(
        "ReportFile", back_populates="report", cascade="all, delete-orphan"
    )


class ReportFile(Base):
    __tablename__ = "report_files"

    id: Mapped[int] = mapped_column(primary_key=True)
    report_id: Mapped[int] = mapped_column(ForeignKey("reports.id"), index=True)
    file_type: Mapped[str] = mapped_column(String(20))
    file_name: Mapped[str] = mapped_column(String(180))
    path: Mapped[str] = mapped_column(String(255), default="")

    report: Mapped[Report] = relationship("Report", back_populates="files")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    actor_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    actor_email: Mapped[str] = mapped_column(String(120), default="")
    action: Mapped[str] = mapped_column(String(120))
    entity_type: Mapped[str] = mapped_column(String(80))
    entity_id: Mapped[str] = mapped_column(String(80), default="")
    details: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    actor: Mapped[User | None] = relationship("User", back_populates="audit_logs")


class Setting(Base, TimestampMixin):
    __tablename__ = "settings"

    id: Mapped[int] = mapped_column(primary_key=True)
    key: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    value: Mapped[str] = mapped_column(Text, default="")
    description: Mapped[str] = mapped_column(Text, default="")
