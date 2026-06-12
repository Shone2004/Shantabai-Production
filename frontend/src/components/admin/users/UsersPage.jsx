import React from "react";
import { Search } from "lucide-react";
import UserTable from "./UserTable";

export default function UsersPage({
  users,
  usersLoading,
  userRoleFilter,
  setUserRoleFilter,
  userSearchQuery,
  setUserSearchQuery,
  setSelectedUser,
  setIsUserModalOpen
}) {
  const filteredUsers = users.filter(u => {
    if (userRoleFilter !== "ALL" && u.role !== userRoleFilter) return false;
    const query = userSearchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      (u.name || "").toLowerCase().includes(query) ||
      (u.email || "").toLowerCase().includes(query) ||
      (u.phone || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm animate-fadeIn">
      
      {/* Header with Search and Tab filters */}
      <div className="p-6 border-b border-slate-100 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-sans">User Account Management</h3>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">Filter, search, inspect credentials, and manage active system accounts</p>
          </div>
          {/* Search Input */}
          <div className="relative w-full md:max-w-xs flex-shrink-0">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
            />
          </div>
        </div>

        {/* Tabs/Chips filters */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50">
          {[
            { id: "ALL", label: "All Users", count: users.length },
            { id: "PROVIDER", label: "Home Cooks", count: users.filter(u => u.role === "PROVIDER").length, color: "text-teal-700 bg-teal-50 border-teal-100" },
            { id: "CUSTOMER", label: "Customers", count: users.filter(u => u.role === "CUSTOMER").length, color: "text-blue-700 bg-blue-50 border-blue-100" },
            { id: "ADMIN", label: "Admins", count: users.filter(u => u.role === "ADMIN").length, color: "text-indigo-700 bg-indigo-50 border-indigo-100" }
          ].map(chip => (
            <button
              key={chip.id}
              onClick={() => setUserRoleFilter(chip.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                userRoleFilter === chip.id
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span>{chip.label}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${
                userRoleFilter === chip.id
                  ? "bg-slate-800 text-white"
                  : chip.color || "bg-slate-100 text-slate-500"
              }`}>
                {chip.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {usersLoading ? (
        <div className="p-12 text-center text-slate-400 font-semibold">Loading user accounts...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 text-center text-slate-400 font-semibold">No accounts match this criteria.</div>
      ) : (
        <UserTable
          filteredUsers={filteredUsers}
          setSelectedUser={setSelectedUser}
          setIsUserModalOpen={setIsUserModalOpen}
        />
      )}
    </div>
  );
}
