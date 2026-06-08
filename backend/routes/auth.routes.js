console.log("✅ Auth routes loaded");

const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
} = require("../controllers/auth.controller");

router.get("/test", (req, res) => {
  res.json({ message: "Auth route works" });
});

router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;