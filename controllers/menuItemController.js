const MenuItem = require("../models/MenuItems");

exports.getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    res.status(200).json(menuItems);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching menu items", error: err.message });
  }
};

exports.getMenuItemById = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem)
      return res.status(404).json({ message: "Menu item not found" });
    res.status(200).json(menuItem);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching menu item", error: err.message });
  }
};

exports.createMenuItem = async (req, res) => {
  try {
    const newItem = new MenuItem(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error creating menu item", error: err.message });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedItem)
      return res.status(404).json({ message: "Menu item not found" });
    res.status(200).json(updatedItem);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error updating menu item", error: err.message });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!deletedItem)
      return res.status(404).json({ message: "Menu item not found" });
    res.status(200).json({ message: "Menu item deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting menu item", error: err.message });
  }
};

exports.toggleMenuItemAvailability = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem)
      return res.status(404).json({ message: "Menu item not found" });

    menuItem.available = !menuItem.available;
    const updatedItem = await menuItem.save();

    res.status(200).json({
      message: `Menu item ${
        updatedItem.available ? "enabled" : "disabled"
      } successfully`,
      menuItem: updatedItem,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error toggling menu item availability",
      error: err.message,
    });
  }
};
