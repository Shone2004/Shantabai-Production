const express = require("express");
const router = express.Router();

const {
  registerProvider,
  getMyProviderProfile,
  updateMyProviderProfile,
  getAllApprovedProviders,
  getAllVerifiedProviders,
  getProviderById,
  getUniqueLocations,
  reverseGeocode,
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

// Public listing (all approved)
router.get("/", getAllApprovedProviders);

// Public listing (verified + available) — used by ChefSection & AIConsultant
// IMPORTANT: must be declared before /:id to avoid route collision
router.get("/verified", getAllVerifiedProviders);

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

// Public locations list
router.get("/locations", getUniqueLocations);

// Reverse geocode lat/lng to city/area
router.get("/reverse-geocode", reverseGeocode);

// Public single profile fetch
router.get("/:id", getProviderById);

module.exports = router;