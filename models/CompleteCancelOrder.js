const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
});

const finalOrdersSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: String,
      required: true,
    },
    items: [orderItemSchema],
    status: {
      type: String,
      enum: ["completed", "cancelled", "incomplete"],
      default: "incomplete",
    },
    total: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "online"],
      required: function () {
        return this.status === "completed";
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("finalOrders", finalOrdersSchema);
