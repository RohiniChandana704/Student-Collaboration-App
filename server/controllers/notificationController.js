const Notification = require("../models/Notification");

// @desc Get logged-in user's notifications
// @route GET /api/notifications
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("sender", "name")
      .populate("post", "title")
      .populate("group", "name")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch notifications", error: error.message });
  }
};

// @desc Mark a single notification as read
// @route PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this notification" });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    console.error("MARK READ ERROR:", error);
    res.status(500).json({ message: "Failed to mark notification as read", error: error.message });
  }
};

// @desc Mark all of the logged-in user's notifications as read
// @route PUT /api/notifications/read-all
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("MARK ALL READ ERROR:", error);
    res.status(500).json({ message: "Failed to mark notifications as read", error: error.message });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};