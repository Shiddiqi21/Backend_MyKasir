const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "mykasir_secret_key_2024";

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Token tidak ditemukan",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "Token tidak valid atau sudah kadaluarsa",
    });
  }
};

module.exports = authMiddleware;
