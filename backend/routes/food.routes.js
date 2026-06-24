const express = require("express");
const router = express.Router();

const {
  createFoodItem,
  getAllFoods,
  getFoodById,
  getMyFoodItems,
  updateFoodItem,
  deleteFoodItem,
  getProviderStats,
  addReviewToFood,
  addReviewToProvider,
  getFoodReviews,
  deleteReview,
  getFoodHistory,
  getSimilarFoods,
} = require("../controllers/food.controller");

const { authenticateUser } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { verifyProviderApproved } = require("../middleware/verifyProviderApproved");
const upload = require("../middleware/uploadMiddleware");

// Middleware stack for protected provider routes
const providerOnly = [
  authenticateUser,
  allowRoles("PROVIDER"),
  verifyProviderApproved,
];

// ==========================================
// 1. PROVIDER-ONLY STATIC ROUTES
// ==========================================
// These must be defined before /:id routes to avoid collision
router.get("/stats", ...providerOnly, getProviderStats);
router.get("/me", ...providerOnly, getMyFoodItems);
router.get("/provider/history", ...providerOnly, getFoodHistory);

// ==========================================
// 2. PUBLIC & DYNAMIC ROUTES
// ==========================================
// Matches "/" (all foods)
router.get("/", getAllFoods);

// Matches "/similar/:id" - specific path before "/:id"
router.get("/similar/:id", getSimilarFoods);

// Matches "/:id/reviews" - specific path before "/:id"
router.get("/:id/reviews", getFoodReviews);

// Matches "/:id" - generic param, must be last in the get list
router.get("/:id", getFoodById);

// ==========================================
// 3. AUTHENTICATED USER ACTIONS
// ==========================================
router.post("/:id/review", authenticateUser, addReviewToFood);
router.post("/provider/:providerId/review", authenticateUser, addReviewToProvider);
router.delete("/:foodId/review/:reviewId", authenticateUser, deleteReview);

// ==========================================
// 4. PROVIDER CRUD ACTIONS
// ==========================================
// Create food item
router.post("/", ...providerOnly, upload.array("images", 5), createFoodItem);

// Update food item
router.put("/:id", ...providerOnly, upload.array("images", 5), updateFoodItem);

// Delete food item
router.delete("/:id", ...providerOnly, deleteFoodItem);

module.exports = router;