import React from "react";

function AppLayout({ activePage, children, navigationItems, onNavigate }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <p className="brand-label">Internal Tool</p>
          <h1>Maintenance Reports</h1>
          <p className="brand-description">
            A simple workspace for supervisors and technicians.
          </p>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === activePage ? "nav-button active" : "nav-button"}
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div>
            <p className="page-eyebrow">Maintenance Report System</p>
            <h2>{navigationItems.find((item) => item.id === activePage)?.label}</h2>
          </div>
          <div className="status-chip">MVP Frontend Skeleton</div>
        </header>

        <section className="page-section">{children}</section>
      </main>
    </div>
  );
}

export default AppLayout;
