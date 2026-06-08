console.log("✅ Auth routes loaded");

const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getMe,
} = require("../controllers/auth.controller");

const { authenticateUser } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

router.get("/test", (req, res) => {
  res.json({ message: "Auth route works" });
});

router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/me", authenticateUser, getMe);

// Role protected route example
router.get("/admin-test", authenticateUser, allowRoles("ADMIN"), (req, res) => {
  res.json({ message: "Welcome Admin!" });
});

module.exports = router;