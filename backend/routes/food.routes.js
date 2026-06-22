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
} = require("../controllers/food.controller");

const { authenticateUser } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { verifyProviderApproved } = require("../middleware/verifyProviderApproved");
const upload = require("../middleware/uploadMiddleware");

const providerOnly = [
  authenticateUser,
  allowRoles("PROVIDER"),
  verifyProviderApproved,
];


// ==========================================
// PUBLIC ROUTES
// ==========================================

// Get all foods
router.get("/", getAllFoods);

// Provider food history
router.get(
  "/provider/history",
  ...providerOnly,
  getFoodHistory
);

// Get single food
router.get("/:id", getFoodById);

// Get food reviews
router.get("/:id/reviews", getFoodReviews);


// ==========================================
// AUTHENTICATED USER ROUTES
// ==========================================

// Add review to food
router.post(
  "/:id/review",
  authenticateUser,
  addReviewToFood
);

// Add review to provider
router.post(
  "/provider/:providerId/review",
  authenticateUser,
  addReviewToProvider
);

// Delete own review
router.delete(
  "/:foodId/review/:reviewId",
  authenticateUser,
  deleteReview
);


// ==========================================
// PROVIDER ROUTES
// ==========================================

// Get provider's foods
router.get(
  "/me",
  ...providerOnly,
  getMyFoodItems
);

// Provider stats
router.get(
  "/stats",
  ...providerOnly,
  getProviderStats
);

// Create food
router.post(
  "/",
  ...providerOnly,
  upload.array("images", 5),
  createFoodItem
);

// Update food
router.put(
  "/:id",
  ...providerOnly,
  upload.array("images", 5),
  updateFoodItem
);

// Delete food
router.delete(
  "/:id",
  ...providerOnly,
  deleteFoodItem
);

module.exports = router;