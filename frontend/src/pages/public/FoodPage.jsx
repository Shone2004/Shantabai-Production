import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import FoodCard from '../../components/food/FoodCard.jsx';
import api from '../../services/api';
import { 
  Search, 
  Filter, 
  Coffee, 
  Utensils, 
  Soup, 
  Package, 
  Cake, 
  Sparkles, 
  X, 
  Clock, 
  Star 
} from 'lucide-react';

const placeholders = [
  "Search homemade meals...",
  "Search Poha, Tiffin, Idli...",
  "Search nearby home kitchens..."
];

const categoriesList = [
  { id: 'All Meals', label: 'All Meals', icon: Utensils },
  { id: 'Breakfast', label: 'Breakfast', icon: Coffee },
  { id: 'Lunch', label: 'Lunch', icon: Utensils },
  { id: 'Dinner', label: 'Dinner', icon: Soup },
  { id: 'Tiffin', label: 'Tiffin', icon: Package },
  { id: 'Bakery', label: 'Bakery', icon: Cake },
  { id: 'Festival', label: 'Festival', icon: Sparkles }
];

const mapCategoryToEnum = (catId) => {
  if (catId === 'All Meals') return 'All Meals';
  if (catId === 'Tiffin') return 'Daily Tiffin';
  if (catId === 'Bakery') return 'Baked Goods';
  if (catId === 'Festival') return 'Festive / Event';
  return catId;
};

