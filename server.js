const app = require("./app");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const user = process.env.USER_NAME;
const password = process.env.PASSWORD;
// const MONGODB_URI = `mongodb+srv://${user}:${password}@cluster0.mpuz2fw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(user, password);
const MONGODB_URI = `mongodb+srv://${user}:${password}@cluster0.mpuz2fw.mongodb.net/`;

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log(" MongoDB connected"))
  .catch((err) => console.error(" MongoDB connection error:", err));

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(` Server running on port ${port}`);
});
