# Frontend

## Purpose
This folder contains the React frontend for the maintenance report system.

## Main screens
- Dashboard
- Reports List
- Create Report
- Report Details

## Run locally
1. Open a terminal in `frontend`
2. Install dependencies:

```powershell
npm.cmd install
```

3. Start the frontend:

```powershell
npm.cmd run dev
```

Vite will show the local development URL, usually `http://localhost:5173`.

## Supported Node.js version
For Vite production builds, use one of:
- Node.js `20.19.0` or newer on Node 20
- Node.js `22.12.0` or newer on Node 22

The frontend `package.json` also documents this in `engines`.

## API setup
The frontend uses `src/api.js` for API requests.

### Local development
By default, the frontend calls relative `/api/...` paths.
Vite proxies those requests to the backend.

Default local proxy target:
- `http://localhost:3001`

### Deployment
Set `VITE_API_BASE_URL` if the frontend and backend are deployed on different hosts.

Example `.env` file:

```env
VITE_API_BASE_URL=https://your-backend.example.com
```

If the frontend and backend are served from the same origin, `VITE_API_BASE_URL` can stay empty.

### Frontend environment variables
- `VITE_API_BASE_URL`
  Base URL for the backend in production when it is hosted on a different origin.
- `VITE_API_PROXY_TARGET`
  Local Vite proxy target used during development. Default is `http://localhost:3001`.

## Environment example
See [`.env.example`](E:\MyProject\maintenance-report-system\frontend\.env.example).

## Production build

```powershell
npm.cmd install
$env:VITE_API_BASE_URL=""
npm.cmd run build
```

If the backend is deployed on another host, set:

```powershell
$env:VITE_API_BASE_URL="https://your-backend.example.com"
npm.cmd run build
```

## Production preview

```powershell
npm.cmd run preview
```

## Before deployment
- confirm the final backend base URL
- run a production build on a supported Node version
- verify all API calls work from the deployed frontend origin
