const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { authenticateUser } = require("../middleware/authMiddleware");

// Customer routes
router.post("/", authenticateUser, bookingController.createOrder);
router.get("/customer", authenticateUser, bookingController.getCustomerOrders);

// Provider routes
router.get("/provider", authenticateUser, bookingController.getProviderOrders);
router.patch("/provider/:orderId/status", authenticateUser, bookingController.updateOrderStatus);

module.exports = router;
