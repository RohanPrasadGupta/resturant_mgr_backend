const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// User authentication routes
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);

// User management routes
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.put("/status/:id", userController.makeUserInactive);

module.exports = router;
