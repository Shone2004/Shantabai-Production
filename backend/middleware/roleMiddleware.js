/**
 * Middleware generator to restrict route access to specific roles.
 * Expects authenticateUser to have run and attached req.user.
 *
 * @param {...string} allowedRoles - Roles allowed to access this route (e.g., 'CUSTOMER', 'PROVIDER', 'ADMIN')
 */
const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // 1. Ensure authenticateUser has run and populated req.user
    if (!req.user) {
      return res.status(500).json({
        success: false,
        message: "Authorization misconfiguration. Authentication middleware missing.",
      });
    }

    // 2. Normalize and check roles
    const userRole = req.user.role ? req.user.role.toUpperCase() : "";

    const normalizedAllowedRoles = allowedRoles.map((role) => {
      const upperRole = role.toUpperCase();
      // Map "CHEF" (frontend terminology) to "PROVIDER" (backend database enum) to avoid routing mismatch
      if (upperRole === "CHEF") {
        return "PROVIDER";
      }
      return upperRole;
    });

    // 3. Verify role permission
    if (!normalizedAllowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized to access this resource.`,
      });
    }

    next();
  };
};

module.exports = {
  allowRoles,
};
