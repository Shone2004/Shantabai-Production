import { io } from "socket.io-client";
import {
  playNotificationSound,
  startTitleFlash,
  showDesktopNotification,
  requestNotificationPermission,
} from "./notifications";

let socket = null;
let currentUserGlobal = null;

export const initSocket = (currentUser) => {
  // Update the global user context reference on every login/refresh call
  if (currentUser) {
    currentUserGlobal = currentUser;
    console.log("⚡ Updated global user context for Socket.IO:", currentUserGlobal.name);
  }

  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("Socket connection skipped: No authentication token found.");
    return null;
  }

  if (socket && socket.connected) {
    return socket;
  }

  // Strip /api from backend URL to get socket root
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
  const socketUrl = backendUrl.replace(/\/api\/?$/, "");

  socket = io(socketUrl, {
    auth: {
      token,
    },
    transports: ["websocket", "polling"],
  });

  // Request browser push notification permissions
  requestNotificationPermission();

  socket.on("connect", () => {
    console.log("⚡ Socket.IO connected successfully");
  });

  // Global background listener for new message alerts
  socket.on("receive_message", (message) => {
    const currentUserId = currentUserGlobal?._id || currentUserGlobal?.id;
    console.log("📨 [Global Listener] Received message event:", {
      messageId: message._id,
      senderId: message.senderId,
      currentUserId: currentUserId,
      activeChatId: window.activeChatId,
      messageConvoId: message.conversationId,
    });
    
    // Alert only if the message is from someone else
    if (currentUserId && String(message.senderId) !== String(currentUserId)) {
      const isChatActive = window.activeChatId && String(window.activeChatId) === String(message.conversationId);
      
      if (!isChatActive) {
        console.log("🔔 Triggering background message alerts (sound, flash, popup)...");
        
        // Trigger Audio Chime (Synth)
        playNotificationSound();

        // Resolve generic display name
        const senderLabel =
          message.senderRole === "ADMIN"
            ? "Support Admin"
            : message.senderRole === "PROVIDER"
            ? "Chef"
            : "Customer";

        // Flash Browser Tab Title
        startTitleFlash(senderLabel);

        // Show HTML5 Push Notification
        showDesktopNotification(senderLabel, message.text);
      } else {
        console.log("🔕 Alert suppressed: Chat is active on screen.");
      }
    }
  });

  // Global background listener for support ticket alerts
  socket.on("support_notification", (notification) => {
    console.log("📨 [Global Support Listener] Support notification received:", notification);
    
    // Check if user is currently viewing the active ticket
    const isCurrentTicketActive = window.activeTicketId && String(window.activeTicketId) === String(notification.ticketDbId);
    
    if (!isCurrentTicketActive) {
      // Dispatch custom window event to trigger list reloading or local updates
      const event = new CustomEvent("support_notification_alert", { detail: notification });
      window.dispatchEvent(event);
    }
  });

  socket.on("connect_error", (err) => {
    console.error("⚡ Socket.IO connection error:", err.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("⚡ Socket.IO disconnected:", reason);
  });

  return socket;
};

export const getSocket = (currentUser) => {
  if (currentUser) {
    currentUserGlobal = currentUser;
  }
  if (!socket) {
    return initSocket(currentUser);
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentUserGlobal = null;
    console.log("⚡ Socket.IO connection closed explicitly");
  }
};
