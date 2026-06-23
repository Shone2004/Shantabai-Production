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
  if (currentUser) {
    currentUserGlobal = currentUser;
    console.log("⚡ Updated global user context for Socket.IO:", currentUserGlobal.name);
  }

  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("Socket connection skipped: No authentication token found.");
    return null;
  }

  // If socket is already connected, update the user context reference and return it
  if (socket && socket.connected) {
    return socket;
  }

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
  const socketUrl = backendUrl.replace(/\/api\/?$/, "");

  socket = io(socketUrl, {
    auth: {
      token,
    },
    transports: ["websocket", "polling"],
  });

  requestNotificationPermission();

  socket.on("connect", () => {
    console.log("⚡ Socket.IO connected successfully");
  });

  // ==========================================
  // 🍽️ LIVE CHEF & FOOD MARKETPLACE LISTENERS
  // ==========================================
  
  // Listens for real-time menu items updating, selling out, or being added live
  socket.on("food_listing_updated", (data) => {
    console.log("🍲 [Marketplace Listener] Real-time food update received:", data);
    
    // Dispatches a global event for FindServices.jsx to instantly capture 
    const foodUpdateEvent = new CustomEvent("socket_food_updated", { detail: data });
    window.dispatchEvent(foodUpdateEvent);
  });

  // Listens for real-time chef changes (Chef going online, updating location, opening kitchen)
  socket.on("chef_status_updated", (data) => {
    console.log("👨‍🍳 [Marketplace Listener] Real-time chef status update received:", data);
    
    // Dispatches a global event for FindServices.jsx to update the chefs tab instantly
    const chefUpdateEvent = new CustomEvent("socket_chef_updated", { detail: data });
    window.dispatchEvent(chefUpdateEvent);
  });

  // ==========================================
  // 📨 CHAT & MESSAGE LISTENERS
  // ==========================================
  socket.on("receive_message", (message) => {
    const currentUserId = currentUserGlobal?._id || currentUserGlobal?.id;
    
    console.log("📨 [Global Service Listener] Message intercepted:", {
      messageId: message._id,
      senderId: message.senderId,
      currentUserId: currentUserId,
      activeChatId: window.activeChatId,
    });
    
    const messageEvent = new CustomEvent("socket_message_received", { detail: message });
    window.dispatchEvent(messageEvent);

    if (currentUserId && String(message.senderId) !== String(currentUserId)) {
      const isChatActive = window.activeChatId && String(window.activeChatId) === String(message.conversationId);
      
      if (!isChatActive) {
        console.log("🔔 Triggering background message alerts...");
        playNotificationSound();

        const senderLabel =
          message.senderRole === "ADMIN"
            ? "Support Admin"
            : message.senderRole === "PROVIDER"
            ? "Chef"
            : "Customer";

        startTitleFlash(senderLabel);
        showDesktopNotification(senderLabel, message.text);
      } else {
        console.log("🔕 Alert suppressed: Chat is active on screen.");
      }
    }
  });

  socket.on("support_notification", (notification) => {
    console.log("📨 [Global Support Listener] Support notification received:", notification);
    
    const isCurrentTicketActive = window.activeTicketId && String(window.activeTicketId) === String(notification.ticketDbId);
    
    if (!isCurrentTicketActive) {
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