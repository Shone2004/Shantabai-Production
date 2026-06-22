import React, { useState, useEffect, useMemo, useDeferredValue } from 'react';
import axios from 'axios';

// Fallback high-fidelity mock datasets
const initialFoodsFallback = [
  {
    _id: "mock-1",
    name: "Chicken Butter Masala",
    price: 220,
    pricePer: "per plate",
    quantity: 7,
    status: "available",
    description: "Rich tomato gravy with slow-cooked chicken, finished with fresh cream and aromatic spices.",
    images: ["https://images.pexels.com/photos/9609844/pexels-photo-9609844.jpeg"],
    bringContainer: true,
    prepTime: 45,
    timeWindow: "10:00 AM - 11:00 AM",
    provider: { kitchenName: "Chef Meena", area: "Kothrud" }
  },
  {
    _id: "mock-2",
    name: "Dum Biryani",
    price: 180,
    pricePer: "per plate",
    quantity: 12,
    status: "available",
    description: "Fragrant basmati rice layered with vegetables and slow-cooked traditional biryani spices.",
    images: ["https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg"],
    bringContainer: true,
    prepTime: 60,
    timeWindow: "12:00 PM - 02:00 PM",
    provider: { kitchenName: "Chef Priya", area: "Wakad" }
  },
  {
    _id: "mock-3",
    name: "Tandoori Chicken",
    price: 280,
    pricePer: "per plate",
    quantity: 2,
    status: "available",
    description: "Tender chicken marinated overnight and grilled for a smoky authentic flavor.",
    images: ["https://images.pexels.com/photos/616354/pexels-photo-616354.jpeg"],
    bringContainer: false,
    prepTime: 30,
    timeWindow: "07:00 PM - 09:00 PM",
    provider: { kitchenName: "Chef Rohit", area: "Baner" }
  },
  {
    _id: "mock-4",
    name: "Masala Dosa",
    price: 120,
    pricePer: "per plate",
    quantity: 15,
    status: "available",
    description: "Golden crispy dosa stuffed with spiced potato filling and served with chutneys.",
    images: ["https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg"],
    bringContainer: false,
    prepTime: 15,
    timeWindow: "08:00 AM - 10:00 AM",
    provider: { kitchenName: "Anjali Kitchen", area: "Hinjewadi" }
  }
];

const availableChefs = [
  {
    id: "chef-1",
    name: "Chef Meena",
    cuisine: "Maharashtrian Specialist",
    rating: 4.9,
    price: "₹450/day",
    location: "Kothrud, Pune",
    image: "https://images.pexels.com/photos/887827/pexels-photo-887827.jpeg",
    distance: "0.9 Km",
    availableHours: "10:00 AM - 04:00 PM",
    instantBooking: true
  },
  {
    id: "chef-2",
    name: "Chef Rohit",
    cuisine: "Continental Expert",
    rating: 4.8,
    price: "₹800/day",
    location: "Baner, Pune",
    image: "https://images.pexels.com/photos/3771120/pexels-photo-3771120.jpeg",
    distance: "2.1 Km",
    availableHours: "08:00 AM - 11:00 PM",
    instantBooking: true
  },
  {
    id: "chef-3",
    name: "Chef Priya",
    cuisine: "North Indian & Tiffin",
    rating: 4.7,
    price: "₹500/day",
    location: "Wakad, Pune",
    image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
    distance: "1.4 Km",
    availableHours: "11:00 AM - 09:00 PM",
    instantBooking: false
  }
];

/**
 * High-Fidelity Details & Reservation Modal Sheet
 */
