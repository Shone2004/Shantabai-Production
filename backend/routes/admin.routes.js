const express = require("express");
const router = express.Router();

const {
  getAdminStats,
  getProviders,
  approveProvider,
  rejectProvider,
  suspendProvider,
  getFoods,
  approveFood,
  rejectFood,
  getUsers,
  deleteFood,
} = require("../controllers/admin.controller");

const { authenticateUser } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

// All admin routes are locked behind authentication and ADMIN role restriction
router.use(authenticateUser);
router.use(allowRoles("ADMIN"));

router.get("/stats", getAdminStats);
router.get("/providers", getProviders);
router.put("/providers/:id/approve", approveProvider);
router.put("/providers/:id/reject", rejectProvider);
router.put("/providers/:id/suspend", suspendProvider);
router.get("/foods", getFoods);
router.put("/foods/:id/approve", approveFood);
router.put("/foods/:id/reject", rejectFood);
router.delete("/foods/:id", deleteFood);
router.get("/users", getUsers);

module.exports = router;
