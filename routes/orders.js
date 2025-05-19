const express = require("express");
const Order = require("../models/Order");
const Table = require("../models/Table");

const router = express.Router();

// Get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().populate("items.menuItem");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new order
router.post("/", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { tableNumber, items } = req.body;

    // Calculate total
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create order
    const order = new Order({
      tableNumber,
      items,
      total,
      status: "active",
    });

    await order.save({ session });

    // Update table status
    await Table.findOneAndUpdate(
      { number: tableNumber },
      { status: "occupied", currentOrder: order._id },
      { session }
    );

    await session.commitTransaction();
    res.status(201).json(order);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// Complete an order
router.patch("/:id/complete", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { paymentMethod } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      throw new Error("Order not found");
    }

    order.status = "completed";
    order.paymentMethod = paymentMethod;
    await order.save({ session });

    // Free up the table
    await Table.findOneAndUpdate(
      { number: order.tableNumber },
      { status: "available", currentOrder: null },
      { session }
    );

    await session.commitTransaction();
    res.json(order);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

module.exports = router;
