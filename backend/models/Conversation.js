const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["CUSTOMER_PROVIDER", "ADMIN_PROVIDER"],
      required: true,
    },
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["CUSTOMER", "PROVIDER", "ADMIN"],
          required: true,
        },
      },
    ],
    lastMessage: {
      type: String,
      default: "",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
conversationSchema.index({ "participants.userId": 1 });
conversationSchema.index({ type: 1 });

module.exports = mongoose.model("Conversation", conversationSchema);
