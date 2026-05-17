from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.api.deps import get_db, require_roles
from backend.app.models import BayesianUpdate, MonteCarloSimulation, RiskAssessment, User
from backend.app.schemas import BayesianUpdateRead, BayesianUpdateRequest, MonteCarloRead, MonteCarloRequest
from backend.app.services.audit import log_action
from backend.app.services.risk_engine import bayesian_update, monte_carlo_distribution


router = APIRouter(prefix="", tags=["simulations"])


@router.post("/simulations/monte-carlo", response_model=MonteCarloRead, status_code=status.HTTP_201_CREATED)
def run_monte_carlo(
    payload: MonteCarloRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst", "Manager")),
) -> MonteCarloSimulation:
    if payload.risk_assessment_id and not db.get(RiskAssessment, payload.risk_assessment_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Risk assessment not found")
    result = monte_carlo_distribution(
        probability_min=payload.probability_min,
        probability_max=payload.probability_max,
        impact_min=payload.impact_min,
        impact_max=payload.impact_max,
        asset_value=payload.asset_value,
        iterations=payload.iterations,
        distribution_type=payload.distribution_type,
    )
    simulation = MonteCarloSimulation(
        risk_assessment_id=payload.risk_assessment_id,
        iterations=payload.iterations,
        distribution_type=payload.distribution_type,
        average_loss=result["average_loss"],
        median_loss=result["median_loss"],
        var_95=result["var_95"],
        var_99=result["var_99"],
        max_loss=result["max_loss"],
        min_loss=result["min_loss"],
        result_json=result["result_json"],
        created_by=user.id,
    )
    db.add(simulation)
    db.commit()
    db.refresh(simulation)
    log_action(db, action="run", entity_type="monte_carlo", entity_id=str(simulation.id), actor=user, details=payload.model_dump())
    return simulation


@router.get("/simulations/{simulation_id}", response_model=MonteCarloRead)
def get_monte_carlo(
    simulation_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst", "Auditor", "Manager", "Viewer")),
) -> MonteCarloSimulation:
    simulation = db.get(MonteCarloSimulation, simulation_id)
    if not simulation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation not found")
    return simulation


@router.post("/bayesian/update", response_model=BayesianUpdateRead, status_code=status.HTTP_201_CREATED)
def run_bayesian_update(
    payload: BayesianUpdateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("Admin", "Cybersecurity Analyst", "Auditor", "Manager")),
) -> BayesianUpdate:
    assessment = db.get(RiskAssessment, payload.risk_assessment_id)
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Risk assessment not found")
    result = bayesian_update(
        payload.prior_probability,
        payload.evidence_likelihood_given_risk,
        payload.evidence_likelihood_given_no_risk,
    )
    update = BayesianUpdate(
        risk_assessment_id=payload.risk_assessment_id,
        prior_probability=payload.prior_probability,
        likelihood_risk=payload.evidence_likelihood_given_risk,
        likelihood_no_risk=payload.evidence_likelihood_given_no_risk,
        posterior_probability=result.posterior,
        explanation=result.explanation,
    )
    db.add(update)
    db.commit()
    db.refresh(update)
    log_action(db, action="run", entity_type="bayesian_update", entity_id=str(update.id), actor=user, details=payload.model_dump())
    return update
