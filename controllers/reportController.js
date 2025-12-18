const { Transaction, TransactionItem } = require("../models");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

// Get sales report (summary)
exports.getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate, period } = req.query;

    let where = {};

    // Default: hari ini
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else if (period === "today") {
      where.createdAt = {
        [Op.between]: [today, tomorrow],
      };
    } else if (period === "week") {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      where.createdAt = {
        [Op.between]: [weekAgo, tomorrow],
      };
    } else if (period === "month") {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      where.createdAt = {
        [Op.between]: [monthAgo, tomorrow],
      };
    } else {
      // Default hari ini
      where.createdAt = {
        [Op.between]: [today, tomorrow],
      };
    }

    // Total penjualan
    const totalSales = await Transaction.sum("total", { where });

    // Jumlah transaksi
    const totalTransactions = await Transaction.count({ where });

    // Produk terlaris
    const topProducts = await TransactionItem.findAll({
      attributes: [
        "productName",
        [sequelize.fn("SUM", sequelize.col("quantity")), "totalQuantity"],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal("unitPrice * quantity")
          ),
          "totalRevenue",
        ],
      ],
      include: [
        {
          model: Transaction,
          as: "transaction",
          attributes: [],
          where,
        },
      ],
      group: ["productName"],
      order: [[sequelize.literal("totalQuantity"), "DESC"]],
      limit: 10,
    });

    // Transaksi per hari (untuk chart)
    const dailySales = await Transaction.findAll({
      attributes: [
        [sequelize.fn("DATE", sequelize.col("createdAt")), "date"],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("SUM", sequelize.col("total")), "total"],
      ],
      where,
      group: [sequelize.fn("DATE", sequelize.col("createdAt"))],
      order: [[sequelize.fn("DATE", sequelize.col("createdAt")), "ASC"]],
    });

    res.json({
      status: "success",
      data: {
        summary: {
          totalSales: totalSales || 0,
          totalTransactions: totalTransactions || 0,
          averageTransaction:
            totalTransactions > 0 ? totalSales / totalTransactions : 0,
        },
        topProducts,
        dailySales,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get detailed report
exports.getDetailedReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let where = {};

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const transactions = await Transaction.findAll({
      where,
      include: [
        {
          model: TransactionItem,
          as: "items",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      status: "success",
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};
