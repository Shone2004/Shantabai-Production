import React from "react";
import { Eye, Trash2, UserCheck, Utensils, Users, Sliders } from "lucide-react";

export default function RecentActivity({
  latestChefs,
  recentFoods,
  activityTimeline,
  stats,
  setActiveTab,
  handleRefreshAll,
  setSelectedProvider,
  setIsDrawerOpen,
  setSelectedFood,
  setIsFoodModalOpen,
  setFoodToDelete,
  setIsDeleteConfirmOpen,
  formatDateTime
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Side (span 2) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Recent Chef Registrations */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Recent Chef Registrations</h4>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Latest cooks to create profiles on the dashboard</p>
            </div>
            <button 
              onClick={() => setActiveTab("providers")} 
              className="text-xs font-bold text-indigo-650 hover:text-indigo-850 transition-colors cursor-pointer"
            >
              View All →
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse hidden sm:table">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Chef / Kitchen</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Joined On</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {latestChefs.map(p => (
                  <tr key={p._id} className="text-xs hover:bg-slate-50/40">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        {p.avatar ? (
                          <img src={p.avatar} className="w-8 h-8 rounded-lg object-cover border border-slate-100 shadow-sm" alt="" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-655 flex items-center justify-center font-bold">👩‍🍳</div>
                        )}
                        <div>
                          <div className="font-extrabold text-slate-900">{p.kitchenName}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{p.user?.name || "Unknown"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-semibold">{p.city}</td>
                    <td className="py-3 px-4 text-slate-400 font-medium">{formatDateTime(p.createdAt)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                        p.verificationStatus === "APPROVED" 
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : p.verificationStatus === "REJECTED"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : p.verificationStatus === "SUSPENDED"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                      }`}>
                        {p.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => { setSelectedProvider(p); setIsDrawerOpen(true); }}
                        className="w-7 h-7 rounded-lg border border-slate-200 text-slate-550 hover:bg-slate-150 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-xs mx-auto"
                        title="View Profile Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Mobile Registrations Card Stack */}
            <div className="sm:hidden divide-y divide-slate-100">
              {latestChefs.map(p => (
                <div key={p._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {p.avatar ? (
                      <img src={p.avatar} className="w-9 h-9 rounded-lg object-cover border border-slate-100 shadow-sm" alt="" />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-650 flex items-center justify-center font-bold">👩‍🍳</div>
                    )}
                    <div className="min-w-0">
                      <h5 className="font-extrabold text-slate-900 text-xs truncate">{p.kitchenName}</h5>
                      <p className="text-[10px] text-slate-400 font-semibold truncate">{p.city} · {p.user?.name || "Unknown"}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setSelectedProvider(p); setIsDrawerOpen(true); }}
                    className="w-8 h-8 rounded-lg border border-slate-200 text-slate-555 flex items-center justify-center flex-shrink-0 touch-target cursor-pointer"
                  >
                    <Eye className="w-4.5 h-4.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recently Added Foods */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Recently Added Foods</h4>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Latest food items listed by cooks</p>
            </div>
            <button 
              onClick={() => setActiveTab("foods")} 
              className="text-xs font-bold text-indigo-655 hover:text-indigo-855 transition-colors cursor-pointer"
            >
              View All →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse hidden sm:table">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Dish</th>
                  <th className="py-3 px-4">Kitchen</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Listed On</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentFoods.map(f => (
                  <tr key={f._id} className="text-xs hover:bg-slate-50/40">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        {f.images?.[0] ? (
                          <img src={f.images[0]} className="w-8 h-8 rounded-lg object-cover border border-slate-100 shadow-sm" alt="" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">🍛</div>
                        )}
                        <span>{f.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-indigo-650 font-bold">{f.provider?.kitchenName || "Unknown"}</td>
                    <td className="py-3 px-4 text-slate-900 font-bold">₹{f.price}</td>
                    <td className="py-3 px-4 text-slate-505 font-semibold">{f.category}</td>
                    <td className="py-3 px-4 text-slate-400 font-medium">{formatDateTime(f.createdAt)}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => { setSelectedFood(f); setIsFoodModalOpen(true); }}
                          className="w-7 h-7 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                          title="View Details"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={() => { setFoodToDelete(f); setIsDeleteConfirmOpen(true); }}
                          className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Mobile Foods Card Stack */}
            <div className="sm:hidden divide-y divide-slate-100">
              {recentFoods.map(f => (
                <div key={f._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {f.images?.[0] ? (
                      <img src={f.images[0]} className="w-9 h-9 rounded-lg object-cover border border-slate-100 shadow-sm" alt="" />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">🍛</div>
                    )}
                    <div className="min-w-0">
                      <h5 className="font-extrabold text-slate-900 text-xs truncate">{f.name}</h5>
                      <p className="text-[10px] text-slate-400 font-semibold truncate">{f.provider?.kitchenName || "Unknown"} · ₹{f.price}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setSelectedFood(f); setIsFoodModalOpen(true); }}
                      className="w-8 h-8 rounded-lg border border-slate-200 text-slate-550 flex items-center justify-center flex-shrink-0 touch-target cursor-pointer"
                    >
                      <Eye className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => { setFoodToDelete(f); setIsDeleteConfirmOpen(true); }}
                      className="w-8 h-8 rounded-lg border border-rose-200 bg-rose-55 text-rose-600 flex items-center justify-center flex-shrink-0 touch-target cursor-pointer"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Right Side (span 1) */}
      <div className="space-y-6">
        
        {/* Quick Actions Shortcuts */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Quick Actions</h4>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Shortcuts to manage the platform</p>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setActiveTab("providers")}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-indigo-50/30 border border-indigo-100 text-indigo-700 hover:bg-indigo-50 font-bold transition-all min-h-[80px] cursor-pointer"
            >
              <UserCheck className="w-5 h-5 text-indigo-505" />
              <span className="text-[10px] uppercase tracking-wider">Home Cooks</span>
            </button>
            <button
              onClick={() => setActiveTab("foods")}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-purple-50/30 border border-purple-100 text-purple-700 hover:bg-purple-50 font-bold transition-all min-h-[80px] cursor-pointer"
            >
              <Utensils className="w-5 h-5 text-purple-505" />
              <span className="text-[10px] uppercase tracking-wider">Food Items</span>
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-blue-50/30 border border-blue-100 text-blue-700 hover:bg-blue-50 font-bold transition-all min-h-[80px] cursor-pointer"
            >
              <Users className="w-5 h-5 text-blue-505" />
              <span className="text-[10px] uppercase tracking-wider">User Accounts</span>
            </button>
            <button
              onClick={handleRefreshAll}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold transition-all min-h-[80px] cursor-pointer"
            >
              <Sliders className="w-5 h-5 text-slate-550" />
              <span className="text-[10px] uppercase tracking-wider">Refresh All</span>
            </button>
          </div>
        </div>

        {/* Platform Snapshot Summary */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Platform Snapshot</h4>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Summary of verified and pending metrics</p>
          </div>
          
          <div className="space-y-2.5 pt-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-650 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span>Total Cooks</span>
              <span className="text-slate-900 text-sm font-black">{stats.totalProviders}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-655 bg-green-50/30 p-2.5 rounded-xl border border-green-100 text-green-800">
              <span>Approved Cooks</span>
              <span className="text-emerald-700 text-sm font-black">{stats.totalProviders - stats.pendingProviders}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-655 bg-amber-50/40 p-2.5 rounded-xl border border-amber-100 text-amber-800">
              <span>Pending Cooks</span>
              <span className="text-amber-700 text-sm font-black">{stats.pendingProviders}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-655 bg-purple-50/30 p-2.5 rounded-xl border border-purple-100 text-purple-800">
              <span>Active Dishes</span>
              <span className="text-purple-700 text-sm font-black">{stats.totalFoods}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-655 bg-indigo-50/30 p-2.5 rounded-xl border border-indigo-100 text-indigo-800">
              <span>Registered Users</span>
              <span className="text-indigo-700 text-sm font-black">{stats.totalUsers}</span>
            </div>
          </div>
        </div>

        {/* Timeline Activity Feed */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Activity Feed</h4>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Real-time system event updates</p>
          </div>

          <div className="space-y-4 pt-2">
            {activityTimeline.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">No recent activity found.</p>
            ) : (
              activityTimeline.map((item, idx) => (
                <div key={item.id} className="flex gap-3 text-xs relative">
                  {/* Connective Line */}
                  {idx !== activityTimeline.length - 1 && (
                    <div className="absolute left-4.5 top-9 bottom-0 w-0.5 bg-slate-100" />
                  )}
                  
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-sm ${item.color}`}>
                    <span className="text-base">{item.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="font-extrabold text-slate-800 truncate">{item.title}</h5>
                      <span className="text-[9px] text-slate-400 font-bold shrink-0">
                        {(() => {
                          const mins = Math.floor((new Date() - item.time) / 60000);
                          if (mins < 1) return "Just now";
                          if (mins < 60) return `${mins}m ago`;
                          const hrs = Math.floor(mins / 60);
                          if (hrs < 24) return `${hrs}h ago`;
                          return item.time.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
                        })()}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-550 font-semibold truncate mt-0.5">{item.detail}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
