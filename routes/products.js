const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authMiddleware = require("../middleware/auth");

// All routes require authentication
router.use(authMiddleware);

// GET /api/products - Get all products
router.get("/", productController.getAllProducts);

// GET /api/products/low-stock - Get low stock products
router.get("/low-stock", productController.getLowStockProducts);

// GET /api/products/:id - Get product by ID
router.get("/:id", productController.getProductById);

// POST /api/products - Create new product
router.post("/", productController.createProduct);

// PUT /api/products/:id - Update product
router.put("/:id", productController.updateProduct);

// PATCH /api/products/:id/stock - Update stock only
router.patch("/:id/stock", productController.updateStock);

// DELETE /api/products/:id - Delete product
router.delete("/:id", productController.deleteProduct);

module.exports = router;
