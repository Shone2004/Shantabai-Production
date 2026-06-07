import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FoodCard from '../../components/food/FoodCard.jsx';

export default function FoodPage() {
  const [activeCategory, setActiveCategory] = useState('All Meals');
  const [vegOnly, setVegOnly] = useState(false);
  const [nonVegOnly, setNonVegOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevance');

  // Mock Foods matching HomePage data structure
  const allFoods = [
    {
      id: 'f4', name: 'Authentic Indori Poha', price: 40, pricePer: '', image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600', description: 'Soft and light poha with peanuts, curry leaves, lemon and mild spices.', availabilityDetails: { isAvailable: true, ordersToday: 120, left: 7, total: 15 }, timeWindow: '9:00 - 10:00 AM', location: 'Baner, Pune', distance: '1.2 km away', tags: ['Veg', 'Healthy', 'Homemade'], provider: { name: 'Savitri\'s Kitchen', avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150', rating: 4.9, ordersCount: '120+', isVerified: true, badges: [] }
    },
    {
      id: 'f1', name: 'Homestyle Premium Veg Tiffin', price: 120, pricePer: '', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600', description: 'Authentic vegetarian thali with 2 sabzis, dal, rice, and chapatis.', availabilityDetails: { isAvailable: true, ordersToday: 450, left: 14, total: 20 }, timeWindow: '12:30 - 2:00 PM', location: 'Kothrud, Pune', distance: '2.5 km away', tags: ['Veg', 'Authentic'], provider: { name: 'Ghar Ka Swaad Network', avatar: 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=150', rating: 4.8, ordersCount: '450+', isVerified: true, badges: [] }
    },
    {
      id: 'f2', name: 'Kolhapuri Chicken Thali', price: 180, pricePer: '', image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=600', description: 'Spicy and flavorful chicken curry served with steamed basmati rice.', availabilityDetails: { isAvailable: true, ordersToday: 80, left: 3, total: 10 }, timeWindow: '8:00 - 9:30 PM', location: 'Baner, Pune', distance: '1.5 km away', tags: ['Non-Veg', 'Spicy'], provider: { name: 'Chef Aarav\'s Culinary', avatar: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150', rating: 4.9, ordersCount: '80+', isVerified: true, badges: [] }
    },
    {
      id: 'f9', name: 'Misal Pav', price: 60, pricePer: 'per plate', image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800', description: 'Spicy sprouted moth bean curry served with fresh pav, topped with farsan.', availabilityDetails: { isAvailable: true, ordersToday: 24, left: 2, total: 30 }, timeWindow: '8:30 - 11:00 AM', location: 'Katraj, Pune', distance: '4.2 km away', tags: ['Veg', 'Spicy', 'Street Food'], provider: { name: 'Ramesh\'s Misal', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150', rating: 4.8, ordersCount: '300+', isVerified: true, badges: [] }
    },
    {
      id: 'f11', name: 'Fish Fry Thali', price: 180, pricePer: 'per thali', image: 'https://images.unsplash.com/photo-1626200419109-383842cb36a0?w=800', description: 'Crispy rava fried fish served with solkadhi, rice, and bhakri.', availabilityDetails: { isAvailable: true, ordersToday: 4, left: 6, total: 10 }, timeWindow: '1:00 - 3:30 PM', location: 'Kothrud, Pune', distance: '3.5 km away', tags: ['Non-Veg', 'Seafood'], provider: { name: 'Konkani Katta', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', rating: 4.7, ordersCount: '110+', isVerified: true, badges: [] }
    },
    {
      id: 'f12', name: 'Paneer Tikka Masala', price: 140, pricePer: 'per portion', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800', description: 'Charcoal grilled paneer chunks in a rich, creamy tomato gravy.', availabilityDetails: { isAvailable: true, ordersToday: 8, left: 12, total: 20 }, timeWindow: '7:00 - 10:00 PM', location: 'Wakad, Pune', distance: '5.0 km away', tags: ['Veg', 'Rich'], provider: { name: 'Punjabi Tadka', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150', rating: 4.5, ordersCount: '180+', isVerified: false, badges: [] }
    }
  ];

  const categories = ['All Meals', 'Breakfast Specials', 'Daily Tiffins', 'Festive / Event Catering', 'Home-baked Goods'];

  const handleVegToggle = () => {
    setVegOnly(!vegOnly);
    if (!vegOnly) setNonVegOnly(false);
  };

  const handleNonVegToggle = () => {
    setNonVegOnly(!nonVegOnly);
    if (!nonVegOnly) setVegOnly(false);
  };

  let displayedFoods = allFoods.filter(food => {
    if (vegOnly && !food.tags.includes('Veg')) return false;
    if (nonVegOnly && !food.tags.includes('Non-Veg')) return false;
    if (searchQuery && !food.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (sortBy === 'price_asc') {
    displayedFoods.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price_desc') {
    displayedFoods.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'distance') {
    displayedFoods.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  }

  return (
    <div className="min-h-screen bg-slate-50/30 text-slate-800 font-sans selection:bg-brand-green selection:text-white pb-24">
      
      {/* SEARCH AND FILTER STICKY HEADER */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/60 shadow-sm transition-all pt-4 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          
          {/* Top Row: Search Bar (Left) and Filters (Right) */}
          <div className="flex flex-col xl:flex-row gap-4 xl:items-center justify-between w-full">
            
            {/* Search Bar */}
            <div className="flex-1 w-full max-w-2xl relative group">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for homemade Poha, regional Tiffin services..."
                className="w-full bg-gray-50 border border-gray-200 focus:border-brand-green focus:bg-white focus:ring-4 focus:ring-brand-green/10 rounded-2xl pl-12 pr-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none transition-all duration-300"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3.5 pointer-events-none group-focus-within:text-brand-green transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="mt-1.5 text-[11px] text-gray-500 font-medium px-2 tracking-wide absolute -bottom-5 left-0">
                <span className="text-brand-green font-bold mr-1">Trending:</span> 
                Indori Poha, Homemade Idli
              </p>
            </div>

            {/* Right Side Filters */}
            <div className="flex flex-wrap items-center gap-2 shrink-0 pt-3 xl:pt-0">
              
              {/* Veg Toggle */}
              <button 
                onClick={handleVegToggle}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-xs font-bold inline-flex items-center gap-1.5 transition-all ${
                  vegOnly 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className={vegOnly ? 'opacity-100' : 'opacity-50 grayscale'}>🟢</span> Veg Only
              </button>
              
              {/* Non-Veg Toggle */}
              <button 
                onClick={handleNonVegToggle}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-xs font-bold inline-flex items-center gap-1.5 transition-all ${
                  nonVegOnly 
                    ? 'bg-red-50 border-red-200 text-red-700' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className={nonVegOnly ? 'opacity-100' : 'opacity-50 grayscale'}>🔴</span> Non-Veg
              </button>

              <div className="w-px h-5 bg-gray-200 mx-1 hidden sm:block"></div>

              {/* Star Rating */}
              <button className="flex-shrink-0 px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 inline-flex items-center gap-1.5 transition-all">
                <span className="text-amber-500">⭐</span> 4.5+ Rated
              </button>

              {/* Sort Dropdown */}
              <div className="flex-shrink-0 inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full px-3 py-1.5 hover:bg-gray-50 transition-colors cursor-pointer">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-xs font-bold text-gray-700 outline-none cursor-pointer pr-1 appearance-none"
                >
                  <option value="relevance">Sort: Relevance</option>
                  <option value="price_asc">Sort: Price Low-High</option>
                  <option value="price_desc">Sort: Price High-Low</option>
                  <option value="distance">Sort: Distance</option>
                </select>
              </div>
            </div>

          </div>

          {/* Bottom Row: Categories (Wrapped) */}
          <div className="flex flex-wrap items-center gap-2 pt-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-colors border ${
                  activeCategory === cat 
                    ? 'bg-brand-green border-brand-green text-white shadow-sm' 
                    : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-2">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              Fresh Homemade Dishes 
              <span className="px-2.5 py-1 rounded bg-rose-100 text-rose-700 text-[10px] uppercase font-black tracking-widest flex items-center gap-1.5 border border-rose-200">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span> LIVE
              </span>
            </h2>
            <p className="text-gray-500 font-medium mt-1 text-sm">Discover what local home cooks are preparing near you today.</p>
          </div>
          <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            <span className="text-sm font-semibold text-gray-600">Showing <span className="text-brand-green font-bold">{displayedFoods.length}</span> options</span>
          </div>
        </div>

        {/* Grid */}
        {displayedFoods.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-8 gap-y-12">
            <AnimatePresence>
              {displayedFoods.map((food, idx) => (
                <motion.div
                  key={food.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 100, damping: 15, delay: idx * 0.05 }}
                  className="w-full"
                >
                  <FoodCard food={food} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-gray-100 shadow-sm"
          >
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">🍽️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No dishes found</h3>
            <p className="text-gray-500 font-medium max-w-sm mb-6 text-sm">We couldn't find anything matching your filters. Try adjusting them or searching for something else.</p>
            <button 
              onClick={() => { setVegOnly(false); setNonVegOnly(false); setSearchQuery(''); setActiveCategory('All Meals'); }}
              className="px-5 py-2.5 rounded-full bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition-colors"
            >
              Reset Filters
            </button>
          </motion.div>
        )}

      </main>
    </div>
  );
}
