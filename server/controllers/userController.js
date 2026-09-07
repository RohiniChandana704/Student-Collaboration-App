const User = require("../models/User");

// @desc Get logged-in user's own profile
// @route GET /api/users/me
const getMyProfile = async (req, res) => {
  try {
    // req.user is already attached by the protect middleware (password excluded)
    res.json(req.user);
  } catch (error) {
    console.error("GET MY PROFILE ERROR:", error);
    res.status(500).json({ message: "Failed to fetch profile", error: error.message });
  }
};

// @desc Update logged-in user's own profile (name, bio, skills)
// @route PUT /api/users/me
const updateMyProfile = async (req, res) => {
  try {
    const { name, bio, skills } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

if (name !== undefined && name.length > 60) {
  return res.status(400).json({ message: "Name must be 60 characters or fewer" });
}

if (bio !== undefined && bio.length > 300) {
  return res.status(400).json({ message: "Bio must be 300 characters or fewer" });
}

    if (skills !== undefined) {
      if (!Array.isArray(skills)) {
        return res.status(400).json({ message: "Skills must be an array of strings" });
      }
      user.skills = skills;
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");

    res.json(updatedUser);
  } catch (error) {
    console.error("UPDATE MY PROFILE ERROR:", error);
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};

// @desc Get another user's public profile by id
// @route GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("GET USER BY ID ERROR:", error);
    res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
};

// @desc Search users by name or skill
// @route GET /api/users?search=react
const searchUsers = async (req, res) => {
  try {
    const filter = {};

    if (req.query.search) {
      const regex = new RegExp(req.query.search, "i");
      filter.$or = [{ name: regex }, { skills: regex }];
    }

    const users = await User.find(filter).select("-password -email");

    res.json(users);
  } catch (error) {
    console.error("SEARCH USERS ERROR:", error);
    res.status(500).json({ message: "Failed to search users", error: error.message });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getUserById,
  searchUsers,
};