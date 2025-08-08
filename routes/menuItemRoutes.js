const express = require("express");
const router = express.Router();
const menuItemController = require("../controllers/menuItemController");
const {
  authCheck,
  authCheckForAdmin,
} = require("../controllers/authController");

router.get("/menu-items", menuItemController.getAllMenuItems);
router.get("/menu-items/:id", menuItemController.getMenuItemById);
router.post(
  "/menu-items",
  authCheckForAdmin,
  menuItemController.createMenuItem
);
router.put(
  "/menu-items/:id",
  authCheckForAdmin,
  menuItemController.updateMenuItem
);
router.delete(
  "/menu-items/:id",
  authCheckForAdmin,
  menuItemController.deleteMenuItem
);
router.patch(
  "/menu-items/:id/toggle-availability",
  authCheckForAdmin,
  menuItemController.toggleMenuItemAvailability
);

module.exports = router;
