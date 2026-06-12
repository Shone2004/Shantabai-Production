import React from "react";
import { Eye } from "lucide-react";

export default function UserTable({
  filteredUsers,
  setSelectedUser,
  setIsUserModalOpen
}) {
  return (
    <>
      {/* Desktop and Tablet table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              <th className="py-4 px-6">Name</th>
              <th className="py-4 px-6">Email Address</th>
              <th className="py-4 px-6">Phone Number</th>
              <th className="py-4 px-6">Role</th>
              <th className="py-4 px-6">Joined Date</th>
              <th className="py-4 px-6 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map(u => (
              <tr key={u._id} className="text-xs hover:bg-slate-50/50">
                {/* Avatar and Name */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    {u.profileImage ? (
                      <img src={u.profileImage} className="w-9 h-9 rounded-full object-cover border border-slate-100 shadow-sm" alt="" loading="lazy" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shadow-sm">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-extrabold text-slate-900">{u.name}</span>
                  </div>
                </td>
                {/* Email */}
                <td className="py-4 px-6 text-slate-655 font-bold">
                  {u.email}
                </td>
                {/* Phone */}
                <td className="py-4 px-6 text-slate-500 font-semibold">
                  {u.phone ? `+91 ${u.phone}` : "N/A"}
                </td>
                {/* Role badge */}
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                    u.role === "ADMIN" 
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200" 
                      : u.role === "PROVIDER"
                      ? "bg-teal-50 text-teal-700 border-teal-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}>
                    {u.role}
                  </span>
                </td>
                {/* Created At */}
                <td className="py-4 px-6 text-slate-400 font-semibold">
                  {new Date(u.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })}
                </td>
                {/* View action */}
                <td className="py-4 px-6">
                  <button
                    onClick={() => { setSelectedUser(u); setIsUserModalOpen(true); }}
                    className="w-8 h-8 rounded-xl border border-slate-200 text-slate-550 hover:bg-slate-100 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-sm mx-auto"
                    title="View User Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked card list */}
      <div className="sm:hidden divide-y divide-slate-100">
        {filteredUsers.map(u => (
          <div key={u._id} className="p-4 space-y-3">
            <div className="flex gap-3">
              {u.profileImage ? (
                <img src={u.profileImage} className="w-12 h-12 rounded-full object-cover border border-slate-100 shadow-sm flex-shrink-0" alt="" loading="lazy" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-650 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {u.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-slate-900 truncate text-xs">{u.name}</h4>
                  <span className={`inline-flex shrink-0 px-1.5 py-0.2 rounded-full text-[8px] font-bold border uppercase tracking-wider ${
                    u.role === "ADMIN" 
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200" 
                      : u.role === "PROVIDER"
                      ? "bg-teal-50 text-teal-700 border-teal-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}>
                    {u.role}
                  </span>
                </div>
                <p className="text-[10px] text-slate-550 font-semibold mt-0.5 truncate">{u.email}</p>
                <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Phone: {u.phone ? `+91 ${u.phone}` : "N/A"}</p>
              </div>
            </div>
            
            {/* Card Action Buttons (min-h-[44px] touch targets) */}
            <div className="flex gap-2">
              <button
                onClick={() => { setSelectedUser(u); setIsUserModalOpen(true); }}
                className="flex-1 flex items-center justify-center gap-1.5 border border-slate-200 text-slate-655 hover:bg-slate-50 rounded-xl text-xs font-bold min-h-[44px] transition-all cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
