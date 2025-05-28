const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem",
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
    tableId: {
      type: String,
      required: true,
    },
    items: [orderItemSchema],
    orderBy: {
      type: String,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.methods.calculateTotal = function () {
  this.total = this.items.reduce((acc, item) => {
    return acc + item.quantity * item.price;
  }, 0);
};

module.exports = mongoose.model("Order", orderSchema);
