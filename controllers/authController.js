const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const JWT_SECRET = process.env.JWT_SECRET || "mykasir_secret_key_2024";

// Register user baru
exports.register = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;

    // Validasi input
    if (!email || !password || !name) {
      return res.status(400).json({
        status: "error",
        message: "Email, password, dan name harus diisi",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: role || "kasir",
    });

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      status: "success",
      message: "User berhasil didaftarkan",
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email dan password harus diisi",
      });
    }

    // Cari user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Email atau password salah",
      });
    }

    // Verifikasi password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        status: "error",
        message: "Email atau password salah",
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      status: "success",
      email: user.email,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Get profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "email", "name", "role"],
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User tidak ditemukan",
      });
    }

    res.json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
