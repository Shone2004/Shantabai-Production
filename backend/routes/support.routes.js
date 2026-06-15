const express = require("express");
const router = express.Router();
const supportController = require("../controllers/support.controller");
const { authenticateUser } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

// All support routes require JWT authentication
router.use(authenticateUser);

// Customer-only endpoints
router.post("/tickets", allowRoles("CUSTOMER"), supportController.createTicket);
router.get("/tickets", allowRoles("CUSTOMER"), supportController.getCustomerTickets);

// Shared endpoints (Customer owner / Admin)
router.get("/tickets/:id", supportController.getTicketDetails);
router.post("/tickets/:id/messages", supportController.sendTicketMessage);

// Admin-only endpoints
router.get("/admin/tickets", allowRoles("ADMIN"), supportController.getAllTickets);
router.put("/tickets/:id/status", allowRoles("ADMIN"), supportController.updateTicketStatus);

module.exports = router;