export default function FoodPage() {
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('All Meals');
  const [vegOnly, setVegOnly] = useState(false);
  const [nonVegOnly, setNonVegOnly] = useState(false);
  const [availOnly, setAvailOnly] = useState(false);
  const [topRated, setTopRated] = useState(false);
  const [bringContainerOnly, setBringContainerOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState('relevance');

  // Search input focus state for animated placeholder
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  
  // Filter Sheet Modal State
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Rotating placeholder interval
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % placeholders.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

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

  const handleVegToggle = () => {
    setVegOnly(!vegOnly);
    if (!vegOnly) setNonVegOnly(false);
  };

  const handleNonVegToggle = () => {
    setNonVegOnly(!nonVegOnly);
    if (!nonVegOnly) setVegOnly(false);
  };

  let displayedFoods = foods.filter(food => {
    if (activeCategory !== 'All Meals') {
      if (food.mealType !== mapCategoryToEnum(activeCategory)) return false;
    }
    if (vegOnly && food.isVeg !== true) return false;
    if (nonVegOnly && food.isVeg !== false) return false;
    if (availOnly && !food.availabilityDetails.isAvailable) return false;
    if (topRated && food.provider.rating < 4.5) return false;
    if (bringContainerOnly && food.bringContainer !== true) return false;
    if (verifiedOnly && food.provider.isVerified !== true) return false;
    
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

  // Fresh Today Hero Section filters (active + available portion items)
  const freshTodayFoods = foods.filter(food => food.availabilityDetails.isAvailable).slice(0, 6);

  // Popular Near You items (editorial break carousel)
  const popularFoods = foods
    .filter(food => food.provider.rating >= 4.7 || food.availabilityDetails.ordersToday > 0)
    .slice(0, 6);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
        <div className="bg-white border-b border-slate-200/60 shadow-sm pt-4 pb-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="h-12 bg-slate-100 rounded-2xl animate-pulse max-w-2xl" />
            <div className="h-10 bg-slate-100 rounded-full animate-pulse max-w-lg" />
          </div>
        </div>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-2">
          <div className="h-6 bg-slate-100 rounded w-1/4 mb-8 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-white border border-slate-150 rounded-3xl h-72 animate-pulse" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/60 shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500 text-3xl">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Error Loading Foods</h2>
          <p className="text-slate-500 mb-6 text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  let popularBreakRendered = false;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-brand-green selection:text-white pb-24">
      
      {/* 1. SEARCH HEADER & TRENDING */}
      <div className="bg-white border-b border-slate-200/60 pt-4 pb-4 sticky top-0 z-35 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex gap-4 items-center">
            
            {/* Search Input Box */}
            <div className="relative flex-1 group">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full bg-slate-100/80 border border-transparent focus:border-brand-green/20 focus:bg-white focus:ring-4 focus:ring-brand-green/5 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition-all duration-300 shadow-[inset_0_2px_4px_rgba(15,23,42,0.01)]"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-4 pointer-events-none group-focus-within:text-brand-green transition-colors" />
              
              {/* Rotating Placeholders with subtle fade */}
              {!searchQuery && !isSearchFocused && (
                <div className="absolute left-12 top-4 pointer-events-none text-slate-400 text-sm font-medium select-none overflow-hidden h-5">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={placeholderIdx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                      className="block"
                    >
                      {placeholders[placeholderIdx]}
                    </motion.span>
                  </AnimatePresence>
                </div>
              )}
            </div>

          </div>

          {/* Trending Searches horizontal scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">Trending:</span>
            {['Poha', 'Tiffin', 'Veg Lunch', 'Idli', 'Maharashtrian'].map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="px-3.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-transparent text-[11px] font-bold text-slate-600 transition-colors shrink-0"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* 2. CATEGORIES SELECTOR ROW */}
        <section>
          <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-none snap-x justify-start pt-1">
            {categoriesList.map((cat) => {
              const IconComponent = cat.icon;
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="flex flex-col items-center shrink-0 group focus:outline-none cursor-pointer snap-start"
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 border ${
                    isSelected 
                      ? 'bg-brand-green text-white border-brand-green shadow-md shadow-brand-green/20 scale-105' 
                      : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200/80 shadow-sm shadow-slate-100/50'
                  }`}>
                    <IconComponent className="w-5.5 h-5.5" />
                  </div>
                  <span className={`text-[11px] font-bold tracking-tight mt-2 transition-colors ${
                    isSelected ? 'text-slate-950 font-extrabold' : 'text-slate-500 group-hover:text-slate-800'
                  }`}>
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. FRESH TODAY HERO CAROUSEL */}
        {freshTodayFoods.length > 0 && !searchQuery && activeCategory === 'All Meals' && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Fresh Today 
                <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 text-[9px] uppercase font-black tracking-widest border border-rose-100">Live</span>
              </h2>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
              {freshTodayFoods.map((food) => (
                <Link 
                  to={`/food/${food.id}`} 
                  key={`fresh-${food.id}`} 
                  className="min-w-[280px] sm:min-w-[320px] max-w-[320px] shrink-0 snap-start block"
                >
                  <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_36px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full group">
                    
                    {/* Food Image */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden shrink-0">
                      <img 
                        src={food.image} 
                        alt={food.name} 
                        className="w-full h-full object-cover transition-transform duration-750 ease-out group-hover:scale-104"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />
                      
                      {/* Availability Badge */}
                      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-xl shadow-sm text-[10px] font-black text-slate-800 uppercase tracking-wide">
                        {food.availabilityDetails.left <= 3 
                          ? "🔥 Only a few portions left" 
                          : food.availabilityDetails.left <= 7 
                            ? "⚡ Selling fast" 
                            : "✅ Fresh batch today"
                        }
                      </div>
                      
                      {/* Price Tag */}
                      <div className="absolute bottom-3 right-3 bg-brand-green/95 backdrop-blur-sm px-3 py-1 rounded-xl text-white font-black text-xs shadow-sm">
                        ₹{food.price}
                      </div>
                    </div>

                    {/* Card Details */}
                    <div className="p-4 flex flex-col justify-between flex-grow">
                      <div>
                        {/* Dish Name */}
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-tight line-clamp-1 group-hover:text-brand-green transition-colors">
                          {food.name}
                        </h3>
                        {/* Kitchen Name */}
                        <p className="text-xs text-slate-450 font-bold truncate mt-1">
                          by <span className="text-slate-700">{food.provider.name}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 4. FOOD RESULTS FEED SECTION */}
        <section className="space-y-4 pt-2">
          
          {/* Header Row & Inline Filter Pills */}
          <div className="border-t border-slate-200/60 pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Fresh Homemade Dishes</h2>
            </div>

            {/* Simplified Filters + Bottom Sheet trigger */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                <button 
                  onClick={handleVegToggle}
                  className={`px-3.5 py-1.5 rounded-full border text-[11px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                    vegOnly 
                      ? 'bg-green-50 border-green-200 text-green-700 font-extrabold' 
                      : 'bg-white border-slate-250/70 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full bg-green-600 ${vegOnly ? 'opacity-100' : 'opacity-50'}`} />
                  Veg
                </button>
                
                <button 
                  onClick={handleNonVegToggle}
                  className={`px-3.5 py-1.5 rounded-full border text-[11px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                    nonVegOnly 
                      ? 'bg-red-50 border-red-200 text-red-700 font-extrabold' 
                      : 'bg-white border-slate-250/70 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full bg-red-650 ${nonVegOnly ? 'opacity-100' : 'opacity-50'}`} />
                  Non-Veg
                </button>
                
                <button 
                  onClick={() => setAvailOnly(!availOnly)}
                  className={`px-3.5 py-1.5 rounded-full border text-[11px] font-bold inline-flex items-center transition-all cursor-pointer ${
                    availOnly 
                      ? 'bg-emerald-50 border-emerald-250 text-emerald-800 font-extrabold' 
                      : 'bg-white border-slate-250/70 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Available Today
                </button>
                
                <button 
                  onClick={() => setTopRated(!topRated)}
                  className={`px-3.5 py-1.5 rounded-full border text-[11px] font-bold inline-flex items-center transition-all cursor-pointer ${
                    topRated 
                      ? 'bg-amber-50 border-amber-250 text-amber-800 font-extrabold' 
                      : 'bg-white border-slate-250/70 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Top Rated
                </button>
              </div>

              {/* Advanced Filters Button */}
              <button 
                onClick={() => setIsFilterSheetOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-250/80 bg-white hover:bg-slate-55 text-[11px] font-bold text-slate-700 shrink-0 transition-colors cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                Filters
              </button>
            </div>
          </div>

          {/* Results Grid with Injected Editorial Break */}
          {displayedFoods.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
              {displayedFoods.map((food, index) => {
                
                // Show editorial break after the 3rd card
                let showPopularBreak = false;
                if (!popularBreakRendered && popularFoods.length > 0) {
                  if (index === 3 || (displayedFoods.length < 4 && index === displayedFoods.length - 1)) {
                    showPopularBreak = true;
                    popularBreakRendered = true;
                  }
                }

                return (
                  <React.Fragment key={food.id}>
                    {showPopularBreak && (
                      <div className="col-span-full py-6 border-t border-b border-slate-200/50 bg-slate-50/20 -mx-4 px-4 sm:mx-0 sm:px-0">
                        <div className="mb-3.5">
                          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Popular Near You</h3>
                          <p className="text-xs text-slate-450 font-bold">Top-rated homemade delicacies loved by your neighbors.</p>
                        </div>
                        
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
                          {popularFoods.map((popFood) => (
                            <div key={`pop-${popFood.id}`} className="min-w-[250px] sm:min-w-[280px] max-w-[280px] shrink-0 snap-start">
                              <FoodCard food={popFood} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.96, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                      className="w-full"
                    >
                      <FoodCard food={food} />
                    </motion.div>
                  </React.Fragment>
                );
              })}
            </div>
          ) : (
            // Illustrated Empty State
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 px-4 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-slate-200/60 shadow-sm"
            >
              {/* Illustrated Cooking pot/cloche icon */}
              <svg className="w-20 h-20 text-slate-200 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M3 12h18M12 3v3M6 6l1.5 1.5M18 6l-1.5 1.5" strokeLinecap="round" />
                <path d="M5 12a7 7 0 0114 0v4H5v-4z" fill="currentColor" fillOpacity="0.04" />
                <rect x="3" y="16" width="18" height="3" rx="1.5" />
              </svg>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">No homemade dishes found nearby</h3>
              <p className="text-slate-450 font-bold max-w-sm mb-6 text-xs leading-relaxed">
                Try another meal type or location. Our chefs are constantly cooking fresh batches!
              </p>
              <button 
                onClick={() => { 
                  setVegOnly(false); 
                  setNonVegOnly(false); 
                  setAvailOnly(false); 
                  setTopRated(false); 
                  setSearchQuery(''); 
                  setActiveCategory('All Meals');
                  setBringContainerOnly(false);
                  setVerifiedOnly(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Reset Filters
              </button>
            </motion.div>
          )}

        </section>

      </main>

      {/* 5. FILTER BOTTOM SHEET MODAL */}
      <AnimatePresence>
        {isFilterSheetOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterSheetOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 pointer-events-auto"
            />
            {/* Drawer */}
            <motion.div
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.1, bottom: 0.85 }}
              onDragEnd={(e, info) => {
                if (info.offset.y > 120) {
                  setIsFilterSheetOpen(false);
                }
              }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white rounded-t-[32px] shadow-2xl z-55 border-t border-slate-100 flex flex-col max-h-[85vh] outline-none"
            >
              {/* Drag Handle */}
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto shrink-0 mt-3.5 mb-1 cursor-grab active:cursor-grabbing" />
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h3 className="text-base font-black text-slate-900">Sort & Filter</h3>
                <button 
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              
              {/* Sheet Scrollable content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 max-h-[50vh]">
                
                {/* Sort Options */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort By</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'relevance', label: 'Relevance' },
                      { id: 'price_asc', label: 'Price: Low to High' },
                      { id: 'price_desc', label: 'Price: High to Low' },
                      { id: 'distance', label: 'Distance' },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setSortBy(opt.id)}
                        className={`py-3 px-4 rounded-2xl text-xs font-bold border text-center transition-all cursor-pointer ${
                          sortBy === opt.id 
                            ? 'border-brand-green bg-emerald-50/50 text-emerald-800 font-extrabold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferences */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kitchen Preferences</h4>
                  <div className="flex flex-col gap-2">
                    
                    {/* Bring own container checkbox */}
                    <button
                      onClick={() => setBringContainerOnly(!bringContainerOnly)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        bringContainerOnly 
                          ? 'border-brand-green bg-emerald-50/50 text-emerald-800 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className="flex flex-col pr-4">
                        <span className="text-xs font-bold">Bring Your Own Container</span>
                        <span className="text-[10px] text-slate-400 font-bold mt-0.5">Show meals requiring container pickup</span>
                      </div>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${bringContainerOnly ? 'border-brand-green bg-brand-green text-white' : 'border-slate-300'}`}>
                        {bringContainerOnly && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                    </button>

                    {/* Verified chefs checkbox */}
                    <button
                      onClick={() => setVerifiedOnly(!verifiedOnly)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        verifiedOnly 
                          ? 'border-brand-green bg-emerald-50/50 text-emerald-800 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className="flex flex-col pr-4">
                        <span className="text-xs font-bold">Verified Chefs Only</span>
                        <span className="text-[10px] text-slate-400 font-bold mt-0.5">Show meals from handpicked verified kitchens</span>
                      </div>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${verifiedOnly ? 'border-brand-green bg-brand-green text-white' : 'border-slate-300'}`}>
                        {verifiedOnly && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                    </button>

                  </div>
                </div>

              </div>

              {/* Sticky Footer Apply Button */}
              <div className="border-t border-slate-100 p-6 bg-white rounded-b-[32px] flex gap-3 shrink-0">
                <button
                  onClick={() => {
                    setSortBy('relevance');
                    setBringContainerOnly(false);
                    setVerifiedOnly(false);
                    setVegOnly(false);
                    setNonVegOnly(false);
                    setAvailOnly(false);
                    setTopRated(false);
                  }}
                  className="flex-1 py-3.5 rounded-2xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl text-xs font-black bg-brand-green hover:bg-[#083a20] text-white transition-colors cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}