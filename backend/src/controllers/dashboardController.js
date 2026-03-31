const { get } = require("../db/database");

async function getDashboardSummary(request, response, next) {
  try {
    const summary = await get(
      `
        SELECT
          COUNT(*) AS total_reports,
          SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END) AS open_reports,
          SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress_reports,
          SUM(CASE WHEN priority = 'Critical' THEN 1 ELSE 0 END) AS critical_reports
        FROM reports
      `
    );

    response.status(200).json({
      success: true,
      data: {
        total_reports: Number(summary?.total_reports || 0),
        open_reports: Number(summary?.open_reports || 0),
        in_progress_reports: Number(summary?.in_progress_reports || 0),
        critical_reports: Number(summary?.critical_reports || 0),
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardSummary,
};
