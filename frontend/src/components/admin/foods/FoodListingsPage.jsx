import React from "react";
import { Search } from "lucide-react";
import FoodTable from "./FoodTable";
import FoodCard from "./FoodCard";

export default function FoodListingsPage({
  foods,
  foodsLoading,
  foodSearchQuery,
  setFoodSearchQuery,
  setSelectedFood,
  setIsFoodModalOpen,
  setFoodToDelete,
  setIsDeleteConfirmOpen
}) {
  const filteredFoods = foods.filter(f => {
    const query = foodSearchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      (f.name || "").toLowerCase().includes(query) ||
      (f.category || "").toLowerCase().includes(query) ||
      (f.provider?.kitchenName || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm animate-fadeIn">
      
      {/* Header with Search */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-sans">Food Listings Management</h3>
          <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">Search, inspect specifications, and manage active menu listings</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 md:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search dishes, cooks, or category..."
              value={foodSearchQuery}
              onChange={(e) => setFoodSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
            />
          </div>
          {/* Items Count Badge */}
          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-3 py-2 rounded-xl border border-indigo-100 shrink-0">
            {filteredFoods.length} Dishes
          </span>
        </div>
      </div>
      
      {foodsLoading ? (
        <div className="p-12 text-center text-slate-400 font-semibold">Loading dishes...</div>
      ) : filteredFoods.length === 0 ? (
        <div className="p-12 text-center text-slate-400 font-semibold">No food items found matching your search.</div>
      ) : (
        <>
          {/* Desktop and Tablet View (Table) */}
          <FoodTable
            filteredFoods={filteredFoods}
            setSelectedFood={setSelectedFood}
            setIsFoodModalOpen={setIsFoodModalOpen}
            setFoodToDelete={setFoodToDelete}
            setIsDeleteConfirmOpen={setIsDeleteConfirmOpen}
          />

          {/* Mobile View (Cards) */}
          <FoodCard
            filteredFoods={filteredFoods}
            setSelectedFood={setSelectedFood}
            setIsFoodModalOpen={setIsFoodModalOpen}
            setFoodToDelete={setFoodToDelete}
            setIsDeleteConfirmOpen={setIsDeleteConfirmOpen}
          />
        </>
      )}
    </div>
  );
}
