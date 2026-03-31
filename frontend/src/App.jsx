import React, { useState } from "react";
import AppLayout from "./components/AppLayout";
import CreateReportPage from "./pages/CreateReportPage";
import DashboardPage from "./pages/DashboardPage";
import ReportDetailsView from "./pages/ReportDetailsView";
import ReportsListPage from "./pages/ReportsListPage";

const navigationItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "reports", label: "Reports List" },
  { id: "create", label: "Create Report" },
  { id: "details", label: "Report Details" },
];

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [reportsListVersion, setReportsListVersion] = useState(0);
  const [dashboardVersion, setDashboardVersion] = useState(0);

  function openReportDetails(reportId) {
    setSelectedReportId(reportId);
    setActivePage("details");
  }

  function handleReportCreated() {
    setReportsListVersion((currentValue) => currentValue + 1);
    setDashboardVersion((currentValue) => currentValue + 1);
    setActivePage("reports");
  }

  function handleReportStatusUpdated() {
    setReportsListVersion((currentValue) => currentValue + 1);
    setDashboardVersion((currentValue) => currentValue + 1);
  }

  function handleReportFieldsUpdated() {
    setReportsListVersion((currentValue) => currentValue + 1);
    setDashboardVersion((currentValue) => currentValue + 1);
  }

  return (
    <AppLayout
      activePage={activePage}
      navigationItems={navigationItems}
      onNavigate={setActivePage}
    >
      {activePage === "dashboard" && (
        <DashboardPage
          onOpenReports={() => setActivePage("reports")}
          reloadKey={dashboardVersion}
        />
      )}
      {activePage === "reports" && (
        <ReportsListPage
          onCreateReport={() => setActivePage("create")}
          onOpenReportDetails={openReportDetails}
          reloadKey={reportsListVersion}
        />
      )}
      {activePage === "create" && <CreateReportPage onReportCreated={handleReportCreated} />}
      {activePage === "details" && (
        <ReportDetailsView
          reportId={selectedReportId}
          onBackToReports={() => setActivePage("reports")}
          onReportFieldsUpdated={handleReportFieldsUpdated}
          onReportStatusUpdated={handleReportStatusUpdated}
        />
      )}
    </AppLayout>
  );
}

export default App;
