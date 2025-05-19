const express = require("express");
const cors = require("cors");
const menuRoutes = require("./routes/menu.js");
const orderRoutes = require("./routes/orders.js");
const tableRoutes = require("./routes/tables.js");

const app = express();

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

app.use(express.json());
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/tables", tableRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

module.exports = app;
