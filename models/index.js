const User = require("./User");
const Product = require("./Product");
const Customer = require("./Customer");
const Transaction = require("./Transaction");
const TransactionItem = require("./TransactionItem");
const Store = require("./Store");

// Store relationships (multi-tenant)
Store.hasMany(User, { foreignKey: "storeId", as: "users" });
Store.hasMany(Product, { foreignKey: "storeId", as: "products" });
Store.hasMany(Customer, { foreignKey: "storeId", as: "customers" });
Store.hasMany(Transaction, { foreignKey: "storeId", as: "transactions" });

User.belongsTo(Store, { foreignKey: "storeId", as: "store" });
Product.belongsTo(Store, { foreignKey: "storeId", as: "store" });
Customer.belongsTo(Store, { foreignKey: "storeId", as: "store" });
Transaction.belongsTo(Store, { foreignKey: "storeId", as: "store" });

// Transaction relationships
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
  Store,
};

