const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { ownerOnly } = require("../middleware/roleMiddleware");
const {
    getCollaborators,
    addCollaborator,
    deleteCollaborator,
    updateCollaborator,
} = require("../controllers/collaboratorController");

// Semua route memerlukan auth dan hanya owner
router.get("/", auth, ownerOnly, getCollaborators);
router.post("/", auth, ownerOnly, addCollaborator);
router.put("/:id", auth, ownerOnly, updateCollaborator);
router.delete("/:id", auth, ownerOnly, deleteCollaborator);

module.exports = router;
