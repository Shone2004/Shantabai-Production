import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Saved fallback mock data so your layout never renders empty cards!
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
    timeWindow: "09/06/26 - 10am : 11am",
    provider: { kitchenName: "Chef Meena", area: "Kothrud, Pune" }
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
    timeWindow: "09/06/26 - 12pm : 2pm",
    provider: { kitchenName: "Chef Priya", area: "Wakad, Pune" }
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
    timeWindow: "09/06/26 - 7pm : 9pm",
    provider: { kitchenName: "Chef Rohit", area: "Baner, Pune" }
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
    timeWindow: "09/06/26 - 8am : 10am",
    provider: { kitchenName: "Anjali Kitchen", area: "Hinjewadi, Pune" }
  }
];

const availableChefs = [
  {
    id: 1,
    name: "Chef Meena",
    cuisine: "Maharashtrian Specialist",
    rating: 4.9,
    price: "₹450/day",
    location: "Kothrud, Pune",
    image: "https://images.pexels.com/photos/887827/pexels-photo-887827.jpeg",
    distance: "0.9 Km",
    availableHours: "10am : 4pm",
    instantBooking: true
  },
  {
    id: 2,
    name: "Chef Rohit",
    cuisine: "Continental Expert",
    rating: 4.8,
    price: "₹800/day",
    location: "Baner, Pune",
    image: "https://images.pexels.com/photos/3771120/pexels-photo-3771120.jpeg",
    distance: "2.1 Km",
    availableHours: "08am : 11pm",
    instantBooking: true
  },
  {
    id: 3,
    name: "Chef Priya",
    cuisine: "North Indian & Tiffin",
    rating: 4.7,
    price: "₹500/day",
    location: "Wakad, Pune",
    image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
    distance: "1.4 Km",
    availableHours: "11am : 09pm",
    instantBooking: false
  }
];

