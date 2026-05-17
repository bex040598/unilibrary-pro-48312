from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserRead"


class AuthRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(min_length=8)
    department: str = ""
    title: str = ""
    locale: str = "uz"


class AuthLogin(BaseModel):
    email: EmailStr
    password: str


class RoleRead(ORMModel):
    id: int
    name: str
    description: str


class UserRead(ORMModel):
    id: int
    full_name: str
    email: EmailStr
    title: str
    department: str
    locale: str
    is_active: bool
    last_login: datetime | None
    created_at: datetime
    roles: list[RoleRead] = []


class UserUpdate(BaseModel):
    full_name: str | None = None
    title: str | None = None
    department: str | None = None
    locale: str | None = None
    is_active: bool | None = None
    role_names: list[str] | None = None


class AssetBase(BaseModel):
    asset_name: str
    asset_type: str
    owner: str
    department: str
    description: str = ""
    asset_value: float = 50.0
    confidentiality_level: int = Field(default=3, ge=1, le=5)
    integrity_level: int = Field(default=3, ge=1, le=5)
    availability_level: int = Field(default=3, ge=1, le=5)
    business_criticality: str = "Medium"
    data_sensitivity: str = "Internal"
    internet_exposure: str = "Medium"


class AssetCreate(AssetBase):
    pass


class AssetUpdate(BaseModel):
    asset_name: str | None = None
    asset_type: str | None = None
    owner: str | None = None
    department: str | None = None
    description: str | None = None
    asset_value: float | None = None
    confidentiality_level: int | None = Field(default=None, ge=1, le=5)
    integrity_level: int | None = Field(default=None, ge=1, le=5)
    availability_level: int | None = Field(default=None, ge=1, le=5)
    business_criticality: str | None = None
    data_sensitivity: str | None = None
    internet_exposure: str | None = None


class AssetRead(ORMModel):
    id: int
    asset_name: str
    asset_type: str
    owner: str
    department: str
    description: str
    asset_value: float
    confidentiality_level: int
    integrity_level: int
    availability_level: int
    business_criticality: str
    data_sensitivity: str
    internet_exposure: str
    created_at: datetime
    updated_at: datetime


class ThreatBase(BaseModel):
    threat_name: str
    threat_category: str
    description: str = ""
    likelihood: str = "Medium"
    frequency_per_year: float = 1.0
    threat_actor: str = ""
    attack_vector: str = ""
    historical_incidents: int = 0


class ThreatCreate(ThreatBase):
    pass


class ThreatUpdate(BaseModel):
    threat_name: str | None = None
    threat_category: str | None = None
    description: str | None = None
    likelihood: str | None = None
    frequency_per_year: float | None = None
    threat_actor: str | None = None
    attack_vector: str | None = None
    historical_incidents: int | None = None


class ThreatRead(ORMModel):
    id: int
    threat_name: str
    threat_category: str
    description: str
    likelihood: str
    frequency_per_year: float
    threat_actor: str
    attack_vector: str
    historical_incidents: int
    created_at: datetime


class VulnerabilityBase(BaseModel):
    vulnerability_name: str
    asset_id: int
    severity: str = "Medium"
    exploitability: int = Field(default=3, ge=1, le=5)
    cvss_score: float = Field(default=5.0, ge=0.0, le=10.0)
    description: str = ""
    remediation: str = ""
    status: str = "open"


class VulnerabilityCreate(VulnerabilityBase):
    pass


class VulnerabilityUpdate(BaseModel):
    vulnerability_name: str | None = None
    asset_id: int | None = None
    severity: str | None = None
    exploitability: int | None = Field(default=None, ge=1, le=5)
    cvss_score: float | None = Field(default=None, ge=0.0, le=10.0)
    description: str | None = None
    remediation: str | None = None
    status: str | None = None


class VulnerabilityRead(ORMModel):
    id: int
    vulnerability_name: str
    asset_id: int
    severity: str
    exploitability: int
    cvss_score: float
    description: str
    remediation: str
    status: str
    discovered_at: datetime


class ProbabilityAssessmentRequest(BaseModel):
    threat_likelihood: float = Field(ge=0, le=100)
    historical_frequency: float = Field(ge=0, le=100)
    exposure_level: float = Field(ge=0, le=100)
    attacker_capability: float = Field(ge=0, le=100)
    vulnerability_exploitability: float = Field(ge=0, le=100)
    control_effectiveness: float = Field(ge=0, le=100)
    incident_history: float = Field(ge=0, le=100)


class ProbabilityAssessmentResponse(BaseModel):
    probability_percent: float
    probability_label: str
    explanation: str


class ImpactAssessmentRequest(BaseModel):
    financial_loss: float = Field(ge=0, le=100)
    downtime_hours: float = Field(ge=0, le=100)
    data_loss_level: float = Field(ge=0, le=100)
    reputational_damage: float = Field(ge=0, le=100)
    legal_consequence: float = Field(ge=0, le=100)
    operational_disruption: float = Field(ge=0, le=100)
    customer_impact: float = Field(ge=0, le=100)
    recovery_cost: float = Field(ge=0, le=100)


