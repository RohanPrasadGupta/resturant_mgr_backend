const express = require("express");
const Order = require("../models/Order");
const Table = require("../models/Table");

const router = express.Router();

// Get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().populate("items.menuItem");
    res.json({ status: "success", orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// get order by tableId
router.get("/:tableId", async (req, res) => {
  try {
    const { tableId } = req.params;
    const order = await Order.findOne({ tableId }).populate("items.menuItem");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ status: "success", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new order or update an existing one
router.post("/", async (req, res) => {
  try {
    const { tableNumber, items, tableId } = req.body;

    // Check if order already exists
    let order = await Order.findOne({ tableId, tableNumber });

    if (order) {
      order.items = items;
      order.calculateTotal();
      await order.save();

      return res.status(200).json({
        message: "Order updated successfully",
        order,
      });
    } else {
      // Create new order
      order = new Order({
        tableNumber,
        tableId,
        items,
        total: 0,
      });

      order.calculateTotal();
      await order.save();

      return res.status(201).json({
        message: "Order created successfully",
        order,
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete Item From Order
router.delete("/deleteItem/:tableId/:itemId", async (req, res) => {
  try {
    const { tableId, itemId } = req.params;

    const order = await Order.findOne({
      tableId: tableId,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const itemIndex = order.items.findIndex(
      (item) => item._id.toString() === itemId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in order" });
    }

    order.items.splice(itemIndex, 1);
    order.calculateTotal();
    await order.save();

    res.json({ message: "Item removed from order successfully", order });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
