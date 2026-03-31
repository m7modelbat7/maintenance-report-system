const assert = require("node:assert/strict");
const path = require("node:path");
const { afterEach, test } = require("node:test");

const controllerModulePath = path.join(__dirname, "..", "src", "controllers", "reportController.js");
const databaseModulePath = require.resolve("../src/db/database");

let originalDatabaseModule;

function loadControllerWithDatabaseMock(databaseMock) {
  originalDatabaseModule = require.cache[databaseModulePath];

  require.cache[databaseModulePath] = {
    id: databaseModulePath,
    filename: databaseModulePath,
    loaded: true,
    exports: databaseMock,
  };

  delete require.cache[controllerModulePath];

  return require(controllerModulePath);
}

afterEach(() => {
  delete require.cache[controllerModulePath];

  if (originalDatabaseModule) {
    require.cache[databaseModulePath] = originalDatabaseModule;
  } else {
    delete require.cache[databaseModulePath];
  }

  originalDatabaseModule = undefined;
});

test("createReport preserves the original database error when rollback also fails", async () => {
  const originalError = new Error("disk I/O error");
  const rollbackError = new Error("cannot rollback - no transaction is active");
  const execCalls = [];

  const reportController = loadControllerWithDatabaseMock({
    all: async () => [],
    get: async () => null,
    run: async (sql) => {
      if (sql.includes("INSERT INTO reports")) {
        throw originalError;
      }

      throw new Error("Unexpected SQL in run");
    },
    exec: async (sql) => {
      execCalls.push(sql);

      if (sql === "BEGIN TRANSACTION") {
        return;
      }

      if (sql === "ROLLBACK") {
        throw rollbackError;
      }

      throw new Error(`Unexpected SQL in exec: ${sql}`);
    },
  });

  const request = {
    body: {
      title: "Pump pressure drop",
      description: "Pressure dropped during the night shift.",
      asset_name: "Pump B",
      location: "Line 2",
      priority: "High",
      reported_by: "Ahmed",
    },
  };

  const response = {
    status() {
      return this;
    },
    json() {
      return this;
    },
  };

  let nextError;
  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    await reportController.createReport(request, response, (error) => {
      nextError = error;
    });
  } finally {
    console.error = originalConsoleError;
  }

  assert.equal(nextError, originalError);
  assert.deepEqual(execCalls, ["BEGIN TRANSACTION", "ROLLBACK"]);
});
