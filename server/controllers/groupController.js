const Group = require("../models/Group");
const Notification = require("../models/Notification");

// @desc Create a new group
// @route POST /api/groups
const createGroup = async (req, res) => {
  try {
    const { name, description, category, technologies, maxMembers } = req.body;

    if (!name) {
  return res.status(400).json({ message: "Group name is required" });
}

if (name.length > 100) {
  return res.status(400).json({ message: "Group name must be 100 characters or fewer" });
}

if (description && description.length > 1000) {
  return res.status(400).json({ message: "Description must be 1000 characters or fewer" });
}

if (category && category.length > 50) {
  return res.status(400).json({ message: "Category must be 50 characters or fewer" });
}

    const group = await Group.create({
      name,
      description,
      category,
      technologies: Array.isArray(technologies) ? technologies : [],
      maxMembers: maxMembers || null,
      creator: req.user._id,
      members: [req.user._id],
    });

    res.status(201).json(group);
  } catch (error) {
    console.error("CREATE GROUP ERROR:", error);
    res.status(500).json({ message: "Failed to create group", error: error.message });
  }
};

// @desc Get all groups (optionally filter by category or search by name)
// @route GET /api/groups
const getGroups = async (req, res) => {
  try {
    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.search) {
      filter.name = new RegExp(req.query.search, "i");
    }

    const groups = await Group.find(filter)
      .populate("creator", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    console.error("GET GROUPS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch groups", error: error.message });
  }
};

// @desc Get a single group by id
// @route GET /api/groups/:id
const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("creator", "name email")
      .populate("members", "name email");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json(group);
  } catch (error) {
    console.error("GET GROUP ERROR:", error);
    res.status(500).json({ message: "Failed to fetch group", error: error.message });
  }
};

// @desc Join a group
// @route PUT /api/groups/:id/join
const joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const userId = req.user._id.toString();
    const alreadyMember = group.members.some((id) => id.toString() === userId);

    if (alreadyMember) {
      return res.status(400).json({ message: "You are already a member of this group" });
    }

    if (group.maxMembers && group.members.length >= group.maxMembers) {
      return res.status(400).json({ message: "This group is full" });
    }

    group.members.push(req.user._id);
    await group.save();

    if (group.creator.toString() !== userId) {
      await Notification.create({
        recipient: group.creator,
        sender: req.user._id,
        type: "group_join",
        group: group._id,
        message: `${req.user.name} joined your group "${group.name}"`,
      });
    }

    res.json({ message: "Joined group successfully", membersCount: group.members.length });
  } catch (error) {
    console.error("JOIN GROUP ERROR:", error);
    res.status(500).json({ message: "Failed to join group", error: error.message });
  }
};

// @desc Leave a group
// @route PUT /api/groups/:id/leave
const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const userId = req.user._id.toString();

    if (group.creator.toString() === userId) {
      return res.status(400).json({
        message: "Creator cannot leave the group. Delete the group instead.",
      });
    }

    const wasMember = group.members.some((id) => id.toString() === userId);

    if (!wasMember) {
      return res.status(400).json({ message: "You are not a member of this group" });
    }

    group.members = group.members.filter((id) => id.toString() !== userId);
    await group.save();

    res.json({ message: "Left group successfully", membersCount: group.members.length });
  } catch (error) {
    console.error("LEAVE GROUP ERROR:", error);
    res.status(500).json({ message: "Failed to leave group", error: error.message });
  }
};

// @desc Delete a group (creator only)
// @route DELETE /api/groups/:id
const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this group" });
    }

    await group.deleteOne();

    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("DELETE GROUP ERROR:", error);
    res.status(500).json({ message: "Failed to delete group", error: error.message });
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroupById,
  joinGroup,
  leaveGroup,
  deleteGroup,
};