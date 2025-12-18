const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const authMiddleware = require("../middleware/auth");

// All routes require authentication
router.use(authMiddleware);

// GET /api/transactions - Get all transactions
router.get("/", transactionController.getAllTransactions);

// GET /api/transactions/:id - Get transaction by ID
router.get("/:id", transactionController.getTransactionById);

// POST /api/transactions - Create new transaction
router.post("/", transactionController.createTransaction);

// DELETE /api/transactions/:id - Delete transaction
router.delete("/:id", transactionController.deleteTransaction);

module.exports = router;
