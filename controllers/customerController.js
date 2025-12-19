const { Customer } = require("../models");

// Get all customers (filtered by user's store)
exports.getAllCustomers = async (req, res, next) => {
  try {
    const { storeId } = req.user;

    const customers = await Customer.findAll({
      where: { storeId },
      order: [["createdAt", "DESC"]],
    });

    res.json({
      status: "success",
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};

// Get customer by ID (filtered by user's store)
exports.getCustomerById = async (req, res, next) => {
  try {
    const { storeId } = req.user;
    const { id } = req.params;

    const customer = await Customer.findOne({
      where: { id, storeId }
    });

    if (!customer) {
      return res.status(404).json({
        status: "error",
        message: "Customer tidak ditemukan",
      });
    }

    res.json({
      status: "success",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

// Create customer (assign to user's store)
exports.createCustomer = async (req, res, next) => {
  try {
    const { storeId } = req.user;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "Name harus diisi",
      });
    }

    const customer = await Customer.create({
      name,
      storeId
    });

    res.status(201).json({
      status: "success",
      message: "Customer berhasil ditambahkan",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

// Update customer (only if belongs to user's store)
exports.updateCustomer = async (req, res, next) => {
  try {
    const { storeId } = req.user;
    const { id } = req.params;
    const { name } = req.body;

    const customer = await Customer.findOne({
      where: { id, storeId }
    });

    if (!customer) {
      return res.status(404).json({
        status: "error",
        message: "Customer tidak ditemukan",
      });
    }

    await customer.update({ name });

    res.json({
      status: "success",
      message: "Customer berhasil diupdate",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

// Delete customer (only if belongs to user's store)
exports.deleteCustomer = async (req, res, next) => {
  try {
    const { storeId } = req.user;
    const { id } = req.params;

    const customer = await Customer.findOne({
      where: { id, storeId }
    });

    if (!customer) {
      return res.status(404).json({
        status: "error",
        message: "Customer tidak ditemukan",
      });
    }

    await customer.destroy();

    res.json({
      status: "success",
      message: "Customer berhasil dihapus",
    });
  } catch (error) {
    next(error);
  }
};

