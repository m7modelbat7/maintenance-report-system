const allowedPriorities = ["Low", "Medium", "High", "Critical"];
const allowedStatuses = ["Open", "In Progress", "Completed", "Closed"];

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function parseReportId(value) {
  const reportId = Number(value);

  if (!Number.isInteger(reportId) || reportId <= 0) {
    return {
      error: "Report id must be a positive integer",
    };
  }

  return {
    value: reportId,
  };
}

function validateCreateReport(body) {
  const errors = [];

  if (!isNonEmptyString(body.title)) {
    errors.push("title is required");
  }

  if (!isNonEmptyString(body.description)) {
    errors.push("description is required");
  }

  if (!isNonEmptyString(body.asset_name)) {
    errors.push("asset_name is required");
  }

  if (!isNonEmptyString(body.location)) {
    errors.push("location is required");
  }

  if (!allowedPriorities.includes(body.priority)) {
    errors.push("priority must be one of: Low, Medium, High, Critical");
  }

  if (!isNonEmptyString(body.reported_by)) {
    errors.push("reported_by is required");
  }

  if (body.assigned_to !== undefined && body.assigned_to !== null && typeof body.assigned_to !== "string") {
    errors.push("assigned_to must be a string");
  }

  if (body.downtime_hours !== undefined) {
    const downtimeHours = Number(body.downtime_hours);

    if (Number.isNaN(downtimeHours) || downtimeHours < 0) {
      errors.push("downtime_hours must be a number greater than or equal to 0");
    }
  }

  if (body.resolution_notes !== undefined && body.resolution_notes !== null && typeof body.resolution_notes !== "string") {
    errors.push("resolution_notes must be a string");
  }

  return errors;
}

function validateUpdateReport(body) {
  const errors = [];
  const allowedFields = [
    "title",
    "description",
    "asset_name",
    "location",
    "priority",
    "assigned_to",
    "downtime_hours",
    "resolution_notes",
    "changed_by",
  ];

  const providedFields = Object.keys(body);
  const unknownFields = providedFields.filter((field) => !allowedFields.includes(field));

  if (unknownFields.length > 0) {
    errors.push(`Unknown fields: ${unknownFields.join(", ")}`);
  }

  if (providedFields.length === 0) {
    errors.push("At least one field is required for update");
  }

  if ("title" in body && !isNonEmptyString(body.title)) {
    errors.push("title must be a non-empty string");
  }

  if ("description" in body && !isNonEmptyString(body.description)) {
    errors.push("description must be a non-empty string");
  }

  if ("asset_name" in body && !isNonEmptyString(body.asset_name)) {
    errors.push("asset_name must be a non-empty string");
  }

  if ("location" in body && !isNonEmptyString(body.location)) {
    errors.push("location must be a non-empty string");
  }

  if ("priority" in body && !allowedPriorities.includes(body.priority)) {
    errors.push("priority must be one of: Low, Medium, High, Critical");
  }

  if ("assigned_to" in body && body.assigned_to !== null && typeof body.assigned_to !== "string") {
    errors.push("assigned_to must be a string or null");
  }

  if ("downtime_hours" in body) {
    const downtimeHours = Number(body.downtime_hours);

    if (Number.isNaN(downtimeHours) || downtimeHours < 0) {
      errors.push("downtime_hours must be a number greater than or equal to 0");
    }
  }

  if ("resolution_notes" in body && body.resolution_notes !== null && typeof body.resolution_notes !== "string") {
    errors.push("resolution_notes must be a string or null");
  }

  if ("changed_by" in body && body.changed_by !== null && !isNonEmptyString(body.changed_by)) {
    errors.push("changed_by must be a non-empty string");
  }

  if ("status" in body) {
    errors.push("Use PATCH /api/reports/:id/status to change the status");
  }

  if ("reported_by" in body) {
    errors.push("reported_by cannot be changed");
  }

  return errors;
}

function validateStatusUpdate(body) {
  const errors = [];
  const allowedFields = ["status", "changed_by", "note"];
  const providedFields = Object.keys(body);
  const unknownFields = providedFields.filter((field) => !allowedFields.includes(field));

  if (unknownFields.length > 0) {
    errors.push(`Unknown fields: ${unknownFields.join(", ")}`);
  }

  if (!allowedStatuses.includes(body.status)) {
    errors.push("status must be one of: Open, In Progress, Completed, Closed");
  }

  if (!isNonEmptyString(body.changed_by)) {
    errors.push("changed_by is required");
  }

  if ("note" in body && body.note !== null && typeof body.note !== "string") {
    errors.push("note must be a string or null");
  }

  return errors;
}

function validateReportFilters(query) {
  const errors = [];

  if (query.priority !== undefined && !allowedPriorities.includes(query.priority)) {
    errors.push("priority must be one of: Low, Medium, High, Critical");
  }

  if (query.status !== undefined && !allowedStatuses.includes(query.status)) {
    errors.push("status must be one of: Open, In Progress, Completed, Closed");
  }

  return errors;
}

module.exports = {
  allowedPriorities,
  allowedStatuses,
  parseReportId,
  validateCreateReport,
  validateReportFilters,
  validateStatusUpdate,
  validateUpdateReport,
};
