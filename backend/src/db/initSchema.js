const { databaseReady, exec } = require("./database");

const createReportsTableSql = `
  CREATE TABLE IF NOT EXISTS reports (
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
`;

const createReportHistoryTableSql = `
  CREATE TABLE IF NOT EXISTS report_history (
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
`;

async function initializeDatabase() {
  await databaseReady;
  await exec(createReportsTableSql);
  await exec(createReportHistoryTableSql);
}

module.exports = {
  initializeDatabase,
};
