# MVP Database Design

## Goal
Keep the database simple for the first version of the app.

The MVP should focus on:
- creating maintenance reports
- listing and searching reports
- updating report status
- tracking basic work history
- supporting a simple dashboard

SQLite is a good fit for this because it works well with small projects and is easy to understand.

## MVP approach
For the first version, use two tables:
- `reports`
- `report_history`

This keeps the design beginner-friendly while still supporting the full MVP scope.

## Table: reports
This is the main table.
Each row is one maintenance report.

Suggested fields:

| Field | Type | Notes |
| --- | --- | --- |
| id | INTEGER | Primary key, auto increment |
| title | TEXT | Short report title, required |
| description | TEXT | Full problem description, required |
| asset_name | TEXT | Name of machine or asset, required |
| location | TEXT | Where the issue happened, required |
| priority | TEXT | Use allowed values listed below |
| status | TEXT | Use allowed values listed below |
| reported_by | TEXT | Name of the person who created the report |
| assigned_to | TEXT | Technician name, optional |
| downtime_hours | REAL | Optional, default `0` |
| resolution_notes | TEXT | Final or latest work summary, optional |
| created_at | TEXT | ISO date/time string |
| updated_at | TEXT | ISO date/time string |

## Table: report_history
This table stores simple work history entries.
Each row is one update related to a report.

Suggested fields:

| Field | Type | Notes |
| --- | --- | --- |
| id | INTEGER | Primary key, auto increment |
| report_id | INTEGER | Foreign key to `reports.id`, required |
| action_type | TEXT | Example: `created`, `status_changed`, `note_added`, `assignment_changed` |
| old_status | TEXT | Optional, useful for status updates |
| new_status | TEXT | Optional, useful for status updates |
| note | TEXT | Short explanation of what changed |
| changed_by | TEXT | Person who made the update |
| created_at | TEXT | ISO date/time string |

## Why this design
- `reports` handles the current state of each maintenance issue.
- `report_history` keeps a simple audit trail without making the main table too large.
- Names are stored as plain text for now instead of separate user tables, which keeps the MVP easier to build.
- `asset_name` is stored directly for now because the project plan says asset support can come later.

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

## SQLite notes
- Use `INTEGER PRIMARY KEY AUTOINCREMENT` for ids.
- Store dates as `TEXT` in ISO format such as `2026-03-31T10:30:00Z`.
- Store `downtime_hours` as `REAL`.
- Use simple `CHECK` constraints for `priority` and `status` if desired.
- Turn on foreign keys in SQLite so `report_history.report_id` stays valid.

## Example relationship
- One report can have many history entries.
- One history entry belongs to one report.

## Out of scope for MVP
These can be added later if needed:
- separate `users` table
- separate `assets` table
- authentication and permissions
- file attachments
- comments with rich formatting

## Example SQL shape
This is not final code, but it shows the intended structure:

```sql
CREATE TABLE reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  location TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Open',
  reported_by TEXT NOT NULL,
  assigned_to TEXT,
  downtime_hours REAL NOT NULL DEFAULT 0,
  resolution_notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  CHECK (status IN ('Open', 'In Progress', 'Completed', 'Closed'))
);

CREATE TABLE report_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT,
  note TEXT,
  changed_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (report_id) REFERENCES reports(id)
);
```
