import React from "react";
import { Users, Clock, Utensils, Shield, UserCheck } from "lucide-react";

export default function StatsGrid({ stats, foodsAddedToday, chefsRegisteredToday }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {/* Total Cooks */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:border-slate-250">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Cooks</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalProviders}</h3>
          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Chef Accounts</p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-inner">
          <Users className="w-5 h-5" />
        </div>
      </div>

      {/* Pending Cooks */}
      <div className={`border rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all hover:shadow-md ${
        stats.pendingProviders > 0 
          ? "bg-amber-50/40 border-amber-200 text-amber-950" 
          : "bg-white border-slate-200/60"
      }`}>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Cooks</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.pendingProviders}</h3>
          <p className={`text-[10px] font-bold mt-0.5 ${stats.pendingProviders > 0 ? "text-amber-600 animate-pulse" : "text-slate-500"}`}>
            {stats.pendingProviders > 0 ? "Requires Action" : "Fully Caught Up"}
          </p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-inner ${
          stats.pendingProviders > 0 ? "bg-amber-100 text-amber-600" : "bg-slate-50 text-slate-400"
        }`}>
          <Clock className={`w-5 h-5 ${stats.pendingProviders > 0 ? "animate-pulse" : ""}`} />
        </div>
      </div>

      {/* Total Foods */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:border-slate-250">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Foods</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalFoods}</h3>
          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Active Menu Items</p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 shadow-inner">
          <Utensils className="w-5 h-5" />
        </div>
      </div>

      {/* Total Users */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:border-slate-250">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalUsers}</h3>
          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Registered Customers</p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-inner">
          <Shield className="w-5 h-5" />
        </div>
      </div>

      {/* Foods Added Today */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:border-slate-250">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Added Today</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{foodsAddedToday}</h3>
          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Dishes Added</p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-inner">
          <Utensils className="w-5 h-5" />
        </div>
      </div>

      {/* New Chefs Registered Today */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:border-slate-250">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Cooks Today</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{chefsRegisteredToday}</h3>
          <p className="text-[10px] text-sky-600 font-bold mt-0.5">New Registrations</p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500 shadow-inner">
          <UserCheck className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
