const User = require("../models/UserInfo");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

// Middleware to check if cookie token is valid before allowing other functions to run
exports.authCheck = async (req, res, next) => {
  try {
    const token = req.cookies["mgr-token"];

    if (!token) {
      return res.json({ error: "No token found" });
    }

    const decoded = jwt.decode(token);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        message: "Invalid token. User not found.",
        authenticated: false,
      });
    }

    if (
      (user.role === "admin" || user.role === "staff") &&
      user.isActive === false
    ) {
      return res.status(403).json({
        message: "User is inactive.",
        authenticated: false,
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Something went wrong.",
      authenticated: false,
    });
  }
};
