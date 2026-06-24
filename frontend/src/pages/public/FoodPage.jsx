import React, { useState, useEffect, useMemo } from 'react';
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
  Star,
  CheckCircle2
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('All Meals');
  const [vegOnly, setVegOnly] = useState(false);
  const [nonVegOnly, setNonVegOnly] = useState(false);
  const [availOnly, setAvailOnly] = useState(false);
  const [topRated, setTopRated] = useState(false);
  const [bringContainerOnly, setBringContainerOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState('relevance');

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Auto-cycling search placeholders
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % placeholders.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Sync state if search params change externally
  useEffect(() => {
    const queryParam = searchParams.get('q');
    if (queryParam !== null) {
      setSearchQuery(queryParam);
    }
  }, [searchParams]);

  // Server-Side Dynamic Fetch Hook
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build URL parameters natively based on live states
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.append('q', searchQuery.trim());
        if (activeCategory !== 'All Meals') params.append('category', mapCategoryToEnum(activeCategory));
        if (vegOnly) params.append('isVeg', 'true');
        if (nonVegOnly) params.append('isVeg', 'false');
        if (availOnly) params.append('available', 'true');
        if (topRated) params.append('minRating', '4.5');
        if (bringContainerOnly) params.append('bringContainer', 'true');
        if (verifiedOnly) params.append('verified', 'true');
        if (sortBy) params.append('sortBy', sortBy);

        const response = await api.get(`/foods?${params.toString()}`);
        
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
              distance: item.distance || '1.2 km away',
              tags: [item.isVeg ? 'Veg' : 'Non-Veg', item.category, ...(item.tags || [])].filter(Boolean),
              provider: {
                name: providerInfo.kitchenName || 'Home Cook',
                avatar: providerInfo.avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150',
                rating: providerInfo.rating || 4.8,
                ordersCount: providerInfo.ordersCount || '150+',
                isVerified: providerInfo.isVerified ?? true,
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

    // Optional: Add basic debounce mechanism to avoid rapid multi-character API strikes
    const delayDebounceFn = setTimeout(() => {
      fetchFoods();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeCategory, vegOnly, nonVegOnly, availOnly, topRated, bringContainerOnly, verifiedOnly, sortBy]);

  const handleVegToggle = () => {
    setVegOnly(!vegOnly);
    if (!vegOnly) setNonVegOnly(false);
  };

  const handleNonVegToggle = () => {
    setNonVegOnly(!nonVegOnly);
    if (!nonVegOnly) setVegOnly(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchParams(prev => {
      prev.delete('q');
      return prev;
    });
  };

  const resetAllFilters = () => {
    setVegOnly(false);
    setNonVegOnly(false);
    setAvailOnly(false);
    setTopRated(false);
    setSearchQuery('');
    setActiveCategory('All Meals');
    setBringContainerOnly(false);
    setVerifiedOnly(false);
    setSortBy('relevance');
    setSearchParams({});
  };

  // Directly match results from server side calculations safely
  const displayedFoods = foods;

  const freshTodayFoods = useMemo(() => {
    return foods.filter(food => food.availabilityDetails.isAvailable).slice(0, 6);
  }, [foods]);

  const popularFoods = useMemo(() => {
    return foods
      .filter(food => food.provider.rating >= 4.7 || food.availabilityDetails.ordersToday > 0)
      .slice(0, 6);
  }, [foods]);

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
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500 text-3xl">⚠️</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Error Loading Foods</h2>
          <p className="text-slate-500 mb-6 text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors">Retry</button>
        </div>
      </div>
    );
  }

  let popularBreakRendered = false;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      
      {/* SEARCH HEADER */}
      <div className="bg-white border-b border-slate-150 sticky top-0 z-40 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-2">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1 flex items-center h-12 bg-slate-100 rounded-xl border border-slate-200/40 focus-within:border-emerald-500/30 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/5 transition-all duration-200">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full h-full bg-transparent pl-12 pr-10 text-sm font-medium text-slate-900 outline-none border-none focus:ring-0"
              />
              {!searchQuery && !isSearchFocused && (
                <div className="absolute left-12 pointer-events-none text-slate-400 text-sm font-medium select-none h-5 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={placeholderIdx}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.3 }}
                      className="block"
                    >
                      {placeholders[placeholderIdx]}
                    </motion.span>
                  </AnimatePresence>
                </div>
              )}
              {searchQuery && (
                <button onClick={clearSearch} className="absolute right-3 p-1 rounded-full text-slate-400 hover:bg-slate-200">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button 
              onClick={() => setSearchParams({ q: searchQuery })} 
              className="hidden sm:flex h-12 px-5 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all"
            >
              Search
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 pt-0.5 scrollbar-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Trending:</span>
            {['Poha', 'Tiffin', 'Veg Lunch', 'Idli'].map((tag) => (
              <button 
                key={tag} 
                onClick={() => {
                  setSearchQuery(tag);
                  setSearchParams({ q: tag });
                }} 
                className="px-3 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[11px] font-medium text-slate-600 shrink-0"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FILTER STRIP */}
      <div className="bg-slate-50 border-b border-slate-200/40 sticky top-[73px] z-30 py-2.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2">
            <button onClick={handleVegToggle} className={`px-3.5 py-1.5 rounded-full border text-[11px] font-bold inline-flex items-center gap-1.5 transition-all ${vegOnly ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-600'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${vegOnly ? 'bg-white' : 'bg-emerald-600'}`} /> Veg
            </button>
            <button onClick={handleNonVegToggle} className={`px-3.5 py-1.5 rounded-full border text-[11px] font-bold inline-flex items-center gap-1.5 transition-all ${nonVegOnly ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white border-slate-200 text-slate-600'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${nonVegOnly ? 'bg-white' : 'bg-rose-600'}`} /> Non-Veg
            </button>
            <button onClick={() => setAvailOnly(!availOnly)} className={`px-3.5 py-1.5 rounded-full border text-[11px] font-bold transition-all ${availOnly ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-600'}`}>Available Today</button>
            <button onClick={() => setTopRated(!topRated)} className={`px-3.5 py-1.5 rounded-full border text-[11px] font-bold transition-all ${topRated ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-slate-200 text-slate-600'}`}>★ 4.5+ Rated</button>
          </div>
          <button onClick={() => setIsFilterSheetOpen(true)} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-[11px] font-bold text-slate-700 shrink-0 shadow-sm">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Filters
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* CATEGORIES SELECTOR ROW */}
        <section>
          <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-none justify-start pt-1">
            {categoriesList.map((cat) => {
              const IconComponent = cat.icon;
              const isSelected = activeCategory === cat.id;
              return (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className="flex flex-col items-center shrink-0">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all ${isSelected ? 'bg-emerald-600 text-white border-emerald-600 scale-105' : 'bg-white text-slate-600 border-slate-200/70 shadow-sm'}`}>
                    <IconComponent className="w-5.5 h-5.5" />
                  </div>
                  <span className={`text-[11px] font-bold tracking-tight mt-2 ${isSelected ? 'text-slate-950 font-extrabold' : 'text-slate-500'}`}>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* FRESH TODAY HERO CAROUSEL */}
        {freshTodayFoods.length > 0 && !searchQuery && activeCategory === 'All Meals' && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Fresh Today 
                <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 text-[9px] uppercase font-black tracking-widest border border-rose-100 animate-pulse">Live</span>
              </h2>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
              {freshTodayFoods.map((food) => (
                <Link to={`/food/${food.id}`} key={`fresh-${food.id}`} className="min-w-[280px] sm:min-w-[320px] max-w-[320px] shrink-0 snap-start block">
                  <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full group">
                    
                    {/* IMAGE SECTION */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden shrink-0 bg-slate-50">
                      <img src={food.image} alt={food.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm text-[10px] font-bold text-slate-800 uppercase tracking-wide">
                        {food.availabilityDetails.left <= 3 ? "🔥 Filling Fast" : "✅ Fresh Batch"}
                      </div>
                      
                      <div className="absolute bottom-3 right-3 bg-slate-900 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg shadow-md">
                        ₹{food.price} <span className="text-[9px] text-slate-400 font-normal">/{food.pricePer}</span>
                      </div>
                    </div>

                    {/* DETAILS CONTENT */}
                    <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 tracking-tight line-clamp-1 group-hover:text-emerald-600 transition-colors">{food.name}</h3>
                        
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          by <span className="text-slate-800 font-black">{food.provider.name}</span>
                        </p>

                        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100/60 font-normal">
                          {food.description}
                        </p>
                      </div>
                    </div>

                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FOOD RESULTS LIST */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Fresh Homemade Dishes</h2>
            <span className="text-xs text-slate-400 font-medium">{displayedFoods.length} choices</span>
          </div>

          {displayedFoods.length > 0 ? (
            <div className="flex flex-col gap-3.5 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-x-6 sm:gap-y-8">
              {displayedFoods.map((food, index) => {
                
                let showPopularBreak = false;
                if (!popularBreakRendered && popularFoods.length > 0) {
                  if (index === 3 || (displayedFoods.length < 4 && index === displayedFoods.length - 1)) {
                    showPopularBreak = true;
                    popularBreakRendered = true;
                  }
                }

                return (
                  <React.Fragment key={food.id}>
                    {/* Inline Editorial Break Hook */}
                    {showPopularBreak && (
                      <div className="col-span-full py-5 border-t border-b border-slate-200/60 bg-white -mx-4 px-4 sm:mx-0 sm:px-5 sm:rounded-2xl sm:border">
                        <div className="mb-3">
                          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">Popular Near You</h3>
                          <p className="text-[11px] sm:text-xs text-slate-400 font-medium">Delicacies highly rated by your local community.</p>
                        </div>
                        <div className="flex gap-3.5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
                          {popularFoods.map((popFood) => (
                            <div key={`pop-${popFood.id}`} className="min-w-[240px] sm:min-w-[280px] max-w-[280px] shrink-0 snap-start">
                              <FoodCard food={popFood} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                      
                      {/* DESKTOP VIEW */}
                      <div className="hidden sm:block bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all group relative">
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                          <img src={food.image} alt={food.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                            <span className={`px-2.5 py-1 rounded-md text-[9px] font-black tracking-wide shadow-sm backdrop-blur-md text-white ${food.isVeg ? 'bg-emerald-600/90' : 'bg-rose-600/90'}`}>
                              {food.isVeg ? 'VEG' : 'NON-VEG'}
                            </span>
                          </div>
                          
                          <div className="absolute bottom-3 right-3 bg-slate-900 text-white font-extrabold text-sm px-3 py-1 rounded-xl shadow-md border border-slate-800">
                            ₹{food.price} <span className="text-[10px] text-slate-400 font-normal">/{food.pricePer}</span>
                          </div>
                        </div>

                        <div className="p-4 space-y-4">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h3 className="text-base font-extrabold text-slate-900 tracking-tight line-clamp-1 group-hover:text-emerald-600 transition-colors">{food.name}</h3>
                              <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 rounded-md text-emerald-700 text-xs font-bold shrink-0">
                                <span>{food.provider.rating}</span>
                                <Star className="w-3 h-3 fill-emerald-700 stroke-none" />
                              </div>
                            </div>
                            
                            <p className="text-sm text-slate-600 mt-1.5 line-clamp-2 leading-relaxed font-normal bg-slate-50 p-2 rounded-lg border border-slate-100">
                              {food.description}
                            </p>
                          </div>

                          {/* CHEF BRAND BRACKET */}
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img src={food.provider.avatar} alt={food.provider.name} className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0" />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block -mb-0.5">Chef</span>
                                </div>
                                <p className="text-sm font-black text-slate-900 truncate leading-none flex items-center gap-1">
                                  {food.provider.name}
                                  {food.provider.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500 stroke-white shrink-0" />}
                                </p>
                              </div>
                            </div>
                            <Link to={`/food/${food.id}`} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm shrink-0">Order</Link>
                          </div>
                        </div>
                      </div>

                      {/* MOBILE ROW VIEW */}
                      <Link to={`/food/${food.id}`} className="block sm:hidden bg-white rounded-xl border border-slate-200/70 p-3.5 shadow-sm active:scale-[0.99] transition-transform">
                        <div className="flex gap-3.5">
                          <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-50 border border-slate-100">
                            <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
                          </div>

                          <div className="flex-1 flex flex-col justify-between min-w-0">
                            <div>
                              <div className="flex justify-between items-start gap-1">
                                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight line-clamp-1">{food.name}</h3>
                                <span className="text-sm font-black text-emerald-600 shrink-0">₹{food.price}</span>
                              </div>

                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-[10px] text-slate-400 font-medium">By</span>
                                <p className="text-[11px] text-slate-900 font-extrabold truncate">
                                  {food.provider.name}
                                </p>
                                {food.provider.isVerified && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 fill-emerald-500 stroke-white shrink-0" />}
                              </div>

                              <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2 leading-normal font-normal">
                                {food.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>

                    </motion.div>
                  </React.Fragment>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200/60 shadow-sm">
              <p className="text-slate-400 text-xs font-bold">No dishes match current criteria.</p>
              <button 
                onClick={resetAllFilters}
                className="mt-3 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>

      </main>

      {/* FILTER BOTTOM SHEET MODAL */}
      <AnimatePresence>
        {isFilterSheetOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setIsFilterSheetOpen(false)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50" />
            <motion.div
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.1, bottom: 0.85 }}
              onDragEnd={(e, info) => { if (info.offset.y > 120) setIsFilterSheetOpen(false); }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white rounded-t-2xl shadow-2xl z-55 border-t border-slate-100 flex flex-col max-h-[85vh] outline-none"
            >
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto shrink-0 mt-3 mb-1 cursor-grab active:cursor-grabbing" />
              
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h3 className="text-base font-bold text-slate-900">Sort & Filter</h3>
                <button onClick={() => setIsFilterSheetOpen(false)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-6 flex-1 max-h-[50vh]">
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
                        key={opt.id} onClick={() => setSortBy(opt.id)}
                        className={`py-3 px-4 rounded-xl text-xs font-bold border text-center transition-all ${
                          sortBy === opt.id ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-extrabold' : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kitchen Preferences</h4>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setBringContainerOnly(!bringContainerOnly)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${bringContainerOnly ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold' : 'border-slate-200 text-slate-600'}`}
                    >
                      <div className="flex flex-col pr-4">
                        <span className="text-xs font-bold">Bring Your Own Container</span>
                        <span className="text-[10px] text-slate-400 font-medium mt-0.5">Show meals requiring container pickup</span>
                      </div>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${bringContainerOnly ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'}`}>
                        {bringContainerOnly && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                    </button>

                    <button
                      onClick={() => setVerifiedOnly(!verifiedOnly)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${verifiedOnly ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold' : 'border-slate-200 text-slate-600'}`}
                    >
                      <div className="flex flex-col pr-4">
                        <span className="text-xs font-bold">Verified Chefs Only</span>
                        <span className="text-[10px] text-slate-400 font-medium mt-0.5">Show meals from handpicked verified kitchens</span>
                      </div>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${verifiedOnly ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'}`}>
                        {verifiedOnly && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 p-6 bg-white rounded-b-2xl flex gap-3 shrink-0">
                <button
                  onClick={() => {
                    setSortBy('relevance'); setBringContainerOnly(false); setVerifiedOnly(false);
                    setVegOnly(false); setNonVegOnly(false); setAvailOnly(false); setTopRated(false);
                  }}
                  className="flex-1 py-3 rounded-xl text-xs font-bold bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Clear All
                </button>
                <button onClick={() => setIsFilterSheetOpen(false)} className="flex-1 py-3 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm">
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