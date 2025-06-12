const FinalOrder = require("../models/CompleteCancelOrder");

// get the final orders from new to old
exports.getAllFinalOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const finalOrders = await FinalOrder.find()
      .sort({ createdAt: -1 })
      .populate("items.menuItem");

    res.status(200).json({ message: "success", finalOrders });
  } catch (error) {
    console.error("Error fetching final orders:", error);
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
