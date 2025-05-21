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

const orderSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: String,
      required: true,
    },
    items: [orderItemSchema],
    status: {
      type: String,
      enum: ["completed", "cancelled"],
      default: "active",
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
    timestamps: new Date.now(),
  }
);

module.exports = mongoose.model("finalOrders", orderSchema);
