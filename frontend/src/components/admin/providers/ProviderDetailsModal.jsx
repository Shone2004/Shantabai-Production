import React from "react";
import {
  X,
  Check,
  Clock,
  User,
  Mail,
  Phone,
  Award,
  MapPin,
  Shield,
  FileText,
  ExternalLink,
  Copy,
  Calendar,
  Utensils,
  Star,
  Ban
} from "lucide-react";
import ProviderTimeline from "./ProviderTimeline";
import ProviderChatPanel from "./ProviderChatPanel";

export default function ProviderDetailsModal({
  isDrawerOpen,
  selectedProvider,
  handleCloseModal,
  handleApproveProvider,
  showToast,
  formatDateTime,
  formatDateParts,
  // Chat props
  providerChats,
  chatInput,
  setChatInput,
  chatEndRef,
  handleSendMessage,
  handleClearChat,
  defaultMessages
}) {
  return (
    <div 
      className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity duration-300 flex items-center justify-center p-0 sm:p-6 lg:p-8 ${
        isDrawerOpen && selectedProvider ? "opacity-100 animate-fadeIn" : "opacity-0 pointer-events-none"
      }`} 
      onClick={handleCloseModal}
    >
      {/* Modal Window */}
      <div 
        className={`bg-[#F8FAFC] shadow-2xl flex flex-col transition-all duration-300 ease-out transform overflow-hidden
          /* Mobile: Full-screen bottom sheet/page */
          w-full h-full rounded-none
          /* Tablet/Desktop: Centered card */
          sm:max-w-3xl lg:max-w-5xl sm:h-auto sm:max-h-[90vh] sm:rounded-[24px]
          ${isDrawerOpen && selectedProvider ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 sm:translate-y-0"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {selectedProvider && (
          <>
            {/* Sticky Header */}
            <div className="flex-shrink-0 bg-white border-b border-slate-100 p-4 sm:p-6 flex items-center justify-between z-15">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="relative flex-shrink-0">
                  {selectedProvider.avatar ? (
                    <img 
                      src={selectedProvider.avatar} 
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border border-slate-150 shadow-sm" 
                      alt={selectedProvider.kitchenName} 
                    />
                  ) : (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-50 border border-indigo-150 text-indigo-650 flex items-center justify-center font-bold text-xl sm:text-2xl shadow-sm">
                      👩‍🍳
                    </div>
                  )}
                  {selectedProvider.isVerified && (
                    <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border border-white shadow-sm flex items-center justify-center" title="Verified Chef">
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center flex-wrap gap-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">
                      {selectedProvider.kitchenName}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${
                      selectedProvider.verificationStatus === "APPROVED" 
                        ? "bg-green-50 text-green-700 border-green-200" 
                        : selectedProvider.verificationStatus === "REJECTED"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : selectedProvider.verificationStatus === "SUSPENDED"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                    }`}>
                      {selectedProvider.verificationStatus}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 mt-0.5 truncate">{selectedProvider.user?.name || "Unknown Chef"}</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5 flex items-center gap-1.5 truncate">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Registered: {formatDateTime(selectedProvider.createdAt)}</span>
                  </p>
                </div>
              </div>
              {/* Close Button */}
              <button 
                onClick={handleCloseModal}
                className="w-10 h-10 flex-shrink-0 bg-slate-50 hover:bg-slate-100 text-slate-550 hover:text-slate-800 rounded-xl flex items-center justify-center transition-all cursor-pointer touch-target ml-2"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column (Main Info - Span 2 on Desktop) */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* SECTION 1 — PERSONAL INFORMATION */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <User className="w-4 h-4 text-indigo-500" />
                      <span className="font-black text-xs text-slate-700 uppercase tracking-wider">Personal Information</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Full Name</span>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedProvider.user?.name || "Unknown"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Kitchen Name</span>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedProvider.kitchenName || "Unknown"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Email Address</span>
                        <p className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{selectedProvider.user?.email || "Unknown"}</span>
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Phone Number</span>
                        <p className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{selectedProvider.user?.phone ? `+91 ${selectedProvider.user.phone}` : "N/A"}</span>
                        </p>
                      </div>
                    </div>
                    {selectedProvider.tagline && (
                      <div className="pt-2 border-t border-slate-50">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Tagline</span>
                        <p className="text-xs italic text-slate-655 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          "{selectedProvider.tagline}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* SECTION 3 — CHEF DETAILS */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <Award className="w-4 h-4 text-indigo-500" />
                      <span className="font-black text-xs text-slate-700 uppercase tracking-wider">Chef Profile & Offerings</span>
                    </div>
                    
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Biography</span>
                      <p className="text-xs text-slate-650 leading-relaxed mt-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100/70 whitespace-pre-line">
                        {selectedProvider.bio || "No biography provided."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Experience</span>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedProvider.experience || 0} Years</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Starting Price</span>
                        <p className="text-sm font-bold text-emerald-600 mt-0.5">₹{selectedProvider.startingPrice || 0}</p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-50">
                      {/* Specialities */}
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Specialities</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedProvider.specialities && selectedProvider.specialities.length > 0 ? (
                            selectedProvider.specialities.map(s => (
                              <span key={s} className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-indigo-100">
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">None listed</span>
                          )}
                        </div>
                      </div>

                      {/* Dietary Types */}
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Dietary Types</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedProvider.dietaryType && selectedProvider.dietaryType.length > 0 ? (
                            selectedProvider.dietaryType.map(d => (
                              <span key={d} className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                d === 'Veg' 
                                  ? 'bg-green-50 text-green-700 border-green-100' 
                                  : d === 'Non-Veg' 
                                  ? 'bg-rose-50 text-rose-700 border-rose-100' 
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              }`}>
                                {d}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">None listed</span>
                          )}
                        </div>
                      </div>

                      {/* Service Types */}
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Service Types</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedProvider.serviceTypes && selectedProvider.serviceTypes.length > 0 ? (
                            selectedProvider.serviceTypes.map(s => (
                              <span key={s} className="bg-teal-50 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-teal-100">
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">None listed</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 4 — ADDRESS */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <MapPin className="w-4 h-4 text-indigo-500" />
                      <span className="font-black text-xs text-slate-700 uppercase tracking-wider">Kitchen Location / Address</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">City</span>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedProvider.city || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Area</span>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedProvider.area || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Pincode</span>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedProvider.pincode || "N/A"}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Full Kitchen Address</span>
                      <p className="text-xs text-slate-700 font-semibold leading-relaxed mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {selectedProvider.fullAddress || "No full address provided."}
                      </p>
                    </div>
                    {(() => {
                      const coords = selectedProvider.location?.coordinates;
                      const hasValidCoords = Array.isArray(coords) &&
                        coords.length === 2 &&
                        typeof coords[0] === 'number' &&
                        typeof coords[1] === 'number' &&
                        !(Math.abs(coords[0] - 73.7898) < 0.0001 && Math.abs(coords[1] - 18.5597) < 0.0001) &&
                        !(coords[0] === 0 && coords[1] === 0);

                      if (!hasValidCoords) return null;

                      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords[1]},${coords[0]}`;

                      return (
                        <div className="pt-2 border-t border-slate-50">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Geospatial Coordinates</span>
                            <a
                              href={googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-650 hover:text-indigo-755 transition-colors"
                            >
                              <span>View on Google Maps</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center justify-between text-xs font-bold text-slate-655">
                            <span>Longitude: {coords[0]}</span>
                            <div className="w-px h-4 bg-slate-200" />
                            <span>Latitude: {coords[1]}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* SECTION 6 — VERIFICATION */}
                  {(() => {
                    const url = selectedProvider.aadharUrl;
                    const hasAadhar = !!url;
                    
                    return (
                      <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                          <Shield className="w-4 h-4 text-indigo-500" />
                          <span className="font-black text-xs text-slate-700 uppercase tracking-wider">Aadhaar Verification</span>
                        </div>
                        
                        {!hasAadhar ? (
                          <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                            <p className="text-xs font-semibold text-slate-400">No Aadhaar document uploaded.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-505 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-indigo-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">📄 Aadhaar Document Uploaded</p>
                                <p className="text-[10px] text-slate-400 font-semibold uppercase">Verification Document</p>
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-2 pt-1">
                              <a 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md shadow-indigo-600/10 cursor-pointer min-h-[44px]"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>View Aadhaar Document</span>
                              </a>
                              
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(url);
                                  showToast("success", "Aadhaar link copied to clipboard");
                                }}
                                className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3 px-4 rounded-xl transition-all cursor-pointer min-h-[44px]"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Link</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                </div>

                {/* Right Column (Meta Info - Span 1 on Desktop) */}
                <div className="space-y-6">
                  
                  {/* SECTION 2 — REGISTRATION INFORMATION */}
                  {(() => {
                    const regParts = formatDateParts(selectedProvider.createdAt);
                    const updatedParts = formatDateParts(selectedProvider.updatedAt);
                    return (
                      <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                          <Calendar className="w-4 h-4 text-indigo-500" />
                          <span className="font-black text-xs text-slate-700 uppercase tracking-wider">Registration Details</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Reg. Date</span>
                            <p className="text-xs font-bold text-slate-900 mt-0.5">{regParts.date}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Reg. Time</span>
                            <p className="text-xs font-bold text-slate-900 mt-0.5">{regParts.time}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Last Updated</span>
                            <p className="text-xs font-bold text-slate-900 mt-0.5">{updatedParts.date} • {updatedParts.time}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Account Status</span>
                            <div className="mt-1">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${
                                selectedProvider.verificationStatus === "APPROVED" 
                                  ? "bg-green-50 text-green-700 border-green-200" 
                                  : selectedProvider.verificationStatus === "REJECTED"
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : selectedProvider.verificationStatus === "SUSPENDED"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                              }`}>
                                {selectedProvider.verificationStatus}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* SECTION 5 — COOKING PREFERENCES */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <Utensils className="w-4 h-4 text-indigo-500" />
                      <span className="font-black text-xs text-slate-700 uppercase tracking-wider">Cooking & Operations</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Oil Customization</span>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedProvider.oilLevel || "Normal"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Spice Customization</span>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedProvider.spiceLevel || "Medium"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Delivery</span>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedProvider.deliveryOption || "Both"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Availability</span>
                        <div className="mt-1">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            selectedProvider.isAvailable 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${selectedProvider.isAvailable ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            {selectedProvider.isAvailable ? "Available" : "Offline"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 7 — PERFORMANCE */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <Star className="w-4 h-4 text-indigo-500" />
                      <span className="font-black text-xs text-slate-700 uppercase tracking-wider">Performance Metrics</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-slate-50/50 rounded-xl p-2.5 border border-slate-100">
                        <span className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Rating</span>
                        <p className="text-xs font-black text-slate-900 flex items-center justify-center gap-0.5">
                          <span className="text-amber-500">★</span>
                          <span>{selectedProvider.rating || "5.0"}</span>
                        </p>
                      </div>
                      <div className="bg-slate-50/50 rounded-xl p-2.5 border border-slate-100">
                        <span className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Reviews</span>
                        <p className="text-xs font-black text-slate-900">{selectedProvider.totalReviews || 0}</p>
                      </div>
                      <div className="bg-slate-50/50 rounded-xl p-2.5 border border-slate-100">
                        <span className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Repeat</span>
                        <p className="text-xs font-black text-emerald-600">{selectedProvider.repeatRate || "100%"}</p>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 8 — TIMELINE */}
                  <ProviderTimeline 
                    selectedProvider={selectedProvider} 
                    formatDateTime={formatDateTime} 
                  />

                  {/* SECTION 9 — ADMIN COMMUNICATION CHAT */}
                  <ProviderChatPanel 
                    selectedProvider={selectedProvider} 
                  />

                </div>
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="flex-shrink-0 bg-white border-t border-slate-200/80 p-4 flex flex-wrap gap-2.5 z-15 shadow-lg justify-between items-center pb-safe">
              <div className="flex gap-2">
                {selectedProvider.verificationStatus !== "APPROVED" && (
                  <button
                    onClick={() => handleApproveProvider(selectedProvider._id, "APPROVED")}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 px-5 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-600/10 min-h-[44px]"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                )}
                {selectedProvider.verificationStatus !== "REJECTED" && selectedProvider.verificationStatus !== "SUSPENDED" && (
                  <button
                    onClick={() => handleApproveProvider(selectedProvider._id, "REJECTED")}
                    className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-3 px-5 rounded-xl transition-all cursor-pointer shadow-md shadow-rose-600/10 min-h-[44px]"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                )}
                {selectedProvider.verificationStatus === "APPROVED" && (
                  <button
                    onClick={() => handleApproveProvider(selectedProvider._id, "SUSPENDED")}
                    className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-3 px-5 rounded-xl transition-all cursor-pointer shadow-md shadow-red-600/10 min-h-[44px]"
                  >
                    <Ban className="w-4 h-4" />
                    <span>Suspend</span>
                  </button>
                )}
              </div>
              
              <button
                onClick={handleCloseModal}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3 px-5 rounded-xl transition-all cursor-pointer min-h-[44px]"
              >
                <span>Close</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
