const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const ProviderProfile = require("../models/ProviderProfile");

// Get all conversations for the authenticated user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find conversations where the current user is a participant
    let conversations = await Conversation.find({
      "participants.userId": userId,
    })
      .sort({ lastMessageAt: -1 })
      .lean();

    // Populate user details and provider details for the other participants
    for (let convo of conversations) {
      convo.otherParticipant = null;

      for (let participant of convo.participants) {
        if (participant.userId.toString() !== userId.toString()) {
          // Fetch user details
          const participantUser = await User.findById(participant.userId)
            .select("name email phone role profileImage")
            .lean();

          if (participantUser) {
            participant.user = participantUser;

            // If the other participant is a provider, fetch their provider profile
            if (participant.role === "PROVIDER") {
              const providerProfile = await ProviderProfile.findOne({
                user: participant.userId,
              })
                .select("kitchenName avatar tagline")
                .lean();
              if (providerProfile) {
                participant.providerProfile = providerProfile;
              }
            }
            convo.otherParticipant = participant;
          }
        }
      }

      // Count unread messages in this conversation for the user
      const unreadCount = await Message.countDocuments({
        conversationId: convo._id,
        senderId: { $ne: userId },
        isRead: false,
      });
      convo.unreadCount = unreadCount;
    }

    // Filter out conversations where the other participant details couldn't be loaded (e.g. deleted user)
    conversations = conversations.filter((convo) => convo.otherParticipant);

    return res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving conversations",
      error: error.message,
    });
  }
};

// Start or retrieve a conversation
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { type, partnerId } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role; // CUSTOMER, PROVIDER, ADMIN

    let targetPartnerId = partnerId;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Conversation type is required",
      });
    }

    // Auto-resolve admin if missing for ADMIN_PROVIDER chat
    if (type === "ADMIN_PROVIDER" && !targetPartnerId && userRole === "PROVIDER") {
      const adminUser = await User.findOne({ role: "ADMIN" });
      if (!adminUser) {
        return res.status(404).json({
          success: false,
          message: "No administrator user found in the system.",
        });
      }
      targetPartnerId = adminUser._id;
    }

    if (!targetPartnerId) {
      return res.status(400).json({
        success: false,
        message: "Conversation partnerId is required",
      });
    }

    // Validate type and roles
    if (type === "CUSTOMER_PROVIDER") {
      // Must involve one CUSTOMER and one PROVIDER
      if (userRole !== "CUSTOMER" && userRole !== "PROVIDER") {
        return res.status(403).json({
          success: false,
          message: "Unauthorized conversation type for your role",
        });
      }
    } else if (type === "ADMIN_PROVIDER") {
      // Must involve one ADMIN and one PROVIDER
      if (userRole !== "ADMIN" && userRole !== "PROVIDER") {
        return res.status(403).json({
          success: false,
          message: "Unauthorized conversation type for your role",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation type",
      });
    }

    // Verify partner exists and get their role
    const partner = await User.findById(targetPartnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Conversation partner user not found",
      });
    }

    // Check matching roles
    if (type === "CUSTOMER_PROVIDER") {
      const roles = [userRole, partner.role];
      if (!roles.includes("CUSTOMER") || !roles.includes("PROVIDER")) {
        return res.status(400).json({
          success: false,
          message: "Customer-Provider chat must involve a customer and a provider",
        });
      }
    } else if (type === "ADMIN_PROVIDER") {
      const roles = [userRole, partner.role];
      if (!roles.includes("ADMIN") || !roles.includes("PROVIDER")) {
        return res.status(400).json({
          success: false,
          message: "Admin-Provider chat must involve an admin and a provider",
        });
      }
    }

    // Find existing conversation with exact participants
    let conversation = await Conversation.findOne({
      type,
      "participants.userId": { $all: [userId, targetPartnerId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        type,
        participants: [
          { userId, role: userRole },
          { userId: targetPartnerId, role: partner.role },
        ],
        lastMessage: "Conversation started",
        lastMessageAt: new Date(),
      });
      await conversation.save();
    }

    // Return conversation details populated
    const convoObj = conversation.toObject();
    convoObj.otherParticipant = null;

    for (let participant of convoObj.participants) {
      if (participant.userId.toString() !== userId.toString()) {
        const participantUser = await User.findById(participant.userId)
          .select("name email phone role profileImage")
          .lean();

        if (participantUser) {
          participant.user = participantUser;
          if (participant.role === "PROVIDER") {
            const providerProfile = await ProviderProfile.findOne({
              user: participant.userId,
            })
              .select("kitchenName avatar tagline")
              .lean();
            if (providerProfile) {
              participant.providerProfile = providerProfile;
            }
          }
          convoObj.otherParticipant = participant;
        }
      }
    }

    return res.status(200).json({
      success: true,
      conversation: convoObj,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error starting conversation",
      error: error.message,
    });
  }
};

// Get messages for a specific conversation
exports.getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Verify conversation exists and user is a participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.userId.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not a participant in this conversation.",
      });
    }

    // Fetch messages
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving messages",
      error: error.message,
    });
  }
};

// Send message via REST API (fallback / trigger)
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!conversationId || !text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID and message text are required",
      });
    }

    // Verify conversation exists and user is a participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.userId.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not a participant in this conversation.",
      });
    }

    // Create message
    const message = new Message({
      conversationId,
      senderId: userId,
      senderRole: userRole,
      text: text.trim(),
    });

    await message.save();

    // Update conversation metadata
    conversation.lastMessage = text.trim();
    conversation.lastMessageAt = new Date();
    await conversation.save();

    return res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error sending message",
      error: error.message,
    });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Verify conversation exists and user is a participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.userId.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not a participant in this conversation.",
      });
    }

    // Update messages
    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        isRead: false,
      },
      {
        $set: { isRead: true },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error marking messages as read",
      error: error.message,
    });
  }
};
