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
  try {
    const { tableNumber, items, total } = req.body;

    // check if order already exists for the table then update it
    const existingOrder = await Order.findOne({
      tableNumber,
      status: "active",
    });
    if (existingOrder) {
      existingOrder.items = items;
      existingOrder.total = total;
      await existingOrder.save();
      return res.status(200).json({
        message: "Order updated successfully",
        order: existingOrder,
      });
    } else {
      // Create order
      const order = new Order({
        tableNumber,
        items,
        total,
        status: "active",
      });

      await order.save();
    }

    // Update table status
    await Table.findOneAndUpdate(
      { number: tableNumber },
      { status: "occupied", currentOrder: order._id }
    );

    // res.status(201).json(order);
    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Complete an order
router.patch("/:id/complete/:paymentMethod", async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod } = req.params;
    console.log("Payment method:", paymentMethod);
    console.log("Order ID:", id);

    const order = await Order.findById(id);
    if (!order) {
      throw new Error("Order not found");
    }

    order.status = "completed";
    order.paymentMethod = paymentMethod;
    await order.save();

    // Free up the table
    await Table.findOneAndUpdate(
      { number: order.tableNumber },
      { status: "available", currentOrder: null }
    );

    // await session.commitTransaction();
    res.json({ message: "Order completed successfully", order });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
