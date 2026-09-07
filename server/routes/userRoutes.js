const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const {
  getMyProfile,
  updateMyProfile,
  getUserById,
  searchUsers,
} = require("../controllers/userController");

// Protected - must come before "/:id" so "me" isn't treated as an id
router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);

// Public - must come before "/:id" so "search" behavior applies to the list route, not a single id lookup
router.get("/", searchUsers);

// Public
router.get("/:id", getUserById);

module.exports = router;