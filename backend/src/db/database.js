const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const databaseFilePath =
  process.env.SQLITE_DB_PATH || path.join(__dirname, "..", "..", "data", "maintenance-report-system.db");

fs.mkdirSync(path.dirname(databaseFilePath), { recursive: true });

const database = new sqlite3.Database(databaseFilePath);

const databaseReady = new Promise((resolve, reject) => {
  database.serialize(() => {
    database.run("PRAGMA foreign_keys = ON", (pragmaError) => {
      if (pragmaError) {
        reject(pragmaError);
        return;
      }

      console.log(`Connected to SQLite database at ${databaseFilePath}`);
      resolve();
    });
  });
});

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    database.run(sql, params, function handleResult(error) {
      if (error) {
        reject(error);
        return;
      }

      resolve({
        id: this.lastID,
        changes: this.changes,
      });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    database.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    database.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows);
    });
  });
}

function exec(sql) {
  return new Promise((resolve, reject) => {
    database.exec(sql, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

module.exports = {
  all,
  database,
  databaseFilePath,
  databaseReady,
  exec,
  get,
  run,
};
