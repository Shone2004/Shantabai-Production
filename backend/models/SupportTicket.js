const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Booking Issue",
        "Payment",
        "Provider Issue",
        "Food Quality",
        "Account",
        "Technical Problem",
        "Other",
      ],
    },
    priority: {
      type: String,
      required: true,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },
    status: {
      type: String,
      required: true,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },
    lastMessage: {
      type: String,
      default: "Ticket created",
    },
    attachments: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate human-friendly ticketId (e.g. SUP-0001, SUP-0002)
supportTicketSchema.pre("save", async function () {
  if (!this.ticketId) {
    const count = await this.constructor.countDocuments();
    const nextNum = count + 1;
    this.ticketId = `SUP-${String(nextNum).padStart(4, "0")}`;
  }
});

module.exports = mongoose.model("SupportTicket", supportTicketSchema);
