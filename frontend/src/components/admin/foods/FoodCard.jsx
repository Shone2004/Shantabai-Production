import React from "react";
import { Eye, Trash2 } from "lucide-react";

export default function FoodCard({
  filteredFoods,
  setSelectedFood,
  setIsFoodModalOpen,
  setFoodToDelete,
  setIsDeleteConfirmOpen
}) {
  return (
    <div className="sm:hidden divide-y divide-slate-100">
      {filteredFoods.map(f => (
        <div key={f._id} className="p-4 space-y-3">
          <div className="flex gap-3">
            {f.images?.[0] ? (
              <img src={f.images[0]} className="w-14 h-14 rounded-xl object-cover border border-slate-100 shadow-sm flex-shrink-0" alt="" loading="lazy" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 flex-shrink-0">🍛</div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="font-extrabold text-slate-900 truncate text-xs">{f.name}</h4>
                <span className={`inline-flex shrink-0 w-2 h-2 rounded-full ${f.isVeg ? "bg-green-500" : "bg-red-500"}`} title={f.isVeg ? "Veg" : "Non-Veg"} />
              </div>
              <p className="text-[10px] text-slate-500 font-bold mt-0.5 truncate">{f.provider?.kitchenName || "Unknown Kitchen"}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-slate-100 text-slate-650 text-[9px] px-1.5 py-0.5 rounded-md font-bold">{f.category}</span>
                <span className="text-slate-900 font-black text-xs">₹{f.price}</span>
              </div>
            </div>
          </div>
          
          {/* Card Action Buttons (min-h-[44px] touch targets) */}
          <div className="flex gap-2">
            <button
              onClick={() => { setSelectedFood(f); setIsFoodModalOpen(true); }}
              className="flex-1 flex items-center justify-center gap-1.5 border border-slate-200 text-slate-650 hover:bg-slate-50 rounded-xl text-xs font-bold min-h-[44px] transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>View Details</span>
            </button>
            <button
              onClick={() => { setFoodToDelete(f); setIsDeleteConfirmOpen(true); }}
              className="flex-1 flex items-center justify-center gap-1.5 border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold min-h-[44px] transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
