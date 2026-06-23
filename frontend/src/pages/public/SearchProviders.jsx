import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { 
  Search, 
  Filter, 
  X, 
  MapPin, 
  Star, 
  ChevronRight, 
  UtensilsCrossed 
} from 'lucide-react';

const placeholders = [
  "Search home kitchens...",
  "Search for Puran Poli, Tiffin service...",
  "Find local home chefs..."
];

const CUISINE_OPTIONS = [
  'North Indian', 'South Indian', 'Maharashtrian', 'Gujarati', 
  'Bengali', 'Chinese', 'Italian', 'Healthy/Diet', 'Baking', 
  'Street Food', 'Vegan', 'Keto', 'Desserts', 'Mughlai', 'Continental',
  'Punjabi', 'Rajasthani', 'Biryani Special', 'Seafood'
];

export default function SearchProviders() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  
  // Rotating placeholders states
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Inline filter states
  const [vegOnly, setVegOnly] = useState(false);
  const [nonVegOnly, setNonVegOnly] = useState(false);
  const [availOnly, setAvailOnly] = useState(false);
  const [topRated, setTopRated] = useState(false);

  // Bottom Sheet Filter State
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Rotate placeholders interval
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % placeholders.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchChefs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/providers');
        if (response.data.success) {
          const mappedChefs = response.data.providers.map(p => ({
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
          setFilteredChefs(mappedChefs);
        }
      } catch (err) {
        console.error('Error fetching chefs:', err);
        setError('Failed to load home cooks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchChefs();
  }, []);

  useEffect(() => {
    if (loading) return;
    let result = chefs;
    
    // 1. Text Search
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        chef =>
          chef.name.toLowerCase().includes(q) ||
          chef.specialty.toLowerCase().includes(q) ||
          chef.locality.toLowerCase().includes(q)
      );
    }

    // 2. Location
    if (filters.location.trim() !== '') {
      result = result.filter(chef => chef.locality.toLowerCase().includes(filters.location.toLowerCase()));
    }

    // 3. Cuisines
    if (filters.cuisines.length > 0) {
      result = result.filter(chef => 
        filters.cuisines.some(c => chef.cuisines.includes(c))
      );
    }

    // 4. Dietary
    const activeDietary = [...filters.dietary];
    if (vegOnly && !activeDietary.includes('Veg')) activeDietary.push('Veg');
    if (nonVegOnly && !activeDietary.includes('Non-Veg')) activeDietary.push('Non-Veg');
    if (activeDietary.length > 0) {
      result = result.filter(chef => 
        activeDietary.every(d => chef.dietary.includes(d))
      );
    }

    // 5. Availability
    if (availOnly) {
      result = result.filter(chef => chef.availability === 'Anytime' || chef.availability === 'Available Now');
    } else if (filters.availability && filters.availability !== 'Anytime') {
      result = result.filter(chef => 
        chef.availability === filters.availability || chef.availability === 'Anytime'
      );
    }

    // 6. Rating
    if (topRated) {
      result = result.filter(chef => chef.rating >= 4.5);
    } else if (filters.rating !== 'any') {
      const minRating = parseFloat(filters.rating);
      result = result.filter(chef => chef.rating >= minRating);
    }

    // 7. Max Price
    if (filters.maxPrice) {
      result = result.filter(chef => chef.price <= filters.maxPrice);
    }

    // 8. Services
    if (filters.services.length > 0) {
      result = result.filter(chef => 
        filters.services.every(s => chef.services.includes(s))
      );
    }

    setFilteredChefs(result);
  }, [chefs, searchQuery, filters, loading, vegOnly, nonVegOnly, availOnly, topRated]);

  // Top Rated Home Chefs (single premium horizontal carousel)
  const topRatedChefs = chefs
    .filter(chef => chef.rating >= 4.7)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  const toggleCuisine = (cuisine) => {
    const updated = filters.cuisines.includes(cuisine)
      ? filters.cuisines.filter(c => c !== cuisine)
      : [...filters.cuisines, cuisine];
    setFilters({ ...filters, cuisines: updated });
  };

  const toggleService = (service) => {
    const updated = filters.services.includes(service)
      ? filters.services.filter(s => s !== service)
      : [...filters.services, service];
    setFilters({ ...filters, services: updated });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-brand-green selection:text-white pb-24">
      
      {/* 1. SEARCH HEADER & TRENDING */}
      <div className="bg-white border-b border-slate-200/60 pt-4 pb-4 sticky top-0 z-35 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          
          {/* Header Title Block */}
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Meet Local Home Chefs</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Discover trusted home kitchens preparing fresh meals near you.</p>
          </div>

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
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* 2. TOP RATED HOME CHEFS CAROUSEL (Hero Editorial Section) */}
        {topRatedChefs.length > 0 && !searchQuery && (
          <section className="space-y-3">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Top Rated Home Chefs</h3>
            <p className="text-xs text-slate-455 font-bold -mt-1">The neighborhood's favorite kitchens, handpicked for cleanliness and taste.</p>
            
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
              {topRatedChefs.map(chef => (
                <div key={`top-${chef.id}`} className="min-w-[280px] sm:min-w-[320px] max-w-[320px] shrink-0 snap-start">
                  <Link to={`/provider/${chef.id}`} className="block h-full group">
                    <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_36px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-3.5">
                      <img src={chef.avatar} alt={chef.name} className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-slate-100 group-hover:scale-103 transition-transform" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-slate-950 text-sm truncate group-hover:text-brand-green transition-colors">{chef.name}</h4>
                        <p className="text-[11px] text-slate-400 font-bold truncate mb-1">{chef.locality}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5 text-[10px] font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 shrink-0">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>{chef.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-bold truncate">{chef.specialty}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. MAIN RESULTS SECTION */}
        <section className="space-y-4 pt-2 border-t border-slate-200/60">
          
          {/* Header & Filter Row */}
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Home Chef Kitchens</h2>
            
            {/* Inline filters row */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              <button 
                onClick={() => setVegOnly(!vegOnly)}
                className={`px-3.5 py-1.5 rounded-full border text-[11px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                  vegOnly 
                    ? 'bg-green-50 border-green-200 text-green-700 font-extrabold' 
                    : 'bg-white border-slate-250/70 text-slate-600 hover:bg-slate-55'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full bg-green-600 ${vegOnly ? 'opacity-100' : 'opacity-50'}`} />
                Veg
              </button>
              
              <button 
                onClick={() => setNonVegOnly(!nonVegOnly)}
                className={`px-3.5 py-1.5 rounded-full border text-[11px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                  nonVegOnly 
                    ? 'bg-red-50 border-red-200 text-red-750 font-extrabold' 
                    : 'bg-white border-slate-250/70 text-slate-600 hover:bg-slate-55'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full bg-red-600 ${nonVegOnly ? 'opacity-100' : 'opacity-50'}`} />
                Non-Veg
              </button>
              
              <button 
                onClick={() => setAvailOnly(!availOnly)}
                className={`px-3.5 py-1.5 rounded-full border text-[11px] font-bold transition-all cursor-pointer ${
                  availOnly 
                    ? 'bg-emerald-50 border-emerald-250 text-emerald-800 font-extrabold' 
                    : 'bg-white border-slate-250/70 text-slate-600 hover:bg-slate-55'
                }`}
              >
                Available Today
              </button>
              
              <button 
                onClick={() => setTopRated(!topRated)}
                className={`px-3.5 py-1.5 rounded-full border text-[11px] font-bold transition-all cursor-pointer ${
                  topRated 
                    ? 'bg-amber-50 border-amber-255 text-amber-800 font-extrabold' 
                    : 'bg-white border-slate-250/70 text-slate-600 hover:bg-slate-55'
                }`}
              >
                Top Rated
              </button>
              
              {/* Advanced Filters Button */}
              <button 
                onClick={() => setIsFilterSheetOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-250 bg-white hover:bg-slate-55 text-[11px] font-bold text-slate-700 shrink-0 transition-colors cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                Filters
              </button>
            </div>
          </div>

          {/* Grid list of home chefs */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(n => (
                <div key={n} className="bg-slate-100 rounded-3xl h-72 animate-pulse w-full" />
              ))}
            </div>
          ) : filteredChefs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredChefs.map((chef, idx) => (
                  <motion.div
                    key={chef.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                    className="w-full"
                  >
                    {/* Redesigned Chef Card: Cover Image -> Kitchen Name -> Location -> Specialties -> Price -> CTA */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_36px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col group h-full">
                      
                      {/* Large Cover Food Image */}
                      <div className="relative h-44 w-full overflow-hidden shrink-0">
                        <img 
                          src={chef.coverImage} 
                          alt={chef.name} 
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-104"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                        
                        {/* Rating overlay in corner */}
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-xl shadow-sm flex items-center gap-1 border border-slate-100 font-bold text-xs text-slate-800">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{chef.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                        <div className="space-y-2">
                          
                          {/* Kitchen Name */}
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-slate-900 text-base leading-snug truncate group-hover:text-brand-green transition-colors">
                              {chef.name}
                            </h3>
                            {chef.isVerified && (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md shrink-0">
                                Verified
                              </span>
                            )}
                          </div>

                          {/* Location */}
                          <div className="flex items-center text-xs text-slate-500 gap-1 font-bold">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{chef.locality}</span>
                          </div>

                          {/* Specialties */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {chef.cuisines.slice(0, 3).map(c => (
                              <span key={c} className="px-2.5 py-0.5 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-100">
                                {c}
                              </span>
                            ))}
                          </div>

                          {/* Bio Description */}
                          {chef.description && (
                            <p className="text-xs text-slate-450 font-bold leading-relaxed line-clamp-2 pt-1">
                              {chef.description}
                            </p>
                          )}

                        </div>

                        {/* Footer starting price & view menu CTA */}
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                          <div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Starting Price</span>
                            <span className="text-sm font-black text-slate-800">Meals from <span className="text-brand-green text-base">₹{chef.price}</span></span>
                          </div>
                          
                          <Link 
                            to={`/provider/${chef.id}`}
                            className="bg-brand-green hover:bg-[#083a20] text-white transition-all px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-sm shadow-brand-green/10"
                          >
                            View Menu
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
            // Illustrated Empty State
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 px-4 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-slate-200/60 shadow-sm w-full"
            >
              {/* Illustrated Chef hat / kitchen icon */}
              <svg className="w-20 h-20 text-slate-200 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M12 2C8.686 2 6 4.686 6 8c0 1.956.94 3.69 2.38 4.79C6.46 13.9 5 15.77 5 18v2a2 2 0 002 2h10a2 2 0 002-2v-2c0-2.23-1.46-4.1-3.38-5.21C17.06 11.69 18 9.956 18 8c0-3.314-2.686-6-6-6z" fill="currentColor" fillOpacity="0.04" />
                <path d="M6 8h12" />
              </svg>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">No home kitchens found nearby</h3>
              <p className="text-slate-450 font-bold max-w-sm mb-6 text-xs leading-relaxed">
                Try another cuisine, preference, or location. Our chefs are constantly setting up new kitchens!
              </p>
              <button 
                onClick={() => { 
                  setSearchQuery('');
                  setVegOnly(false);
                  setNonVegOnly(false);
                  setAvailOnly(false);
                  setTopRated(false);
                  setFilters({ location: '', cuisines: [], dietary: [], availability: 'Anytime', rating: 'any', maxPrice: 1000, services: [] });
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            </motion.div>
          )}

        </section>

      </main>

      {/* 4. FILTER BOTTOM SHEET MODAL */}
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
                <h3 className="text-base font-black text-slate-900">Advanced Filters</h3>
                <button 
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              
              {/* Sheet Scrollable content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 max-h-[50vh] no-scrollbar">
                
                {/* Location Filter */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Location</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Enter city or area..."
                      value={filters.location || ''}
                      onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                      className="w-full bg-slate-100 border border-transparent focus:border-brand-green/20 focus:bg-white rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 outline-none transition-all"
                    />
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                {/* Cuisines Filter */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Cuisines / Specialties</label>
                  <div className="flex flex-wrap gap-2">
                    {CUISINE_OPTIONS.map(cuisine => {
                      const isSelected = filters.cuisines.includes(cuisine);
                      return (
                        <button
                          type="button"
                          key={cuisine}
                          onClick={() => toggleCuisine(cuisine)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            isSelected 
                              ? 'border-brand-green bg-emerald-50/50 text-emerald-800 font-extrabold'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          {cuisine}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Maximum Price Filter */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Starting Price Limit</label>
                    <span className="text-xs font-black text-brand-green">₹{filters.maxPrice}</span>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="1000" 
                    step="50"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-green"
                  />
                  <div className="flex justify-between text-[9px] font-black text-slate-400 mt-1">
                    <span>₹50</span>
                    <span>₹1000</span>
                  </div>
                </div>

                {/* Service type Filters */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Services Offered</label>
                  <div className="flex flex-col gap-2">
                    {['Delivery', 'Pickup', 'Event Catering', 'Daily Tiffin'].map(service => {
                      const isSelected = filters.services.includes(service);
                      return (
                        <button
                          key={service}
                          onClick={() => toggleService(service)}
                          className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                            isSelected 
                              ? 'border-brand-green bg-emerald-50/50 text-emerald-800 font-bold'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <span className="text-xs font-bold">{service}</span>
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${isSelected ? 'border-brand-green bg-brand-green text-white' : 'border-slate-300'}`}>
                            {isSelected && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Sticky Footer Apply Button */}
              <div className="border-t border-slate-100 p-6 bg-white rounded-b-[32px] flex gap-3 shrink-0">
                <button
                  onClick={() => {
                    setFilters({ location: '', cuisines: [], dietary: [], availability: 'Anytime', rating: 'any', maxPrice: 1000, services: [] });
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
