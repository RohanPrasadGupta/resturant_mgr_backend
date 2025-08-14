const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/NotificationController");
const { authCheckForAdmin } = require("../controllers/authController");

router.get("/", authCheckForAdmin, notificationController.getNotifications);
router.patch(
  "/hide",
  authCheckForAdmin,
  notificationController.updateHideMarkStatus
);

router.patch(
  "/read",
  authCheckForAdmin,
  notificationController.updateReadMarkStatus
);

router.patch(
  "/hide/all",
  authCheckForAdmin,
  notificationController.updateAllNotificationHideMark
);

router.patch(
  "/read/all",
  authCheckForAdmin,
  notificationController.updateAllNotificationReadMark
);

module.exports = router;
