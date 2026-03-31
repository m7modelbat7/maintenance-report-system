import React, { useEffect, useRef, useState } from "react";
import { apiFetch } from "../api";

const initialFormState = {
  title: "",
  asset_name: "",
  location: "",
  priority: "Medium",
  reported_by: "",
  assigned_to: "",
  description: "",
  downtime_hours: "",
  resolution_notes: "",
};

function CreateReportPage({ onReportCreated }) {
  const [formData, setFormData] = useState(initialFormState);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const redirectTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  function updateField(fieldName, value) {
    setFormData((currentValue) => ({
      ...currentValue,
      [fieldName]: value,
    }));
  }

  function clearForm() {
    setFormData(initialFormState);
    setValidationErrors([]);
    setSubmitError("");
    setSuccessMessage("");
  }

  function validateForm() {
    const errors = [];

    if (!formData.title.trim()) {
      errors.push("Title is required");
    }

    if (!formData.asset_name.trim()) {
      errors.push("Asset Name is required");
    }

    if (!formData.location.trim()) {
      errors.push("Location is required");
    }

    if (!formData.reported_by.trim()) {
      errors.push("Reported By is required");
    }

    if (!formData.description.trim()) {
      errors.push("Description is required");
    }

    if (formData.downtime_hours.trim()) {
      const downtimeHours = Number(formData.downtime_hours);

      if (Number.isNaN(downtimeHours) || downtimeHours < 0) {
        errors.push("Downtime Hours must be a number greater than or equal to 0");
      }
    }

    return errors;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const errors = validateForm();
    setValidationErrors(errors);
    setSubmitError("");
    setSuccessMessage("");

    if (errors.length > 0) {
      return;
    }

    const requestBody = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      asset_name: formData.asset_name.trim(),
      location: formData.location.trim(),
      priority: formData.priority,
      reported_by: formData.reported_by.trim(),
    };

    if (formData.assigned_to.trim()) {
      requestBody.assigned_to = formData.assigned_to.trim();
    }

    if (formData.downtime_hours.trim()) {
      requestBody.downtime_hours = Number(formData.downtime_hours);
    }

    if (formData.resolution_notes.trim()) {
      requestBody.resolution_notes = formData.resolution_notes.trim();
    }

    try {
      setIsSubmitting(true);

      const response = await apiFetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (Array.isArray(responseData.details) && responseData.details.length > 0) {
          setValidationErrors(responseData.details);
          return;
        }

        throw new Error(responseData.error || "Failed to create report");
      }

      setValidationErrors([]);
      setSubmitError("");
      setSuccessMessage("Report created successfully. Returning to the Reports List...");
      setFormData(initialFormState);

      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }

      redirectTimeoutRef.current = setTimeout(() => {
        redirectTimeoutRef.current = null;
        onReportCreated();
      }, 800);
    } catch (error) {
      setSubmitError(error.message || "Failed to create report");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-stack">
      <div className="content-card">
        <div className="card-heading">
          <p className="section-label">Create Report</p>
          <h3>Log a new maintenance issue</h3>
          <p className="muted-text">Create a maintenance report and send it to the backend API.</p>
        </div>

        {validationErrors.length > 0 && (
          <div className="state-box error-box">
            <p className="state-title">Please fix the following fields</p>
            <ul className="feedback-list">
              {validationErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {submitError && (
          <div className="state-box error-box">
            <p className="state-title">Could not create report</p>
            <p className="muted-text">{submitError}</p>
          </div>
        )}

        {successMessage && (
          <div className="state-box success-box">
            <p className="state-title">Success</p>
            <p className="muted-text">{successMessage}</p>
          </div>
        )}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Title</span>
            <input
              className="text-input"
              type="text"
              placeholder="Enter report title"
              value={formData.title}
              onChange={(event) => updateField("title", event.target.value)}
              disabled={isSubmitting}
            />
          </label>

          <label className="form-field">
            <span>Asset Name</span>
            <input
              className="text-input"
              type="text"
              placeholder="Enter asset name"
              value={formData.asset_name}
              onChange={(event) => updateField("asset_name", event.target.value)}
              disabled={isSubmitting}
            />
          </label>

          <label className="form-field">
            <span>Location</span>
            <input
              className="text-input"
              type="text"
              placeholder="Enter location"
              value={formData.location}
              onChange={(event) => updateField("location", event.target.value)}
              disabled={isSubmitting}
            />
          </label>

          <label className="form-field">
            <span>Priority</span>
            <select
              className="text-input"
              value={formData.priority}
              onChange={(event) => updateField("priority", event.target.value)}
              disabled={isSubmitting}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </label>

          <label className="form-field">
            <span>Reported By</span>
            <input
              className="text-input"
              type="text"
              placeholder="Enter reporter name"
              value={formData.reported_by}
              onChange={(event) => updateField("reported_by", event.target.value)}
              disabled={isSubmitting}
            />
          </label>

          <label className="form-field">
            <span>Assigned To</span>
            <input
              className="text-input"
              type="text"
              placeholder="Optional technician name"
              value={formData.assigned_to}
              onChange={(event) => updateField("assigned_to", event.target.value)}
              disabled={isSubmitting}
            />
          </label>

          <label className="form-field">
            <span>Downtime Hours</span>
            <input
              className="text-input"
              type="number"
              min="0"
              step="0.5"
              placeholder="Optional downtime hours"
              value={formData.downtime_hours}
              onChange={(event) => updateField("downtime_hours", event.target.value)}
              disabled={isSubmitting}
            />
          </label>

          <label className="form-field full-width">
            <span>Description</span>
            <textarea
              className="text-input text-area"
              rows="5"
              placeholder="Describe the issue"
              value={formData.description}
              onChange={(event) => updateField("description", event.target.value)}
              disabled={isSubmitting}
            />
          </label>

          <label className="form-field full-width">
            <span>Resolution Notes</span>
            <textarea
              className="text-input text-area"
              rows="4"
              placeholder="Optional initial notes"
              value={formData.resolution_notes}
              onChange={(event) => updateField("resolution_notes", event.target.value)}
              disabled={isSubmitting}
            />
          </label>

          <div className="form-actions full-width">
            <button type="button" className="secondary-button" onClick={clearForm} disabled={isSubmitting}>
              Clear Form
            </button>
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? "Creating Report..." : "Create Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateReportPage;
