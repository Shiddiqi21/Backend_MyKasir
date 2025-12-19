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

        // Cek apakah email sudah terdaftar
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                status: "error",
                message: "Email sudah terdaftar",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Buat user baru sebagai Cashier
        const cashier = await User.create({
            email,
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
