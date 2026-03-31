# MVP API Design

## Goal
Keep the backend API small and clear for the first version.

The MVP API should support:
- creating reports
- listing and searching reports
- viewing report details
- updating report fields
- changing report status
- viewing work history
- showing simple dashboard counts

## General notes
- Base path: `/api`
- Use JSON for request and response bodies
- Return simple error messages that are easy for beginners to debug
- Validate required fields on the backend
- Use numeric report ids

## Report object

Example shape:

```json
{
  "id": 1,
  "title": "Air compressor failure",
  "description": "The compressor stopped during the morning shift.",
  "asset_name": "Compressor A",
  "location": "Plant 1",
  "priority": "High",
  "status": "Open",
  "reported_by": "Ahmed",
  "assigned_to": "Sara",
  "downtime_hours": 2.5,
  "resolution_notes": null,
  "created_at": "2026-03-31T09:00:00Z",
  "updated_at": "2026-03-31T09:00:00Z"
}
```

## History object

Example shape:

```json
{
  "id": 10,
  "report_id": 1,
  "action_type": "status_changed",
  "old_status": "Open",
  "new_status": "In Progress",
  "note": "Technician started inspection.",
  "changed_by": "Sara",
  "created_at": "2026-03-31T10:15:00Z"
}
```

## Endpoints

### GET /api/reports
List reports.

Optional query params:
- `search`: search in title, description, asset name, or location
- `status`: filter by status
- `priority`: filter by priority

Example:
- `/api/reports?search=compressor&status=Open`

Suggested response:

```json
[
  {
    "id": 1,
    "title": "Air compressor failure",
    "priority": "High",
    "status": "Open",
    "asset_name": "Compressor A",
    "location": "Plant 1",
    "reported_by": "Ahmed",
    "assigned_to": "Sara",
    "created_at": "2026-03-31T09:00:00Z",
    "updated_at": "2026-03-31T09:00:00Z"
  }
]
```

### GET /api/reports/:id
Get one report by id.

Suggested response:

```json
{
  "report": {
    "id": 1,
    "title": "Air compressor failure",
    "description": "The compressor stopped during the morning shift.",
    "asset_name": "Compressor A",
    "location": "Plant 1",
    "priority": "High",
    "status": "In Progress",
    "reported_by": "Ahmed",
    "assigned_to": "Sara",
    "downtime_hours": 2.5,
    "resolution_notes": null,
    "created_at": "2026-03-31T09:00:00Z",
    "updated_at": "2026-03-31T10:15:00Z"
  },
  "history": [
    {
      "id": 10,
      "report_id": 1,
      "action_type": "status_changed",
      "old_status": "Open",
      "new_status": "In Progress",
      "note": "Technician started inspection.",
      "changed_by": "Sara",
      "created_at": "2026-03-31T10:15:00Z"
    }
  ]
}
```

### POST /api/reports
Create a new report.

Suggested request body:

```json
{
  "title": "Air compressor failure",
  "description": "The compressor stopped during the morning shift.",
  "asset_name": "Compressor A",
  "location": "Plant 1",
  "priority": "High",
  "reported_by": "Ahmed",
  "assigned_to": "Sara",
  "downtime_hours": 0
}
```

Validation rules:
- `title` is required
- `description` is required
- `asset_name` is required
- `location` is required
- `priority` must be one of the allowed values
- `reported_by` is required
- `status` should default to `Open`

Behavior:
- create a row in `reports`
- create a first row in `report_history` with `action_type = created`

### PUT /api/reports/:id
Update general report fields.

This endpoint is for editing report details such as:
- title
- description
- asset_name
- location
- priority
- assigned_to
- downtime_hours
- resolution_notes

Suggested request body:

```json
{
  "assigned_to": "Sara",
  "downtime_hours": 3,
  "resolution_notes": "Initial inspection completed."
}
```

Behavior:
- update the selected report
- update `updated_at`
- optionally add a `report_history` row when an important change is made

### PATCH /api/reports/:id/status
Change only the report status.

This keeps status updates simple and clear.

Suggested request body:

```json
{
  "status": "Completed",
  "changed_by": "Sara",
  "note": "Repair completed and machine tested."
}
```

Validation rules:
- `status` is required
- `status` must be one of the allowed values
- `changed_by` is required

Behavior:
- update the `reports.status`
- update `reports.updated_at`
- insert a `report_history` row with old and new status

### GET /api/reports/:id/history
Get only the work history for one report.

Suggested response:

```json
[
  {
    "id": 1,
    "report_id": 1,
    "action_type": "created",
    "old_status": null,
    "new_status": "Open",
    "note": "Report created.",
    "changed_by": "Ahmed",
    "created_at": "2026-03-31T09:00:00Z"
  }
]
```

### GET /api/dashboard/summary
Return simple numbers for the dashboard.

Suggested response:

```json
{
  "total_reports": 12,
  "open_reports": 4,
  "in_progress_reports": 3,
  "completed_reports": 3,
  "closed_reports": 2,
  "critical_reports": 1
}
```

## Allowed values

### priority
- `Low`
- `Medium`
- `High`
- `Critical`

### status
- `Open`
- `In Progress`
- `Completed`
- `Closed`

## Error examples

### 400 Bad Request

```json
{
  "error": "priority must be one of: Low, Medium, High, Critical"
}
```

### 404 Not Found

```json
{
  "error": "Report not found"
}
```

## Out of scope for MVP
- authentication endpoints
- users CRUD
- assets CRUD
- file upload endpoints
- delete report endpoint

Deleting reports is intentionally left out of the MVP to keep the workflow safer and simpler for internal use.
