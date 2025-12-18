const User = require("./User");
const Product = require("./Product");
const Customer = require("./Customer");
const Transaction = require("./Transaction");
const TransactionItem = require("./TransactionItem");

// Define relationships
Transaction.belongsTo(Customer, { foreignKey: "customerId", as: "customer" });
Transaction.belongsTo(User, { foreignKey: "userId", as: "user" });
Transaction.hasMany(TransactionItem, {
  foreignKey: "transactionId",
  as: "items",
});
TransactionItem.belongsTo(Transaction, {
  foreignKey: "transactionId",
  as: "transaction",
});

module.exports = {
  User,
  Product,
  Customer,
  Transaction,
  TransactionItem,
};
