const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.post("/order", orderController.createOrder);
router.put(
  "/order/:orderId/update-quantity",
  orderController.updateOrderQuantity
);
router.put("/order/:orderId/remove-item", orderController.removeItemFromOrder);
router.get("/orders", orderController.getAllOrders);
router.post("/order/:orderId/complete", orderController.completeOrder);
router.post("/order/:orderId/cancel", orderController.cancelOrder);
router.delete("/order/:orderId", orderController.deleteOrder);
router.get(
  "/order/table-number/:tableNumber",
  orderController.getOrderByTableNumber
);

module.exports = router;
