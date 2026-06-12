import React from "react";
import ProvidersTable from "./ProvidersTable";

export default function ProvidersPage({
  providers,
  providersLoading,
  formatDateTime,
  handleApproveProvider,
  setSelectedProvider,
  setIsDrawerOpen
}) {
  return (
    <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm animate-fadeIn">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Chef/Partner Profiles</h3>
        <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-3 py-1 rounded-full">
          {providers.length} Registered Cooks
        </span>
      </div>
      
      {providersLoading ? (
        <div className="p-12 text-center text-slate-400">Loading partners...</div>
      ) : providers.length === 0 ? (
        <div className="p-12 text-center text-slate-400">No home cooks registered in the database.</div>
      ) : (
        <ProvidersTable
          providers={providers}
          formatDateTime={formatDateTime}
          handleApproveProvider={handleApproveProvider}
          setSelectedProvider={setSelectedProvider}
          setIsDrawerOpen={setIsDrawerOpen}
        />
      )}
    </div>
  );
}
