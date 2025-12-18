const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TransactionItem = sequelize.define(
  "TransactionItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    transactionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "transactions",
        key: "id",
      },
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "transaction_items",
    timestamps: true,
  }
);

module.exports = TransactionItem;
