const SupportTicket = require("../models/SupportTicket");
const SupportMessage = require("../models/SupportMessage");
const User = require("../models/User");
const { getIO } = require("../services/socketService");

// 1. Create a support ticket (Customer only)
exports.createTicket = async (req, res) => {
  try {
    const { subject, category, priority, message } = req.body;
    const customerId = req.user._id;

    if (!subject || !category || !message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Subject, category, and initial message are required.",
      });
    }

    // Create ticket document
    const ticket = new SupportTicket({
      customerId,
      customerName: req.user.name,
      customerEmail: req.user.email,
      subject,
      category,
      priority: priority || "Low",
      status: "Open",
      lastMessage: message.trim(),
    });

    await ticket.save();

    // Create the first message
    const supportMessage = new SupportMessage({
      ticketId: ticket._id,
      senderId: customerId,
      senderRole: "CUSTOMER",
      message: message.trim(),
    });

    await supportMessage.save();

    // Send real-time Socket.IO notification to admins
    const io = getIO();
    if (io) {
      io.to("admins").emit("support_notification", {
        type: "NEW_TICKET",
        ticketId: ticket.ticketId,
        ticketDbId: ticket._id,
        customerName: ticket.customerName,
        subject: ticket.subject,
        priority: ticket.priority,
        category: ticket.category,
      });
    }

    return res.status(201).json({
      success: true,
      ticket,
      message: "Support ticket created successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating support ticket.",
      error: error.message,
    });
  }
};

// 2. Get customer tickets (Customer only)
exports.getCustomerTickets = async (req, res) => {
  try {
    const customerId = req.user._id;
    const tickets = await SupportTicket.find({ customerId })
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      tickets,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving your support tickets.",
      error: error.message,
    });
  }
};

// 3. Get all tickets (Admin only)
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({})
      .populate("customerId", "name email phone role profileImage createdAt")
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      tickets,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving support tickets.",
      error: error.message,
    });
  }
};

// 4. Get ticket details & messages (Customer / Admin)
exports.getTicketDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const ticket = await SupportTicket.findById(id)
      .populate("customerId", "name email phone role profileImage createdAt")
      .lean();

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found.",
      });
    }

    // Security: Only creator or admins can view
    if (userRole !== "ADMIN" && ticket.customerId._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not authorized to view this ticket.",
      });
    }

    // Fetch conversation messages
    const messages = await SupportMessage.find({ ticketId: id })
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      ticket,
      messages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving support ticket details.",
      error: error.message,
    });
  }
};

// 5. Send message reply in ticket (Customer / Admin)
exports.sendTicketMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message text is required.",
      });
    }

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found.",
      });
    }

    // Security: Only creator or admins can reply
    if (userRole !== "ADMIN" && ticket.customerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not authorized to reply to this ticket.",
      });
    }

    // Save message
    const supportMessage = new SupportMessage({
      ticketId: id,
      senderId: userId,
      senderRole: userRole,
      message: message.trim(),
    });

    await supportMessage.save();

    // Update ticket metadata
    ticket.lastMessage = message.trim();
    // If ticket was Closed/Resolved, maybe auto reopen on customer message?
    // Let's just update lastMessage and updatedAt
    await ticket.save();

    const io = getIO();
    if (io) {
      const roomName = `ticket_${id}`;
      // Emit the message in real-time to everyone in the ticket room
      io.to(roomName).emit("receive_ticket_message", supportMessage);

      // Emit notifications
      if (userRole === "CUSTOMER") {
        // Notify admins
        io.to("admins").emit("support_notification", {
          type: "CUSTOMER_MESSAGE",
          ticketId: ticket.ticketId,
          ticketDbId: ticket._id,
          customerName: ticket.customerName,
          message: message.trim(),
        });
      } else {
        // Notify customer
        io.to(`user_${ticket.customerId}`).emit("support_notification", {
          type: "ADMIN_REPLY",
          ticketId: ticket.ticketId,
          ticketDbId: ticket._id,
          message: message.trim(),
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: supportMessage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error sending message.",
      error: error.message,
    });
  }
};

// 6. Update ticket status (Admin only)
exports.updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["Open", "In Progress", "Resolved", "Closed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value. Must be Open, In Progress, Resolved, or Closed.",
      });
    }

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found.",
      });
    }

    ticket.status = status;
    await ticket.save();

    const io = getIO();
    if (io) {
      const roomName = `ticket_${id}`;
      // Notify active room users of the status change
      io.to(roomName).emit("ticket_status_updated", {
        ticketId: ticket.ticketId,
        ticketDbId: ticket._id,
        status,
      });

      // Notify customer globally
      io.to(`user_${ticket.customerId}`).emit("support_notification", {
        type: "STATUS_CHANGED",
        ticketId: ticket.ticketId,
        ticketDbId: ticket._id,
        status,
      });
    }

    return res.status(200).json({
      success: true,
      ticket,
      message: `Ticket status updated to ${status}.`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating ticket status.",
      error: error.message,
    });
  }
};
