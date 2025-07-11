const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { authCheck } = require("../controllers/authController");

router.post("/order", orderController.createOrder);
router.put(
  "/order/:orderId/update-quantity",
  orderController.updateOrderQuantity
);
router.put("/order/:orderId/remove-item", orderController.removeItemFromOrder);
router.put("/order/:orderId/mark-item-served", orderController.markItemServed);
router.put(
  "/order/:orderId/mark-all-served",
  orderController.markAllItemsServed
);
router.get("/orders", authCheck, orderController.getAllOrders);
router.get(
  "/order/table-number/:tableNumber",
  orderController.getOrderByTableNumber
);
router.post("/order/:orderId/complete", orderController.completeOrder);
router.post("/order/:orderId/cancel", orderController.cancelOrder);
router.delete("/order/:orderId", orderController.deleteOrder);

module.exports = router;
