import React from "react";

const historyItems = [
  {
    title: "Report created",
    meta: "Ahmed • 31 Mar 2026, 11:00",
    text: "The compressor stopped during the morning shift.",
  },
  {
    title: "Status changed to In Progress",
    meta: "Sara • 31 Mar 2026, 11:30",
    text: "Technician started inspection.",
  },
];

function ReportDetailsPage({ onBackToReports }) {
  return (
    <div className="page-stack">
      <div className="toolbar-card">
        <div className="toolbar-row">
          <div>
            <p className="section-label">Report Details</p>
            <h3>Air compressor failure</h3>
            <p className="muted-text">Static preview of the report details screen.</p>
          </div>
          <button type="button" className="secondary-button" onClick={onBackToReports}>
            Back to Reports
          </button>
        </div>
      </div>

      <div className="details-grid">
        <article className="content-card">
          <div className="card-heading">
            <h3>Report Summary</h3>
          </div>

          <dl className="details-list">
            <div>
              <dt>Status</dt>
              <dd>In Progress</dd>
            </div>
            <div>
              <dt>Priority</dt>
              <dd>High</dd>
            </div>
            <div>
              <dt>Asset</dt>
              <dd>Compressor A</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>Plant 1</dd>
            </div>
            <div>
              <dt>Reported By</dt>
              <dd>Ahmed</dd>
            </div>
            <div>
              <dt>Assigned To</dt>
              <dd>Sara</dd>
            </div>
          </dl>
        </article>

        <article className="content-card">
          <div className="card-heading">
            <h3>Work History</h3>
          </div>

          <ul className="timeline-list">
            {historyItems.map((item) => (
              <li key={item.title} className="timeline-item">
                <h4>{item.title}</h4>
                <p className="timeline-meta">{item.meta}</p>
                <p className="muted-text">{item.text}</p>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  );
}

export default ReportDetailsPage;
