from __future__ import annotations

from dataclasses import dataclass

import numpy as np


THREAT_PROBABILITY_MAP = {
    "Very Low": 0.05,
    "Low": 0.15,
    "Medium": 0.35,
    "High": 0.65,
    "Very High": 0.85,
}


def clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(upper, value))


def risk_level(score: float) -> str:
    if score <= 20:
        return "Low"
    if score <= 50:
        return "Medium"
    if score <= 75:
        return "High"
    return "Critical"


def probability_label(score: float) -> str:
    if score <= 20:
        return "Very Low"
    if score <= 40:
        return "Low"
    if score <= 60:
        return "Medium"
    if score <= 80:
        return "High"
    return "Very High"


def impact_label(score: float) -> str:
    if score <= 20:
        return "Minor"
    if score <= 40:
        return "Moderate"
    if score <= 60:
        return "Significant"
    if score <= 80:
        return "Severe"
    return "Catastrophic"


def asset_value_factor(asset_value: float) -> float:
    return clamp(0.5 + (asset_value / 100.0), 0.6, 1.8)


def vulnerability_factor(exploitability: float, cvss_score: float) -> float:
    normalized = ((exploitability / 5.0) + (cvss_score / 10.0)) / 2.0
    return clamp(0.6 + normalized, 0.8, 1.6)


def calculate_probability_score(
    *,
    threat_likelihood: float,
    historical_frequency: float,
    exposure_level: float,
    attacker_capability: float,
    vulnerability_exploitability: float,
    control_effectiveness: float,
    incident_history: float,
) -> dict:
    base_probability = (
        threat_likelihood
        + historical_frequency
        + exposure_level
        + attacker_capability
        + vulnerability_exploitability
        + incident_history
        - control_effectiveness
    ) / 6.0
    score = round(clamp(base_probability, 0.0, 100.0), 2)
    label = probability_label(score)
    explanation = (
        f"Threat likelihood, exposure and exploitability indicate a {label.lower()} "
        f"event probability with {score}% likelihood."
    )
    return {
        "probability_percent": score,
        "probability_label": label,
        "explanation": explanation,
    }


def calculate_impact_score(
    *,
    financial_loss: float,
    downtime_hours: float,
    data_loss_level: float,
    reputational_damage: float,
    legal_consequence: float,
    operational_disruption: float,
    customer_impact: float,
    recovery_cost: float,
) -> dict:
    score = round(
        clamp(
            (
                financial_loss
                + downtime_hours
                + data_loss_level
                + reputational_damage
                + legal_consequence
                + operational_disruption
                + customer_impact
                + recovery_cost
            )
            / 8.0,
            0.0,
            100.0,
        ),
        2,
    )
    label = impact_label(score)
    explanation = f"Combined business, legal and operational impact is rated {label.lower()}."
    return {"impact_score": score, "impact_label": label, "explanation": explanation}


def recommendation_for_level(level: str) -> str:
    return {
        "Low": "Monitor the control environment and reassess quarterly.",
        "Medium": "Strengthen detective and preventive controls within 30 days.",
        "High": "Prioritize mitigation, assign an owner and reduce exposure immediately.",
        "Critical": "Escalate to management, activate mitigation plan and monitor continuously.",
    }[level]


def calculate_risk(
    *,
    probability_score_value: float,
    impact_score_value: float,
    asset_value_input: float,
    control_effectiveness: float,
    financial_impact: float,
    vulnerability_factor_value: float = 1.0,
) -> dict:
    asset_factor = asset_value_factor(asset_value_input)
    inherent = (
        (probability_score_value / 100.0)
        * (impact_score_value / 100.0)
        * asset_factor
        * vulnerability_factor_value
        * 100.0
    )
    inherent = round(clamp(inherent, 0.0, 100.0), 2)
    residual = round(clamp(inherent * (1.0 - control_effectiveness), 0.0, 100.0), 2)
    level = risk_level(residual)
    expected_annual_loss = round((probability_score_value / 100.0) * financial_impact, 2)
    return {
        "inherent_risk": inherent,
        "residual_risk": residual,
        "risk_level": level,
        "expected_annual_loss": expected_annual_loss,
        "recommendation": recommendation_for_level(level),
        "asset_value_factor": round(asset_factor, 2),
    }


def monte_carlo_distribution(
    *,
    probability_min: float,
    probability_max: float,
    impact_min: float,
    impact_max: float,
    asset_value: float,
    iterations: int,
    distribution_type: str,
) -> dict:
    rng = np.random.default_rng()
    if distribution_type == "triangular":
        probability_samples = rng.triangular(
            probability_min,
            (probability_min + probability_max) / 2,
            probability_max,
            iterations,
        )
        impact_samples = rng.triangular(
            impact_min,
            (impact_min + impact_max) / 2,
            impact_max,
            iterations,
        )
    elif distribution_type == "normal":
        probability_mean = (probability_min + probability_max) / 2
        probability_sigma = max((probability_max - probability_min) / 6, 0.01)
        impact_mean = (impact_min + impact_max) / 2
        impact_sigma = max((impact_max - impact_min) / 6, 1)
        probability_samples = np.clip(
            rng.normal(probability_mean, probability_sigma, iterations), probability_min, probability_max
        )
        impact_samples = np.clip(
            rng.normal(impact_mean, impact_sigma, iterations), impact_min, impact_max
        )
    else:
        probability_samples = rng.uniform(probability_min, probability_max, iterations)
        impact_samples = rng.uniform(impact_min, impact_max, iterations)

    losses = probability_samples * impact_samples * asset_value
    histogram_counts, histogram_edges = np.histogram(losses, bins=16)
    return {
        "average_loss": round(float(np.mean(losses)), 2),
        "median_loss": round(float(np.median(losses)), 2),
        "max_loss": round(float(np.max(losses)), 2),
        "min_loss": round(float(np.min(losses)), 2),
        "var_95": round(float(np.percentile(losses, 95)), 2),
        "var_99": round(float(np.percentile(losses, 99)), 2),
        "result_json": {
            "samples": [round(float(value), 2) for value in losses[:120]],
            "histogram": {
                "edges": [round(float(edge), 2) for edge in histogram_edges.tolist()],
                "counts": [int(count) for count in histogram_counts.tolist()],
            },
        },
    }


@dataclass(slots=True)
class BayesianResult:
    posterior: float
    delta: float
    explanation: str


def bayesian_update(prior: float, likelihood_risk: float, likelihood_no_risk: float) -> BayesianResult:
    denominator = (likelihood_risk * prior) + (likelihood_no_risk * (1 - prior))
    posterior = 0.0 if denominator == 0 else (likelihood_risk * prior) / denominator
    posterior = round(clamp(posterior, 0.0, 1.0), 4)
    delta = round((posterior - prior) * 100, 2)
    direction = "increased" if delta >= 0 else "decreased"
    explanation = f"Posterior risk probability {direction} by {abs(delta)} percentage points after new evidence."
    return BayesianResult(posterior=posterior, delta=delta, explanation=explanation)


def matrix_bucket(score: float) -> str:
    if score <= 20:
        return "Very Low"
    if score <= 40:
        return "Low"
    if score <= 60:
        return "Medium"
    if score <= 80:
        return "High"
    return "Very High"
