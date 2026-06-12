import React from "react";
import { X, Sliders, User, Clock, Trash2 } from "lucide-react";

export default function FoodDetailsModal({
  isFoodModalOpen,
  selectedFood,
  handleCloseFoodModal,
  setFoodToDelete,
  setIsDeleteConfirmOpen,
  formatDateTime
}) {
  return (
    <div 
      className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity duration-300 flex items-center justify-center p-0 sm:p-6 lg:p-8 ${
        isFoodModalOpen && selectedFood ? "opacity-100 animate-fadeIn" : "opacity-0 pointer-events-none"
      }`} 
      onClick={handleCloseFoodModal}
    >
      {/* Modal Window */}
      <div 
        className={`bg-[#F8FAFC] shadow-2xl flex flex-col transition-all duration-300 ease-out transform overflow-hidden
          /* Mobile: Full-screen bottom sheet/page */
          w-full h-full rounded-none
          /* Tablet/Desktop: Centered card */
          sm:max-w-2xl sm:h-auto sm:max-h-[90vh] sm:rounded-[24px]
          ${isFoodModalOpen && selectedFood ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 sm:translate-y-0"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {selectedFood && (
          <>
            {/* Sticky Header */}
            <div className="flex-shrink-0 bg-white border-b border-slate-100 p-4 sm:p-6 flex items-center justify-between z-15">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {selectedFood.images?.[0] ? (
                  <img 
                    src={selectedFood.images[0]} 
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border border-slate-150 shadow-sm" 
                    alt={selectedFood.name} 
                    loading="lazy"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-50 border border-indigo-150 text-indigo-650 flex items-center justify-center font-bold text-xl sm:text-2xl shadow-sm">
                    🍛
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center flex-wrap gap-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">
                      {selectedFood.name}
                    </h3>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold border uppercase ${
                      selectedFood.isVeg 
                        ? "bg-green-50 text-green-700 border-green-200" 
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${selectedFood.isVeg ? "bg-emerald-505" : "bg-rose-505"}`} />
                      {selectedFood.isVeg ? "Veg" : "Non-Veg"}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-505 mt-0.5 truncate">{selectedFood.category} · ₹{selectedFood.price} /{selectedFood.pricePer || "meal"}</p>
                </div>
              </div>
              {/* Close Button */}
              <button 
                onClick={handleCloseFoodModal}
                className="w-10 h-10 flex-shrink-0 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl flex items-center justify-center transition-all cursor-pointer touch-target ml-2"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50">
              
              {/* Description */}
              <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Description</span>
                <p className="text-xs text-slate-655 leading-relaxed whitespace-pre-line">
                  {selectedFood.description || "No description provided."}
                </p>
              </div>

              {/* Grid details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Left panel - Specifications */}
                <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Sliders className="w-4 h-4 text-indigo-500" />
                    <span className="font-black text-xs text-slate-700 uppercase tracking-wider">Specifications</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Category</span>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedFood.category || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Meal Type</span>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedFood.mealType || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Prep Time</span>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedFood.prepTime || 30} mins</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Bring Container</span>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedFood.bringContainer ? "Required" : "Not Required"}</p>
                    </div>
                  </div>
                </div>

                {/* Right panel - Chef & Stock */}
                <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <User className="w-4 h-4 text-indigo-500" />
                    <span className="font-black text-xs text-slate-700 uppercase tracking-wider">Chef & Inventory</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Kitchen Name</span>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedFood.provider?.kitchenName || "N/A"}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Chef Name</span>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedFood.provider?.user?.name || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Available Qty</span>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedFood.quantity || 0} / {selectedFood.totalQuantity || 10} servings</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Status</span>
                      <p className="text-xs font-bold mt-0.5">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${
                          selectedFood.status === "available"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}>
                          {selectedFood.status}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4 sm:col-span-2">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span className="font-black text-xs text-slate-700 uppercase tracking-wider">Timeline</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Created At</span>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">{formatDateTime(selectedFood.createdAt)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Last Updated</span>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">{formatDateTime(selectedFood.updatedAt)}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Action Footer */}
            <div className="flex-shrink-0 bg-white border-t border-slate-200/80 p-4 flex justify-between items-center pb-safe">
              <button
                onClick={() => {
                  handleCloseFoodModal();
                  setFoodToDelete(selectedFood);
                  setIsDeleteConfirmOpen(true);
                }}
                className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-3 px-5 rounded-xl transition-all cursor-pointer shadow-md shadow-rose-600/10 min-h-[44px]"
              >
                <Trash2 className="w-4.5 h-4.5" />
                <span>Delete Food Item</span>
              </button>
              <button
                onClick={handleCloseFoodModal}
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
