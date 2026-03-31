const { all, exec, get, run } = require("../db/database");
const {
  parseReportId,
  validateCreateReport,
  validateReportFilters,
  validateStatusUpdate,
  validateUpdateReport,
} = require("../validators/reportValidation");

function sendValidationError(response, errors) {
  response.status(400).json({
    success: false,
    error: "Validation failed",
    details: errors,
  });
}

function sendNotFound(response) {
  response.status(404).json({
    success: false,
    error: "Report not found",
  });
}

function getCurrentTimestamp() {
  return new Date().toISOString();
}

function getHistoryActor(existingReport, changedBy) {
  return changedBy || existingReport.assigned_to || existingReport.reported_by;
}

async function rollbackTransaction() {
  try {
    await exec("ROLLBACK");
  } catch (rollbackError) {
    console.error("Rollback failed:", rollbackError.message);
  }
}

async function getExistingReport(reportId) {
  return get("SELECT * FROM reports WHERE id = ?", [reportId]);
}

async function insertHistoryEntry(entry) {
  await run(
    `
      INSERT INTO report_history (
        report_id,
        action_type,
        old_status,
        new_status,
        note,
        changed_by,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      entry.report_id,
      entry.action_type,
      entry.old_status || null,
      entry.new_status || null,
      entry.note || null,
      entry.changed_by,
      entry.created_at,
    ]
  );
}

function buildUpdateSummary(existingReport, updateData) {
  const changedFields = [];

  if (updateData.title !== undefined && updateData.title !== existingReport.title) {
    changedFields.push("title");
  }

  if (updateData.description !== undefined && updateData.description !== existingReport.description) {
    changedFields.push("description");
  }

  if (updateData.asset_name !== undefined && updateData.asset_name !== existingReport.asset_name) {
    changedFields.push("asset_name");
  }

  if (updateData.location !== undefined && updateData.location !== existingReport.location) {
    changedFields.push("location");
  }

  if (updateData.priority !== undefined && updateData.priority !== existingReport.priority) {
    changedFields.push("priority");
  }

  if (updateData.assigned_to !== undefined && updateData.assigned_to !== existingReport.assigned_to) {
    changedFields.push("assigned_to");
  }

  if (updateData.downtime_hours !== undefined && Number(updateData.downtime_hours) !== Number(existingReport.downtime_hours)) {
    changedFields.push("downtime_hours");
  }

  if (updateData.resolution_notes !== undefined && updateData.resolution_notes !== existingReport.resolution_notes) {
    changedFields.push("resolution_notes");
  }

  return changedFields;
}

async function getReportHistoryRows(reportId) {
  return all(
    `
      SELECT id, report_id, action_type, old_status, new_status, note, changed_by, created_at
      FROM report_history
      WHERE report_id = ?
      ORDER BY id ASC
    `,
    [reportId]
  );
}

async function getReports(request, response, next) {
  try {
    const validationErrors = validateReportFilters(request.query);

    if (validationErrors.length > 0) {
      return sendValidationError(response, validationErrors);
    }

    const conditions = [];
    const params = [];

    if (request.query.search) {
      const searchValue = `%${request.query.search.trim()}%`;
      conditions.push("(title LIKE ? OR description LIKE ? OR asset_name LIKE ? OR location LIKE ?)");
      params.push(searchValue, searchValue, searchValue, searchValue);
    }

    if (request.query.status) {
      conditions.push("status = ?");
      params.push(request.query.status);
    }

    if (request.query.priority) {
      conditions.push("priority = ?");
      params.push(request.query.priority);
    }

    let sql = `
      SELECT id, title, priority, status, asset_name, location, reported_by, assigned_to, created_at, updated_at
      FROM reports
    `;

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    sql += " ORDER BY id DESC";

    const reports = await all(sql, params);

    response.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
}

async function getReportById(request, response, next) {
  try {
    const parsedId = parseReportId(request.params.id);

    if (parsedId.error) {
      return sendValidationError(response, [parsedId.error]);
    }

    const report = await getExistingReport(parsedId.value);

    if (!report) {
      return sendNotFound(response);
    }

    const history = await getReportHistoryRows(parsedId.value);

    response.status(200).json({
      success: true,
      data: {
        report,
        history,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getReportHistory(request, response, next) {
  try {
    const parsedId = parseReportId(request.params.id);

    if (parsedId.error) {
      return sendValidationError(response, [parsedId.error]);
    }

    const report = await getExistingReport(parsedId.value);

    if (!report) {
      return sendNotFound(response);
    }

    const history = await getReportHistoryRows(parsedId.value);

    response.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
}

async function createReport(request, response, next) {
  try {
    const validationErrors = validateCreateReport(request.body);

    if (validationErrors.length > 0) {
      return sendValidationError(response, validationErrors);
    }

    const currentTimestamp = getCurrentTimestamp();
    const downtimeHours = request.body.downtime_hours === undefined ? 0 : Number(request.body.downtime_hours);

    await exec("BEGIN TRANSACTION");

    try {
      const insertResult = await run(
        `
          INSERT INTO reports (
            title,
            description,
            asset_name,
            location,
            priority,
            status,
            reported_by,
            assigned_to,
            downtime_hours,
            resolution_notes,
            created_at,
            updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          request.body.title.trim(),
          request.body.description.trim(),
          request.body.asset_name.trim(),
          request.body.location.trim(),
          request.body.priority,
          "Open",
          request.body.reported_by.trim(),
          request.body.assigned_to ? request.body.assigned_to.trim() : null,
          downtimeHours,
          request.body.resolution_notes ? request.body.resolution_notes.trim() : null,
          currentTimestamp,
          currentTimestamp,
        ]
      );

      await insertHistoryEntry({
        report_id: insertResult.id,
        action_type: "created",
        old_status: null,
        new_status: "Open",
        note: "Report created.",
        changed_by: request.body.reported_by.trim(),
        created_at: currentTimestamp,
      });

      await exec("COMMIT");

      const createdReport = await getExistingReport(insertResult.id);

      response.status(201).json({
        success: true,
        data: createdReport,
      });
    } catch (error) {
      await rollbackTransaction();
      throw error;
    }
  } catch (error) {
    next(error);
  }
}

