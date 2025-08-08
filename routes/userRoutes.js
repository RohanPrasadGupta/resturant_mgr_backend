const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  authCheck,
  authCheckForAdmin,
} = require("../controllers/authController");

// User authentication routes
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);

// User management routes
router.get("/", authCheckForAdmin, userController.getAllUsers);
router.get("/:id", authCheckForAdmin, userController.getUserById);
router.put("/:id", authCheckForAdmin, userController.updateUser);
router.delete("/:id", authCheckForAdmin, userController.deleteUser);
router.put("/status/:id", authCheckForAdmin, userController.makeUserInactive);

module.exports = router;
