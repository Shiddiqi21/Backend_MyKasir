const bcrypt = require("bcryptjs");
const { User, Store } = require("../models");

// Get all collaborators (cashiers) for owner's store
exports.getCollaborators = async (req, res, next) => {
    try {
        const { storeId } = req.user;

        const collaborators = await User.findAll({
            where: {
                storeId,
                role: "cashier"
            },
            attributes: ["id", "email", "name", "role", "createdAt"],
            order: [["createdAt", "DESC"]],
        });

        res.json({
            status: "success",
            data: collaborators,
        });
    } catch (error) {
        next(error);
    }
};

// Add new collaborator (cashier)
exports.addCollaborator = async (req, res, next) => {
    try {
        const { storeId } = req.user;
        const { email, password, name } = req.body;

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
                message: "Email sudah terdaftar. Silakan gunakan email lain.",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Buat user baru sebagai Cashier dengan email yang sudah dinormalisasi
        const cashier = await User.create({
            email: normalizedEmail,
            password: hashedPassword,
            name,
            role: "cashier",
            storeId: storeId, // Sama dengan store owner
        });

        res.status(201).json({
            status: "success",
            message: "Kasir berhasil ditambahkan",
            data: {
                id: cashier.id,
                email: cashier.email,
                name: cashier.name,
                role: cashier.role,
            },
        });
    } catch (error) {
        // Handle unique constraint violation dari database
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                status: "error",
                message: "Email sudah terdaftar. Silakan gunakan email lain.",
            });
        }
        next(error);
    }
};

// Delete collaborator (cashier)
exports.deleteCollaborator = async (req, res, next) => {
    try {
        const { storeId } = req.user;
        const { id } = req.params;

        // Cari cashier
        const cashier = await User.findOne({
            where: {
                id,
                storeId,
                role: "cashier"
            },
        });

        if (!cashier) {
            return res.status(404).json({
                status: "error",
                message: "Kasir tidak ditemukan",
            });
        }

        await cashier.destroy();

        res.json({
            status: "success",
            message: "Kasir berhasil dihapus",
        });
    } catch (error) {
        next(error);
    }
};

// Update collaborator (cashier)
exports.updateCollaborator = async (req, res, next) => {
    try {
        const { storeId } = req.user;
        const { id } = req.params;
        const { name, password } = req.body;

        // Cari cashier
        const cashier = await User.findOne({
            where: {
                id,
                storeId,
                role: "cashier"
            },
        });

        if (!cashier) {
            return res.status(404).json({
                status: "error",
                message: "Kasir tidak ditemukan",
            });
        }

        // Update fields
        if (name) cashier.name = name;
        if (password) {
            // Validasi panjang password minimum 8 karakter
            if (password.length < 8) {
                return res.status(400).json({
                    status: "error",
                    message: "Password minimal 8 karakter",
                });
            }
            cashier.password = await bcrypt.hash(password, 10);
        }

        await cashier.save();

        res.json({
            status: "success",
            message: "Kasir berhasil diupdate",
            data: {
                id: cashier.id,
                email: cashier.email,
                name: cashier.name,
                role: cashier.role,
            },
        });
    } catch (error) {
        next(error);
    }
};
