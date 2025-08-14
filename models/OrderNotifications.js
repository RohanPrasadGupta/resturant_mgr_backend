const mongoose = require("mongoose");

const notification = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  readMark: { type: Boolean, default: false },
  hideMark: { type: Boolean, default: false },
  orderValue: { type: Number, required: true },
});

module.exports = mongoose.model("Notification", notification);
