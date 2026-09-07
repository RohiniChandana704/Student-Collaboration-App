const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const Message = require("../models/Message");
const Group = require("../models/Group");

// @desc Get chat history for a group (members only)
// @route GET /api/groups/:groupId/messages
router.get("/:groupId/messages", protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: "Only group members can view messages" });
    }

    const messages = await Message.find({ group: req.params.groupId })
      .populate("sender", "name")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error);
    res.status(500).json({ message: "Failed to fetch messages", error: error.message });
  }
});

module.exports = router;