async function updateReport(request, response, next) {
  try {
    const parsedId = parseReportId(request.params.id);

    if (parsedId.error) {
      return sendValidationError(response, [parsedId.error]);
    }

    const validationErrors = validateUpdateReport(request.body);

    if (validationErrors.length > 0) {
      return sendValidationError(response, validationErrors);
    }

    const existingReport = await getExistingReport(parsedId.value);

    if (!existingReport) {
      return sendNotFound(response);
    }

    const changedFields = buildUpdateSummary(existingReport, request.body);

    if (changedFields.length === 0) {
      return response.status(200).json({
        success: true,
        data: existingReport,
        message: "No changes were made",
      });
    }

    const updatedReport = {
      title: request.body.title !== undefined ? request.body.title.trim() : existingReport.title,
      description: request.body.description !== undefined ? request.body.description.trim() : existingReport.description,
      asset_name: request.body.asset_name !== undefined ? request.body.asset_name.trim() : existingReport.asset_name,
      location: request.body.location !== undefined ? request.body.location.trim() : existingReport.location,
      priority: request.body.priority !== undefined ? request.body.priority : existingReport.priority,
      assigned_to:
        request.body.assigned_to !== undefined
          ? request.body.assigned_to === null
            ? null
            : request.body.assigned_to.trim()
          : existingReport.assigned_to,
      downtime_hours:
        request.body.downtime_hours !== undefined
          ? Number(request.body.downtime_hours)
          : existingReport.downtime_hours,
      resolution_notes:
        request.body.resolution_notes !== undefined
          ? request.body.resolution_notes === null
            ? null
            : request.body.resolution_notes.trim()
          : existingReport.resolution_notes,
      updated_at: getCurrentTimestamp(),
    };

    const changedBy = getHistoryActor(existingReport, request.body.changed_by ? request.body.changed_by.trim() : null);

    await exec("BEGIN TRANSACTION");

    try {
      await run(
        `
          UPDATE reports
          SET
            title = ?,
            description = ?,
            asset_name = ?,
            location = ?,
            priority = ?,
            assigned_to = ?,
            downtime_hours = ?,
            resolution_notes = ?,
            updated_at = ?
          WHERE id = ?
        `,
        [
          updatedReport.title,
          updatedReport.description,
          updatedReport.asset_name,
          updatedReport.location,
          updatedReport.priority,
          updatedReport.assigned_to,
          updatedReport.downtime_hours,
          updatedReport.resolution_notes,
          updatedReport.updated_at,
          parsedId.value,
        ]
      );

      await insertHistoryEntry({
        report_id: parsedId.value,
        action_type: "report_updated",
        old_status: existingReport.status,
        new_status: existingReport.status,
        note: `Updated fields: ${changedFields.join(", ")}`,
        changed_by: changedBy,
        created_at: updatedReport.updated_at,
      });

      await exec("COMMIT");

      const savedReport = await getExistingReport(parsedId.value);

      response.status(200).json({
        success: true,
        data: savedReport,
      });
    } catch (error) {
      await rollbackTransaction();
      throw error;
    }
  } catch (error) {
    next(error);
  }
}

async function updateReportStatus(request, response, next) {
  try {
    const parsedId = parseReportId(request.params.id);

    if (parsedId.error) {
      return sendValidationError(response, [parsedId.error]);
    }

    const validationErrors = validateStatusUpdate(request.body);

    if (validationErrors.length > 0) {
      return sendValidationError(response, validationErrors);
    }

    const existingReport = await getExistingReport(parsedId.value);

    if (!existingReport) {
      return sendNotFound(response);
    }

    if (existingReport.status === request.body.status) {
      return response.status(200).json({
        success: true,
        data: existingReport,
        message: "Status is already set to this value",
      });
    }

    const currentTimestamp = getCurrentTimestamp();

    await exec("BEGIN TRANSACTION");

    try {
      await run(
        `
          UPDATE reports
          SET status = ?, updated_at = ?
          WHERE id = ?
        `,
        [request.body.status, currentTimestamp, parsedId.value]
      );

      await insertHistoryEntry({
        report_id: parsedId.value,
        action_type: "status_changed",
        old_status: existingReport.status,
        new_status: request.body.status,
        note: request.body.note ? request.body.note.trim() : null,
        changed_by: request.body.changed_by.trim(),
        created_at: currentTimestamp,
      });

      await exec("COMMIT");

      const updatedReport = await getExistingReport(parsedId.value);

      response.status(200).json({
        success: true,
        data: updatedReport,
      });
    } catch (error) {
      await rollbackTransaction();
      throw error;
    }
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createReport,
  getReportById,
  getReportHistory,
  getReports,
  updateReport,
  updateReportStatus,
};
