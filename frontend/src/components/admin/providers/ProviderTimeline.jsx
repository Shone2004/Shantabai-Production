import React from "react";
import { Clock } from "lucide-react";

export default function ProviderTimeline({ selectedProvider, formatDateTime }) {
  if (!selectedProvider) return null;

  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <Clock className="w-4 h-4 text-indigo-500" />
        <span className="font-black text-xs text-slate-700 uppercase tracking-wider">Activity Timeline</span>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-800">Chef profile registered</p>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">{formatDateTime(selectedProvider.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-800">Profile information updated</p>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">{formatDateTime(selectedProvider.updatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
