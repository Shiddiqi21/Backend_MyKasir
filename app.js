require("dotenv").config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

// Import database
const sequelize = require("./config/database");
const models = require("./models");

// Import routes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const authRouter = require("./routes/auth");
const productsRouter = require("./routes/products");
const customersRouter = require("./routes/customers");
const transactionsRouter = require("./routes/transactions");
const reportsRouter = require("./routes/reports");

// Import middleware
const errorHandler = require("./middleware/errorHandler");

var app = express();

// Enable CORS
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/reports', reportsRouter);

// Legacy routes
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Database connection and sync
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected successfully");
    // Sync models (create tables if not exist)
    return sequelize.sync({ alter: false }); // Set to true for development if you want auto-update schema
  })
  .then(() => {
    console.log("✅ Database models synced");
  })
  .catch((err) => {
    console.error("❌ Unable to connect to database:", err);
  });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler middleware (must be last)
app.use(errorHandler);

module.exports = app;
