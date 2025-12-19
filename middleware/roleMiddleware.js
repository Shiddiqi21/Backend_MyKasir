// Middleware untuk mengecek apakah user adalah owner
const ownerOnly = (req, res, next) => {
    if (req.user.role !== "owner") {
        return res.status(403).json({
            status: "error",
            message: "Akses hanya untuk pemilik toko",
        });
    }
    next();
};

// Middleware untuk mengecek akses laporan (hanya owner)
const reportAccess = (req, res, next) => {
    if (req.user.role !== "owner") {
        return res.status(403).json({
            status: "error",
            message: "Kasir tidak memiliki akses ke laporan",
        });
    }
    next();
};

module.exports = {
    ownerOnly,
    reportAccess,
};
