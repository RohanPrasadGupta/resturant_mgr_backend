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
// get all sold items and number of time it was ordered and calculate the amount sold for thet order
router.get("/all-sold-items", adminController.getSoldItems);

module.exports = router;
