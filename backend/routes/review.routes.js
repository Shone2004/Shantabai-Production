const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const { getProviderReviews } = require("../controllers/review.controller");

console.log("AUTH:", auth);
console.log("CONTROLLER:", getProviderReviews);

// 👇 FIX IS HERE
// This matches the path: GET /api/reviews/my-reviews
router.get("/my-reviews", auth.authenticateUser, getProviderReviews);

module.exports = router;