function DetailsModal({ show, onClose, data, type, onConfirm }) {
  const [quantityToReserve, setQuantityToReserve] = useState(1);

  useEffect(() => {
    if (show) setQuantityToReserve(1);
  }, [show, data]);

  if (!show || !data) return null;

  const isOutOfStock = type === "food" && (data.status === "out" || data.quantity <= 0);
  const totalPrice = type === "food" ? data.price * quantityToReserve : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 transform transition-all animate-slideUp">
        {/* Banner Graphic Header Layer */}
        <div className="relative h-60 w-full bg-slate-100">
          <img 
            src={data.images?.[0] || data.image || "https://images.pexels.com/photos/2474658/pexels-photo-2474658.jpeg"} 
            alt={data.name} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md flex items-center justify-center text-sm font-bold transition-all"
          >
            ✕
          </button>
          <div className="absolute bottom-5 left-6 right-6 text-white">
            <p className="text-[10px] font-black tracking-widest text-emerald-400 uppercase mb-1">
              {type === "chef" ? data.cuisine : `By ${data.provider?.kitchenName || 'Home Kitchen'}`}
            </p>
            <h2 className="text-2xl font-black tracking-tight leading-tight">{data.name}</h2>
          </div>
        </div>

        {/* Content Details Block Layout */}
        <div className="p-6 space-y-5">
          <div className="space-y-3 text-slate-600">
            {type === "chef" ? (
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Location</span>
                  <p className="font-semibold text-slate-800 mt-0.5 text-sm">📍 {data.location}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Rating Score</span>
                  <p className="font-semibold text-slate-800 mt-0.5 text-sm">⭐ {data.rating} / 5.0</p>
                </div>
                <div className="col-span-2 pt-3 border-t border-slate-200/60">
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Service Schedule</span>
                  <p className="font-semibold text-slate-800 mt-0.5 text-sm">🕒 {data.availableHours}</p>
                </div>
              </div>
            ) : (
              <>
                <p className="text-slate-600 text-sm leading-relaxed">{data.description}</p>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Unit Cost</span>
                    <span className="font-extrabold text-slate-900 text-sm">₹{data.price} <span className="text-xs font-medium text-slate-400">/{data.pricePer || "serving"}</span></span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Prep Lead Time</span>
                    <span className="font-extrabold text-slate-900 text-sm">⏳ {data.prepTime || 30} mins</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100/50 text-xs space-y-1.5 text-slate-700">
                  <div className="flex justify-between"><span className="text-slate-400 font-medium">Pickup/Delivery window:</span> <span className="font-bold text-slate-800">{data.timeWindow}</span></div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Available Inventory:</span> 
                    <span className={`font-black ${isOutOfStock ? "text-rose-600" : "text-emerald-800"}`}>
                      {data.quantity} servings left
                    </span>
                  </div>
                </div>

                {data.bringContainer && (
                  <div className="text-[11px] text-amber-800 bg-amber-50/60 border border-amber-200/50 p-3 rounded-xl flex gap-2.5 items-start">
                    <span className="text-xs mt-0.5">⚠️</span>
                    <p className="font-medium leading-normal">Please arrange to bring or hand over a clean personal tiffin/meal container upon order collection.</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Dynamic Portions Controls Matrix */}
          {type === "food" && !isOutOfStock && (
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-extrabold text-slate-800">Portions to reserve</span>
                <span className="text-[10px] text-slate-400 font-medium">Adjust quantity requirements</span>
              </div>
              <div className="flex items-center gap-3 bg-white p-1 rounded-xl shadow-sm border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setQuantityToReserve(prev => Math.max(1, prev - 1))}
                  disabled={quantityToReserve <= 1}
                  className="w-8 h-8 rounded-lg bg-slate-50 font-black text-slate-700 flex items-center justify-center transition hover:bg-slate-100 disabled:opacity-30"
                >
                  —
                </button>
                <span className="text-sm font-black text-slate-900 min-w-[20px] text-center">{quantityToReserve}</span>
                <button
                  type="button"
                  onClick={() => setQuantityToReserve(prev => Math.min(data.quantity, prev + 1))}
                  disabled={quantityToReserve >= data.quantity}
                  className="w-8 h-8 rounded-lg bg-slate-50 font-black text-slate-700 flex items-center justify-center transition hover:bg-slate-100 disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Dynamic Structural Operational Buttons array */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              type="button"
              className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 font-bold text-xs rounded-xl text-slate-600 transition"
            >
              Close
            </button>
            <button
              onClick={() => {
                if (type === "food") {
                  onConfirm(data._id, quantityToReserve);
                } else {
                  onClose();
                  window.location.href = `mailto:support@platform.com?subject=Inquiry regarding ${encodeURIComponent(data.name)}`;
                }
              }}
              disabled={isOutOfStock}
              className={`flex-[2] py-3 text-white rounded-xl font-bold text-xs tracking-wide transition-all shadow-md ${
                isOutOfStock 
                  ? "bg-slate-300 shadow-none cursor-not-allowed text-slate-500" 
                  : "bg-emerald-700 hover:bg-emerald-800 shadow-emerald-950/10"
              }`}
            >
              {isOutOfStock ? "Out of Stock" : type === "food" ? `Confirm Checkout • ₹${totalPrice}` : "Inquire Availability"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FindServices() {
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [activeTab, setActiveTab] = useState("chefs");
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [foods, setFoods] = useState(initialFoodsFallback);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  useEffect(() => {
    fetchLiveFoods();
  }, []);

  const fetchLiveFoods = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/foods');
      if (response.data?.success && response.data.foodItems?.length > 0) {
        setFoods(response.data.foodItems);
      }
    } catch (err) {
      console.log("Using system standard fallback localized structures.");
    } finally {
      setLoading(false);
    }
  };

  const filteredChefs = useMemo(() => {
    const query = deferredSearchQuery.trim().toLowerCase();
    if (!query) return availableChefs;
    return availableChefs.filter(
      (chef) =>
        chef.name.toLowerCase().includes(query) ||
        chef.cuisine.toLowerCase().includes(query) ||
        chef.location.toLowerCase().includes(query)
    );
  }, [deferredSearchQuery]);

  const filteredFoods = useMemo(() => {
    const query = deferredSearchQuery.trim().toLowerCase();
    if (!query) return foods;
    return foods.filter(
      (food) =>
        food.name?.toLowerCase().includes(query) ||
        food.provider?.kitchenName?.toLowerCase().includes(query) ||
        food.description?.toLowerCase().includes(query)
    );
  }, [foods, deferredSearchQuery]);

  const handleReserveFood = async (foodItemId, count) => {
    const selectedFood = foods.find(f => f._id === foodItemId);
    if (!selectedFood) return;

    const providerName = selectedFood.provider?.kitchenName || 'Home Kitchen';
    const foodName = selectedFood.name || 'Gourmet Dish';
    const unitPrice = selectedFood.price || 0;
    
    const generateHydratedBookingRecord = (sourceTag) => ({
      id: `${sourceTag}-${Math.floor(100000 + Math.random() * 900000)}`,
      providerName,
      serviceType: `${foodName} (${count} Servings)`,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'Confirmed',
      price: `₹${unitPrice * count}`,
      paymentStatus: 'Settled via Wallet'
    });

    // Simulated local fallback pipeline loop
    if (String(foodItemId).startsWith('mock-')) {
      setFoods(prev => prev.map(f => f._id === foodItemId ? { ...f, quantity: Math.max(0, f.quantity - count) } : f));
      
      const currentLogs = JSON.parse(localStorage.getItem('bookings')) || [];
      currentLogs.push(generateHydratedBookingRecord('MCK'));
      localStorage.setItem('bookings', JSON.stringify(currentLogs));

      triggerToast(`Successfully reserved ${count} portions of ${foodName}!`, "success");
      setShowModal(false);
      return;
    }

    try {
      const response = await axios.post('/api/orders', { foodItemId, quantity: count });
      if (response.data?.success) {
        const currentLogs = JSON.parse(localStorage.getItem('bookings')) || [];
        currentLogs.push(generateHydratedBookingRecord('BKG'));
        localStorage.setItem('bookings', JSON.stringify(currentLogs));

        triggerToast("Order registration validated and confirmed!", "success");
        setShowModal(false);
        fetchLiveFoods();
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || "Failed to process database registration checkout transaction.", "error");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto pb-20 space-y-8 animate-fadeIn text-slate-800">
      {/* Dynamic Native System Toast System */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border text-xs font-bold tracking-wide animate-slideUp backdrop-blur-md ${
          toast.type === "error" ? "bg-rose-50 text-rose-900 border-rose-200" : "bg-emerald-50 text-emerald-950 border-emerald-200"
        }`}>
          <span>{toast.type === "error" ? "✕" : "✓"}</span>
          {toast.message}
        </div>
      )}

      {/* Header Matrix Section Component */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Marketplace Finder</h1>
          <p className="text-slate-400 text-xs sm:text-sm font-medium mt-0.5">Explore premium active home chefs and micro-kitchen operations around Pune.</p>
        </div>
        
        <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 self-start sm:self-auto">
          <button
            onClick={() => { setActiveTab("chefs"); setSearchQuery(""); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "chefs" ? "bg-white text-emerald-950 shadow-sm" : "text-slate-400 hover:text-slate-800"}`}
          >
            👨‍🍳 Chefs
          </button>
          <button
            onClick={() => { setActiveTab("foods"); setSearchQuery(""); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "foods" ? "bg-white text-emerald-950 shadow-sm" : "text-slate-400 hover:text-slate-800"}`}
          >
            🍽️ Live Menus
          </button>
        </div>
      </div>

      {/* Search Layout Box */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 sm:p-4">
        <div className="relative flex items-center">
          <span className="absolute left-4 text-slate-400 text-sm pointer-events-none">🔍</span>
          <input
            type="text"
            placeholder={activeTab === "chefs" ? "Search cooks by name, cuisine specialties, areas..." : "Search menu items by dishes, keywords, kitchens..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-10 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-700 transition-all text-slate-800 placeholder-slate-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-4 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-200/50 w-5 h-5 rounded-full flex items-center justify-center">×</button>
          )}
        </div>
      </div>

      {/* Primary Grid Layout Frame */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-100 space-y-4 animate-pulse">
                <div className="bg-slate-100 h-40 w-full rounded-xl" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-9 bg-slate-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : activeTab === "chefs" ? (
          filteredChefs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredChefs.map((chef) => (
                <div key={chef.id} className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
                  <div className="relative w-full h-44 overflow-hidden bg-slate-50">
                    <img src={chef.image} alt={chef.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    <span className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-black text-white tracking-wide">
                      {chef.price}
                    </span>
                  </div>
                  
                  <div className="p-4 flex flex-col flex-grow gap-4">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 truncate tracking-tight group-hover:text-emerald-800 transition-colors">{chef.name}</h3>
                      <span className="inline-block border border-emerald-100 bg-emerald-50 px-2 py-0.5 mt-1.5 rounded-md font-extrabold text-[9px] text-emerald-800 uppercase tracking-wider">
                        {chef.cuisine}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-500 pt-3 border-t border-slate-100 font-medium mt-auto">
                      <p className="flex items-center gap-1.5 truncate"><span>📍</span> {chef.location}</p>
                      <div className="flex justify-between items-center bg-slate-50 px-2 py-1.5 rounded-lg text-[10px]">
                        <span className="text-slate-500 font-bold">🚗 {chef.distance} away</span>
                        <span className="text-amber-600 font-black flex items-center gap-0.5">★ {chef.rating}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => { setSelectedItem(chef); setShowModal(true); }} 
                      className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm"
                    >
                      Book Professional Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 text-slate-400 text-xs font-medium">No professional culinary profiles match your search criteria.</div>
          )
        ) : (
          filteredFoods.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredFoods.map((food) => {
                const isOutOfStock = food.status === "out" || food.quantity <= 0;
                return (
                  <div key={food._id} className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
                    <div className="relative w-full h-44 overflow-hidden bg-slate-50">
                      <img src={food.images?.[0]} alt={food.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      <span className="absolute top-3 right-3 bg-emerald-900 px-2.5 py-1 rounded-lg text-[10px] font-black text-white shadow-sm">
                        ₹{food.price}
                      </span>
                    </div>

                    <div className="p-4 flex flex-col flex-grow gap-4">
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 truncate tracking-tight group-hover:text-emerald-800 transition-colors">{food.name}</h3>
                        <span className="inline-block border border-slate-200 bg-slate-50 px-2 py-0.5 mt-1.5 rounded-md font-extrabold text-[9px] text-slate-500 uppercase tracking-wider">
                          👩‍🍳 {food.provider?.kitchenName} ({food.provider?.area})
                        </span>
                      </div>

                      <div className="space-y-2 mt-auto pt-3 border-t border-slate-100">
                        <div className={`flex items-center justify-between text-[10px] px-2 py-1.5 rounded-lg font-bold border ${
                          isOutOfStock ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50/60 text-emerald-800 border-emerald-100/30'
                        }`}>
                          <span>Stock Availability:</span>
                          <span>{isOutOfStock ? "Sold Out" : `${food.quantity} left`}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => { setSelectedItem(food); setShowModal(true); }}
                        disabled={isOutOfStock}
                        className={`w-full py-2.5 rounded-xl text-white text-xs font-bold transition-all ${
                          isOutOfStock ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" : "bg-emerald-700 hover:bg-emerald-800 shadow-sm"
                        }`}
                      >
                        {isOutOfStock ? "Out of Stock" : "Reserve Portion 🍽️"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 text-slate-400 text-xs font-medium">No live meal options align with current query filters.</div>
          )
        )}
      </div>

      {/* Managed Isolated Modal Mounting Core Context Portal */}
      <DetailsModal
        show={showModal}
        onClose={() => { setShowModal(false); setSelectedItem(null); }}
        data={selectedItem}
        type={activeTab === "chefs" ? "chef" : "food"}
        onConfirm={handleReserveFood}
      />
    </div>
  );
}