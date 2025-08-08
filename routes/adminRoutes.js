const express = require("express");
const router = express.Router();
const adminController = require("../controllers/AdminController");
const { authCheckForAdmin } = require("../controllers/authController");

router.get(
  "/all-confirm-orders",
  authCheckForAdmin,
  adminController.getAllFinalOrders
);
router.get(
  "/total-amount-confirm-orders",
  authCheckForAdmin,
  adminController.getTotalAmountOfFinalOrders
);
router.get("/all-sold-items", authCheckForAdmin, adminController.getSoldItems);

module.exports = router;
