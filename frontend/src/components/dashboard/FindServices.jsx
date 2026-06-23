import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import FoodCard from '../../components/food/FoodCard.jsx';
import { 
  Search, 
  Filter, 
  X, 
  MapPin, 
  Star, 
  ChevronRight,
  Sparkles,
  Flame,
  Utensils,
  Maximize2
} from 'lucide-react';

const placeholders = [
  "Search hot home-cooked biryanis...",
  "Search for Puran Poli, Tiffin services...",
  "Find premium local home chefs..."
];

const CUISINE_OPTIONS = [
  'North Indian', 'South Indian', 'Maharashtrian', 'Gujarati', 
  'Bengali', 'Chinese', 'Italian', 'Healthy/Diet', 'Baking', 
  'Street Food', 'Vegan', 'Keto', 'Desserts', 'Mughlai', 'Continental',
  'Punjabi', 'Rajasthani', 'Biryani Special', 'Seafood'
];

const mapBackendFoodToCard = (backendFood) => {
  const isAvailable = backendFood.status === "available" && backendFood.quantity > 0;
  
  return {
    id: backendFood._id,
    name: backendFood.name,
    price: backendFood.price,
    pricePer: backendFood.pricePer || 'per plate',
    image: backendFood.images?.[0] || 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
    description: backendFood.description,
    availabilityDetails: {
      isAvailable: isAvailable,
      ordersToday: backendFood.ordersToday || 0,
      left: backendFood.quantity || 0,
      total: backendFood.totalQuantity || backendFood.quantity || 0
    },
    serviceDate: backendFood.serviceDate,
    startTime: backendFood.startTime,
    endTime: backendFood.endTime,
    timeWindow: backendFood.timeWindow || '12:00 - 2:00 PM',
    location: backendFood.provider ? `${backendFood.provider.area}, ${backendFood.provider.city}` : 'Pune',
    distance: '1.5 km away',
    bringContainer: backendFood.bringContainer,
    isVeg: backendFood.isVeg,
    tags: [
      backendFood.isVeg ? 'Veg' : 'Non-Veg',
      ...(backendFood.tags || [])
    ],
    provider: {
      id: backendFood.provider?._id || '',
      name: backendFood.provider?.kitchenName || 'Home Cook',
      avatar: backendFood.provider?.avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150',
      rating: backendFood.provider?.rating || 4.8,
      ordersCount: '100+',
      isVerified: true,
      badges: []
    }
  };
};

