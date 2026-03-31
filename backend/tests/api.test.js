const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { after, before, beforeEach, test } = require("node:test");

const testDatabaseDirectory = path.join(__dirname, ".tmp");
const testDatabasePath = path.join(testDatabaseDirectory, "api.test.sqlite");

fs.mkdirSync(testDatabaseDirectory, { recursive: true });
fs.rmSync(testDatabasePath, { force: true });
fs.rmSync(`${testDatabasePath}-journal`, { force: true });

process.env.SQLITE_DB_PATH = testDatabasePath;

const app = require("../src/app");
const { database, exec } = require("../src/db/database");
const { initializeDatabase } = require("../src/db/initSchema");

let server;
let baseUrl;

function createJsonRequestOptions(method, body) {
  return {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
}

async function requestJson(routePath, options) {
  const response = await fetch(`${baseUrl}${routePath}`, options);
  const body = await response.json();

  return {
    response,
    body,
  };
}

async function createReport(overrides = {}) {
  const requestBody = {
    title: "Pump pressure drop",
    description: "Pressure dropped during the night shift.",
    asset_name: "Pump B",
    location: "Line 2",
    priority: "High",
    reported_by: "Ahmed",
    ...overrides,
  };

  return requestJson("/api/reports", createJsonRequestOptions("POST", requestBody));
}

before(async () => {
  await initializeDatabase();

  server = await new Promise((resolve) => {
    const startedServer = app.listen(0, () => {
      resolve(startedServer);
    });
  });

  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

beforeEach(async () => {
  await exec("DELETE FROM report_history");
  await exec("DELETE FROM reports");
  await exec("DELETE FROM sqlite_sequence WHERE name IN ('report_history', 'reports')");
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  await new Promise((resolve, reject) => {
    database.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  fs.rmSync(testDatabasePath, { force: true });
  fs.rmSync(`${testDatabasePath}-journal`, { force: true });
});

test("GET /api/health returns backend status", async () => {
  const { response, body } = await requestJson("/api/health");

  assert.equal(response.status, 200);
  assert.equal(body.status, "ok");
  assert.equal(body.message, "Backend is running");
  assert.ok(body.timestamp);
});

test("POST /api/reports creates a report and records the default status", async () => {
  const { response, body } = await createReport({
    assigned_to: "Sara",
    downtime_hours: 1.5,
  });

  assert.equal(response.status, 201);
  assert.equal(body.success, true);
  assert.equal(body.data.title, "Pump pressure drop");
  assert.equal(body.data.status, "Open");
  assert.equal(body.data.assigned_to, "Sara");
  assert.equal(body.data.downtime_hours, 1.5);

  const historyResponse = await requestJson(`/api/reports/${body.data.id}/history`);
  assert.equal(historyResponse.response.status, 200);
  assert.equal(historyResponse.body.data.length, 1);
  assert.equal(historyResponse.body.data[0].action_type, "created");
  assert.equal(historyResponse.body.data[0].new_status, "Open");
});

test("POST /api/reports returns validation errors for invalid payloads", async () => {
  const { response, body } = await requestJson(
    "/api/reports",
    createJsonRequestOptions("POST", {
      title: "",
      description: "",
      asset_name: "",
      location: "",
      priority: "Urgent",
      reported_by: "",
    })
  );

  assert.equal(response.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.error, "Validation failed");
  assert.ok(body.details.includes("title is required"));
  assert.ok(body.details.includes("priority must be one of: Low, Medium, High, Critical"));
});

test("GET /api/reports lists reports and applies search, status, and priority filters", async () => {
  await createReport({
    title: "Pump vibration alert",
    asset_name: "Pump C",
    priority: "High",
  });

  const criticalReport = await createReport({
    title: "Compressor stopped",
    asset_name: "Compressor A",
    priority: "Critical",
  });

  await requestJson(
    `/api/reports/${criticalReport.body.data.id}/status`,
    createJsonRequestOptions("PATCH", {
      status: "In Progress",
      changed_by: "Sara",
      note: "Technician started inspection.",
    })
  );

  const { response, body } = await requestJson("/api/reports?search=Compressor&status=In%20Progress&priority=Critical");

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.length, 1);
  assert.equal(body.data[0].title, "Compressor stopped");
  assert.equal(body.data[0].status, "In Progress");
  assert.equal(body.data[0].priority, "Critical");
});

test("PUT /api/reports/:id updates editable fields and records report history", async () => {
  const createdReport = await createReport();
  const reportId = createdReport.body.data.id;

  const updateResponse = await requestJson(
    `/api/reports/${reportId}`,
    createJsonRequestOptions("PUT", {
      title: "Pump pressure drop resolved",
      assigned_to: "Mona",
      downtime_hours: 2,
      resolution_notes: "Initial inspection completed.",
      changed_by: "Sara",
    })
  );

  assert.equal(updateResponse.response.status, 200);
  assert.equal(updateResponse.body.success, true);
  assert.equal(updateResponse.body.data.title, "Pump pressure drop resolved");
  assert.equal(updateResponse.body.data.assigned_to, "Mona");
  assert.equal(updateResponse.body.data.downtime_hours, 2);
  assert.equal(updateResponse.body.data.resolution_notes, "Initial inspection completed.");

  const detailsResponse = await requestJson(`/api/reports/${reportId}`);
  assert.equal(detailsResponse.response.status, 200);
  assert.equal(detailsResponse.body.data.history.length, 2);
  assert.equal(detailsResponse.body.data.history[1].action_type, "report_updated");
  assert.match(detailsResponse.body.data.history[1].note, /title/);
});

test("PATCH /api/reports/:id/status updates the status and records a history entry", async () => {
  const createdReport = await createReport();
  const reportId = createdReport.body.data.id;

  const statusResponse = await requestJson(
    `/api/reports/${reportId}/status`,
    createJsonRequestOptions("PATCH", {
      status: "Completed",
      changed_by: "Sara",
      note: "Repair completed and machine tested.",
    })
  );

  assert.equal(statusResponse.response.status, 200);
  assert.equal(statusResponse.body.success, true);
  assert.equal(statusResponse.body.data.status, "Completed");

  const historyResponse = await requestJson(`/api/reports/${reportId}/history`);
  assert.equal(historyResponse.response.status, 200);
  assert.equal(historyResponse.body.data.length, 2);
  assert.equal(historyResponse.body.data[1].action_type, "status_changed");
  assert.equal(historyResponse.body.data[1].old_status, "Open");
  assert.equal(historyResponse.body.data[1].new_status, "Completed");
});

test("GET /api/dashboard/summary returns counts based on report data", async () => {
  const firstReport = await createReport({
    title: "Critical pump issue",
    priority: "Critical",
  });

  const secondReport = await createReport({
    title: "Cooling fan issue",
    priority: "Low",
  });

  await requestJson(
    `/api/reports/${firstReport.body.data.id}/status`,
    createJsonRequestOptions("PATCH", {
      status: "In Progress",
      changed_by: "Sara",
      note: "Repair started.",
    })
  );

  await requestJson(
    `/api/reports/${secondReport.body.data.id}/status`,
    createJsonRequestOptions("PATCH", {
      status: "Closed",
      changed_by: "Mona",
      note: "Issue closed after review.",
    })
  );

  const { response, body } = await requestJson("/api/dashboard/summary");

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.deepEqual(body.data, {
    total_reports: 2,
    open_reports: 0,
    in_progress_reports: 1,
    critical_reports: 1,
  });
});
