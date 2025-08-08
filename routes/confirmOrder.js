const express = require("express");
const Order = require("../models/Order");
const Table = require("../models/Table");
const FinalOrders = require("../models/CompleteCancelOrder");
const {
  authCheck,
  authCheckForAdmin,
} = require("../controllers/authController");

const router = express.Router();

router.get("/", authCheck, async (req, res) => {
  try {
    const orders = await FinalOrders.find().populate("items.menuItem");
    res.json({ status: "success", orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