export default function FindService() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Filter conditions
  const [vegOnly, setVegOnly] = useState(false);
  const [nonVegOnly, setNonVegOnly] = useState(false);
  const [availOnly, setAvailOnly] = useState(false);
  const [topRated, setTopRated] = useState(false);

  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [filters, setFilters] = useState({
    location: searchParams.get('loc') || '',
    cuisines: [],
    dietary: [],
    availability: 'Anytime',
    rating: 'any',
    maxPrice: 1000,
    services: []
  });

  const [chefs, setChefs] = useState([]);
  const [filteredChefs, setFilteredChefs] = useState([]);
  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % placeholders.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchMarketplaceData = async () => {
      try {
        setLoading(true);
        const [providersResponse, foodsResponse] = await Promise.all([
          api.get('/providers').catch(() => ({ data: { success: false } })),
          api.get('/foods').catch(() => ({ data: { success: false } }))
        ]);

        if (providersResponse.data?.success) {
          const mappedChefs = providersResponse.data.providers.map(p => ({
            id: p._id,
            name: p.kitchenName || 'Home Cook',
            specialty: p.specialities?.join(', ') || 'Home Cooked Meals',
            cuisines: p.specialities || [],
            dietary: Array.isArray(p.dietaryType) && p.dietaryType.length > 0 ? p.dietaryType : [],
            availability: p.isAvailable ? 'Anytime' : 'Unavailable',
            services: Array.isArray(p.serviceTypes) && p.serviceTypes.length > 0 ? p.serviceTypes : [],
            experience: p.experience ? `${p.experience}+ Years Exp` : '',
            rating: p.rating || 5.0,
            reviews: p.totalReviews || 0,
            price: p.startingPrice || 0,
            avatar: p.avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400',
            coverImage: p.coverImage || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800',
            locality: `${p.area || ''}, ${p.city || ''}`.replace(/^, |, $/, ''),
            description: p.bio || '',
            isVerified: p.verificationStatus === 'APPROVED' || p.isVerified || false
          }));
          setChefs(mappedChefs);
        }

        if (foodsResponse.data?.success) {
          setFoods(foodsResponse.data.foodItems || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMarketplaceData();
  }, []);

  useEffect(() => {
    if (loading) return;

    let chefResult = chefs;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      chefResult = chefResult.filter(chef =>
        chef.name.toLowerCase().includes(q) ||
        chef.specialty.toLowerCase().includes(q) ||
        chef.locality.toLowerCase().includes(q)
      );
    }
    if (filters.location.trim() !== '') {
      chefResult = chefResult.filter(chef => chef.locality.toLowerCase().includes(filters.location.toLowerCase()));
    }
    if (filters.cuisines.length > 0) {
      chefResult = chefResult.filter(chef => filters.cuisines.some(c => chef.cuisines.includes(c)));
    }
    if (vegOnly) chefResult = chefResult.filter(chef => chef.dietary.includes('Veg') || chef.specialty.toLowerCase().includes('veg'));
    if (nonVegOnly) chefResult = chefResult.filter(chef => chef.dietary.includes('Non-Veg'));
    if (availOnly) chefResult = chefResult.filter(chef => chef.availability === 'Anytime');
    if (topRated) chefResult = chefResult.filter(chef => chef.rating >= 4.5);
    if (filters.maxPrice) chefResult = chefResult.filter(chef => chef.price <= filters.maxPrice);
    if (filters.services.length > 0) {
      chefResult = chefResult.filter(chef => filters.services.every(s => chef.services.includes(s)));
    }
    setFilteredChefs(chefResult);

    let foodResult = foods;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      foodResult = foodResult.filter(f =>
        f.name?.toLowerCase().includes(q) ||
        f.description?.toLowerCase().includes(q) ||
        f.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    if (vegOnly) foodResult = foodResult.filter(f => f.isVeg === true);
    if (nonVegOnly) foodResult = foodResult.filter(f => f.isVeg === false);
    if (topRated) foodResult = foodResult.filter(f => (f.provider?.rating || 0) >= 4.5);
    if (filters.maxPrice) foodResult = foodResult.filter(f => f.price <= filters.maxPrice);
    if (filters.cuisines.length > 0) {
      foodResult = foodResult.filter(f => 
        filters.cuisines.some(c => f.tags?.map(t => t.toLowerCase()).includes(c.toLowerCase()))
      );
    }
    setFilteredFoods(foodResult);
  }, [chefs, foods, searchQuery, filters, loading, vegOnly, nonVegOnly, availOnly, topRated]);

  const topRatedChefs = chefs.filter(chef => chef.rating >= 4.7).slice(0, 6);

  const toggleCuisine = (cuisine) => {
    const updated = filters.cuisines.includes(cuisine)
      ? filters.cuisines.filter(c => c !== cuisine)
      : [...filters.cuisines, cuisine];
    setFilters({ ...filters, cuisines: updated });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 pb-28 relative overflow-x-hidden selection:bg-emerald-600 selection:text-white">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/30 blur-3xl rounded-full -mr-48 -mt-20 pointer-events-none" />
      <div className="absolute top-[60vh] left-0 w-[400px] h-[400px] bg-amber-50/40 blur-3xl rounded-full -ml-40 pointer-events-none" />

      {/* STICKY GLASSMorphic SEARCH CONTAINER */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 pt-5 pb-5 sticky top-0 z-30 shadow-[0_2px_20px_-4px_rgba(15,23,42,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-50 text-emerald-700 p-1.5 rounded-xl border border-emerald-100/80">
                <Sparkles className="w-4 h-4 fill-emerald-600/10" />
              </span>
              <h1 className="text-xl font-black tracking-tight text-slate-900 md:text-2xl">
                Home Kitchens Marketplace
              </h1>
            </div>
            <p className="text-xs text-slate-450 font-semibold pl-8">
              Order fresh, authentic food mapped straight from neighborhood home makers.
            </p>
          </div>

          {/* Search bar layout wrapper */}
          <div className="w-full md:w-[420px] relative group">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full bg-slate-100/90 border border-slate-200/40 focus:border-emerald-600/30 focus:bg-white focus:ring-4 focus:ring-emerald-600/5 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-900 outline-none transition-all duration-300 shadow-[inset_0_2px_4px_rgba(15,23,42,0.015)]"
            />
            <Search className="w-4.5 h-4.5 text-slate-400 absolute left-4 top-4.5 pointer-events-none group-focus-within:text-emerald-600 transition-colors" />
            
            {!searchQuery && !isSearchFocused && (
              <div className="absolute left-12 top-4 pointer-events-none text-slate-400/90 text-sm font-semibold select-none overflow-hidden h-5">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={placeholderIdx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="block"
                  >
                    {placeholders[placeholderIdx]}
                  </motion.span>
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-14 relative z-10">
        
        {/* PREMIUM HORIZONTAL CHEFS CAROUSEL */}
        {topRatedChefs.length > 0 && !searchQuery && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                Top Rated Culinary Gurus
              </h3>
            </div>
            
            <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
              {topRatedChefs.map(chef => (
                <div key={`top-${chef.id}`} className="min-w-[290px] sm:min-w-[330px] max-w-[330px] shrink-0 snap-start">
                  <Link to={`/provider/${chef.id}`} className="block h-full group">
                    <div className="bg-white border border-slate-200/50 rounded-[24px] p-4 shadow-[0_10px_35px_-8px_rgba(15,23,42,0.03)] hover:shadow-[0_20px_40px_-4px_rgba(15,23,42,0.08)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />
                      
                      <div className="relative shrink-0">
                        <img src={chef.avatar} alt={chef.name} className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-sm group-hover:scale-105 transition-transform duration-300" />
                        <span className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <h4 className="font-extrabold text-slate-950 text-sm truncate group-hover:text-emerald-600 transition-colors">
                          {chef.name}
                        </h4>
                        <div className="flex items-center text-[11px] text-slate-400 font-bold gap-1">
                          <MapPin className="w-3 h-3 text-slate-300 shrink-0" />
                          <span className="truncate">{chef.locality}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 pt-0.5">
                          <div className="flex items-center gap-0.5 text-[10px] font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-lg border border-amber-100/70 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>{chef.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-bold truncate">
                            {chef.specialty}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* INTERACTIVE CONTROLS CONTAINER */}
        <div className="bg-white border border-slate-200/60 shadow-[0_4px_25px_-6px_rgba(15,23,42,0.02)] rounded-3xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Active Neighborhood Catalogs
            </h2>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
            <button 
              onClick={() => setVegOnly(!vegOnly)}
              className={`px-4 py-2 rounded-2xl border text-[11px] font-extrabold inline-flex items-center gap-2 transition-all cursor-pointer ${
                vegOnly ? 'bg-green-50/80 border-green-300 text-green-700 shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
              Veg Only
            </button>
            
            <button 
              onClick={() => setNonVegOnly(!nonVegOnly)}
              className={`px-4 py-2 rounded-2xl border text-[11px] font-extrabold inline-flex items-center gap-2 transition-all cursor-pointer ${
                nonVegOnly ? 'bg-red-50/80 border-red-200 text-red-700 shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
              Non-Veg
            </button>
            
            <button 
              onClick={() => setAvailOnly(!availOnly)}
              className={`px-4 py-2 rounded-2xl border text-[11px] font-extrabold transition-all cursor-pointer ${
                availOnly ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Available Today
            </button>
            
            <button 
              onClick={() => setTopRated(!topRated)}
              className={`px-4 py-2 rounded-2xl border text-[11px] font-extrabold transition-all cursor-pointer ${
                topRated ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              ⭐️ 4.5+ Rating
            </button>
            
            <div className="w-px h-6 bg-slate-200 mx-1 shrink-0" />

            <button 
              onClick={() => setIsFilterSheetOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-slate-250 bg-slate-900 text-white text-[11px] font-black tracking-wide shrink-0 hover:bg-slate-800 transition-colors cursor-pointer shadow-sm"
            >
              <Filter className="w-3.5 h-3.5" />
              More Filters
            </button>
          </div>
        </div>

        {/* VIEW AREA 1: LIVE FOOD ITEMS GRID */}
        <section className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200/50 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>🍽️</span> Live Food Offerings
              </h3>
              <p className="text-xs text-slate-400 font-bold">
                Fresh, instant items prepared from active home kitchens right now.
              </p>
            </div>
            <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2.5 py-1 rounded-xl border border-slate-200/40">
              {filteredFoods.length} Items Found
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="bg-white border border-slate-100 rounded-3xl p-3 space-y-3 shadow-xs">
                  <div className="bg-slate-200/60 rounded-2xl w-full h-40 animate-pulse" />
                  <div className="bg-slate-200/60 h-4 w-3/4 rounded animate-pulse" />
                  <div className="bg-slate-200/60 h-3 w-1/2 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : filteredFoods.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
              <AnimatePresence>
                {filteredFoods.map((food, idx) => (
                  <motion.div 
                    key={food._id}
                    layout 
                    initial={{ opacity: 0, scale: 0.96 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.015 }}
                    className="w-full flex justify-center transform hover:scale-[1.02] transition-transform duration-300"
                  >
                    <FoodCard food={mapBackendFoodToCard(food)} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 font-bold text-xs bg-white rounded-3xl border border-dashed border-slate-200 max-w-xl mx-auto shadow-xs p-6">
              🍲 No live food listings currently match your filter selections.
            </div>
          )}
        </section>

        {/* VIEW AREA 2: HOME KITCHENS MARKETPLACE */}
        <section className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200/50 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>👨‍🍳</span> Cooks & Kitchens Marketplace
              </h3>
              <p className="text-xs text-slate-400 font-bold">
                Independent neighborhood catering layouts open for custom subscription plans or catering orders.
              </p>
            </div>
            <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2.5 py-1 rounded-xl border border-slate-200/40">
              {filteredChefs.length} Kitchens Found
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(n => <div key={n} className="bg-white border border-slate-100 rounded-3xl h-72 animate-pulse w-full" />)}
            </div>
          ) : filteredChefs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredChefs.map((chef) => (
                  <motion.div
                    key={chef.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 140, damping: 20 }}
                    className="w-full"
                  >
                    <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.03)] hover:shadow-[0_24px_48px_-10px_rgba(15,23,42,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group h-full relative">
                      
                      {/* Cover Banner */}
                      <div className="relative h-48 w-full overflow-hidden shrink-0">
                        <img src={chef.coverImage} alt={chef.name} className="w-full h-full object-cover transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1) group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent pointer-events-none" />
                        
                        {/* Rating floating tag */}
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl shadow-xs flex items-center gap-1 border border-slate-100 font-extrabold text-xs text-slate-900">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{chef.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Content Layer */}
                      <div className="p-6 flex-1 flex flex-col justify-between gap-5 relative">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-black text-slate-900 text-base leading-snug group-hover:text-emerald-600 transition-colors line-clamp-1">
                              {chef.name}
                            </h3>
                            {chef.isVerified && (
                              <span className="bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg shrink-0">
                                Verified
                              </span>
                            )}
                          </div>

                          <div className="flex items-center text-xs text-slate-400 gap-1 font-bold">
                            <MapPin className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                            <span className="truncate">{chef.locality}</span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {chef.cuisines.slice(0, 3).map(c => (
                              <span key={c} className="px-2.5 py-1 bg-slate-50 text-slate-600 text-[10px] font-extrabold rounded-xl border border-slate-200/50">
                                {c}
                              </span>
                            ))}
                          </div>
                          
                          {chef.description && (
                            <p className="text-xs text-slate-450 font-medium leading-relaxed line-clamp-2 pt-1 border-t border-slate-100/70">
                              {chef.description}
                            </p>
                          )}
                        </div>

                        {/* Bottom CTA section */}
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                          <div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Starting From</span>
                            <span className="text-xs font-bold text-slate-500">Meals at <span className="text-emerald-600 text-base font-black">₹{chef.price}</span></span>
                          </div>
                          <Link to={`/provider/${chef.id}`} className="bg-emerald-600 hover:bg-emerald-700 text-white transition-all px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20">
                            View Kitchen
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 px-4 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-slate-200/60 shadow-xs max-w-md mx-auto">
              <Utensils className="w-12 h-12 text-slate-200 mb-2 stroke-[1.5]" />
              <h3 className="text-base font-extrabold text-slate-900 mb-1">No home kitchens found nearby</h3>
              <p className="text-slate-400 font-semibold max-w-xs mb-5 text-xs leading-relaxed">Try adjusting or clearing your filter criteria to scan wider ranges.</p>
              <button 
                onClick={() => { 
                  setSearchQuery('');
                  setVegOnly(false); setNonVegOnly(false); setAvailOnly(false); setTopRated(false);
                  setFilters({ location: '', cuisines: [], dietary: [], availability: 'Anytime', rating: 'any', maxPrice: 1000, services: [] });
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
              >
                Reset Selection
              </button>
            </motion.div>
          )}
        </section>
      </main>

      {/* RE-ENGINEERED ADVANCED DRAWER CAP */}
      <AnimatePresence>
        {isFilterSheetOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setIsFilterSheetOpen(false)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 pointer-events-auto" />
            <motion.div drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0.1, bottom: 0.85 }} onDragEnd={(e, info) => { if (info.offset.y > 120) setIsFilterSheetOpen(false); }} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 240 }} className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white rounded-t-[36px] shadow-2xl z-55 border-t border-slate-100 flex flex-col max-h-[85vh] outline-none">
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto shrink-0 mt-3.5 mb-1 cursor-grab active:cursor-grabbing" />
              
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h3 className="text-base font-black text-slate-900">Advanced Filters</h3>
                <button onClick={() => setIsFilterSheetOpen(false)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-6 flex-1 max-h-[50vh] no-scrollbar">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Location Context</label>
                  <div className="relative">
                    <input type="text" placeholder="Enter city or neighborhood area..." value={filters.location || ''} onChange={(e) => setFilters({ ...filters, location: e.target.value })} className="w-full bg-slate-100 border border-transparent focus:border-emerald-600/20 focus:bg-white rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 outline-none transition-all" />
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Cuisines Specialties</label>
                  <div className="flex flex-wrap gap-2">
                    {CUISINE_OPTIONS.map(cuisine => {
                      const isSelected = filters.cuisines.includes(cuisine);
                      return (
                        <button type="button" key={cuisine} onClick={() => toggleCuisine(cuisine)} className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${isSelected ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-extrabold' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                          {cuisine}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Starting Price Limit</label>
                    <span className="text-xs font-black text-emerald-600">₹{filters.maxPrice}</span>
                  </div>
                  <input type="range" min="50" max="1000" step="50" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
                  <div className="flex justify-between text-[9px] font-black text-slate-400 mt-1">
                    <span>₹50</span>
                    <span>₹1000</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 p-6 bg-white rounded-b-[36px] flex gap-3 shrink-0">
                <button onClick={() => { setFilters({ location: '', cuisines: [], dietary: [], availability: 'Anytime', rating: 'any', maxPrice: 1000, services: [] }); setVegOnly(false); setNonVegOnly(false); setAvailOnly(false); setTopRated(false); }} className="flex-1 py-3.5 rounded-2xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer">Clear All</button>
                <button onClick={() => setIsFilterSheetOpen(false)} className="flex-1 py-3.5 rounded-2xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer">Apply Filters</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}