class ImpactAssessmentResponse(BaseModel):
    impact_score: float
    impact_label: str
    explanation: str


class RiskCalculationRequest(BaseModel):
    asset_id: int | None = None
    threat_id: int | None = None
    vulnerability_id: int | None = None
    probability_score: float = Field(ge=0, le=100)
    impact_score: float = Field(ge=0, le=100)
    asset_value: float = Field(default=50.0, ge=0)
    control_effectiveness: float = Field(default=0.3, ge=0, le=1)
    financial_impact: float = Field(default=10000.0, ge=0)
    vulnerability_factor: float = Field(default=1.0, ge=0)


class RiskCalculationResponse(BaseModel):
    inherent_risk: float
    residual_risk: float
    risk_level: str
    expected_annual_loss: float
    recommendation: str
    asset_value_factor: float


class RiskAssessmentCreate(BaseModel):
    asset_id: int
    threat_id: int
    vulnerability_id: int
    probability_score: float = Field(ge=0, le=100)
    impact_score: float = Field(ge=0, le=100)
    control_effectiveness: float = Field(default=0.3, ge=0, le=1)
    financial_impact: float = Field(default=10000.0, ge=0)
    notes: str = ""


class RiskAssessmentUpdate(BaseModel):
    probability_score: float | None = Field(default=None, ge=0, le=100)
    impact_score: float | None = Field(default=None, ge=0, le=100)
    control_effectiveness: float | None = Field(default=None, ge=0, le=1)
    financial_impact: float | None = Field(default=None, ge=0)
    status: str | None = None
    notes: str | None = None


class RiskAssessmentRead(ORMModel):
    id: int
    asset_id: int
    threat_id: int
    vulnerability_id: int
    probability_score: float
    probability_label: str
    impact_score: float
    impact_label: str
    asset_value_factor: float
    control_effectiveness: float
    inherent_risk: float
    residual_risk: float
    risk_level: str
    expected_annual_loss: float
    status: str
    notes: str
    assessed_by: int | None
    assessed_at: datetime
    created_at: datetime
    updated_at: datetime


class MonteCarloRequest(BaseModel):
    risk_assessment_id: int | None = None
    probability_min: float = Field(ge=0, le=1)
    probability_max: float = Field(ge=0, le=1)
    impact_min: float = Field(ge=0)
    impact_max: float = Field(ge=0)
    asset_value: float = Field(default=1.0, ge=0)
    iterations: int = Field(default=1000, ge=100, le=100000)
    distribution_type: str = "uniform"


class MonteCarloRead(ORMModel):
    id: int
    risk_assessment_id: int | None
    iterations: int
    distribution_type: str
    average_loss: float
    median_loss: float
    var_95: float
    var_99: float
    max_loss: float
    min_loss: float
    result_json: dict[str, Any]
    created_by: int | None
    created_at: datetime


class BayesianUpdateRequest(BaseModel):
    risk_assessment_id: int
    prior_probability: float = Field(ge=0, le=1)
    evidence_likelihood_given_risk: float = Field(ge=0, le=1)
    evidence_likelihood_given_no_risk: float = Field(ge=0, le=1)


class BayesianUpdateRead(ORMModel):
    id: int
    risk_assessment_id: int
    prior_probability: float
    likelihood_risk: float
    likelihood_no_risk: float
    posterior_probability: float
    explanation: str
    created_at: datetime


class MitigationCreate(BaseModel):
    risk_id: int
    mitigation_action: str
    responsible_person: str
    deadline: datetime | None = None
    cost: float = Field(default=0, ge=0)
    expected_risk_reduction: float = Field(default=0, ge=0, le=100)
    status: str = "planned"
    progress: int = Field(default=0, ge=0, le=100)


class MitigationUpdate(BaseModel):
    mitigation_action: str | None = None
    responsible_person: str | None = None
    deadline: datetime | None = None
    cost: float | None = Field(default=None, ge=0)
    expected_risk_reduction: float | None = Field(default=None, ge=0, le=100)
    status: str | None = None
    progress: int | None = Field(default=None, ge=0, le=100)


class MitigationRead(ORMModel):
    id: int
    risk_id: int
    mitigation_action: str
    responsible_person: str
    deadline: datetime | None
    cost: float
    expected_risk_reduction: float
    status: str
    progress: int
    residual_risk_after_action: float
    created_at: datetime
    updated_at: datetime


class ReportGenerateRequest(BaseModel):
    report_type: str
    title: str
    executive_summary: str = ""


class ReportRead(ORMModel):
    id: int
    title: str
    report_type: str
    prepared_by: int | None
    report_date: datetime
    executive_summary: str
    content_json: dict[str, Any]
    created_at: datetime
    updated_at: datetime


class AuditLogRead(ORMModel):
    id: int
    actor_id: int | None
    actor_email: str
    action: str
    entity_type: str
    entity_id: str
    details: dict[str, Any]
    created_at: datetime


class SettingRead(ORMModel):
    id: int
    key: str
    value: str
    description: str


class SettingUpdate(BaseModel):
    value: str
    description: str | None = None


UserRead.model_rebuild()
