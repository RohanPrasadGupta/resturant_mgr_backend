const FinalOrder = require("../models/CompleteCancelOrder");

// get the final orders from new to old
exports.getAllFinalOrders = async (req, res) => {
  try {
    const finalOrders = await FinalOrder.find()
      .sort({ createdAt: -1 })
      .populate("items.menuItem");

    res.status(200).json({ message: "success", finalOrders });
  } catch (error) {
    console.error("Error fetching final orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getFinalOrderByID = async (req, res) => {
  try {
    const { id } = req.params;
    const finalOrder = await FinalOrder.findById(id).populate("items.menuItem");

    if (!finalOrder) {
      return res.status(404).json({ message: "Final order not found" });
    }

    res.status(200).json({ message: "success", finalOrder });
  } catch (error) {
    console.error("Error fetching final order by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// get the total amount of all final orders, also amount for online and cash payments
exports.getTotalAmountOfFinalOrders = async (req, res) => {
  try {
    const totalAmountData = await FinalOrder.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$total" },
          cashAmount: {
            $sum: {
              $cond: [{ $eq: ["$paymentMethod", "cash"] }, "$total", 0],
            },
          },
          onlineAmount: {
            $sum: {
              $cond: [{ $eq: ["$paymentMethod", "online"] }, "$total", 0],
            },
          },
          totalOrders: { $sum: 1 },
          cashOrders: {
            $sum: {
              $cond: [{ $eq: ["$paymentMethod", "cash"] }, 1, 0],
            },
          },
          onlineOrders: {
            $sum: {
              $cond: [{ $eq: ["$paymentMethod", "online"] }, 1, 0],
            },
          },
        },
      },
    ]);

    if (totalAmountData.length > 0) {
      const data = totalAmountData[0];
      res.status(200).json({
        totalAmount: data.totalAmount,
        cashAmount: data.cashAmount,
        onlineAmount: data.onlineAmount,
        totalOrders: data.totalOrders,
        cashOrders: data.cashOrders,
        onlineOrders: data.onlineOrders,
        paymentBreakdown: {
          cash: {
            amount: data.cashAmount,
            orders: data.cashOrders,
            percentage:
              data.totalAmount > 0
                ? ((data.cashAmount / data.totalAmount) * 100).toFixed(2)
                : 0,
          },
          online: {
            amount: data.onlineAmount,
            orders: data.onlineOrders,
            percentage:
              data.totalAmount > 0
                ? ((data.onlineAmount / data.totalAmount) * 100).toFixed(2)
                : 0,
          },
        },
      });
    } else {
      res.status(200).json({
        totalAmount: 0,
        cashAmount: 0,
        onlineAmount: 0,
        totalOrders: 0,
        cashOrders: 0,
        onlineOrders: 0,
        paymentBreakdown: {
          cash: { amount: 0, orders: 0, percentage: 0 },
          online: { amount: 0, orders: 0, percentage: 0 },
        },
      });
    }
  } catch (error) {
    console.error("Error fetching total amount of final orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// get all sold items and number of time it was ordered and calculate the amount sold for that order
exports.getSoldItems = async (req, res) => {
  try {
    const soldItems = await FinalOrder.aggregate([
      { $match: { status: "completed" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.menuItem",
          totalQuantity: { $sum: "$items.quantity" },
          totalAmount: { $sum: "$items.price" },
        },
      },
      {
        $project: {
          _id: 0,
          menuItemName: "$_id",
          totalQuantity: 1,
          totalAmount: 1,
          averagePrice: {
            $divide: ["$totalAmount", "$totalQuantity"],
          },
        },
      },

      { $sort: { totalQuantity: -1 } },
    ]);

    // Calculate overall statistics
    const totalStats = soldItems.reduce(
      (acc, item) => {
        acc.totalQuantitySold += item.totalQuantity;
        acc.totalRevenue += item.totalAmount;
        return acc;
      },
      { totalQuantitySold: 0, totalRevenue: 0 }
    );

    res.status(200).json({
      message: "success",
      soldItems,
      totalStats: {
        totalItemsSold: totalStats.totalQuantitySold,
        totalRevenue: totalStats.totalRevenue,
        uniqueItems: soldItems.length,
      },
    });
  } catch (error) {
    console.error("Error fetching sold items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
