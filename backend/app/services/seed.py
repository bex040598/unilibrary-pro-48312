from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.core.security import get_password_hash
from backend.app.models import Asset, RiskAssessment, Role, Setting, Threat, User, Vulnerability
from backend.app.services.risk_engine import calculate_risk, vulnerability_factor


DEFAULT_ROLES = [
    ("Admin", "Platform administrator with full access"),
    ("Cybersecurity Analyst", "Creates assessments and performs calculations"),
    ("Auditor", "Reviews reports and monitors audit logs"),
    ("Manager", "Approves mitigations and monitors high risks"),
    ("Viewer", "Read-only access"),
]


DEFAULT_USERS = [
    ("admin@cyberrisk.uz", "Admin123!", "Platform Administrator", "Admin"),
    ("analyst@cyberrisk.uz", "Analyst123!", "Lead Analyst", "Cybersecurity Analyst"),
    ("auditor@cyberrisk.uz", "Auditor123!", "Internal Auditor", "Auditor"),
    ("manager@cyberrisk.uz", "Manager123!", "Risk Manager", "Manager"),
]


ASSETS = [
    ("University Web Portal", "Web application", "Digital Services", "Academic Affairs", 90, "Critical", "High"),
    ("Student Database", "Database", "Data Office", "Registrar", 95, "Critical", "Restricted"),
    ("Online Library System", "Web application", "Library IT", "Library", 70, "High", "Internal"),
    ("Payment API", "API service", "FinTech Team", "Finance", 92, "Critical", "Restricted"),
    ("Email Server", "Server", "Infrastructure", "IT", 88, "High", "Confidential"),
    ("Cloud Storage", "Cloud storage", "Cloud Ops", "IT", 84, "High", "Restricted"),
    ("LMS Platform", "Web application", "EdTech Team", "Education", 85, "Critical", "Confidential"),
    ("Wi-Fi Network", "Network device", "Network Team", "IT", 65, "Medium", "Internal"),
    ("HR System", "Web application", "HRIS Team", "HR", 78, "High", "Confidential"),
    ("Backup Server", "Server", "Infrastructure", "IT", 80, "Critical", "Restricted"),
]


THREATS = [
    ("Phishing attack", "Phishing", "Email-based credential theft", "High", 12, "External attacker", "Email", 8),
    ("SQL Injection", "SQL injection", "Injection against input forms and APIs", "High", 6, "External attacker", "Web form", 4),
    ("Ransomware", "Ransomware", "File encryption and business disruption", "Medium", 3, "Cybercriminal", "Malware loader", 2),
    ("DDoS", "DDoS", "Volumetric service disruption", "Medium", 7, "Botnet", "Network flood", 5),
    ("Unauthorized access", "Unauthorized access", "Privilege escalation or stolen access", "High", 8, "Insider/External", "Credential misuse", 6),
    ("Insider threat", "Insider threat", "Malicious or negligent insider activity", "Low", 2, "Insider", "Authorized channel", 2),
    ("Data leakage", "Data leakage", "Sensitive data exposure", "Medium", 4, "Insider/External", "Misconfiguration", 3),
    ("Credential stuffing", "Credential stuffing", "Automated account takeover attempts", "Very High", 18, "Bot operator", "Authentication endpoint", 9),
]


VULNERABILITIES = [
    ("Weak password policy", 1, "High", 4, 7.5, "Passwords do not enforce complexity.", "Apply strong password policy and rotation.", "open"),
    ("Outdated server software", 5, "High", 4, 8.2, "Mail server patch level is outdated.", "Patch OS and mail transfer components.", "in_progress"),
    ("Missing MFA", 4, "Critical", 5, 9.1, "Privileged access lacks MFA.", "Enable MFA for all admin access.", "open"),
    ("Unpatched CMS", 1, "Critical", 5, 9.4, "Public CMS plugin is vulnerable.", "Patch CMS core and plugins.", "open"),
    ("Public database port", 2, "Critical", 5, 9.0, "Database port is internet-reachable.", "Restrict inbound access and isolate network.", "open"),
    ("Insecure API endpoint", 4, "High", 4, 8.5, "Payment API lacks robust validation.", "Add validation, rate limiting and token hardening.", "open"),
    ("Legacy cipher suite", 8, "Medium", 3, 5.8, "Weak TLS ciphers supported.", "Disable legacy ciphers.", "open"),
    ("Insufficient backup encryption", 10, "High", 3, 7.1, "Backup archives are not encrypted at rest.", "Encrypt archives and rotate keys.", "open"),
]


