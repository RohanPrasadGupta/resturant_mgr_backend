const Order = require("../models/Order");
const Table = require("../models/Table");
const MenuItem = require("../models/MenuItems");
const FinalOrder = require("../models/CompleteCancelOrder");

exports.createOrder = async (req, res) => {
  try {
    const { tableNumber, tableId, items, orderBy } = req.body;

    // First check if the table exists
    const existingTable = await Table.findById(tableId);
    if (!existingTable) {
      return res.status(404).json({ message: "Table not found" });
    }

    // Validate menu items
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem) {
        return res.status(404).json({
          message: `Menu item with ID ${item.menuItem} not found`,
        });
      }
    }

    // Check if table is occupied and has an existing order
    if (existingTable.status === "occupied" && existingTable.currentOrder) {
      const existingOrder = await Order.findById(existingTable.currentOrder);

      if (existingOrder) {
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
          order: existingOrder,
        });
      }
    }

    // Create new order if table is not occupied or doesn't have an order
    const order = new Order({ tableNumber, tableId, items, orderBy });
    order.calculateTotal();
    await order.save();

    // Update the table status
    await Table.findByIdAndUpdate(tableId, {
      status: "occupied",
      currentOrder: order._id,
    });

    res.status(201).json({ message: "Order created successfully", order });
  } catch (err) {
    console.error("Order creation error:", err);
    res
      .status(500)
      .json({ message: "Error creating order", error: err.message });
  }
};

exports.addItemToOrder = async (req, res) => {
  try {
    const { menuItemId, quantity } = req.body;
    const menuItem = await MenuItem.findById(menuItemId);

    const order = await Order.findById(req.params.orderId);
    order.items.push({ menuItem: menuItemId, quantity, price: menuItem.price });
    order.calculateTotal();
    await order.save();
    s;

    res.status(200).json(order);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error adding item to order", error: err.message });
  }
};

exports.removeItemFromOrder = async (req, res) => {
  try {
    const { menuItemId } = req.body;
    const order = await Order.findById(req.params.orderId);
    order.items = order.items.filter(
      (item) => item.menuItem.toString() !== menuItemId
    );
    order.calculateTotal();
    await order.save();

    res.status(200).json(order);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error removing item", error: err.message });
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

exports.deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.orderId);
    res.status(200).json({ message: "Order deleted." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting order", error: err.message });
  }
};
