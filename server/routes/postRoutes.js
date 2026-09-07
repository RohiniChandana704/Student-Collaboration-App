const express = require("express");
const router = express.Router();
const optionalAuth = require("../middleware/optionalAuth");
const protect = require("../middleware/authMiddleware");
const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
} = require("../controllers/postController");

// Public
router.get("/", getPosts);
router.get("/:id", optionalAuth, getPostById);

// Protected
router.post("/", protect, createPost);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

router.put("/:id/like", protect, toggleLike);

router.post("/:id/comments", protect, addComment);
router.delete("/:id/comments/:commentId", protect, deleteComment);

module.exports = router;