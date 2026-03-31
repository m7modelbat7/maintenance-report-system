import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";

function ReportsListPage({ onCreateReport, onOpenReportDetails, reloadKey }) {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");

  function resetFilters() {
    setSearchText("");
    setSelectedStatus("");
    setSelectedPriority("");
  }

  const hasActiveFilters =
    searchText.trim() !== "" || selectedStatus !== "" || selectedPriority !== "";
  const isWaitingForSearch = searchText !== debouncedSearchText;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 400);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchText]);

  useEffect(() => {
    async function loadReports() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const queryParams = new URLSearchParams();

        if (debouncedSearchText.trim()) {
          queryParams.set("search", debouncedSearchText.trim());
        }

        if (selectedStatus) {
          queryParams.set("status", selectedStatus);
        }

        if (selectedPriority) {
          queryParams.set("priority", selectedPriority);
        }

        const queryString = queryParams.toString();
        const requestUrl = queryString ? `/api/reports?${queryString}` : "/api/reports";
        const response = await apiFetch(requestUrl);
        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.error || "Failed to load reports");
        }

        setReports(Array.isArray(responseData.data) ? responseData.data : []);
      } catch (error) {
        setErrorMessage(error.message || "Failed to load reports");
      } finally {
        setIsLoading(false);
      }
    }

    loadReports();
  }, [reloadKey, debouncedSearchText, selectedStatus, selectedPriority]);

  return (
    <div className="page-stack">
      <div className="toolbar-card">
        <div className="toolbar-row">
          <div>
            <p className="section-label">Reports</p>
            <h3>Search and review maintenance reports</h3>
          </div>
          <button type="button" className="primary-button" onClick={onCreateReport}>
            New Report
          </button>
        </div>

        <div className="filter-grid">
          <input
            className="text-input"
            type="text"
            placeholder="Search reports"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
          <select
            className="text-input"
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Closed">Closed</option>
          </select>
          <select
            className="text-input"
            value={selectedPriority}
            onChange={(event) => setSelectedPriority(event.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <div className="filter-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={resetFilters}
            disabled={!hasActiveFilters}
          >
            Reset Filters
          </button>
        </div>

        {isWaitingForSearch && (
          <p className="filter-hint">Updating results...</p>
        )}
      </div>

      <div className="content-card">
        <div className="card-heading">
          <h3>Report List</h3>
          <p className="muted-text">Reports are loaded from the backend API.</p>
        </div>

        {isLoading && (
          <div className="state-box">
            <p className="state-title">Loading reports...</p>
            <p className="muted-text">Please wait while the report list is being loaded.</p>
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="state-box">
            <p className="state-title">Could not load reports</p>
            <p className="muted-text">{errorMessage}</p>
          </div>
        )}

        {!isLoading && !errorMessage && reports.length === 0 && (
          <div className="state-box">
            <p className="state-title">No reports found</p>
            <p className="muted-text">Create the first maintenance report to see it here.</p>
          </div>
        )}

        {!isLoading && !errorMessage && reports.length > 0 && (
          <div className="table-wrapper">
            <table className="report-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Asset</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    className="clickable-row"
                    onClick={() => onOpenReportDetails(report.id)}
                  >
                    <td>#{report.id}</td>
                    <td>
                      <button
                        type="button"
                        className="table-link-button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onOpenReportDetails(report.id);
                        }}
                      >
                        {report.title}
                      </button>
                    </td>
                    <td>{report.asset_name}</td>
                    <td>{report.priority}</td>
                    <td>{report.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportsListPage;
