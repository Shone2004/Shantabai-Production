const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");
const { authenticateUser } = require("../middleware/authMiddleware");

// All routes require authentication
router.get("/conversations", authenticateUser, chatController.getConversations);
router.post("/conversation", authenticateUser, chatController.getOrCreateConversation);
router.get("/conversations/:conversationId/messages", authenticateUser, chatController.getConversationMessages);
router.post("/messages", authenticateUser, chatController.sendMessage);
router.put("/conversations/:conversationId/read", authenticateUser, chatController.markAsRead);

module.exports = router;
