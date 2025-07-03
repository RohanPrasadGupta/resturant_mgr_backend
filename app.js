const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const orderRoutes = require("./routes/orderRoutes.js");
const tableRoutes = require("./routes/tableRoutes.js");
const menuItemRoutes = require("./routes/menuItemRoutes");
const userRoutes = require("./routes/userRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");

const app = express();
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:3001",
  "http://localhost:3000",
  "https://mgr-frontend.netlify.app",
  "https://resturant-mgr-backend.onrender.com",
];

const corsOptions = {
  origin: allowedOrigins,
  methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400000,
};

app.use(cors(corsOptions));
app.use("/api", orderRoutes);
app.use("/api", tableRoutes);
app.use("/api", menuItemRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

module.exports = app;
