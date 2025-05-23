const express = require("express");
const router = express.Router();
const tableController = require("../controllers/tableController");

router.get("/tables", tableController.getAllTables); // Get all tables
router.get("/table/:number", tableController.getTableByNumber); // Get table by number
router.post("/table", tableController.createTable); // Create table
router.delete("/table/:id", tableController.deleteTable); // Delete table by ID

module.exports = router;
