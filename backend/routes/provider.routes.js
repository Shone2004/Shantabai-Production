const express = require("express");
const router = express.Router();

const {
  registerProvider,
  getMyProviderProfile,
  updateMyProviderProfile,
  getAllApprovedProviders,
  getProviderById,
} = require("../controllers/provider.controller");

const { authenticateUser } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

// @route   POST /api/providers/register
// @desc    Register as a new provider
// @access  Public
router.post(
  "/register",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "aadhar", maxCount: 1 },
    { name: "kitchenPhoto", maxCount: 1 },
  ]),
  registerProvider
);

// Public listing
router.get("/", getAllApprovedProviders);

// @route   GET /api/providers/me
// @desc    Get current provider's profile
// @access  Private (Provider only)
router.get(
  "/me",
  authenticateUser,
  allowRoles("PROVIDER"),
  getMyProviderProfile
);

// @route   PUT /api/providers/me
// @desc    Update current provider's profile
// @access  Private (Provider only)
router.put(
  "/me",
  authenticateUser,
  allowRoles("PROVIDER"),
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  updateMyProviderProfile
);

// Public single profile fetch
router.get("/:id", getProviderById);

module.exports = router;