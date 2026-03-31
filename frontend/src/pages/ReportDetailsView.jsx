import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";

const availableStatuses = ["Open", "In Progress", "Completed", "Closed"];
const availablePriorities = ["Low", "Medium", "High", "Critical"];

const initialEditForm = {
  title: "",
  description: "",
  asset_name: "",
  location: "",
  priority: "Medium",
  assigned_to: "",
  downtime_hours: "",
  resolution_notes: "",
};

function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }

  return value;
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function ReportDetailsView({
  onBackToReports,
  onReportFieldsUpdated,
  onReportStatusUpdated,
  reportId,
}) {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isNotFound, setIsNotFound] = useState(false);
  const [hasSelection, setHasSelection] = useState(true);
  const [statusForm, setStatusForm] = useState({
    status: "Open",
    changedBy: "",
    note: "",
  });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState("");
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState("");
  const [editForm, setEditForm] = useState(initialEditForm);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editSaveError, setEditSaveError] = useState("");
  const [editSaveSuccess, setEditSaveSuccess] = useState("");

  function fillFormsFromReport(report) {
    setStatusForm((currentValue) => ({
      ...currentValue,
      status: report?.status || "Open",
    }));

    setEditForm({
      title: report?.title || "",
      description: report?.description || "",
      asset_name: report?.asset_name || "",
      location: report?.location || "",
      priority: report?.priority || "Medium",
      assigned_to: report?.assigned_to || "",
      downtime_hours:
        report?.downtime_hours === null || report?.downtime_hours === undefined
          ? ""
          : String(report.downtime_hours),
      resolution_notes: report?.resolution_notes || "",
    });
  }

  async function fetchReportDetails(currentReportId) {
    const response = await apiFetch(`/api/reports/${currentReportId}`);
    const responseData = await response.json();

    if (response.status === 404) {
      setReportData(null);
      setIsNotFound(true);
      return null;
    }

    if (!response.ok) {
      throw new Error(responseData.error || "Failed to load report details");
    }

    setReportData(responseData.data);
    fillFormsFromReport(responseData.data?.report);
    return responseData.data;
  }

  useEffect(() => {
    async function loadReport() {
      if (!reportId) {
        setReportData(null);
        setIsLoading(false);
        setIsNotFound(false);
        setHasSelection(false);
        setErrorMessage("");
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");
        setIsNotFound(false);
        setHasSelection(true);
        setEditSaveError("");
        setEditSaveSuccess("");
        setStatusUpdateError("");
        setStatusUpdateSuccess("");

        await fetchReportDetails(reportId);
      } catch (error) {
        setErrorMessage(error.message || "Failed to load report details");
        setReportData(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadReport();
  }, [reportId]);

  const report = reportData?.report;
  const historyItems = Array.isArray(reportData?.history) ? reportData.history : [];

  function updateStatusField(fieldName, value) {
    setStatusForm((currentValue) => ({
      ...currentValue,
      [fieldName]: value,
    }));
  }

  function updateEditField(fieldName, value) {
    setEditForm((currentValue) => ({
      ...currentValue,
      [fieldName]: value,
    }));
  }

  function resetEditForm() {
    if (!report) {
      return;
    }

    fillFormsFromReport(report);
    setEditSaveError("");
    setEditSaveSuccess("");
  }

  async function handleStatusSubmit(event) {
    event.preventDefault();

    if (!reportId) {
      return;
    }

    if (!statusForm.changedBy.trim()) {
      setStatusUpdateError("Changed By is required");
      setStatusUpdateSuccess("");
      return;
    }

    try {
      setIsUpdatingStatus(true);
      setStatusUpdateError("");
      setStatusUpdateSuccess("");

      const requestBody = {
        status: statusForm.status,
        changed_by: statusForm.changedBy.trim(),
      };

      if (statusForm.note.trim()) {
        requestBody.note = statusForm.note.trim();
      }

      const response = await apiFetch(`/api/reports/${reportId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (Array.isArray(responseData.details) && responseData.details.length > 0) {
          throw new Error(responseData.details.join(", "));
        }

        throw new Error(responseData.error || "Failed to update report status");
      }

      setStatusUpdateSuccess("Report status updated successfully.");
      setStatusForm((currentValue) => ({
        ...currentValue,
        note: "",
      }));

      setIsLoading(true);
      setErrorMessage("");
      setIsNotFound(false);
      await fetchReportDetails(reportId);
      onReportStatusUpdated();
    } catch (error) {
      setStatusUpdateError(error.message || "Failed to update report status");
      setStatusUpdateSuccess("");
    } finally {
      setIsUpdatingStatus(false);
      setIsLoading(false);
    }
  }

  function validateEditForm() {
    const errors = [];

    if (!editForm.title.trim()) {
      errors.push("Title is required");
    }

    if (!editForm.description.trim()) {
      errors.push("Description is required");
    }

    if (!editForm.asset_name.trim()) {
      errors.push("Asset Name is required");
    }

    if (!editForm.location.trim()) {
      errors.push("Location is required");
    }

    if (editForm.downtime_hours.trim()) {
      const downtimeHours = Number(editForm.downtime_hours);

      if (Number.isNaN(downtimeHours) || downtimeHours < 0) {
        errors.push("Downtime Hours must be a number greater than or equal to 0");
      }
    }

    return errors;
  }

  async function handleEditSubmit(event) {
    event.preventDefault();

    if (!reportId) {
      return;
    }

    const validationErrors = validateEditForm();

    if (validationErrors.length > 0) {
      setEditSaveError(validationErrors.join(", "));
      setEditSaveSuccess("");
      return;
    }

    const requestBody = {
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      asset_name: editForm.asset_name.trim(),
      location: editForm.location.trim(),
      priority: editForm.priority,
      assigned_to: editForm.assigned_to.trim() ? editForm.assigned_to.trim() : null,
      downtime_hours: editForm.downtime_hours.trim() ? Number(editForm.downtime_hours) : 0,
      resolution_notes: editForm.resolution_notes.trim() ? editForm.resolution_notes.trim() : null,
    };

    try {
      setIsSavingEdit(true);
      setEditSaveError("");
      setEditSaveSuccess("");

      const response = await apiFetch(`/api/reports/${reportId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (Array.isArray(responseData.details) && responseData.details.length > 0) {
          throw new Error(responseData.details.join(", "));
        }

        throw new Error(responseData.error || "Failed to save report changes");
      }

      setEditSaveSuccess("Report details saved successfully.");
      setIsLoading(true);
      setErrorMessage("");
      setIsNotFound(false);
      await fetchReportDetails(reportId);
      onReportFieldsUpdated();
    } catch (error) {
      setEditSaveError(error.message || "Failed to save report changes");
      setEditSaveSuccess("");
    } finally {
      setIsSavingEdit(false);
      setIsLoading(false);
    }
  }

  return (
    <div className="page-stack">
      <div className="toolbar-card">
        <div className="toolbar-row">
          <div>
            <p className="section-label">Report Details</p>
            <h3>{report ? report.title : "Selected Report"}</h3>
            <p className="muted-text">Review the full report details and work history.</p>
          </div>
          <button type="button" className="secondary-button" onClick={onBackToReports}>
            Back to Reports
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="content-card">
          <div className="state-box">
            <p className="state-title">Loading report details...</p>
            <p className="muted-text">Please wait while the selected report is being loaded.</p>
          </div>
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="content-card">
          <div className="state-box">
            <p className="state-title">Could not load report details</p>
            <p className="muted-text">{errorMessage}</p>
          </div>
        </div>
      )}

      {!isLoading && !hasSelection && (
        <div className="content-card">
          <div className="state-box">
            <p className="state-title">No report selected yet</p>
            <p className="muted-text">Choose a report from the Reports List to view its details.</p>
          </div>
        </div>
      )}

      {!isLoading && isNotFound && (
        <div className="content-card">
          <div className="state-box">
            <p className="state-title">Report not found</p>
            <p className="muted-text">
              The selected report could not be found. It may have been removed or the id is invalid.
            </p>
          </div>
        </div>
      )}

      {!isLoading && !errorMessage && !isNotFound && report && (
        <div className="page-stack">
          <div className="details-grid">
            <article className="content-card">
              <div className="card-heading">
                <h3>Report Summary</h3>
              </div>

              <dl className="details-list">
                <div>
                  <dt>Title</dt>
                  <dd>{formatValue(report.title)}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{formatValue(report.status)}</dd>
                </div>
                <div>
                  <dt>Priority</dt>
                  <dd>{formatValue(report.priority)}</dd>
                </div>
                <div>
                  <dt>Asset Name</dt>
                  <dd>{formatValue(report.asset_name)}</dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>{formatValue(report.location)}</dd>
                </div>
                <div>
                  <dt>Reported By</dt>
                  <dd>{formatValue(report.reported_by)}</dd>
                </div>
                <div>
                  <dt>Assigned To</dt>
                  <dd>{formatValue(report.assigned_to)}</dd>
                </div>
                <div>
                  <dt>Downtime Hours</dt>
                  <dd>{formatValue(report.downtime_hours)}</dd>
                </div>
                <div>
                  <dt>Created At</dt>
                  <dd>{formatDate(report.created_at)}</dd>
                </div>
                <div>
                  <dt>Updated At</dt>
                  <dd>{formatDate(report.updated_at)}</dd>
                </div>
              </dl>
            </article>

            <article className="content-card">
              <div className="card-heading">
                <h3>Status Update</h3>
              </div>

              {statusUpdateError && (
                <div className="state-box error-box compact-box">
                  <p className="state-title">Could not update status</p>
                  <p className="muted-text">{statusUpdateError}</p>
                </div>
              )}

              {statusUpdateSuccess && (
                <div className="state-box success-box compact-box">
                  <p className="state-title">Success</p>
                  <p className="muted-text">{statusUpdateSuccess}</p>
                </div>
              )}

              <form className="form-grid single-column-form" onSubmit={handleStatusSubmit}>
                <label className="form-field">
                  <span>Status</span>
                  <select
                    className="text-input"
                    value={statusForm.status}
                    onChange={(event) => updateStatusField("status", event.target.value)}
                    disabled={isUpdatingStatus}
                  >
                    {availableStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>Changed By</span>
                  <input
                    className="text-input"
                    type="text"
                    placeholder="Enter your name"
                    value={statusForm.changedBy}
                    onChange={(event) => updateStatusField("changedBy", event.target.value)}
                    disabled={isUpdatingStatus}
                  />
                </label>

                <label className="form-field">
                  <span>Note</span>
                  <textarea
                    className="text-input text-area"
                    rows="4"
                    placeholder="Optional status update note"
                    value={statusForm.note}
                    onChange={(event) => updateStatusField("note", event.target.value)}
                    disabled={isUpdatingStatus}
                  />
                </label>

                <div className="form-actions">
                  <button type="submit" className="primary-button" disabled={isUpdatingStatus}>
                    {isUpdatingStatus ? "Updating Status..." : "Update Status"}
                  </button>
                </div>
              </form>
            </article>
          </div>

          <article className="content-card">
            <div className="card-heading">
              <h3>Work Summary</h3>
            </div>

            <div className="details-block">
              <p className="details-block-label">Description</p>
              <p className="details-block-text">{formatValue(report.description)}</p>
            </div>

            <div className="details-block">
              <p className="details-block-label">Resolution Notes</p>
              <p className="details-block-text">{formatValue(report.resolution_notes)}</p>
            </div>
          </article>

          <article className="content-card">
            <div className="card-heading">
              <h3>Edit Report</h3>
              <p className="muted-text">Update the main report fields and save them to the backend.</p>
            </div>

            {editSaveError && (
              <div className="state-box error-box compact-box">
                <p className="state-title">Could not save report changes</p>
                <p className="muted-text">{editSaveError}</p>
              </div>
            )}

            {editSaveSuccess && (
              <div className="state-box success-box compact-box">
                <p className="state-title">Success</p>
                <p className="muted-text">{editSaveSuccess}</p>
              </div>
            )}

            <form className="form-grid" onSubmit={handleEditSubmit}>
              <label className="form-field">
                <span>Title</span>
                <input
                  className="text-input"
                  type="text"
                  value={editForm.title}
                  onChange={(event) => updateEditField("title", event.target.value)}
                  disabled={isSavingEdit}
                />
              </label>

              <label className="form-field">
                <span>Asset Name</span>
                <input
                  className="text-input"
                  type="text"
                  value={editForm.asset_name}
                  onChange={(event) => updateEditField("asset_name", event.target.value)}
                  disabled={isSavingEdit}
                />
              </label>

              <label className="form-field">
                <span>Location</span>
                <input
                  className="text-input"
                  type="text"
                  value={editForm.location}
                  onChange={(event) => updateEditField("location", event.target.value)}
                  disabled={isSavingEdit}
                />
              </label>

              <label className="form-field">
                <span>Priority</span>
                <select
                  className="text-input"
                  value={editForm.priority}
                  onChange={(event) => updateEditField("priority", event.target.value)}
                  disabled={isSavingEdit}
                >
                  {availablePriorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field">
                <span>Assigned To</span>
                <input
                  className="text-input"
                  type="text"
                  value={editForm.assigned_to}
                  onChange={(event) => updateEditField("assigned_to", event.target.value)}
                  disabled={isSavingEdit}
                />
              </label>

              <label className="form-field">
                <span>Reported By</span>
                <input className="text-input read-only-input" type="text" value={report.reported_by || ""} readOnly />
              </label>

              <label className="form-field">
                <span>Downtime Hours</span>
                <input
                  className="text-input"
                  type="number"
                  min="0"
                  step="0.5"
                  value={editForm.downtime_hours}
                  onChange={(event) => updateEditField("downtime_hours", event.target.value)}
                  disabled={isSavingEdit}
                />
              </label>

              <label className="form-field full-width">
                <span>Description</span>
                <textarea
                  className="text-input text-area"
                  rows="5"
                  value={editForm.description}
                  onChange={(event) => updateEditField("description", event.target.value)}
                  disabled={isSavingEdit}
                />
              </label>

              <label className="form-field full-width">
                <span>Resolution Notes</span>
                <textarea
                  className="text-input text-area"
                  rows="4"
                  value={editForm.resolution_notes}
                  onChange={(event) => updateEditField("resolution_notes", event.target.value)}
                  disabled={isSavingEdit}
                />
              </label>

              <div className="form-actions full-width">
                <button type="button" className="secondary-button" onClick={resetEditForm} disabled={isSavingEdit}>
                  Reset Form
                </button>
                <button type="submit" className="primary-button" disabled={isSavingEdit}>
                  {isSavingEdit ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </article>

          <article className="content-card">
            <div className="card-heading">
              <h3>Work History</h3>
              <p className="muted-text">Changes recorded for this report.</p>
            </div>

            {historyItems.length === 0 ? (
              <div className="state-box">
                <p className="state-title">No history entries yet</p>
                <p className="muted-text">History will appear here when the report is updated.</p>
              </div>
            ) : (
              <ul className="timeline-list">
                {historyItems.map((item) => (
                  <li key={item.id} className="timeline-item">
                    <h4>{formatValue(item.action_type)}</h4>
                    <p className="timeline-meta">
                      {formatValue(item.changed_by)} | {formatDate(item.created_at)}
                    </p>
                    {(item.old_status || item.new_status) && (
                      <p className="muted-text">
                        Status: {formatValue(item.old_status)} to {formatValue(item.new_status)}
                      </p>
                    )}
                    <p className="muted-text">{formatValue(item.note)}</p>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>
      )}
    </div>
  );
}

export default ReportDetailsView;
