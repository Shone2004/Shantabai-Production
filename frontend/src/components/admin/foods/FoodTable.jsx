import React from "react";
import { Eye, Trash2 } from "lucide-react";

export default function FoodTable({
  filteredFoods,
  setSelectedFood,
  setIsFoodModalOpen,
  setFoodToDelete,
  setIsDeleteConfirmOpen
}) {
  return (
    <div className="hidden sm:block overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <th className="py-4 px-6">Dish Name</th>
            <th className="py-4 px-6">Kitchen / Cook</th>
            <th className="py-4 px-6">Category</th>
            <th className="py-4 px-6">Price</th>
            <th className="py-4 px-6 text-center">Qty Left</th>
            <th className="py-4 px-6 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filteredFoods.map(f => (
            <tr key={f._id} className="text-xs hover:bg-slate-50/50">
              {/* Food Title */}
              <td className="py-4 px-6">
                <div className="flex items-center gap-3">
                  {f.images?.[0] ? (
                    <img src={f.images[0]} className="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-sm" alt="" loading="lazy" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">🍛</div>
                  )}
                  <div>
                    <h4 className="font-extrabold text-slate-900">{f.name}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${f.isVeg ? "bg-green-500" : "bg-red-500"}`} />
                      <span className="text-[9px] text-slate-400 font-bold uppercase">{f.isVeg ? "Veg" : "Non-Veg"}</span>
                    </div>
                  </div>
                </div>
              </td>
              {/* Chef */}
              <td className="py-4 px-6 text-slate-700 font-semibold">
                <div className="font-bold">{f.provider?.kitchenName || "Unknown Kitchen"}</div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">{f.provider?.user?.name || ""}</div>
              </td>
              {/* Category */}
              <td className="py-4 px-6 text-slate-500 font-semibold">
                {f.category}
              </td>
              {/* Price */}
              <td className="py-4 px-6 text-slate-900 font-bold">
                ₹{f.price} <span className="text-[9px] text-slate-400 font-medium">/{f.pricePer || "meal"}</span>
              </td>
              {/* Qty Left */}
              <td className="py-4 px-6 text-center text-slate-650 font-bold">
                {f.quantity || 0} <span className="text-[9px] text-slate-400 font-medium">/ {f.totalQuantity || 10}</span>
              </td>
              {/* Actions */}
              <td className="py-4 px-6">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => { setSelectedFood(f); setIsFoodModalOpen(true); }}
                    className="w-8 h-8 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-indigo-650 flex items-center justify-center transition-all cursor-pointer shadow-sm"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setFoodToDelete(f); setIsDeleteConfirmOpen(true); }}
                    className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                    title="Delete Food"
                  >
                    <Trash2 className="w-4 h-4" />
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
