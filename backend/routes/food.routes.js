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
} = require("../controllers/food.controller");

const { authenticateUser } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { verifyProviderApproved } = require("../middleware/verifyProviderApproved");
const upload = require("../middleware/uploadMiddleware");

// Protected Routes that collide with /:id (define first with inline middleware)
router.get("/stats", authenticateUser, allowRoles("PROVIDER"), verifyProviderApproved, getProviderStats);
router.get("/me", authenticateUser, allowRoles("PROVIDER"), verifyProviderApproved, getMyFoodItems);

// Public Routes
router.get("/", getAllFoods);
router.get("/:id", getFoodById);

// Protected Routes (Required Authentication and PROVIDER role)
router.use(authenticateUser);
router.use(allowRoles("PROVIDER"));
router.use(verifyProviderApproved);

router.post("/", upload.array("images", 5), createFoodItem);
router.put("/:id", upload.array("images", 5), updateFoodItem);
router.delete("/:id", deleteFoodItem);

module.exports = router;
