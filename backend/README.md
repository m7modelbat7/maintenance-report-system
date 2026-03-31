# Backend

## Purpose
This folder contains the Express and SQLite backend for the maintenance report system.

## Main features
- health check endpoint
- reports CRUD API
- report status updates
- report history tracking
- dashboard summary endpoint

## Run locally
1. Open a terminal in `backend`
2. Install dependencies:

```powershell
npm.cmd install
```

3. Start the backend:

```powershell
npm.cmd start
```

The backend runs on `http://localhost:3001` by default.

## Database
- SQLite database file: `backend/data/maintenance-report-system.db`
- The schema is created automatically when the server starts

## Main API endpoints
- `GET /api/health`
- `GET /api/reports`
- `GET /api/reports/:id`
- `POST /api/reports`
- `PUT /api/reports/:id`
- `PATCH /api/reports/:id/status`
- `GET /api/reports/:id/history`
- `GET /api/dashboard/summary`

## Environment
- `PORT`
  Example:

```powershell
$env:PORT=4000
npm.cmd start
```

## Recommended production run

```powershell
npm.cmd install
$env:PORT=3001
npm.cmd start
```

## Backend smoke test
With the backend running:

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:3001/api/health" | Select-Object -ExpandProperty Content
Invoke-WebRequest -Uri "http://127.0.0.1:3001/api/dashboard/summary" | Select-Object -ExpandProperty Content
```

## Before deployment
- clean temporary files from `backend/data`
- decide how the SQLite database file will be stored and backed up
- add real automated tests
- confirm the production host can persist SQLite data
