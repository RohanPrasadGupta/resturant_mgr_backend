const Notification = require("../models/OrderNotifications");

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({
      createdAt: -1,
      _id: -1,
    });
    res.status(200).json({
      message: "Notifications fetched successfully",
      notifications,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching notifications", error: err.message });
  }
};

exports.updateHideMarkStatus = async (req, res) => {
  try {
    const { notificationId } = req.body;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.hideMark = true;

    await notification.save();

    res.status(200).json({
      message: "Notification updated successfully",
      notification,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating notification", error: err.message });
  }
};

exports.updateReadMarkStatus = async (req, res) => {
  try {
    const { notificationId } = req.body;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.readMark = true;

    await notification.save();

    res.status(200).json({
      message: "Notification updated successfully",
      notification,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating notification", error: err.message });
  }
};

exports.updateAllNotificationHideMark = async (req, res) => {
  try {
    const notifications = await Notification.updateMany(
      {},
      { $set: { hideMark: true } }
    );

    res.status(200).json({
      message: "All notifications updated successfully",
      notifications,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating notifications", error: err.message });
  }
};

exports.updateAllNotificationReadMark = async (req, res) => {
  try {
    const notifications = await Notification.updateMany(
      {},
      { $set: { readMark: true } }
    );

    res.status(200).json({
      message: "All notifications updated successfully",
      notifications,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating notifications", error: err.message });
  }
};
