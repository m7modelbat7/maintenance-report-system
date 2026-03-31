# Session Handoff

## Project goal
Build a simple, professional maintenance report system for internal company use.

Core user goals:
- create maintenance reports
- view and search reports
- update report status
- track work history
- view a simple dashboard

## Current architecture
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: SQLite
- Navigation: local React state, no routing library
- API style: REST under `/api`

## Completed features
- backend SQLite setup and schema initialization
- backend health endpoint
- backend reports endpoints:
  - `GET /api/reports`
  - `GET /api/reports/:id`
  - `POST /api/reports`
  - `PUT /api/reports/:id`
  - `PATCH /api/reports/:id/status`
  - `GET /api/reports/:id/history`
- backend dashboard summary endpoint:
  - `GET /api/dashboard/summary`
- frontend pages:
  - Dashboard
  - Reports List
  - Create Report
  - Report Details
- frontend report creation
- frontend reports list loading
- frontend search and filter
- frontend reset filters
- frontend report details loading
- frontend field editing
- frontend status update
- frontend dashboard summary loading
- dashboard and reports list refresh patterns after create/update actions

## Current frontend status
- Functional MVP UI exists
- API calls use `frontend/src/api.js`
- Relative `/api` calls work for local dev
- Vite proxy supports local backend access
- Deployment-friendly `VITE_API_BASE_URL` support exists

Main frontend files:
- `frontend/src/App.jsx`
- `frontend/src/api.js`
- `frontend/src/pages/DashboardPage.jsx`
- `frontend/src/pages/ReportsListPage.jsx`
- `frontend/src/pages/CreateReportPage.jsx`
- `frontend/src/pages/ReportDetailsView.jsx`
- `frontend/vite.config.js`

## Current backend status
- Functional MVP API exists
- SQLite schema auto-creates on startup
- Report history is recorded for create, edit, and status updates
- Dashboard summary endpoint is implemented

Main backend files:
- `backend/src/server.js`
- `backend/src/app.js`
- `backend/src/db/database.js`
- `backend/src/db/initSchema.js`
- `backend/src/controllers/reportController.js`
- `backend/src/controllers/dashboardController.js`
- `backend/src/routes/reportRoutes.js`
- `backend/src/routes/dashboardRoutes.js`
- `backend/src/validators/reportValidation.js`

## Important environment/config notes
- Backend default port: `3001`
- Backend env:
  - `PORT`
- Frontend env:
  - `VITE_API_BASE_URL`
  - `VITE_API_PROXY_TARGET`
- Local frontend dev assumes Vite proxy to backend
- Frontend production build requires:
  - Node `20.19.0+` or
  - Node `22.12.0+`

## Known issues or blockers
- No automated tests yet
- Production SQLite persistence/backup strategy is not finalized
- Temporary/local files exist in `backend/data` and should not be committed
- Frontend production build depends on a supported Node version
- No authentication yet by design

## Files/folders that matter most
- `AGENTS.md`
- `docs/plan.md`
- `docs/db.md`
- `docs/api.md`
- `docs/SESSION_HANDOFF.md`
- `frontend/src/`
- `backend/src/`
- `frontend/README.md`
- `backend/README.md`
- root `README.md`

## Exact next recommended task
Add a small automated test layer for the backend first.

Best next step:
- add simple backend tests for:
  - `GET /api/health`
  - `GET /api/reports`
  - `POST /api/reports`
  - `PATCH /api/reports/:id/status`
  - `GET /api/dashboard/summary`

Reason:
- deployment readiness is now mostly documentation/config cleanup
- the biggest remaining risk is lack of automated verification

## Exact commands to run locally
Backend:

```powershell
cd E:\MyProject\maintenance-report-system\backend
npm.cmd install
npm.cmd start
```

Frontend:

```powershell
cd E:\MyProject\maintenance-report-system\frontend
npm.cmd install
npm.cmd run dev
```

Backend smoke checks:

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:3001/api/health" | Select-Object -ExpandProperty Content
Invoke-WebRequest -Uri "http://127.0.0.1:3001/api/dashboard/summary" | Select-Object -ExpandProperty Content
```

Frontend production smoke test:

```powershell
cd E:\MyProject\maintenance-report-system\frontend
$env:VITE_API_BASE_URL=""
npm.cmd run build
npm.cmd run preview
```

## Deployment-readiness status
Status: mostly prepared, not fully production-ready.

Ready:
- documented local run flow
- documented environment variables
- deployment-friendly frontend API setup
- root `.gitignore`
- backend and frontend README files

Not ready yet:
- automated tests
- final production host/storage decision for SQLite
- local temp file cleanup in `backend/data`
- final production smoke test on supported Node version

## How future Codex sessions should start
1. Read `AGENTS.md`
2. Read `docs/SESSION_HANDOFF.md`
3. Read only the specific files needed for the requested task after that
4. Avoid re-scanning the whole repo unless the task actually requires it
