const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ["available", "occupied"],
    default: "available",
  },
  currentOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
});

module.exports = mongoose.model("Table", tableSchema);
