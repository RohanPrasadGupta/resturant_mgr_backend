const express = require("express");
const Table = require("../models/Table");

const router = express.Router();

// Get all tables
router.get("/", async (req, res) => {
  try {
    const tables = await Table.find().populate("currentOrder");
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new table
router.post("/createTable/", async (req, res) => {
  try {
    const { number } = req.body;
    const table = new Table({
      number,
    });
    await table.save();
    res.status(201).json(table);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// get table details by id
router.get("/bytable/:tableID", async (req, res) => {
  const { tableID } = req.params;
  try {
    const table = await Table.findById(tableID).populate("currentOrder");

    if (!table) {
      return res.status(404).json({ message: "Table Data not found" });
    }

    res.json({
      ststus: "success",
      table,
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
});

module.exports = router;
