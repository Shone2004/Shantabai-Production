import React from "react";
import { X, User, Calendar, Utensils } from "lucide-react";

export default function UserDetailsModal({
  isUserModalOpen,
  selectedUser,
  handleCloseUserModal,
  providers,
  formatDateTime
}) {
  return (
    <div 
      className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-45 transition-opacity duration-300 flex items-center justify-center p-0 sm:p-6 lg:p-8 ${
        isUserModalOpen && selectedUser ? "opacity-100 animate-fadeIn" : "opacity-0 pointer-events-none"
      }`} 
      onClick={handleCloseUserModal}
    >
      {/* Modal Window */}
      <div 
        className={`bg-[#F8FAFC] shadow-2xl flex flex-col transition-all duration-300 ease-out transform overflow-hidden
          /* Mobile: Full-screen bottom sheet/page */
          w-full h-full rounded-none
          /* Tablet/Desktop: Centered card */
          sm:max-w-2xl sm:h-auto sm:max-h-[90vh] sm:rounded-[24px]
          ${isUserModalOpen && selectedUser ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 sm:translate-y-0"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {selectedUser && (() => {
          const providerProfile = selectedUser.role === "PROVIDER" 
            ? providers.find(p => p.user?._id === selectedUser._id || p.user === selectedUser._id)
            : null;
            
          return (
            <>
              {/* Sticky Header */}
              <div className="flex-shrink-0 bg-white border-b border-slate-100 p-4 sm:p-6 flex items-center justify-between z-15">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="relative flex-shrink-0">
                    {selectedUser.profileImage ? (
                      <img 
                        src={selectedUser.profileImage} 
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border border-slate-150 shadow-sm" 
                        alt={selectedUser.name} 
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-650 flex items-center justify-center font-bold text-xl sm:text-2xl shadow-sm">
                        {(selectedUser.name || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">
                        {selectedUser.name}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                        selectedUser.role === "ADMIN" 
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200" 
                          : selectedUser.role === "PROVIDER"
                          ? "bg-teal-50 text-teal-700 border-teal-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                        {selectedUser.role}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-505 mt-0.5 truncate">{selectedUser.email}</p>
                  </div>
                </div>
                {/* Close Button */}
                <button 
                  onClick={handleCloseUserModal}
                  className="w-10 h-10 flex-shrink-0 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl flex items-center justify-center transition-all cursor-pointer touch-target ml-2"
                  title="Close Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Account Info */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <User className="w-4 h-4 text-indigo-505" />
                      <span className="font-black text-xs text-slate-700 uppercase tracking-wider">Account Details</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Full Name</span>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedUser.name}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Email Address</span>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedUser.email}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Phone Number</span>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedUser.phone ? `+91 ${selectedUser.phone}` : "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Role</span>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedUser.role}</p>
                      </div>
                    </div>
                  </div>

                  {/* Metadata (Joined / Updated) */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <Calendar className="w-4 h-4 text-indigo-505" />
                      <span className="font-black text-xs text-slate-700 uppercase tracking-wider">Activity & Status</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Joined On</span>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">{formatDateTime(selectedUser.createdAt)}</p>
                      </div>
                      {selectedUser.updatedAt && (
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Last Updated</span>
                          <p className="text-xs font-bold text-slate-900 mt-0.5">{formatDateTime(selectedUser.updatedAt)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Conditional Kitchen/Cook details */}
                  {selectedUser.role === "PROVIDER" && (
                    <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4 sm:col-span-2">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Utensils className="w-4 h-4 text-indigo-505" />
                        <span className="font-black text-xs text-slate-700 uppercase tracking-wider">Kitchen / Cook Profile</span>
                      </div>
                      {providerProfile ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Kitchen Name</span>
                            <p className="text-xs font-extrabold text-indigo-650 mt-0.5">{providerProfile.kitchenName || "N/A"}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Verification Status</span>
                            <div className="mt-0.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${
                                providerProfile.verificationStatus === "APPROVED" 
                                  ? "bg-green-50 text-green-700 border-green-200" 
                                  : providerProfile.verificationStatus === "REJECTED"
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : providerProfile.verificationStatus === "SUSPENDED"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                              }`}>
                                {providerProfile.verificationStatus || "PENDING"}
                              </span>
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">City</span>
                            <p className="text-xs font-bold text-slate-900 mt-0.5">{providerProfile.city || "N/A"}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Area</span>
                            <p className="text-xs font-bold text-slate-900 mt-0.5">{providerProfile.area || "N/A"}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                          <p className="text-xs text-slate-505 font-semibold">Kitchen profile has not been fully initialized or linked yet.</p>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>

              {/* Action Footer */}
              <div className="flex-shrink-0 bg-white border-t border-slate-200/80 p-4 flex justify-end items-center pb-safe">
                <button
                  onClick={handleCloseUserModal}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3 px-5 rounded-xl transition-all cursor-pointer min-h-[44px]"
                >
                  <span>Close</span>
                </button>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
