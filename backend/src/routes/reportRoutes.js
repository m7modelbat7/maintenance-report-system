const express = require("express");

const {
  createReport,
  getReportById,
  getReportHistory,
  getReports,
  updateReport,
  updateReportStatus,
} = require("../controllers/reportController");

const router = express.Router();

router.get("/", getReports);
router.get("/:id/history", getReportHistory);
router.get("/:id", getReportById);
router.post("/", createReport);
router.put("/:id", updateReport);
router.patch("/:id/status", updateReportStatus);

module.exports = router;
