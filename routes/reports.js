const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const authMiddleware = require("../middleware/auth");
const { reportAccess } = require("../middleware/roleMiddleware");

// All routes require authentication and owner role
router.use(authMiddleware);
router.use(reportAccess); // Hanya owner yang bisa akses laporan

// GET /api/reports/sales - Get sales report summary
router.get("/sales", reportController.getSalesReport);

// GET /api/reports/detailed - Get detailed report
router.get("/detailed", reportController.getDetailedReport);

module.exports = router;

