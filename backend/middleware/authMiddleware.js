const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware to authenticate requests using a JWT.
 * Extracts the bearer token, verifies it, fetches the corresponding User,
 * and attaches it to req.user.
 */
const authenticateUser = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Format: "Bearer <token>"
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No authentication token provided.",
      });
    }

    // Verify token
    let decoded;
    try {
  console.log("TOKEN:", token);

  decoded = jwt.verify(token, process.env.JWT_SECRET);

  console.log("DECODED TOKEN:", decoded);

} catch (err) {
  console.log("JWT ERROR:", err);

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Authentication token has expired. Please log in again.",
    });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid authentication token. Authorization failed.",
  });
}
    // Fetch user from DB (excluding password)
    const user = await User.findById(decoded.id || decoded.user?.id || decoded._id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User associated with this token no longer exists.",
      });
    }
    console.log("FOUND USER:", user);

    // Attach user to request context
    req.user = user;
    
    // --- ADDED FOR COMPATIBILITY (DO NOT DELETE) ---
    // Guarantees that req.user.id is explicitly stringified and accessible 
    // for controllers tracking subscriptions via structural string matching
    if (!req.user.id && req.user._id) {
      req.user.id = req.user._id.toString();
    }
    // -----------------------------------------------

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error during authentication.",
      error: error.message,
    });
  }
};

module.exports = {
  authenticateUser,
};