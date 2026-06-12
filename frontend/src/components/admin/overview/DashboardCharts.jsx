import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function DashboardCharts({ historicalChartData }) {
  return (
    <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-2">
        <div>
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Registrations & Listings Trend</h4>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Chef sign-ups and food additions over the last 6 months</p>
        </div>
        <div className="flex gap-4 text-xs font-bold text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span>New Chefs</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span>New Dishes</span>
          </span>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={historicalChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="New Chefs" stroke="#4f46e5" strokeWidth={2.5} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="New Dishes" stroke="#c084fc" strokeWidth={2.5} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
