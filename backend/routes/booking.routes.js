const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/bookingController");
const { authenticateUser } = require("../middleware/authMiddleware");

/* ==========================================
   CUSTOMER ROUTES
========================================== */

// Create booking
router.post(
  "/",
  authenticateUser,
  bookingController.createOrder
);

// Get customer's bookings
router.get(
  "/customer",
  authenticateUser,
  bookingController.getCustomerOrders
);

// Cancel booking (Customer)
router.patch(
  "/customer/:orderId/cancel",
  authenticateUser,
  (req, res, next) => {
    req.body.status = "CANCELLED";
    next();
  },
  bookingController.updateOrderStatus
);

/* ==========================================
   PROVIDER ROUTES
========================================== */

// Get provider bookings
router.get(
  "/provider",
  authenticateUser,
  bookingController.getProviderOrders
);

// Update booking status
router.patch(
  "/provider/:orderId/status",
  authenticateUser,
  bookingController.updateOrderStatus
);

module.exports = router;