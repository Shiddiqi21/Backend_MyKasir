const { Transaction, TransactionItem, Customer, Product, User } = require("../models");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

// Get all transactions (filtered by user's store)
exports.getAllTransactions = async (req, res, next) => {
  try {
    const { storeId } = req.user;
    const { startDate, endDate, customerId } = req.query;

    let where = { storeId }; // Filter by store

    // Filter by date range
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    // Filter by customer
    if (customerId) {
      where.customerId = customerId;
    }

    const transactions = await Transaction.findAll({
      where,
      include: [
        {
          model: Customer,
          as: "customer",
          attributes: ["id", "name"],
        },
        {
          model: TransactionItem,
          as: "items",
          attributes: ["id", "productName", "unitPrice", "quantity"],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Map transactions to include cashierName from user if not set
    const transactionsWithCashier = transactions.map(tx => {
      const txData = tx.toJSON();
      // Use cashierName if available, otherwise get from user relation
      if (!txData.cashierName && txData.user) {
        txData.cashierName = txData.user.name;
      }
      return txData;
    });

    res.json({
      status: "success",
      data: transactionsWithCashier,
    });
  } catch (error) {
    next(error);
  }
};

// Get transaction by ID (filtered by user's store)
exports.getTransactionById = async (req, res, next) => {
  try {
    const { storeId } = req.user;
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      where: { id, storeId },
      include: [
        {
          model: Customer,
          as: "customer",
          attributes: ["id", "name"],
        },
        {
          model: TransactionItem,
          as: "items",
          attributes: ["id", "productName", "unitPrice", "quantity"],
        },
      ],
    });

    if (!transaction) {
      return res.status(404).json({
        status: "error",
        message: "Transaksi tidak ditemukan",
      });
    }

    res.json({
      status: "success",
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// Create transaction (assign to user's store)
exports.createTransaction = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { storeId } = req.user;
    const { customerId, items } = req.body;
    const userId = req.user?.id;

    // Validasi input
    if (!customerId || !items || items.length === 0) {
      await t.rollback();
      return res.status(400).json({
        status: "error",
        message: "CustomerId dan items harus diisi",
      });
    }

    // Hitung total
    let total = 0;
    for (const item of items) {
      if (!item.productName || !item.unitPrice || !item.quantity) {
        await t.rollback();
        return res.status(400).json({
          status: "error",
          message: "Setiap item harus memiliki productName, unitPrice, dan quantity",
        });
      }
      total += item.unitPrice * item.quantity;
    }

    // Get cashier name from user
    const user = await User.findByPk(userId);
    const cashierName = user ? user.name : "Unknown";

    // Buat transaksi
    const transaction = await Transaction.create(
      {
        customerId,
        total,
        userId,
        cashierName,
        storeId, // Assign to user's store
      },
      { transaction: t }
    );

    // Buat transaction items
    const transactionItems = await TransactionItem.bulkCreate(
      items.map((item) => ({
        transactionId: transaction.id,
        productName: item.productName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
      })),
      { transaction: t }
    );

    // Update stock produk (jika ada) - filter by storeId
    for (const item of items) {
      const product = await Product.findOne({
        where: { name: item.productName, storeId },
        transaction: t,
      });

      if (product) {
        const newStock = product.stock - item.quantity;
        if (newStock < 0) {
          await t.rollback();
          return res.status(400).json({
            status: "error",
            message: `Stock ${item.productName} tidak mencukupi`,
          });
        }
        await product.update({ stock: newStock }, { transaction: t });
      }
    }

    await t.commit();

    // Fetch full transaction with relations
    const fullTransaction = await Transaction.findByPk(transaction.id, {
      include: [
        {
          model: Customer,
          as: "customer",
          attributes: ["id", "name"],
        },
        {
          model: TransactionItem,
          as: "items",
          attributes: ["id", "productName", "unitPrice", "quantity"],
        },
      ],
    });

    res.status(201).json({
      status: "success",
      message: "Transaksi berhasil dibuat",
      data: fullTransaction,
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// Delete transaction (only if belongs to user's store)
exports.deleteTransaction = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { storeId } = req.user;
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      where: { id, storeId },
      include: [
        {
          model: TransactionItem,
          as: "items",
        },
      ],
    });

    if (!transaction) {
      await t.rollback();
      return res.status(404).json({
        status: "error",
        message: "Transaksi tidak ditemukan",
      });
    }

    // Restore stock (optional, bisa di-comment jika tidak perlu) - filter by storeId
    for (const item of transaction.items) {
      const product = await Product.findOne({
        where: { name: item.productName, storeId },
        transaction: t,
      });

      if (product) {
        await product.update(
          { stock: product.stock + item.quantity },
          { transaction: t }
        );
      }
    }

    // Delete transaction items
    await TransactionItem.destroy({
      where: { transactionId: id },
      transaction: t,
    });

    // Delete transaction
    await transaction.destroy({ transaction: t });

    await t.commit();

    res.json({
      status: "success",
      message: "Transaksi berhasil dihapus",
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

