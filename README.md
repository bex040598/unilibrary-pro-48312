# CyberRisk Probability Assessment Platform

Probability-based cybersecurity risk assessment platform for digital systems, assets, threats, vulnerabilities, simulations and reporting.

## Stack

- Frontend: dependency-free SPA, responsive multi-language dashboard
- Backend: FastAPI, SQLAlchemy, Alembic, JWT auth, RBAC
- Database: PostgreSQL-ready via `DATABASE_URL`, SQLite fallback for local development
- Analytics: probability scoring, impact scoring, inherent/residual risk, Monte Carlo, Bayesian update

## Run locally

### Backend

```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

Swagger:

`http://127.0.0.1:8000/docs`

### Frontend

```bash
npm run build
npm run serve
```

Frontend:

`http://127.0.0.1:4173`

## Seed logins

- `admin@cyberrisk.uz / Admin123!`
- `analyst@cyberrisk.uz / Analyst123!`
- `auditor@cyberrisk.uz / Auditor123!`
- `manager@cyberrisk.uz / Manager123!`

## Render blueprint

`render.yaml` provisions:

- FastAPI backend service
- static frontend service
- PostgreSQL database

After pushing the repository to GitHub, import the repo into Render as a Blueprint.
