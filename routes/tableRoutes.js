const express = require("express");
const router = express.Router();
const tableController = require("../controllers/tableController");
const {
  authCheck,
  authCheckForAdmin,
} = require("../controllers/authController");

router.get("/tables", authCheck, tableController.getAllTables);
router.get("/table/:number", authCheck, tableController.getTableByNumber);
router.post("/table", authCheckForAdmin, tableController.createTable);
router.delete("/table/:id", authCheckForAdmin, tableController.deleteTable);

module.exports = router;
