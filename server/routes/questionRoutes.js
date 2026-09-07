const express = require("express");
const router = express.Router();
const optionalAuth = require("../middleware/optionalAuth");

const protect = require("../middleware/authMiddleware");
const {
  createQuestion,
  getQuestions,
  getQuestionById,
  toggleVote,
  addAnswer,
  deleteQuestion,
} = require("../controllers/questionController");

router.get("/", getQuestions);
router.get("/:id", optionalAuth, getQuestionById);

router.post("/", protect, createQuestion);
router.put("/:id/vote", protect, toggleVote);
router.post("/:id/answers", protect, addAnswer);
router.delete("/:id", protect, deleteQuestion);

module.exports = router;