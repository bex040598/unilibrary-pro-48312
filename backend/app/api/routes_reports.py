from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from backend.app.api.deps import get_db, require_roles
from backend.app.models import Asset, Report, RiskAssessment, User
from backend.app.schemas import ReportGenerateRequest, ReportRead
from backend.app.services.audit import log_action
from backend.app.services.reports import build_excel_xml, build_simple_pdf, report_lines_from_payload


router = APIRouter(prefix="/reports", tags=["reports"])


def _report_payload(db: Session, report_type: str, title: str, executive_summary: str) -> dict:
    total_assets = db.scalar(select(func.count(Asset.id))) or 0
    critical_risks = db.scalar(
        select(func.count(RiskAssessment.id)).where(RiskAssessment.risk_level == "Critical")
    ) or 0
    expected_loss = db.scalar(select(func.sum(RiskAssessment.expected_annual_loss))) or 0
    top_risks = [
        {
            "id": assessment.id,
            "risk_level": assessment.risk_level,
            "residual_risk": assessment.residual_risk,
        }
        for assessment in db.scalars(
            select(RiskAssessment).order_by(RiskAssessment.residual_risk.desc()).limit(5)
        )
    ]
    return {
        "title": title,
        "report_type": report_type,
        "executive_summary": executive_summary,
        "summary": {
            "total_assets": total_assets,
            "critical_risks": critical_risks,
            "expected_loss": round(float(expected_loss), 2),
        },
        "top_risks": top_risks,
        "appendix": {"note": "Export layer is implemented as a lightweight skeleton."},
    }


@router.get("", response_model=list[ReportRead])
def list_reports(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst", "Auditor", "Manager", "Viewer")),
) -> list[Report]:
    return list(db.scalars(select(Report).order_by(Report.created_at.desc())))


@router.post("/generate", response_model=ReportRead)
def generate_report(
    payload: ReportGenerateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst", "Manager", "Auditor")),
) -> Report:
    report = Report(
        title=payload.title,
        report_type=payload.report_type,
        prepared_by=user.id,
        executive_summary=payload.executive_summary,
        content_json=_report_payload(db, payload.report_type, payload.title, payload.executive_summary),
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    log_action(db, action="generate", entity_type="report", entity_id=str(report.id), actor=user, details=payload.model_dump())
    return report


@router.get("/{report_id}", response_model=ReportRead)
def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst", "Auditor", "Manager", "Viewer")),
) -> Report:
    report = db.get(Report, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.get("/{report_id}/pdf")
def report_pdf(
    report_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst", "Auditor", "Manager", "Viewer")),
) -> Response:
    report = db.get(Report, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    pdf_bytes = build_simple_pdf(report.title, report_lines_from_payload(report.content_json))
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="report-{report_id}.pdf"'},
    )


@router.get("/{report_id}/excel")
def report_excel(
    report_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst", "Auditor", "Manager", "Viewer")),
) -> Response:
    report = db.get(Report, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    rows = [["Metric", "Value"]]
    for key, value in report.content_json.get("summary", {}).items():
        rows.append([key, str(value)])
    for risk in report.content_json.get("top_risks", []):
        rows.append(["Top Risk", f"#{risk['id']} {risk['risk_level']} residual {risk['residual_risk']}"])
    excel_bytes = build_excel_xml(report.title, rows)
    return Response(
        content=excel_bytes,
        media_type="application/vnd.ms-excel",
        headers={"Content-Disposition": f'attachment; filename="report-{report_id}.xls"'},
    )
