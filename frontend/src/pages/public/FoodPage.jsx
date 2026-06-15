import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import FoodCard from '../../components/food/FoodCard.jsx';
import api from '../../services/api';

export default function FoodPage() {
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('All Meals');
  const [vegOnly, setVegOnly] = useState(false);
  const [nonVegOnly, setNonVegOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState('relevance');

  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/foods');
        if (response.data.success) {
          const mappedFoods = response.data.foodItems.map(item => {
            const providerInfo = item.provider || {};
            return {
              id: item._id,
              name: item.name,
              price: item.price,
              pricePer: item.pricePer || 'per plate',
              image: item.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600',
              description: item.description,
              category: item.category,
              mealType: item.mealType || '',
              isVeg: item.isVeg,
              bringContainer: item.bringContainer ?? false,
              serviceDate: item.serviceDate,
              startTime: item.startTime,
              endTime: item.endTime,
              availabilityDetails: {
                isAvailable: item.quantity > 0 && item.status === 'available',
                ordersToday: item.ordersToday || 0,
                left: item.quantity,
                total: item.totalQuantity || item.quantity
              },
              timeWindow: item.timeWindow || '12:30 - 2:00 PM',
              location: providerInfo.area ? `${providerInfo.area}, ${providerInfo.city}` : 'Pune',
              distance: '1.2 km away',
              tags: [item.isVeg ? 'Veg' : 'Non-Veg', item.category, ...(item.tags || [])].filter(Boolean),
              provider: {
                name: providerInfo.kitchenName || 'Home Cook',
                avatar: providerInfo.avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150',
                rating: providerInfo.rating || 5.0,
                ordersCount: '100+',
                isVerified: providerInfo.isVerified || false,
                badges: []
              }
            };
          });
          setFoods(mappedFoods);
        }
      } catch (err) {
        console.error('Error fetching foods:', err);
        setError('Failed to load fresh homemade foods. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, []);

  const categories = [
    'All Meals',
    'Breakfast',
    'Lunch',
    'Dinner',
    'Daily Tiffin',
    'Snack',
    'Festive / Event',
    'Baked Goods'
  ];

  const handleVegToggle = () => {
    setVegOnly(!vegOnly);
    if (!vegOnly) setNonVegOnly(false);
  };

  const handleNonVegToggle = () => {
    setNonVegOnly(!nonVegOnly);
    if (!nonVegOnly) setVegOnly(false);
  };

  let displayedFoods = foods.filter(food => {
    // Filter by mealType (exact match against enum values)
    if (activeCategory !== 'All Meals') {
      if (food.mealType !== activeCategory) return false;
    }
    if (vegOnly && food.isVeg !== true) return false;
    if (nonVegOnly && food.isVeg !== false) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        food.name.toLowerCase().includes(q) ||
        food.description.toLowerCase().includes(q) ||
        food.provider.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (sortBy === 'price_asc') {
    displayedFoods.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price_desc') {
    displayedFoods.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'distance') {
    displayedFoods.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/30 text-slate-800 font-sans pb-24">
        <div className="bg-white border-b border-gray-200/60 shadow-sm pt-4 pb-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="h-12 bg-gray-200 rounded-2xl animate-pulse max-w-2xl" />
            <div className="h-10 bg-gray-200 rounded-full animate-pulse max-w-lg" />
          </div>
        </div>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-2">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-8 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-white border border-gray-100 rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50/30 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500 text-3xl">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Foods</h2>
          <p className="text-gray-500 mb-6 text-sm">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => window.location.reload()} className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-gray-800 transition-colors">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
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