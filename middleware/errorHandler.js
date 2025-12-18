const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Sequelize validation error
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      status: "error",
      message: "Validation error",
      errors: err.errors.map((e) => e.message),
    });
  }

  // Sequelize unique constraint error
  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(400).json({
      status: "error",
      message: "Data sudah ada",
      errors: err.errors.map((e) => e.message),
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message || "Internal server error",
  });
};

module.exports = errorHandler;
