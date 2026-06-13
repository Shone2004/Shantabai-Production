import React, { useState, useEffect } from "react";
import {
  Home,
  Search,
  Calendar,
  Heart,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { getSocket } from "../../services/socket";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/chat/conversations");
      if (res.data.success) {
        let total = 0;
        res.data.conversations.forEach((convo) => {
          if (convo.type === "CUSTOMER_PROVIDER") {
            total += convo.unreadCount || 0;
          }
        });
        setUnreadCount(total);
      }
    } catch (err) {
      console.error("Failed to fetch customer unread count:", err);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchUnreadCount();

    // Listen to socket events for real-time badge updates
    const socket = getSocket();
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      const userId = user?.id || user?._id;
      if (userId && String(message.senderId) !== String(userId)) {
        const isChatActive = window.activeChatId && String(window.activeChatId) === String(message.conversationId);
        if (!isChatActive) {
          // Increment unread count by 1 for incoming customer/provider message
          setUnreadCount((prev) => prev + 1);
        }
      }
    };

    const handleMessagesRead = () => {
      // Re-sync unread counts
      fetchUnreadCount();
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("messages_read", handleMessagesRead);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("messages_read", handleMessagesRead);
    };
  }, [user?._id, user?.id]);

  // Sync when activeTab changes (e.g. going back to dashboard)
  useEffect(() => {
    fetchUnreadCount();
  }, [activeTab]);

  const handleLogoutClick = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="w-full lg:w-64 bg-white shadow-lg border-r border-gray-100 lg:min-h-screen p-5">
      <div className="flex justify-center mb-8">
        <img
          src="/logonavbar.png"
          alt="ShantaBai Logo"
          className="h-16 w-auto object-contain"
        />
      </div>

      <div className="space-y-3">
        {/* Dashboard */}
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center gap-3 w-full p-3 rounded-xl transition cursor-pointer ${
            activeTab === "dashboard"
              ? "bg-brand-green text-white shadow-sm"
              : "hover:bg-brand-light text-gray-700"
          }`}
        >
          <Home size={20} />
          Dashboard
        </button>

        {/* Find Services */}
        <button
          onClick={() => setActiveTab("find-services")}
          className={`flex items-center gap-3 w-full p-3 rounded-xl transition cursor-pointer ${
            activeTab === "find-services"
              ? "bg-brand-green text-white shadow-sm"
              : "hover:bg-brand-light text-gray-700"
          }`}
        >
          <Search size={20} />
          Find Services
        </button>

        {/* Bookings */}
        <button
          onClick={() => setActiveTab("bookings")}
          className={`flex items-center gap-3 w-full p-3 rounded-xl transition cursor-pointer ${
            activeTab === "bookings"
              ? "bg-brand-green text-white shadow-sm"
              : "hover:bg-brand-light text-gray-700"
          }`}
        >
          <Calendar size={20} />
          <span className="flex-1 text-left">My Bookings</span>
          {unreadCount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Favorites */}
        <button
          onClick={() => setActiveTab("favorites")}
          className={`flex items-center gap-3 w-full p-3 rounded-xl transition cursor-pointer ${
            activeTab === "favorites"
              ? "bg-brand-green text-white shadow-sm"
              : "hover:bg-brand-light text-gray-700"
          }`}
        >
          <Heart size={20} />
          Favorites
        </button>

        {/* Logout */}
        <button
          onClick={handleLogoutClick}
          className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-50 text-red-500 transition mt-6 cursor-pointer"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;