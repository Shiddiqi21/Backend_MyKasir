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

    // Validasi panjang password minimum 8 karakter
    if (password.length < 8) {
      return res.status(400).json({
        status: "error",
        message: "Password minimal 8 karakter",
      });
    }

    // Normalisasi email: lowercase dan trim whitespace
    const normalizedEmail = email.trim().toLowerCase();

    // Cek apakah email sudah terdaftar (case-insensitive)
    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Email sudah terdaftar. Silakan gunakan email lain atau login jika sudah memiliki akun.",
      });
    }

    // Buat Store baru untuk Owner
    const store = await Store.create({
      name: storeName || `Toko ${name}`,
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru sebagai Owner dengan email yang sudah dinormalisasi
    const user = await User.create({
      email: normalizedEmail,
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
    // Handle unique constraint violation dari database
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: "error",
        message: "Email sudah terdaftar. Silakan gunakan email lain atau login jika sudah memiliki akun.",
      });
    }
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

    if (password.length < 8) {
      return res.status(400).json({
        status: "error",
        message: "Password minimal 8 karakter",
      });
    }

    // Normalisasi email: lowercase dan trim whitespace
    const normalizedEmail = email.trim().toLowerCase();

    // Cari user dengan include Store (case-insensitive)
    const user = await User.findOne({
      where: { email: normalizedEmail },
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

// Update profile (Owner only)
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, storeName, oldPassword, newPassword } = req.body;

    // Cari user dengan store
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Store, as: "store" }]
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User tidak ditemukan",
      });
    }

    // Hanya owner yang bisa update profile
    if (user.role !== "owner") {
      return res.status(403).json({
        status: "error",
        message: "Hanya pemilik toko yang dapat mengubah profil",
      });
    }

    // Update nama user jika disediakan
    if (name) {
      user.name = name;
    }

    // Update nama toko jika disediakan
    if (storeName && user.store) {
      user.store.name = storeName;
      await user.store.save();
    }

    // Update password jika disediakan
    if (newPassword) {
      // Validasi password lama harus disertakan
      if (!oldPassword) {
        return res.status(400).json({
          status: "error",
          message: "Password lama harus diisi untuk mengganti password",
        });
      }

      // Verifikasi password lama
      const isValidPassword = await bcrypt.compare(oldPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          status: "error",
          message: "Password lama tidak sesuai",
        });
      }

      // Hash password baru
      user.password = await bcrypt.hash(newPassword, 10);
    }

    // Simpan perubahan user
    await user.save();

    res.json({
      status: "success",
      message: "Profil berhasil diperbarui",
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

