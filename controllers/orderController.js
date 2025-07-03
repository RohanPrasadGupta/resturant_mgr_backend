const Order = require("../models/Order");
const Table = require("../models/Table");
const MenuItem = require("../models/MenuItems");
const FinalOrder = require("../models/CompleteCancelOrder");

exports.createOrder = async (req, res) => {
  try {
    const { tableNumber, tableId, items, orderBy } = req.body;
    const existingTable = await Table.findById(tableId);
    if (!existingTable) {
      return res.status(404).json({ message: "Table not found" });
    }

    const validatedItems = [];
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem) {
        return res.status(404).json({
          message: `Menu item with ID ${item.menuItem} not found`,
        });
      }

      validatedItems.push({
        menuItem: item.menuItem,
        quantity: item.quantity,
        price: menuItem.price * item.quantity,
        orderServed: false,
      });
    }

    if (existingTable.status === "occupied" && existingTable.currentOrder) {
      const existingOrder = await Order.findById(existingTable.currentOrder);

      if (existingOrder) {
        for (const newItem of validatedItems) {
          const unservedItemIndex = existingOrder.items.findIndex(
            (item) =>
              item.menuItem.toString() === newItem.menuItem.toString() &&
              !item.orderServed
          );

          if (unservedItemIndex !== -1) {
            // Update quantity of existing unserved item
            const menuItem = await MenuItem.findById(newItem.menuItem);
            existingOrder.items[unservedItemIndex].quantity += newItem.quantity;
            existingOrder.items[unservedItemIndex].price =
              menuItem.price * existingOrder.items[unservedItemIndex].quantity;
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

    const order = new Order({
      tableNumber,
      tableId,
      items: validatedItems,
      orderBy,
    });
    order.calculateTotal();
    await order.save();

    await Table.findByIdAndUpdate(tableId, {
      status: "occupied",
      currentOrder: order._id,
    });
    global.io.emit("new-order", order);

    res.status(201).json({ message: "Order created successfully", order });
  } catch (err) {
    console.error("Order creation error:", err);
    res
      .status(500)
      .json({ message: "Error creating order", error: err.message });
  }
};

exports.updateOrderQuantity = async (req, res) => {
  try {
    const { menuItemId, quantity } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const itemIndex = order.items.findIndex(
      (item) => item.menuItem.toString() === menuItemId
    );

    if (itemIndex !== -1) {
      if (order.items[itemIndex].orderServed) {
        return res.status(400).json({
          message: "Cannot modify this item - it has already been served",
        });
      }

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

    const itemToRemove = order.items.find((item) => {
      return item.menuItem._id.toString() === menuItemId;
    });

    if (!itemToRemove) {
      return res.status(404).json({ message: "Menu item not found in order." });
    }

    if (itemToRemove.orderServed) {
      return res.status(400).json({
        message: "Cannot remove this item - it has already been served",
      });
    }

    order.items = order.items.filter((item) => {
      return item.menuItem._id.toString() !== menuItemId;
    });

    if (order.items.length === 0) {
      await Table.findByIdAndUpdate(order.tableId, {
        status: "available",
        currentOrder: null,
      });

      await Order.findByIdAndDelete(req.params.orderId);

      return res.status(200).json({
        message: "Last item removed, order deleted and table made available",
        tableStatus: "available",
      });
    }

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

exports.markItemServed = async (req, res) => {
  try {
    const { menuItemId } = req.body;
    const order = await Order.findById(req.params.orderId).populate(
      "items.menuItem"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const itemIndex = order.items.findIndex(
      (item) => item.menuItem._id.toString() === menuItemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Menu item not found in order" });
    }

    if (order.items[itemIndex].orderServed) {
      return res.status(400).json({
        message: "Item has already been marked as served",
      });
    }

    order.items[itemIndex].orderServed = true;
    await order.save();

    res.status(200).json({
      message: "Item marked as served successfully",
      order,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error marking item as served", error: err.message });
  }
};

exports.markAllItemsServed = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate(
      "items.menuItem"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    let servedCount = 0;
    order.items.forEach((item) => {
      if (!item.orderServed) {
        item.orderServed = true;
        servedCount++;
      }
    });

    if (servedCount === 0) {
      return res.status(400).json({
        message: "All items are already marked as served",
      });
    }

    await order.save();

    res.status(200).json({
      message: `${servedCount} items marked as served successfully`,
      order,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error marking items as served", error: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const hasServedItems = order.items.some((item) => item.orderServed);
    if (hasServedItems) {
      return res.status(400).json({
        message: "Cannot delete order - some items have already been served",
      });
    }

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

exports.completeOrder = async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const order = await Order.findById(req.params.orderId).populate(
      "items.menuItem"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const unservedItems = order.items.filter((item) => !item.orderServed);

    if (unservedItems.length > 0) {
      return res.status(400).json({
        message: "Cannot complete order - some items have not been served yet",
        unservedItems: unservedItems.map((item) => ({
          menuItemId: item.menuItem._id,
          menuItemName: item.menuItem.name,
          quantity: item.quantity,
        })),
      });
    }

    const finalOrder = new FinalOrder({
      tableNumber: order.tableNumber,
      items: order.items.map((item) => ({
        menuItem: item.menuItem.name,
        quantity: item.quantity,
        price: item.price,
        orderServed: item.orderServed,
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
    await order.deleteOne();

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

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const finalOrder = new FinalOrder({
      tableNumber: order.tableNumber,
      items: order.items.map((item) => ({
        menuItem: item.menuItem.name,
        quantity: item.quantity,
        price: item.price,
        orderServed: item.orderServed,
      })),
      total: order.total,
      status: "cancelled",
    });

    await finalOrder.save();
    await Table.findByIdAndUpdate(order.tableId, {
      status: "available",
      currentOrder: null,
    });
    await order.deleteOne();

    res.status(200).json({ message: "Order cancelled and archived." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error cancelling order", error: err.message });
  }
};
