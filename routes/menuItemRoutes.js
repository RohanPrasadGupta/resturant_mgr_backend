const express = require("express");
const router = express.Router();
const menuItemController = require("../controllers/menuItemController");

router.get("/menu-items", menuItemController.getAllMenuItems);
router.get("/menu-items/:id", menuItemController.getMenuItemById);
router.post("/menu-items", menuItemController.createMenuItem);
router.put("/menu-items/:id", menuItemController.updateMenuItem);
router.delete("/menu-items/:id", menuItemController.deleteMenuItem);
router.patch(
  "/menu-items/:id/toggle-availability",
  menuItemController.toggleMenuItemAvailability
);

module.exports = router;
