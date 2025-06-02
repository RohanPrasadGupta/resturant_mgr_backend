const Order = require("../models/Order");
const Table = require("../models/Table");
const MenuItem = require("../models/MenuItems");
const FinalOrder = require("../models/CompleteCancelOrder");

exports.createOrder = async (req, res) => {
  try {
    const { tableNumber, tableId, items, orderBy } = req.body;

    const existingTable = await Table.findById(tableId);
    if (existingTable.status === "occupied" && existingTable.currentOrder) {
      const existingOrder = await Order.findById(existingTable.currentOrder);

      for (const newItem of items) {
        const existingItemIndex = existingOrder.items.findIndex(
          (item) => item.menuItem.toString() === newItem.menuItem.toString()
        );

        if (existingItemIndex !== -1) {
          existingOrder.items[existingItemIndex].quantity += newItem.quantity;
        } else {
          existingOrder.items.push(newItem);
        }
      }

      existingOrder.calculateTotal();
      await existingOrder.save();
      return res.status(200).json({
        message: "Order updated successfully",
        existingOrder,
      });
    }

    const order = new Order({ tableNumber, tableId, items, orderBy });
    order.calculateTotal();
    await order.save();

    await Table.findByIdAndUpdate(tableId, {
      status: "occupied",
      currentOrder: order._id,
    });

    res.status(201).json({ message: "Order created successfully", order });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating order", error: err.message });
  }
};

// update order quantity
exports.updateOrderQuantity = async (req, res) => {
  try {
    const { menuItemId, quantity } = req.body;
    const order = await Order.findById(req.params.orderId);

    const itemIndex = order.items.findIndex(
      (item) => item.menuItem.toString() === menuItemId
    );

    if (itemIndex !== -1) {
      order.items[itemIndex].quantity = quantity;
      order.items[itemIndex].price =
        (await MenuItem.findById(menuItemId)).price * quantity;
      order.calculateTotal();
      await order.save();

      res.status(200).json(order);
    } else {
      res.status(404).json({ message: "Menu item not found in order." });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating order quantity", error: err.message });
  }
};

exports.removeItemFromOrder = async (req, res) => {
  try {
    const { menuItemId } = req.body;
    const order = await Order.findById(req.params.orderId).populate(
      "items.menuItem"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Filter out the specific menu item using the populated _id
    order.items = order.items.filter((item) => {
      return item.menuItem._id.toString() !== menuItemId;
    });

    // Check if no items are left in the order
    if (order.items.length === 0) {
      // Update table status to available and remove current order
      await Table.findByIdAndUpdate(order.tableId, {
        status: "available",
        currentOrder: null,
      });

      // Delete the order since it has no items
      await Order.findByIdAndDelete(req.params.orderId);

      return res.status(200).json({
        message: "Last item removed, order deleted and table made available",
        tableStatus: "available",
      });
    }

    // If items still exist, recalculate total and save
    order.calculateTotal();
    await order.save();

    res.status(200).json({
      message: "Item removed successfully",
      order,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error removing item", error: err.message });
  }
};

// Delete entire order (keep this for deleting complete orders)
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update table status when deleting entire order
    await Table.findByIdAndUpdate(order.tableId, {
      status: "available",
      currentOrder: null,
    });

    await Order.findByIdAndDelete(req.params.orderId);

    res.status(200).json({ message: "Entire order deleted successfully." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting order", error: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("items.menuItem");
    res.status(200).json(orders);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: err.message });
  }
};

exports.completeOrder = async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const order = await Order.findById(req.params.orderId).populate(
      "items.menuItem"
    );

    const finalOrder = new FinalOrder({
      tableNumber: order.tableNumber,
      items: order.items.map((item) => ({
        menuItem: item.menuItem.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total: order.total,
      status: "completed",
      paymentMethod,
    });

    await finalOrder.save();
    await Table.findByIdAndUpdate(order.tableId, {
      status: "available",
      currentOrder: null,
    });
    await order.remove();

    res.status(200).json({ message: "Order completed and archived." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error completing order", error: err.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate(
      "items.menuItem"
    );

    const finalOrder = new FinalOrder({
      tableNumber: order.tableNumber,
      items: order.items.map((item) => ({
        menuItem: item.menuItem.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total: order.total,
      status: "cancelled",
    });

    await finalOrder.save();
    await Table.findByIdAndUpdate(order.tableId, {
      status: "available",
      currentOrder: null,
    });
    await order.remove();

    res.status(200).json({ message: "Order cancelled and archived." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error cancelling order", error: err.message });
  }
};

exports.getOrderByTableNumber = async (req, res) => {
  try {
    const { tableNumber } = req.params;

    const order = await Order.findOne({
      tableNumber: tableNumber,
    }).populate("items.menuItem");

    if (!order) {
      return res
        .status(404)
        .json({ message: "No active order found for this table number" });
    }

    res.status(200).json({
      message: "Order found successfully",
      order,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching order by table number",
      error: err.message,
    });
  }
};
