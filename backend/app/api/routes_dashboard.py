from __future__ import annotations

from collections import defaultdict

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from backend.app.api.deps import get_db, require_roles
from backend.app.models import Asset, AuditLog, Mitigation, RiskAssessment, Threat, User, Vulnerability
from backend.app.services.risk_engine import matrix_bucket


router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
def dashboard_summary(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst", "Auditor", "Manager", "Viewer")),
) -> dict:
    counts = {
        "total_assets": db.scalar(select(func.count(Asset.id))) or 0,
        "identified_threats": db.scalar(select(func.count(Threat.id))) or 0,
        "vulnerabilities": db.scalar(select(func.count(Vulnerability.id))) or 0,
        "critical_risks": db.scalar(select(func.count(RiskAssessment.id)).where(RiskAssessment.risk_level == "Critical")) or 0,
        "high_risks": db.scalar(select(func.count(RiskAssessment.id)).where(RiskAssessment.risk_level == "High")) or 0,
        "medium_risks": db.scalar(select(func.count(RiskAssessment.id)).where(RiskAssessment.risk_level == "Medium")) or 0,
        "low_risks": db.scalar(select(func.count(RiskAssessment.id)).where(RiskAssessment.risk_level == "Low")) or 0,
        "average_risk_score": round(float(db.scalar(select(func.avg(RiskAssessment.residual_risk))) or 0), 2),
        "expected_loss": round(float(db.scalar(select(func.sum(RiskAssessment.expected_annual_loss))) or 0), 2),
        "last_audit_date": None,
    }
    last_audit = db.scalar(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(1))
    counts["last_audit_date"] = last_audit.created_at.isoformat() if last_audit else None
    return counts


@router.get("/risk-distribution")
def risk_distribution(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst", "Auditor", "Manager", "Viewer")),
) -> dict:
    distribution = defaultdict(int)
    by_department = defaultdict(float)
    matrix = defaultdict(int)
    for assessment in db.scalars(select(RiskAssessment)):
        distribution[assessment.risk_level] += 1
        asset = db.get(Asset, assessment.asset_id)
        if asset:
            by_department[asset.department] += assessment.residual_risk
        key = f"{matrix_bucket(assessment.impact_score)}|{matrix_bucket(assessment.probability_score)}"
        matrix[key] += 1
    return {
        "distribution": distribution,
        "department_comparison": by_department,
        "matrix": matrix,
    }


@router.get("/top-risks")
def top_risks(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst", "Auditor", "Manager", "Viewer")),
) -> dict:
    assessments = list(
        db.scalars(select(RiskAssessment).order_by(RiskAssessment.residual_risk.desc()).limit(10))
    )
    top_assets = []
    for assessment in assessments:
        asset = db.get(Asset, assessment.asset_id)
        threat = db.get(Threat, assessment.threat_id)
        top_assets.append(
            {
                "id": assessment.id,
                "asset_name": asset.asset_name if asset else "Unknown asset",
                "threat_name": threat.threat_name if threat else "Unknown threat",
                "risk_level": assessment.risk_level,
                "residual_risk": assessment.residual_risk,
            }
        )
    pending_mitigations = [
        {
            "id": mitigation.id,
            "status": mitigation.status,
            "action": mitigation.mitigation_action,
            "deadline": mitigation.deadline.isoformat() if mitigation.deadline else None,
        }
        for mitigation in db.scalars(
            select(Mitigation).where(Mitigation.status != "completed").limit(10)
        )
    ]
    return {"top_risks": top_assets, "pending_mitigations": pending_mitigations}


@router.get("/trends")
def risk_trends(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst", "Auditor", "Manager", "Viewer")),
) -> dict:
    trend = defaultdict(lambda: {"count": 0, "average_residual": 0.0})
    history = []
    for assessment in db.scalars(select(RiskAssessment).order_by(RiskAssessment.assessed_at.asc())):
        month = assessment.assessed_at.strftime("%Y-%m")
        bucket = trend[month]
        bucket["count"] += 1
        bucket["average_residual"] += assessment.residual_risk
        history.append(
            {
                "id": assessment.id,
                "date": assessment.assessed_at.isoformat(),
                "risk_level": assessment.risk_level,
                "residual_risk": assessment.residual_risk,
            }
        )
    trend_rows = []
    for month, payload in trend.items():
        average = round(payload["average_residual"] / payload["count"], 2) if payload["count"] else 0
        trend_rows.append({"month": month, "count": payload["count"], "average_residual": average})
    return {"trend": trend_rows, "history": history[-20:]}
