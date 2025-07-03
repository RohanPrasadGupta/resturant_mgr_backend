const app = require("./app");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config({ path: "./config.env" });

const user = process.env.USER_NAME;
const password = process.env.PASSWORD;

const MONGODB_URI = `mongodb+srv://${user}:${password}@cluster0.mpuz2fw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const port = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://mgr-frontend.netlify.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Listen for socket connections
io.on("connection", (socket) => {
  console.log("🔔 A user connected:", socket.id);

  // Optional: listen for event registration (admin/staff)
  socket.on("register-admin", () => {
    console.log(`🧑‍💼 Admin registered: ${socket.id}`);
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// Attach to global so routes can use io
global.io = io;

server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
