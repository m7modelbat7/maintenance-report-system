# Maintenance Report System

## Overview
This project is a beginner-friendly maintenance report system with:
- a React frontend
- a Node.js + Express backend
- a SQLite database for MVP

The app supports:
- create report
- view reports
- search and filter reports
- open report details
- edit report fields
- update report status
- view report history
- view a dashboard summary

## Project structure
- `frontend/`: React app
- `backend/`: Express API and SQLite setup
- `docs/`: planning and API/database documentation

## Quick start

### 1. Start the backend
Open a terminal in `backend`:

```powershell
npm.cmd install
npm.cmd start
```

Backend default URL:
- `http://localhost:3001`

### 2. Start the frontend
Open a second terminal in `frontend`:

```powershell
npm.cmd install
npm.cmd run dev
```

Frontend default URL:
- usually `http://localhost:5173`

## Supported Node.js version

### Frontend
For Vite production builds, use one of:
- Node.js `20.19.0` or newer on Node 20
- Node.js `22.12.0` or newer on Node 22

The current frontend `package.json` documents this in `engines`.

### Backend
The backend uses standard Node.js + Express and should run on current LTS Node versions.
For consistency, using the same Node version as the frontend is recommended.

## Full app flow

### 1. Create report
- Open `Create Report`
- Fill the required fields
- Submit the form
- The frontend sends `POST /api/reports`

### 2. View reports
- Open `Reports List`
- The frontend loads `GET /api/reports`
- Reports appear in the table

### 3. Filter and search
- Type in the search input
- Choose status and priority filters
- The frontend loads `GET /api/reports` with query parameters such as:
  - `search`
  - `status`
  - `priority`

### 4. Open details
- Select a report row from the list
- The app stores the selected report id in local state
- The details page loads `GET /api/reports/:id`

### 5. Edit fields
- Use the `Edit Report` section on the details page
- Save changes
- The frontend sends `PUT /api/reports/:id`
- The page reloads the latest report details and history

### 6. Update status
- Use the `Status Update` section on the details page
- Choose a status and enter `Changed By`
- The frontend sends `PATCH /api/reports/:id/status`
- The page reloads details and history

### 7. View dashboard
- Open `Dashboard`
- The frontend loads `GET /api/dashboard/summary`
- The dashboard shows:
  - total reports
  - open reports
  - in progress reports
  - critical priority reports

## Frontend API setup
Frontend API calls use [api.js](E:\MyProject\maintenance-report-system\frontend\src\api.js).

### Local development
- Frontend uses relative `/api/...` paths
- Vite proxies `/api` to the backend
- Default proxy target is `http://localhost:3001`

### Deployment
If the frontend and backend are on different hosts, set:

```env
VITE_API_BASE_URL=https://your-backend.example.com
```

If they are served from the same host, this can stay empty and relative `/api` calls will still work.

### Frontend environment variables
- `VITE_API_BASE_URL`
  Use this when the frontend calls a backend hosted on a different origin in production.
- `VITE_API_PROXY_TARGET`
  Used for local Vite development proxy only. Default is `http://localhost:3001`.

### Backend environment variables
- `PORT`
  Sets the backend server port. Default is `3001`.

## Hardcoded assumptions cleaned up
- Frontend API calls no longer depend directly on hardcoded fetch targets in components
- Vite proxy target is now configurable with `VITE_API_PROXY_TARGET`
- Root `.gitignore` now excludes local dependencies, build output, local env files, and local database files

## Hardcoded assumptions still present
- backend default port is `3001` unless `PORT` is set
- frontend assumes Vite for local development
- SQLite uses a local file in `backend/data`

## Manual test checklist
- Start backend and frontend successfully
- Create a report from the frontend
- Confirm the new report appears in Reports List
- Search for the report
- Filter by status and priority
- Reset filters
- Open report details
- Edit title, asset name, location, priority, assigned technician, downtime, and resolution notes
- Save changes and confirm history updates
- Update status and confirm history updates
- Return to Reports List and confirm updated values are visible
- Open Dashboard and confirm summary numbers match the current data
- Stop backend and confirm frontend error states appear on:
  - Dashboard
  - Reports List
  - Create Report submission
  - Report Details fetch
  - Status update
  - Field edit save

## What still remains before deployment
- add automated tests for backend and frontend
- decide how SQLite data will be persisted and backed up in production
- configure production environment variables
- build and smoke-test frontend production output
- choose whether production will serve frontend and backend from one origin or separate hosts

## Recommended deployment approach

### Simple option
- Deploy backend as a small Node service
- Keep SQLite on the same server with persistent disk storage
- Build frontend with Vite and serve it as static files
- Place both behind one domain if possible

Example:
- frontend: static site on the same host or reverse proxy path
- backend: Node process listening on a private/internal port
- reverse proxy: map `/api` to backend and frontend routes to static files

### Why this is a good fit
- minimal infrastructure
- works well for an internal MVP
- keeps relative `/api` requests simple
- easiest path before adding authentication or a larger database

## Production commands

### Backend
Install and run:

```powershell
cd backend
npm.cmd install
$env:PORT=3001
npm.cmd start
```

### Frontend
Build:

```powershell
cd frontend
npm.cmd install
npm.cmd run build
```

Preview the built frontend locally:

```powershell
npm.cmd run preview
```

If the backend is on another host, set `VITE_API_BASE_URL` before build.

## Production smoke test commands

### 1. Backend smoke test
```powershell
cd backend
$env:PORT=3001
npm.cmd start
```

In another terminal:

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:3001/api/health" | Select-Object -ExpandProperty Content
Invoke-WebRequest -Uri "http://127.0.0.1:3001/api/dashboard/summary" | Select-Object -ExpandProperty Content
```

### 2. Frontend production smoke test
```powershell
cd frontend
$env:VITE_API_BASE_URL=""
npm.cmd run build
npm.cmd run preview
```

Then open the preview URL and verify the main app flows.

## More details
- [Frontend README](E:\MyProject\maintenance-report-system\frontend\README.md)
- [Backend README](E:\MyProject\maintenance-report-system\backend\README.md)
- [API docs](E:\MyProject\maintenance-report-system\docs\api.md)
