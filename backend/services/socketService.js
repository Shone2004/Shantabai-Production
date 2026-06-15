const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Allow all origins or specify frontend origins
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true,
    },
  });

  // Authentication Middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error("Authentication error: Token not provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.error("Socket Auth Error:", err.message);
      return next(new Error("Authentication error: Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.user.name} (${socket.user.role}) [ID: ${socket.id}]`);

    // Join personal room for background alerts
    socket.join(`user_${socket.user._id}`);
    console.log(`👤 User ${socket.user.name} joined personal room: user_${socket.user._id}`);

    // Join admins room if role is ADMIN
    if (socket.user.role === "ADMIN") {
      socket.join("admins");
      console.log(`🔑 Admin ${socket.user.name} joined room: admins`);
    }

    // Client -> Server: Join room conversation_<conversationId>
    socket.on("join_conversation", async ({ conversationId }) => {
      try {
        if (!conversationId) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          socket.emit("error_message", { message: "Conversation not found" });
          return;
        }

        // Verify participant authorization
        const isParticipant = conversation.participants.some(
          (p) => p.userId.toString() === socket.user._id.toString()
        );

        if (!isParticipant) {
          socket.emit("error_message", {
            message: "Access denied. You are not authorized for this conversation.",
          });
          return;
        }

        const roomName = `conversation_${conversationId}`;
        socket.join(roomName);
        console.log(`👤 User ${socket.user.name} joined room: ${roomName}`);
      } catch (err) {
        console.error("Error in join_conversation socket event:", err);
        socket.emit("error_message", { message: "Internal server error joining conversation" });
      }
    });

    // Client -> Server: Join support ticket room ticket_<ticketId>
    socket.on("join_ticket", async ({ ticketId }) => {
      try {
        if (!ticketId) return;

        const SupportTicket = require("../models/SupportTicket");
        const ticket = await SupportTicket.findById(ticketId);
        if (!ticket) {
          socket.emit("error_message", { message: "Support ticket not found" });
          return;
        }

        // Verify participant authorization
        const isCreator = ticket.customerId.toString() === socket.user._id.toString();
        const isAdmin = socket.user.role === "ADMIN";

        if (!isCreator && !isAdmin) {
          socket.emit("error_message", {
            message: "Access denied. You are not authorized for this support ticket conversation.",
          });
          return;
        }

        const roomName = `ticket_${ticketId}`;
        socket.join(roomName);
        console.log(`👤 User ${socket.user.name} joined ticket room: ${roomName}`);
      } catch (err) {
        console.error("Error in join_ticket socket event:", err);
        socket.emit("error_message", { message: "Internal server error joining ticket room" });
      }
    });

    // Client -> Server: Send message
    socket.on("send_message", async ({ conversationId, text }) => {
      try {
        if (!conversationId || !text || !text.trim()) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          socket.emit("error_message", { message: "Conversation not found" });
          return;
        }

        // Verify participant authorization
        const isParticipant = conversation.participants.some(
          (p) => p.userId.toString() === socket.user._id.toString()
        );

        if (!isParticipant) {
          socket.emit("error_message", {
            message: "Access denied. You are not authorized for this conversation.",
          });
          return;
        }

        // Save message to MongoDB
        const message = new Message({
          conversationId,
          senderId: socket.user._id,
          senderRole: socket.user.role,
          text: text.trim(),
        });
        await message.save();

        // Update Conversation metadata
        conversation.lastMessage = text.trim();
        conversation.lastMessageAt = new Date();
        await conversation.save();

        const roomName = `conversation_${conversationId}`;

        // Server -> Client: Broadcast new message to the room
        io.to(roomName).emit("receive_message", message);

        // Also broadcast to each participant's personal room for background alerts
        conversation.participants.forEach((participant) => {
          io.to(`user_${participant.userId}`).emit("receive_message", message);
          
          // Emit conversation metadata updates for real-time sidebar list updates
          io.to(`user_${participant.userId}`).emit("conversation_updated", {
            conversationId,
            lastMessage: text.trim(),
            lastMessageAt: conversation.lastMessageAt,
            senderId: socket.user._id,
          });
        });

      } catch (err) {
        console.error("Error in send_message socket event:", err);
        socket.emit("error_message", { message: "Internal server error sending message" });
      }
    });

    // Client -> Server: Mark read
    socket.on("mark_read", async ({ conversationId }) => {
      try {
        if (!conversationId) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        // Verify participant authorization
        const isParticipant = conversation.participants.some(
          (p) => p.userId.toString() === socket.user._id.toString()
        );

        if (!isParticipant) return;

        // Mark incoming messages as read
        await Message.updateMany(
          {
            conversationId,
            senderId: { $ne: socket.user._id },
            isRead: false,
          },
          {
            $set: { isRead: true },
          }
        );

        const roomName = `conversation_${conversationId}`;

        // Server -> Client: Notify read status update
        io.to(roomName).emit("messages_read", {
          conversationId,
          readBy: socket.user._id,
        });
      } catch (err) {
        console.error("Error in mark_read socket event:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.user.name}`);
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

module.exports = {
  initSocket,
  getIO,
};
