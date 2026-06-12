import React from "react";
import { MapPin, Check, X, Ban, Eye } from "lucide-react";

export default function ProvidersTable({
  providers,
  formatDateTime,
  handleApproveProvider,
  setSelectedProvider,
  setIsDrawerOpen
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <th className="py-5 px-6">Chef Details</th>
            <th className="py-5 px-6">Location</th>
            <th className="py-5 px-6">Exp.</th>
            <th className="py-5 px-6">Specialities</th>
            <th className="py-5 px-6">Registered On</th>
            <th className="py-5 px-6 text-center">Status</th>
            <th className="py-5 px-6 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {providers.map(p => (
            <tr 
              key={p._id} 
              onClick={() => { setSelectedProvider(p); setIsDrawerOpen(true); }}
              className="text-xs hover:bg-slate-50/80 transition-colors cursor-pointer group"
            >
              {/* Chef Info */}
              <td className="py-5 px-6">
                <div className="flex items-center gap-3">
                  {p.avatar ? (
                    <img src={p.avatar} className="w-11 h-11 rounded-2xl object-cover border border-slate-100 shadow-sm" alt="" />
                  ) : (
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-150 text-indigo-650 flex items-center justify-center font-bold text-lg shadow-sm">👩‍🍳</div>
                  )}
                  <div>
                    <h4 className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">{p.kitchenName}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{p.user?.name || "Unknown"} · {p.user?.email}</p>
                  </div>
                </div>
              </td>
              {/* Location */}
              <td className="py-5 px-6 text-slate-505 font-semibold">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate max-w-[120px]">{p.area}, {p.city}</span>
                </div>
              </td>
              {/* Experience */}
              <td className="py-5 px-6 text-slate-900 font-bold">{p.experience || 0} yrs</td>
              {/* Specialities */}
              <td className="py-5 px-6">
                <div className="flex flex-wrap gap-1 max-w-[150px]">
                  {(p.specialities || []).slice(0, 2).map(s => (
                    <span key={s} className="bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.5 rounded-md font-semibold">
                      {s}
                    </span>
                  ))}
                  {p.specialities?.length > 2 && (
                    <span className="text-[9px] text-slate-400 font-bold">+{p.specialities.length - 2}</span>
                  )}
                </div>
              </td>
              {/* Registered On */}
              <td className="py-5 px-6 text-slate-500 font-semibold">
                {formatDateTime(p.createdAt)}
              </td>
              {/* Status */}
              <td className="py-5 px-6 text-center">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                  p.verificationStatus === "APPROVED" 
                    ? "bg-green-50 text-green-700 border-green-200" 
                    : p.verificationStatus === "REJECTED"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : p.verificationStatus === "SUSPENDED"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    p.verificationStatus === "APPROVED" 
                      ? "bg-emerald-505" 
                      : p.verificationStatus === "REJECTED" 
                      ? "bg-rose-505" 
                      : p.verificationStatus === "SUSPENDED" 
                      ? "bg-red-505" 
                      : "bg-amber-505 animate-ping"
                  }`} />
                  {p.verificationStatus}
                </span>
              </td>
              {/* Actions */}
              <td className="py-5 px-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-center gap-2">
                  {p.verificationStatus !== "APPROVED" && (
                    <button
                      onClick={() => handleApproveProvider(p._id, "APPROVED")}
                      className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                      title="Approve Partner"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {p.verificationStatus !== "REJECTED" && p.verificationStatus !== "SUSPENDED" && (
                    <button
                      onClick={() => handleApproveProvider(p._id, "REJECTED")}
                      className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                      title="Reject Partner"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {p.verificationStatus === "APPROVED" && (
                    <button
                      onClick={() => handleApproveProvider(p._id, "SUSPENDED")}
                      className="w-8 h-8 rounded-xl bg-red-50 text-red-600 border border-red-100 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                      title="Suspend Partner"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => { setSelectedProvider(p); setIsDrawerOpen(true); }}
                    className="w-8 h-8 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-indigo-650 flex items-center justify-center transition-all cursor-pointer shadow-sm"
                    title="View Partner Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
