const express = require("express");
const cors = require("cors");
// const completeOrderRoutes = require("./routes/confirmOrder.js");
const orderRoutes = require("./routes/orderRoutes.js");
const tableRoutes = require("./routes/tableRoutes.js");
const menuItemRoutes = require("./routes/menuItemRoutes");
const userRoutes = require("./controllers/userController.js");

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
app.use("/api/users", userRoutes);

// app.use("/api/confirmOrder", completeOrderRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

module.exports = app;
