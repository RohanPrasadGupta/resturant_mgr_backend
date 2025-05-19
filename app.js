const express = require("express");
const cors = require("cors");
const menuRoutes = require("./routes/menu.js");
const orderRoutes = require("./routes/orders.js");
const tableRoutes = require("./routes/tables.js");

const app = express();

app.use(cors({ origin: true, credentials: true }));

app.use(express.json());
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/tables", tableRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

module.exports = app;
