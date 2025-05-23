const express = require("express");
const cors = require("cors");
// const menuRoutes = require("./routes/menu.js");
// const orderRoutes = require("./routes/orders.js");
// const tableRoutes = require("./routes/tables.js");
// const completeOrderRoutes = require("./routes/confirmOrder.js");
const orderRoutes = require("./routes/orderRoutes.js");
const tableRoutes = require("./routes/tableRoutes.js");
const menuItemRoutes = require("./routes/menuItemRoutes");

const app = express();
app.use(express.json());

const allowedOrigins = [
  "http://localhost:3002",
  "http://localhost:3000",
  "https://rpg-ecommerce.netlify.app",
  "https://resturant-mgr-backend.onrender.com",
];

const corsOptions = {
  origin: allowedOrigins,
  methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
  credentials: true,
  allowedHeaders: "Content-Type, Authorization",
};

app.use(cors(corsOptions));
app.use("/api", orderRoutes);
app.use("/api", tableRoutes);
app.use("/api", menuItemRoutes);

// app.use("/api/menu", menuRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/tables", tableRoutes);
// app.use("/api/confirmOrder", completeOrderRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

module.exports = app;
