const Table = require("../models/Table");
const Order = require("../models/Order");

exports.getTableByNumber = async (req, res) => {
  try {
    const table = await Table.findOne({ number: req.params.number }).populate({
      path: "currentOrder",
      populate: { path: "items.menuItem" },
    });

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    res.status(200).json(table);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching table info", error: error.message });
  }
};

exports.getAllTables = async (req, res) => {
  try {
    const tables = await Table.find().populate({
      path: "currentOrder",
      populate: { path: "items.menuItem" },
    });

    res.status(200).json(tables);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching tables", error: error.message });
  }
};

// Create a new table
exports.createTable = async (req, res) => {
  try {
    const { number, status } = req.body;

    // Check if table number already exists
    const existingTable = await Table.findOne({ number });
    if (existingTable) {
      return res.status(400).json({ message: "Table number already exists" });
    }

    const newTable = new Table({ number, status });
    const savedTable = await newTable.save();
    res.status(201).json(savedTable);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating table", error: error.message });
  }
};

// Delete a table by ID
exports.deleteTable = async (req, res) => {
  try {
    const deleted = await Table.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Table not found" });
    }
    res.status(200).json({ message: "Table deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting table", error: error.message });
  }
};