SETTINGS = [
    ("language.default", "uz", "Default application language"),
    ("risk.review_cycle_days", "90", "Risk reassessment cycle in days"),
    ("simulation.default_iterations", "5000", "Default Monte Carlo iteration count"),
]


def seed_database(db: Session) -> None:
    if db.scalar(select(User.id).limit(1)):
        return

    roles: dict[str, Role] = {}
    for name, description in DEFAULT_ROLES:
        role = Role(name=name, description=description)
        db.add(role)
        roles[name] = role

    db.flush()

    for email, password, full_name, role_name in DEFAULT_USERS:
        user = User(
            full_name=full_name,
            email=email,
            password_hash=get_password_hash(password),
            title=role_name,
            department="Security Office",
            locale="uz",
        )
        user.roles.append(roles[role_name])
        db.add(user)

    assets: list[Asset] = []
    for asset_name, asset_type, owner, department, asset_value, criticality, sensitivity in ASSETS:
        asset = Asset(
            asset_name=asset_name,
            asset_type=asset_type,
            owner=owner,
            department=department,
            description=f"{asset_name} digital service inventory record.",
            asset_value=asset_value,
            confidentiality_level=5 if sensitivity in {"Restricted", "Confidential"} else 3,
            integrity_level=4 if criticality in {"High", "Critical"} else 3,
            availability_level=5 if criticality == "Critical" else 3,
            business_criticality=criticality,
            data_sensitivity=sensitivity,
            internet_exposure="High" if asset_type in {"Web application", "API service"} else "Medium",
        )
        assets.append(asset)
        db.add(asset)

    threats: list[Threat] = []
    for threat_name, category, description, likelihood, frequency, actor, vector, incidents in THREATS:
        threat = Threat(
            threat_name=threat_name,
            threat_category=category,
            description=description,
            likelihood=likelihood,
            frequency_per_year=frequency,
            threat_actor=actor,
            attack_vector=vector,
            historical_incidents=incidents,
        )
        threats.append(threat)
        db.add(threat)

    db.flush()

    vulnerabilities: list[Vulnerability] = []
    for name, asset_index, severity, exploitability, cvss, description, remediation, status in VULNERABILITIES:
        vulnerability = Vulnerability(
            vulnerability_name=name,
            asset_id=assets[asset_index - 1].id,
            severity=severity,
            exploitability=exploitability,
            cvss_score=cvss,
            description=description,
            remediation=remediation,
            status=status,
        )
        vulnerabilities.append(vulnerability)
        db.add(vulnerability)

    db.flush()

    analyst = db.scalar(select(User).where(User.email == "analyst@cyberrisk.uz"))
    control_cycle = [0.1, 0.2, 0.35, 0.15, 0.4]
    impact_cycle = [25, 45, 62, 88, 74]
    probability_cycle = [18, 36, 55, 72, 91]

    for index in range(20):
        asset = assets[index % len(assets)]
        threat = threats[index % len(threats)]
        vulnerability = vulnerabilities[index % len(vulnerabilities)]
        probability_score = probability_cycle[index % len(probability_cycle)] + (index % 3)
        impact_score = impact_cycle[index % len(impact_cycle)] + (index % 4)
        control_effectiveness = control_cycle[index % len(control_cycle)]
        financial_impact = asset.asset_value * 1500
        calc = calculate_risk(
            probability_score_value=probability_score,
            impact_score_value=impact_score,
            asset_value_input=asset.asset_value,
            control_effectiveness=control_effectiveness,
            financial_impact=financial_impact,
            vulnerability_factor_value=vulnerability_factor(
                vulnerability.exploitability, vulnerability.cvss_score
            ),
        )
        assessment = RiskAssessment(
            asset_id=asset.id,
            threat_id=threat.id,
            vulnerability_id=vulnerability.id,
            probability_score=probability_score,
            probability_label=(
                "Very High" if probability_score > 80 else "High" if probability_score > 60 else "Medium" if probability_score > 40 else "Low"
            ),
            impact_score=impact_score,
            impact_label=(
                "Catastrophic" if impact_score > 80 else "Severe" if impact_score > 60 else "Significant" if impact_score > 40 else "Moderate"
            ),
            asset_value_factor=calc["asset_value_factor"],
            control_effectiveness=control_effectiveness,
            inherent_risk=calc["inherent_risk"],
            residual_risk=calc["residual_risk"],
            risk_level=calc["risk_level"],
            expected_annual_loss=calc["expected_annual_loss"],
            status="active",
            notes=f"Seeded assessment for {asset.asset_name} against {threat.threat_name}.",
            assessed_by=analyst.id if analyst else None,
        )
        db.add(assessment)

    for key, value, description in SETTINGS:
        db.add(Setting(key=key, value=value, description=description))

    db.commit()
