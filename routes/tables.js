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

// Update table status
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const table = await Table.findByIdAndUpdate(id, { status }, { new: true });

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    res.json(table);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