export default function FindServices() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("chefs");
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [foods, setFoods] = useState(initialFoodsFallback);
  const [loading, setLoading] = useState(false);

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
      console.log("Backend offline or unreachable. Displaying fallback local card templates.");
    } finally {
      setLoading(false);
    }
  };

  const filteredChefs = availableChefs.filter(
    (chef) =>
      chef.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chef.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chef.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFoods = foods.filter(
    (food) =>
      food.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.provider?.kitchenName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReserveFood = async (foodItemId, count) => {
    const selectedFood = foods.find(f => f._id === foodItemId);
    const providerName = selectedFood?.provider?.kitchenName || 'Home Kitchen';
    const foodName = selectedFood?.name || 'Delicious Meal';
    const unitPrice = selectedFood?.price || 0;
    
    const createNewLocalBookingObject = (idPrefix) => ({
      id: `${idPrefix}-${Math.floor(1000 + Math.random() * 9000)}`,
      providerName: providerName,
      serviceType: `${foodName} (${count} servings)`,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'Confirmed',
      price: `₹${unitPrice * count}`,
      paymentStatus: 'Paid via Wallet/API',
      image: `https://ui-avatars.com/api/?name=${encodeURIComponent(providerName)}&background=f43f5e&color=fff&size=128`,
      tab: 'upcoming'
    });

    if (String(foodItemId).startsWith('mock-')) {
      setFoods(prev => prev.map(f => f._id === foodItemId ? { ...f, quantity: Math.max(0, f.quantity - count) } : f));
      
      const existing = JSON.parse(localStorage.getItem('bookings')) || [];
      existing.push(createNewLocalBookingObject('MCK'));
      localStorage.setItem('bookings', JSON.stringify(existing));

      alert("Reservation Simulation Successful (Mock Template Mode)!");
      setShowModal(false);
      return;
    }

    try {
      const payload = {
        foodItemId: foodItemId,
        quantity: count,
        customerNote: "Ordered via web application dashboard portal."
      };
      const response = await axios.post('/api/orders', payload);
      if (response.data?.success) {
        const existing = JSON.parse(localStorage.getItem('bookings')) || [];
        existing.push(createNewLocalBookingObject('BKG'));
        localStorage.setItem('bookings', JSON.stringify(existing));

        alert("Reservation created successfully!");
        setShowModal(false);
        fetchLiveFoods();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Could not complete live registration booking.");
    }
  };

  function DetailsModal({ show, onClose, data, type, onConfirm }) {
    const [quantityToReserve, setQuantityToReserve] = useState(1);

    useEffect(() => {
      if (show) setQuantityToReserve(1);
    }, [show, data]);

    if (!show || !data) return null;

    const isOutOfStock = type === "food" && (data.status === "out" || data.quantity <= 0);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-[90%] md:w-[500px] bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100">
          <img 
            src={data.images?.[0] || data.image || "https://images.pexels.com/photos/2474658/pexels-photo-2474658.jpeg"} 
            alt={data.name} 
            className="w-full h-56 object-cover" 
          />
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{data.name}</h2>
            <p className="text-gray-500 mb-3">
              {type === "chef" ? data.cuisine : `By ${data.provider?.kitchenName || 'Home Kitchen'}`}
            </p>

            <div className="space-y-2 text-sm text-gray-700">
              {type === "chef" ? (
                <>
                  <p>📍 {data.location}</p>
                  <p>⭐ Rating: {data.rating}</p>
                  <p>💰 Price: {data.price}</p>
                </>
              ) : (
                <>
                  <p>{data.description}</p>
                  <p>💰 Price: ₹{data.price} ({data.pricePer || "per serving"})</p>
                  <p>⏳ Prep Time: {data.prepTime || 30} mins</p>
                  <p>📦 Pickup Window: {data.timeWindow || "Flexible Today"}</p>
                  <p className={`font-bold ${isOutOfStock ? "text-red-500" : "text-blue-600"}`}>
                    📊 Portions Available: {data.quantity} left
                  </p>
                  {data.bringContainer && (
                    <p className="text-xs text-orange-600 bg-orange-50 border border-orange-100 p-2 rounded-xl mt-1 font-medium">
                      ⚠️ Note: Please bring your own container to pick up this specific meal option.
                    </p>
                  )}
                </>
              )}
            </div>

            {type === "food" && !isOutOfStock && (
              <div className="mt-5 p-3 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between">
                <span className="text-sm font-bold text-gray-800">Select Quantity:</span>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setQuantityToReserve(prev => Math.max(1, prev - 1))}
                    disabled={quantityToReserve <= 1}
                    className="w-8 h-8 rounded-xl bg-white border border-gray-300 font-bold text-gray-700 flex items-center justify-center transition"
                  >
                    —
                  </button>
                  <span className="text-base font-black text-gray-900 min-w-[20px] text-center">{quantityToReserve}</span>
                  <button
                    type="button"
                    onClick={() => setQuantityToReserve(prev => Math.min(data.quantity, prev + 1))}
                    disabled={quantityToReserve >= data.quantity}
                    className="w-8 h-8 rounded-xl bg-white border border-gray-300 font-bold text-gray-700 flex items-center justify-center transition"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                if (type === "food") {
                  onConfirm(data._id, quantityToReserve);
                } else {
                  onClose();
                }
              }}
              disabled={isOutOfStock}
              className={`mt-6 w-full py-3 text-white rounded-2xl font-bold transition-all ${isOutOfStock ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"}`}
            >
              {isOutOfStock ? "Out of Stock" : type === "food" ? `Confirm Order (${quantityToReserve})` : "Pay"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Services in Pune</h1>
        <p className="text-gray-500">Find the perfect home chef or freshly prepared food for your needs.</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search chefs, cuisines, foods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab("chefs")}
          className={`px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === "chefs" ? "bg-black text-white shadow-lg" : "bg-white border border-gray-200 text-gray-700"}`}
        >
          👨‍🍳 Available Chefs
        </button>
        <button
          onClick={() => setActiveTab("foods")}
          className={`px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === "foods" ? "bg-green-600 text-white shadow-lg" : "bg-white border border-gray-200 text-gray-700"}`}
        >
          🍽️ Available Foods
        </button>
      </div>

      {loading && <div className="text-center py-6 text-gray-400 animate-pulse">Syncing active menus...</div>}

      {/* CHEFS TAB */}
      {activeTab === "chefs" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredChefs.map((chef) => (
            <div key={chef.id} className="group bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg flex flex-col">
              <div className="relative w-full h-40 overflow-hidden">
                <img src={chef.image} alt={chef.name} className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-sm font-bold text-gray-900">{chef.price}</div>
              </div>
              <div className="p-3.5 flex flex-col flex-grow gap-2.5">
                <div>
                  <h3 className="text-base font-bold text-gray-900 truncate uppercase">{chef.name}</h3>
                  <div className="inline-block border border-gray-900 bg-gray-50 px-2 py-0.5 mt-1 rounded-md font-bold text-[11px] text-gray-700 uppercase">BY: {chef.cuisine}</div>
                </div>
                <div className="space-y-1.5 text-xs text-gray-600 font-medium pt-2 border-t border-gray-100">
                  <p>📍 {chef.location}</p>
                  <div className="flex justify-between">
                    <span>🚗 {chef.distance}</span>
                    <span className="text-orange-500 font-bold">★ {chef.rating}</span>
                  </div>
                </div>
                <button onClick={() => { setSelectedItem(chef); setShowModal(true); }} className="w-full mt-auto py-2 rounded-xl bg-black text-white text-xs font-bold">
                  Book Chef 👨‍🍳
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FOODS TAB */}
      {activeTab === "foods" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFoods.map((food) => {
            const isOutOfStock = food.status === "out" || food.quantity <= 0;
            return (
              <div key={food._id} className="group bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg flex flex-col">
                <div className="relative w-full h-40 overflow-hidden">
                  <img 
                    src={food.images?.[0] || "https://images.pexels.com/photos/2474658/pexels-photo-2474658.jpeg"} 
                    alt={food.name} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-sm font-bold text-gray-900">₹{food.price}</div>
                </div>
                <div className="p-3.5 flex flex-col flex-grow gap-2.5">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 truncate uppercase">{food.name}</h3>
                    <div className="inline-block border border-gray-900 bg-gray-50 px-2 py-0.5 mt-1 rounded-md font-bold text-[11px] text-gray-700 uppercase">
                      BY: {food.provider?.kitchenName || 'Home Kitchen'}
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-gray-600 font-medium pt-2 border-t border-gray-100">
                    <p>📍 {food.provider?.area || 'Pune Region'}</p>
                    <div className={`flex items-center justify-between text-[11px] px-2 py-1 rounded-lg border font-bold ${isOutOfStock ? 'bg-red-50 text-red-800 border-red-100' : 'bg-blue-50 text-blue-800 border-blue-100'}`}>
                      <span>📊 Quantities:</span>
                      <span>{food.quantity} servings left</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { setSelectedItem(food); setShowModal(true); }}
                    disabled={isOutOfStock}
                    className={`w-full mt-auto py-2 rounded-xl text-white text-xs font-bold transition-all ${isOutOfStock ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
                  >
                    {isOutOfStock ? "Out of Stock ❌" : "Reserve Food 🍽️"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DetailsModal
        show={showModal}
        onClose={() => setShowModal(false)}
        data={
          selectedItem 
            ? (activeTab === "foods" ? foods.find(f => f._id === selectedItem._id) : selectedItem)
            : null
        }
        type={activeTab === "chefs" ? "chef" : "food"}
        onConfirm={handleReserveFood}
      />
    </div>
  );
}