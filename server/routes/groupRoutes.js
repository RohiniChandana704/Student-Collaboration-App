const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const {
  createGroup,
  getGroups,
  getGroupById,
  joinGroup,
  leaveGroup,
  deleteGroup,
} = require("../controllers/groupController");

// Public
router.get("/", getGroups);
router.get("/:id", getGroupById);

// Protected
router.post("/", protect, createGroup);
router.put("/:id/join", protect, joinGroup);
router.put("/:id/leave", protect, leaveGroup);
router.delete("/:id", protect, deleteGroup);

module.exports = router;