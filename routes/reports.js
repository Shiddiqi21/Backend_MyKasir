const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const authMiddleware = require("../middleware/auth");

// All routes require authentication
router.use(authMiddleware);

// GET /api/reports/sales - Get sales report summary
router.get("/sales", reportController.getSalesReport);

// GET /api/reports/detailed - Get detailed report
router.get("/detailed", reportController.getDetailedReport);

module.exports = router;
