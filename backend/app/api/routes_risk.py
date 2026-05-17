from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.api.deps import get_db, require_roles
from backend.app.models import Asset, RiskAssessment, Threat, User, Vulnerability
from backend.app.schemas import (
    ImpactAssessmentRequest,
    ImpactAssessmentResponse,
    ProbabilityAssessmentRequest,
    ProbabilityAssessmentResponse,
    RiskAssessmentCreate,
    RiskAssessmentRead,
    RiskAssessmentUpdate,
    RiskCalculationRequest,
    RiskCalculationResponse,
)
from backend.app.services.audit import log_action
from backend.app.services.risk_engine import (
    calculate_impact_score,
    calculate_probability_score,
    calculate_risk,
    impact_label,
    probability_label,
    vulnerability_factor,
)


router = APIRouter(prefix="/risk-assessments", tags=["risk-assessments"])


@router.post("/probability", response_model=ProbabilityAssessmentResponse)
def assess_probability(
    payload: ProbabilityAssessmentRequest,
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst", "Manager", "Auditor")),
) -> dict:
    return calculate_probability_score(**payload.model_dump())


@router.post("/impact", response_model=ImpactAssessmentResponse)
def assess_impact(
    payload: ImpactAssessmentRequest,
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst", "Manager", "Auditor")),
) -> dict:
    return calculate_impact_score(**payload.model_dump())


@router.post("/calculate", response_model=RiskCalculationResponse)
def calculate_risk_endpoint(
    payload: RiskCalculationRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst", "Manager", "Auditor")),
) -> dict:
    derived_vulnerability_factor = payload.vulnerability_factor
    if payload.vulnerability_id:
        vulnerability = db.get(Vulnerability, payload.vulnerability_id)
        if vulnerability:
            derived_vulnerability_factor = vulnerability_factor(
                vulnerability.exploitability, vulnerability.cvss_score
            )
    return calculate_risk(
        probability_score_value=payload.probability_score,
        impact_score_value=payload.impact_score,
        asset_value_input=payload.asset_value,
        control_effectiveness=payload.control_effectiveness,
        financial_impact=payload.financial_impact,
        vulnerability_factor_value=derived_vulnerability_factor,
    )


@router.get("", response_model=list[RiskAssessmentRead])
def list_risk_assessments(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst", "Auditor", "Manager", "Viewer")),
) -> list[RiskAssessment]:
    return list(db.scalars(select(RiskAssessment).order_by(RiskAssessment.assessed_at.desc())))


@router.post("", response_model=RiskAssessmentRead, status_code=status.HTTP_201_CREATED)
def create_risk_assessment(
    payload: RiskAssessmentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst")),
) -> RiskAssessment:
    asset = db.get(Asset, payload.asset_id)
    threat = db.get(Threat, payload.threat_id)
    vulnerability = db.get(Vulnerability, payload.vulnerability_id)
    if not asset or not threat or not vulnerability:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset, threat or vulnerability not found")
    calc = calculate_risk(
        probability_score_value=payload.probability_score,
        impact_score_value=payload.impact_score,
        asset_value_input=asset.asset_value,
        control_effectiveness=payload.control_effectiveness,
        financial_impact=payload.financial_impact,
        vulnerability_factor_value=vulnerability_factor(vulnerability.exploitability, vulnerability.cvss_score),
    )
    assessment = RiskAssessment(
        asset_id=payload.asset_id,
        threat_id=payload.threat_id,
        vulnerability_id=payload.vulnerability_id,
        probability_score=payload.probability_score,
        probability_label=probability_label(payload.probability_score),
        impact_score=payload.impact_score,
        impact_label=impact_label(payload.impact_score),
        asset_value_factor=calc["asset_value_factor"],
        control_effectiveness=payload.control_effectiveness,
        inherent_risk=calc["inherent_risk"],
        residual_risk=calc["residual_risk"],
        risk_level=calc["risk_level"],
        expected_annual_loss=calc["expected_annual_loss"],
        status="active",
        notes=payload.notes,
        assessed_by=user.id,
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    log_action(db, action="create", entity_type="risk_assessment", entity_id=str(assessment.id), actor=user, details=payload.model_dump())
    return assessment


@router.get("/{assessment_id}", response_model=RiskAssessmentRead)
def get_risk_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst", "Auditor", "Manager", "Viewer")),
) -> RiskAssessment:
    assessment = db.get(RiskAssessment, assessment_id)
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Risk assessment not found")
    return assessment


@router.patch("/{assessment_id}", response_model=RiskAssessmentRead)
def update_risk_assessment(
    assessment_id: int,
    payload: RiskAssessmentUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst")),
) -> RiskAssessment:
    assessment = db.get(RiskAssessment, assessment_id)
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Risk assessment not found")
    updates = payload.model_dump(exclude_unset=True)
    financial_impact = updates.pop("financial_impact", assessment.expected_annual_loss or 10000.0)
    for key, value in updates.items():
        setattr(assessment, key, value)
    asset = db.get(Asset, assessment.asset_id)
    vulnerability = db.get(Vulnerability, assessment.vulnerability_id)
    calc = calculate_risk(
        probability_score_value=assessment.probability_score,
        impact_score_value=assessment.impact_score,
        asset_value_input=asset.asset_value if asset else 50.0,
        control_effectiveness=assessment.control_effectiveness,
        financial_impact=financial_impact,
        vulnerability_factor_value=(
            vulnerability_factor(vulnerability.exploitability, vulnerability.cvss_score)
            if vulnerability
            else 1.0
        ),
    )
    assessment.probability_label = probability_label(assessment.probability_score)
    assessment.impact_label = impact_label(assessment.impact_score)
    assessment.asset_value_factor = calc["asset_value_factor"]
    assessment.inherent_risk = calc["inherent_risk"]
    assessment.residual_risk = calc["residual_risk"]
    assessment.risk_level = calc["risk_level"]
    assessment.expected_annual_loss = calc["expected_annual_loss"]
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    log_action(db, action="update", entity_type="risk_assessment", entity_id=str(assessment.id), actor=user, details=payload.model_dump(exclude_unset=True))
    return assessment


@router.delete("/{assessment_id}")
def delete_risk_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst")),
) -> dict:
    assessment = db.get(RiskAssessment, assessment_id)
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Risk assessment not found")
    db.delete(assessment)
    db.commit()
    log_action(db, action="delete", entity_type="risk_assessment", entity_id=str(assessment_id), actor=user, details={})
    return {"message": "Risk assessment deleted"}
