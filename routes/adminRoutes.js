const express = require("express");
const router = express.Router();
const adminController = require("../controllers/AdminController");

// Route to get all final orders
router.get("/all-confirm-orders", adminController.getAllFinalOrders);
// Route to get the total amount of all final orders
router.get(
  "/total-amount-confirm-orders",
  adminController.getTotalAmountOfFinalOrders
);

module.exports = router;
