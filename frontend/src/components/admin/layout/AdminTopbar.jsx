import React from "react";
import { Menu } from "lucide-react";

export default function AdminTopbar({ activeTab, setSidebarOpen, user }) {
  // Format the display title based on active tab
  const getDisplayTitle = () => {
    if (activeTab === "dashboard") return "Overview";
    if (activeTab === "providers") return "Home Cooks";
    if (activeTab === "foods") return "Food Listings";
    if (activeTab === "users") return "User Accounts";
    return activeTab;
  };

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white px-4 sm:px-8 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {/* Sidebar Toggle Button for Mobile */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-650 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer touch-target flex-shrink-0"
          title="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-black text-slate-900 capitalize truncate">
            {getDisplayTitle()}
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-400 font-medium truncate">Verify partners, dishes, and oversee system users</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:flex bg-slate-100 rounded-full py-1.5 px-3 border border-slate-200 text-slate-600 text-xs font-bold items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Admin Mode Active</span>
        </div>
        <div className="hidden sm:block w-px h-8 bg-slate-200" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
            {(user?.name || "A").charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-bold text-slate-700 hidden sm:inline">{user?.name || "Administrator"}</span>
        </div>
      </div>
    </header>
  );
}
