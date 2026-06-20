import React, { useState, useEffect } from "react";
import {
  Home,
  LayoutDashboard,
  LifeBuoy,
  Search,
  Calendar,
  Heart,
  LogOut,
  Menu,
  X,
  Bell,
  MessageSquare,
  Crown
} from "lucide-react";

import api from "../../services/api";
import { getSocket } from "../../services/socket";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [supportCount, setSupportCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false); // Mobile drawer open state

  // Scroll lock on mobile when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/chat/conversations");
      if (res.data.success) {
        console.log("🔍 SIDEBAR CONVO DATA TYPE CHECK:", res.data.conversations);

        let total = 0;
        res.data.conversations.forEach((convo) => {
          if (
            convo.type === "CUSTOMER_PROVIDER" ||
            convo.type === "BOOKING" ||
            convo.type === "BOOKING_CHAT"
          ) {
            total += convo.unreadCount || 0;
          }
        });
        setUnreadCount(total);
      }
    } catch (err) {
      console.error("Failed to fetch customer unread count:", err);
    }
  };

  const fetchSupportCount = async () => {
    try {
      const res = await api.get("/support/tickets");
      if (res.data.success) {
        const openTickets = res.data.tickets.filter(
          (t) => t.status === "Open" || t.status === "In Progress"
        );
        setSupportCount(openTickets.length);
      }
    } catch (err) {
      console.error("Failed to fetch customer support count:", err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    fetchSupportCount();

    const socket = getSocket(user);
    if (!socket) return;

    const handleCustomIncomingMessage = (event) => {
      const message = event.detail;
      const userId = user?.id || user?._id;

      if (userId && String(message.senderId) !== String(userId)) {
        const isChatActive =
          window.activeChatId &&
          String(window.activeChatId) === String(message.conversationId);

        if (!isChatActive) {
          setUnreadCount((prev) => prev + 1);
        }
      }
    };

    const handleMessagesRead = () => {
      fetchUnreadCount();
    };

    const handleSupportNotification = () => {
      fetchSupportCount();
    };

    window.addEventListener("socket_message_received", handleCustomIncomingMessage);
    socket.on("messages_read", handleMessagesRead);
    socket.on("support_notification", handleSupportNotification);

    return () => {
      window.removeEventListener("socket_message_received", handleCustomIncomingMessage);
      socket.off("messages_read", handleMessagesRead);
      socket.off("support_notification", handleSupportNotification);
    };
  }, [user?._id, user?.id]);

  useEffect(() => {
    fetchUnreadCount();
    fetchSupportCount();
  }, [activeTab]);

  const handleLogoutClick = () => {
    logout();
    window.location.href = "/"; // Native browser redirect
  };

  const handleNavClick = (tabId, isRoute = false, routePath = "") => {
    if (isRoute) {
      window.location.href = routePath; // Native browser redirect instead of react-router
    } else {
      setActiveTab(tabId);
    }
    setIsOpen(false); 
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getActiveTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Dashboard";
      case "find-services":
        return "Find Services";
      case "subscription":
        return "Subscription";
      case "chats":
        return "Inbox Chats";
      case "bookings":
        return "My Bookings";
      case "favorites":
        return "Favorites";
      case "support":
        return "Support";
      default:
        return "Shantabai";
    }
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Native clickable redirect block — Fixed z-index added */}
        <div 
          onClick={() => handleNavClick("", true, "/")}
          className="relative z-50 flex items-center gap-3 px-2 cursor-pointer group select-none"
        >
          <img
            src="/logonavbar.png"
            alt="ShantaBai Logo"
            className="h-12 w-auto object-contain flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
          />
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-800 leading-tight transition-colors duration-200 group-hover:text-emerald-800">
              Shantabai
            </h1>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-0.5">
              Premium Kitchens
            </p>
          </div>
        </div>

        {/* Premium Profile Card */}
        <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500/20"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-100 text-brand-green flex items-center justify-center font-bold text-sm">
              {getInitials(user?.name)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-slate-800 text-xs truncate leading-normal">
              {user?.name || "Customer Account"}
            </h4>
            <span className="inline-flex items-center bg-emerald-50 text-brand-green text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-100 mt-1">
              Verified User
            </span>
          </div>
        </div>

        {/* Navigation Link Groups */}
        <div className="space-y-6">
          <div>
            <h5 className="px-2 text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Main
            </h5>
            <div className="space-y-1">
              <button
                onClick={() => handleNavClick("", true, "/")}
                className="flex items-center gap-3.5 w-full p-3 rounded-xl transition text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
              >
                <Home size={18} />
                <span>Home</span>
              </button>

              <button
                onClick={() => handleNavClick("dashboard")}
                className={`flex items-center gap-3.5 w-full p-3 rounded-xl transition text-xs font-bold cursor-pointer ${
                  activeTab === "dashboard"
                    ? "bg-gradient-to-r from-emerald-800 to-brand-green text-white shadow-md shadow-emerald-800/15"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => handleNavClick("find-services")}
                className={`flex items-center gap-3.5 w-full p-3 rounded-xl transition text-xs font-bold cursor-pointer ${
                  activeTab === "find-services"
                    ? "bg-gradient-to-r from-emerald-800 to-brand-green text-white shadow-md shadow-emerald-800/15"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Search size={18} />
                <span>Find Cooks / Services</span>
              </button>

              <button
                onClick={() => handleNavClick("chats")}
                className={`flex items-center gap-3.5 w-full p-3 rounded-xl transition text-xs font-bold cursor-pointer ${
                  activeTab === "chats"
                    ? "bg-gradient-to-r from-emerald-800 to-brand-green text-white shadow-md shadow-emerald-800/15"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <MessageSquare size={18} />
                <span className="flex-1 text-left">Inbox Chats</span>
                {unreadCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-black w-5.5 h-5.5 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div>
            <h5 className="px-2 text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Orders
            </h5>
            <div className="space-y-1">
              <button
                onClick={() => handleNavClick("bookings")}
                className={`flex items-center gap-3.5 w-full p-3 rounded-xl transition text-xs font-bold cursor-pointer ${
                  activeTab === "bookings"
                    ? "bg-gradient-to-r from-emerald-800 to-brand-green text-white shadow-md shadow-emerald-800/15"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Calendar size={18} />
                <span className="flex-1 text-left">My Bookings</span>
                {unreadCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-black w-5.5 h-5.5 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleNavClick("subscription")}
                className={`flex items-center gap-3.5 w-full p-3 rounded-xl transition text-xs font-bold cursor-pointer ${
                  activeTab === "subscription"
                    ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Crown size={18} />
                <span className="flex-1 text-left">Subscription</span>
                <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-1 rounded-full">
                  PRO
                </span>
              </button>

              <button
                onClick={() => handleNavClick("favorites")}
                className={`flex items-center gap-3.5 w-full p-3 rounded-xl transition text-xs font-bold cursor-pointer ${
                  activeTab === "favorites"
                    ? "bg-gradient-to-r from-emerald-800 to-brand-green text-white shadow-md shadow-emerald-800/15"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Heart size={18} />
                <span>Favorites</span>
              </button>
            </div>
          </div>

          <div>
            <h5 className="px-2 text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Help
            </h5>
            <div className="space-y-1">
              <button
                onClick={() => handleNavClick("support")}
                className={`flex items-center gap-3.5 w-full p-3 rounded-xl transition text-xs font-bold cursor-pointer ${
                  activeTab === "support"
                    ? "bg-gradient-to-r from-emerald-800 to-brand-green text-white shadow-md shadow-emerald-800/15"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <LifeBuoy size={18} />
                <span className="flex-1 text-left">Customer Support</span>
                {supportCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-black w-5.5 h-5.5 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                    {supportCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 bg-white">
        <button
          onClick={handleLogoutClick}
          className="flex items-center gap-3.5 w-full p-3 rounded-xl hover:bg-rose-50 text-rose-600 transition font-bold text-xs cursor-pointer"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. MOBILE STICKY TOP HEADER */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 z-40 lg:hidden shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 -ml-2 text-slate-600 hover:text-brand-green focus:outline-none cursor-pointer"
            title="Open Menu"
          >
            <Menu size={22} />
          </button>
          <img
            src="/logonavbar.png"
            alt="ShantaBai Logo"
            className="h-9 w-auto object-contain cursor-pointer"
            onClick={() => handleNavClick("", true, "/")}
          />
          <span className="font-extrabold text-sm text-slate-800 truncate max-w-[120px]">
            {getActiveTitle()}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-400 hover:text-brand-green" title="Notifications">
            <Bell size={20} />
          </button>
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover border border-slate-100"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-brand-green flex items-center justify-center font-bold text-[10px]">
              {getInitials(user?.name)}
            </div>
          )}
        </div>
      </header>

      {/* 2. MOBILE DRAWER OVERLAY & CONTAINER */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 w-[80%] max-w-[280px] bg-white z-50 lg:hidden flex flex-col h-full shadow-2xl transition-transform duration-300 ease-in-out transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute top-4 right-4 z-30">
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 h-full overflow-hidden">
          {renderSidebarContent()}
        </div>
      </aside>

      {/* 3. DESKTOP STATIC LEFT SIDEBAR */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:h-screen lg:fixed lg:top-0 lg:left-0 bg-white border-r border-slate-100 shadow-xs z-30">
        <div className="flex-1 h-full overflow-hidden">
          {renderSidebarContent()}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;