# Task Manager Take-Home

Full-stack task management app with a FastAPI backend and React + TypeScript frontend.

## Project Overview

This project demonstrates a pragmatic, production-leaning architecture for a take-home assignment:
- JWT-based auth
- User-scoped task CRUD
- Server-side filtering/sorting/pagination
- Lightweight background audit events
- Structured request logging and a simple observability endpoint

## Tech Stack

- Backend: Python, FastAPI, SQLAlchemy, Alembic, Pydantic Settings
- Auth/Security: JWT (`python-jose`), password hashing (`passlib`)
- Frontend: React, TypeScript, Vite, Ant Design, React Query, React Router
- Database: PostgreSQL
- Local orchestration: Docker Compose

## High-Level Architecture

- `backend/app/api` - HTTP routes and dependencies
- `backend/app/services` - business logic (thin handlers, service-centric flow)
- `backend/app/models` - SQLAlchemy models
- `backend/app/schemas` - request/response contracts
- `backend/app/db` - engine/session/base + seed helper
- `backend/app/core` - settings, security, logging, observability
- `frontend/src/api` - HTTP client functions
- `frontend/src/pages` - route-level screens
- `frontend/src/components` - reusable UI components
- `frontend/src/auth`, `frontend/src/hooks`, `frontend/src/routes` - auth/state and routing composition

## Design Decisions and Trade-offs

- **Service-layer business logic**: route handlers stay thin and testable.
- **JWT only (no refresh token)**: intentionally simple for take-home scope.
- **Server-side list operations**: predictable payloads and scalable list behavior.
- **In-process background tasks**: practical for assignment; avoids queue infrastructure complexity.
- **Structured logs + in-memory metrics**: lightweight observability without heavy dependencies.

## API Design Choices

- Versioning via `/api/v1`.
- Task list endpoint supports:
  - status/priority filters
  - title search
  - offset/limit pagination
  - sort fields (`created_at`, `due_date`) and order
- Paginated response shape:
  - `items`, `total`, `limit`, `offset`

## Auth Approach

- `POST /api/v1/auth/login` returns bearer token.
- `GET /api/v1/auth/me` demonstrates protected user context.
- Reusable dependency resolves current user from bearer token.
- Frontend stores token in localStorage and attaches it through axios interceptor.

## Filtering and Pagination Approach

- Backend executes filtering/search/sort/pagination in service layer query logic.
- Frontend controls UI state (filters, search, sort, page) and sends it as query params.
- React Query key includes all list state for predictable caching and refetch behavior.

## Background Processing Approach

- Task create and task status updates enqueue audit events via FastAPI `BackgroundTasks`.
- Audit events are emitted as structured logs (JSON payload).
- Intentional trade-off: good enough for assignment, easy to explain.

## Logging and Observability Approach

- HTTP middleware logs one structured event per request:
  - method, path, status_code, duration_ms, request_id
- Request ID is propagated via `x-request-id`.
- `/api/v1/observability` returns in-memory counters and uptime snapshot.

## How to Run Locally

### Option A: Docker Compose (recommended)

```bash
docker compose up --build
```

Services:
- Frontend: [http://localhost:5174](http://localhost:5174)
- Backend: [http://localhost:8000](http://localhost:8000)
- Backend docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- PostgreSQL: `localhost:5433`

Startup behavior:
- `postgres` starts first.
- `backend` starts with `DATABASE_URL` pointing to `postgres` container hostname.
- `frontend` starts after backend and calls it at `http://localhost:8000/api/v1`.

### Option B: Native local run

Backend:
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
python -m app.db.seed
uvicorn app.main:app --reload
```

Frontend:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Environment Variables

### Backend (`backend/.env`)
- `PROJECT_NAME`
- `APP_VERSION`
- `API_V1_PREFIX`
- `APP_ENV`
- `DATABASE_URL`
- `JWT_SECRET_KEY`
- `JWT_ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`

### Frontend (`frontend/.env`)
- `VITE_API_BASE_URL`

## Demo Credentials

After seeding (`python -m app.db.seed`, development-only):
- Email: `demo@example.com`
- Password: `demo1234`

## Assumptions

- Single-user demo auth flow is acceptable for this assignment scope.
- PostgreSQL is available locally (directly or via Docker).
- Structured logs are sufficient as the initial audit/observability surface.

## Future Improvements

- Add endpoint integration tests (`TestClient`) and test DB fixtures.
- Add refresh-token flow and token rotation.
- Add optimistic UI updates and finer-grained cache updates on frontend.
- Add richer observability export (OpenTelemetry + metrics backend).
- Add CI pipeline for lint/test/build across backend and frontend.

## What Would Be Different in Production

- Managed secret storage (AWS Secrets Manager/SSM), no default dev secrets.
- Dedicated background workers/queue (SQS/Celery/RQ) for durable async processing.
- Managed PostgreSQL with backups, tuning, connection pooling, and failover.
- Full telemetry stack (logs, metrics, traces) with dashboards/alerts.
- Stronger security hardening (CORS policy, rate limiting, stricter token policies, audit retention).
