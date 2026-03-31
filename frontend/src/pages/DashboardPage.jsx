import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";

function DashboardPage({ onOpenReports, reloadKey }) {
  const [summaryData, setSummaryData] = useState({
    total_reports: 0,
    open_reports: 0,
    in_progress_reports: 0,
    critical_reports: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadDashboardSummary() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await apiFetch("/api/dashboard/summary");
        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.error || "Failed to load dashboard summary");
        }

        setSummaryData({
          total_reports: Number(responseData.data?.total_reports || 0),
          open_reports: Number(responseData.data?.open_reports || 0),
          in_progress_reports: Number(responseData.data?.in_progress_reports || 0),
          critical_reports: Number(responseData.data?.critical_reports || 0),
        });
      } catch (error) {
        setErrorMessage(error.message || "Failed to load dashboard summary");
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardSummary();
  }, [reloadKey]);

  const summaryCards = [
    { label: "Total Reports", value: summaryData.total_reports },
    { label: "Open Reports", value: summaryData.open_reports },
    { label: "In Progress", value: summaryData.in_progress_reports },
    { label: "Critical Priority", value: summaryData.critical_reports },
  ];

  return (
    <div className="page-stack">
      <div className="hero-card">
        <div>
          <p className="section-label">Overview</p>
          <h3>Track maintenance work in one place</h3>
          <p className="muted-text">
            This placeholder dashboard shows where report totals and quick actions will live once the
            backend is connected.
          </p>
        </div>
        <button type="button" className="primary-button" onClick={onOpenReports}>
          View Reports
        </button>
      </div>

      {isLoading && (
        <div className="content-card">
          <div className="state-box">
            <p className="state-title">Loading dashboard summary...</p>
            <p className="muted-text">Please wait while the summary data is being loaded.</p>
          </div>
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="content-card">
          <div className="state-box error-box">
            <p className="state-title">Could not load dashboard summary</p>
            <p className="muted-text">{errorMessage}</p>
          </div>
        </div>
      )}

      {!isLoading && !errorMessage && (
        <div className="card-grid">
          {summaryCards.map((card) => (
            <article key={card.label} className="summary-card">
              <p className="summary-label">{card.label}</p>
              <p className="summary-value">{card.value}</p>
            </article>
          ))}
        </div>
      )}

      <div className="content-card">
        <div className="card-heading">
          <h3>Dashboard Notes</h3>
          <p className="muted-text">This section explains what the summary cards show.</p>
        </div>

        <ul className="activity-list">
          <li>Total Reports shows how many maintenance reports exist in the system.</li>
          <li>Open Reports shows work that has not started yet.</li>
          <li>In Progress shows reports currently being handled.</li>
          <li>Critical Priority shows urgent reports that need close attention.</li>
        </ul>
      </div>
    </div>
  );
}

export default DashboardPage;
