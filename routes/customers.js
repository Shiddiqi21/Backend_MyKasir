const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const authMiddleware = require("../middleware/auth");

// All routes require authentication
router.use(authMiddleware);

// GET /api/customers - Get all customers
router.get("/", customerController.getAllCustomers);

// GET /api/customers/:id - Get customer by ID
router.get("/:id", customerController.getCustomerById);

// POST /api/customers - Create new customer
router.post("/", customerController.createCustomer);

// PUT /api/customers/:id - Update customer
router.put("/:id", customerController.updateCustomer);

// DELETE /api/customers/:id - Delete customer
router.delete("/:id", customerController.deleteCustomer);

module.exports = router;
