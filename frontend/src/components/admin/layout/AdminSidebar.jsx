import React, { useState, useEffect } from "react";
import {
  Shield,
  X,
  Sliders,
  UserCheck,
  Utensils,
  Users,
  LogOut
} from "lucide-react";
import api from "../../../services/api";
import { getSocket } from "../../../services/socket";
import { useAuth } from "../../../context/AuthContext";

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  logout,
  navigate
}) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/chat/conversations");
      if (res.data.success) {
        let total = 0;
        res.data.conversations.forEach((convo) => {
          if (convo.type === "ADMIN_PROVIDER") {
            total += convo.unreadCount || 0;
          }
        });
        setUnreadCount(total);
      }
    } catch (err) {
      console.error("Failed to fetch admin unread count:", err);
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
        if (!isChatActive && message.senderRole === "PROVIDER") {
          // Increment unread count by 1 for incoming provider message
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

  // Sync when activeTab changes
  useEffect(() => {
    fetchUnreadCount();
  }, [activeTab]);

  return (
    <>
      {/* Sidebar Backdrop for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-25 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-full flex-shrink-0 fixed lg:relative z-30 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white leading-tight">
                Shantabai <span className="text-indigo-400">Admin</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Control Panel</p>
            </div>
          </div>
          {/* Close Sidebar Button for Mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer touch-target"
            title="Close Navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {[
            { id: "dashboard", label: "Overview", icon: Sliders },
            { id: "providers", label: "Home Cooks", icon: UserCheck },
            { id: "foods", label: "Food Listings", icon: Utensils },
            { id: "users", label: "User Accounts", icon: Users }
          ].map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false); // Close sidebar on selection on mobile
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  active 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15" 
                    : "hover:bg-slate-800/80 hover:text-slate-100"
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${active ? "text-white" : "text-slate-400 group-hover:text-slate-100"}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.id === "providers" && unreadCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold hover:bg-rose-500/10 hover:text-rose-400 transition-colors text-slate-400 cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5 text-slate-400" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
