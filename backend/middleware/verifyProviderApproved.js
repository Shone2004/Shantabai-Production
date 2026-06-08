const ProviderProfile = require("../models/ProviderProfile");

/**
 * Middleware to restrict route access to approved providers only.
 * Expects authenticateUser to have run and attached req.user.
 */
const verifyProviderApproved = async (req, res, next) => {
  try {
    // 1. Check if user is authenticated
    if (!req.user) {
      return res.status(500).json({
        success: false,
        message: "Authorization misconfiguration. Authentication middleware missing.",
      });
    }

    // 2. Only enforce verification checks for PROVIDER role
    if (req.user.role === "PROVIDER") {
      const profile = await ProviderProfile.findOne({ user: req.user._id });

      if (!profile) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Provider profile not found. Please complete onboarding.",
        });
      }

      if (profile.verificationStatus !== "APPROVED") {
        return res.status(403).json({
          success: false,
          message: `Access denied. Your chef profile is current status: '${profile.verificationStatus}'. Only approved chefs can perform dashboard operations.`,
          verificationStatus: profile.verificationStatus,
        });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error checking provider verification status.",
      error: error.message,
    });
  }
};

module.exports = {
  verifyProviderApproved,
};
