const express = require("express");
const router = express.Router();
const tableController = require("../controllers/tableController");

router.get("/tables", tableController.getAllTables);
router.get("/table/:number", tableController.getTableByNumber);
router.post("/table", tableController.createTable);
router.delete("/table/:id", tableController.deleteTable);

module.exports = router;
