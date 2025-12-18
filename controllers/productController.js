const { Product } = require("../models");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

// Get all products
exports.getAllProducts = async (req, res, next) => {
  try {
    const { search, category, lowStock } = req.query;

    let where = {};

    // Filter search
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    // Filter category
    if (category) {
      where.category = category;
    }

    // Filter low stock
    if (lowStock === "true") {
      where[Op.and] = [
        { stock: { [Op.lte]: sequelize.col("minStock") } },
        { stock: { [Op.gt]: 0 } },
      ];
    }

    const products = await Product.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      status: "success",
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// Get product by ID
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Produk tidak ditemukan",
      });
    }

    res.json({
      status: "success",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// Create product
exports.createProduct = async (req, res, next) => {
  try {
    const { name, category, price, stock, minStock, imageUri } = req.body;

    // Validasi input
    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Name, price, dan stock harus diisi",
      });
    }

    const product = await Product.create({
      name,
      category: category || "",
      price,
      stock,
      minStock: minStock || 0,
      imageUri,
    });

    res.status(201).json({
      status: "success",
      message: "Produk berhasil ditambahkan",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// Update product
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock, minStock, imageUri } = req.body;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Produk tidak ditemukan",
      });
    }

    await product.update({
      name: name !== undefined ? name : product.name,
      category: category !== undefined ? category : product.category,
      price: price !== undefined ? price : product.price,
      stock: stock !== undefined ? stock : product.stock,
      minStock: minStock !== undefined ? minStock : product.minStock,
      imageUri: imageUri !== undefined ? imageUri : product.imageUri,
    });

    res.json({
      status: "success",
      message: "Produk berhasil diupdate",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// Delete product
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Produk tidak ditemukan",
      });
    }

    await product.destroy();

    res.json({
      status: "success",
      message: "Produk berhasil dihapus",
    });
  } catch (error) {
    next(error);
  }
};

// Get low stock products
exports.getLowStockProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      where: {
        [Op.and]: [
          sequelize.where(
            sequelize.col("stock"),
            "<=",
            sequelize.col("minStock")
          ),
          { stock: { [Op.gt]: 0 } },
        ],
      },
      order: [["stock", "ASC"]],
    });

    res.json({
      status: "success",
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// Update stock
exports.updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Stock harus diisi",
      });
    }

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Produk tidak ditemukan",
      });
    }

    await product.update({ stock });

    res.json({
      status: "success",
      message: "Stock berhasil diupdate",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};
