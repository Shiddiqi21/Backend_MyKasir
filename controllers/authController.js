const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Store } = require("../models");

const JWT_SECRET = process.env.JWT_SECRET || "mykasir_secret_key_2024";

// Register user baru (otomatis jadi Owner dengan Store baru)
exports.register = async (req, res, next) => {
  try {
    const { email, password, name, storeName } = req.body;

    // Validasi input
    if (!email || !password || !name) {
      return res.status(400).json({
        status: "error",
        message: "Email, password, dan name harus diisi",
      });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Email sudah terdaftar",
      });
    }

    // Buat Store baru untuk Owner
    const store = await Store.create({
      name: storeName || `Toko ${name}`,
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru sebagai Owner
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: "owner", // Selalu owner saat register
      storeId: store.id,
    });

    // Generate token dengan role dan storeId
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        storeId: user.storeId
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      status: "success",
      message: "User berhasil didaftarkan sebagai Owner",
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        storeId: user.storeId,
        storeName: store.name,
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

    // Cari user dengan include Store
    const user = await User.findOne({
      where: { email },
      include: [{ model: Store, as: "store" }]
    });
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

    // Generate token dengan role dan storeId
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        storeId: user.storeId
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      status: "success",
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        storeId: user.storeId,
        storeName: user.store?.name,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "email", "name", "role", "storeId"],
      include: [{ model: Store, as: "store", attributes: ["id", "name"] }]
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User tidak ditemukan",
      });
    }

    res.json({
      status: "success",
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        storeId: user.storeId,
        storeName: user.store?.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

