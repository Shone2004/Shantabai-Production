import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Leaf, ShieldCheck, Soup, ShoppingBag, ArrowRight, ChevronDown, X, AlertCircle } from 'lucide-react';
import { LocationContext } from '../../context/LocationContext';

const Hero = () => {
  const [query, setQuery] = useState('');
  const [locationSearch, setLocationSearch] = useState(''); // New state for filtering locations inside the dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const { 
    selectedLocation: location, 
    setSelectedLocation: setLocation, 
    locationsList = [], // Safely fallback to empty array to prevent .forEach crashes
    loadingLocations, 
    errorLocations 
  } = useContext(LocationContext);

  // MOCK DATA: Replace this list or connect it to your Menu/Food context if you want to validate queries in real-time
  const availableMockDishes = ['thali', 'biryani', 'cake', 'roti', 'paneer', 'tiffin', 'chicken', 'dal', 'paratha', 'rice'];

  // Determine if the user has typed something that doesn't match any available options
  const isQueryInvalid = useMemo(() => {
    if (!query.trim()) return false;
    const cleanQuery = query.toLowerCase().trim();
    return !availableMockDishes.some(dish => dish.includes(cleanQuery));
  }, [query]);

  // Close custom dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset location search input text whenever the dropdown closes
  useEffect(() => {
    if (!dropdownOpen) {
      setLocationSearch('');
    }
  }, [dropdownOpen]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const qParam  = query.trim() ? `q=${encodeURIComponent(query.trim())}` : '';
    const locParam = (location && location !== 'Select your area') ? `loc=${encodeURIComponent(location)}` : '';
    const params   = [qParam, locParam].filter(Boolean).join('&');
    navigate(`/food${params ? `?${params}` : ''}`);
  };

  const containerVariants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  };

  const itemVariants = {
    hidden:  { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  };

  // Dynamically filter and group locationsList based on locationSearch input state
  const groupedLocations = useMemo(() => {
    const groups = {};
    const list = Array.isArray(locationsList) ? locationsList : [];
    
    list.forEach(loc => {
      const matchesSearch = 
        loc.area.toLowerCase().includes(locationSearch.toLowerCase()) ||
        loc.city.toLowerCase().includes(locationSearch.toLowerCase());

      if (matchesSearch) {
        const city = loc.city;
        if (!groups[city]) {
          groups[city] = [];
        }
        groups[city].push(loc);
      }
    });
    return groups;
  }, [locationsList, locationSearch]);

  return (
    <>
      {/* ── MOBILE CONTAINER (< lg) ── */}
      <section 
        className="block lg:hidden relative overflow-hidden pt-1.5 pb-0 border-b border-gray-100"
        style={{
          background: 'radial-gradient(circle at top right, rgba(12, 78, 45, 0.09), transparent 45%), linear-gradient(180deg, #FAF8F4 0%, #FFFFFF 100%)'
        }}
      >
        {/* 1. Decorative Graphics (Line Illustrations) */}
        <svg
          className="absolute pointer-events-none select-none text-brand-green z-0"
          style={{
            top: '2%',
            left: '4%',
            width: '210px',
            height: '210px',
            opacity: 0.06
          }}
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          aria-hidden="true"
        >
          <path d="M50,15 C35,30 32,55 45,75 C52,85 62,82 68,72 C76,60 70,30 50,15 Z" />
          <path d="M50,15 C48,40 50,60 45,75" strokeWidth="0.5" />
        </svg>

        <svg
          className="absolute pointer-events-none select-none z-0"
          style={{
            bottom: '-10px',
            right: '-40px',
            width: '260px',
            height: '260px',
            opacity: 0.08
          }}
          viewBox="0 0 120 120"
          fill="none"
          stroke="rgba(12, 78, 45, 0.12)"
          strokeWidth="0.8"
          aria-hidden="true"
        >
          <circle cx="60" cy="60" r="50" />
          <circle cx="60" cy="60" r="40" strokeDasharray="3 3" />
          <circle cx="60" cy="60" r="30" />
        </svg>

        {/* Floating Background Trust Seal on Mobile */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0 block lg:hidden">
          {/* Premium Trust Seal: Verified Kitchens */}
          <div 
            className="absolute rounded-full py-1 px-3 flex items-center gap-1.5 pointer-events-none"
            style={{
              top: '20%',
              right: '8%',
              background: 'rgba(255, 248, 231, 0.9)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(244, 210, 122, 0.6)',
              boxShadow: '0 4px 12px rgba(138, 90, 0, 0.05)'
            }}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#8A5A00] shrink-0" />
            <span className="text-[10px] font-extrabold text-[#8A5A00] tracking-tight">Verified Kitchens</span>
          </div>
        </div>

        <div className="relative z-10 px-4">
          {/* Premium Value Proposition */}
          <div className="text-left mb-2 relative">
            
            {/* 2. Ambient Glow (Behind mobile heading) */}
            <div 
              className="absolute top-0 left-4 w-[220px] h-[220px] rounded-full pointer-events-none z-0" 
              style={{
                background: 'rgba(12, 78, 45, 0.08)',
                filter: 'blur(80px)'
              }}
            />

            <h1 
              className="relative z-10 text-[2.25rem] sm:text-5xl font-black tracking-[-0.05em] leading-[0.92]"
              style={{
                fontFamily: '"Plus Jakarta Sans", sans-serif'
              }}
            >
              <span className="block text-[#0F172A]" style={{ textShadow: '0 2px 8px rgba(12, 78, 45, 0.08)' }}>Good food.</span>
              <span 
                className="block bg-gradient-to-r from-[#0C4E2D] to-[#198754] bg-clip-text text-transparent filter drop-shadow-[0_2px_8px_rgba(12,78,45,0.08)] pb-1"
              >
                Made nearby.
              </span>
            </h1>
            <p className="relative z-10 text-sm text-gray-500 font-semibold leading-relaxed mt-0.5 max-w-sm">
              Prepared by trusted home cooks near you.
            </p>
          </div>

          {/* Simple Mobile Search Bar */}
          <form
            onSubmit={handleSearch}
            className={`bg-white rounded-xl border p-1 flex items-center gap-2 transition-all duration-300 relative ${
              isQueryInvalid ? 'border-red-300 focus-within:border-red-400' : 'border-gray-200 focus-within:border-brand-green/30 shadow-sm'
            }`}
          >
            <Search className={`w-4.5 h-4.5 ml-2.5 shrink-0 ${isQueryInvalid ? 'text-red-400' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search meals, kitchens, tiffins..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm font-bold text-gray-800 placeholder-gray-400 focus:outline-none py-2"
            />
            <button
              type="submit"
              className={`p-2 rounded-lg flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-all ${
                isQueryInvalid ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-[#0A4D2B] text-white'
              }`}
              aria-label="Search"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Mobile Empty Option Notification */}
          <AnimatePresence>
            {isQueryInvalid && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-1.5 bg-red-50 border border-red-100 rounded-lg p-2 flex items-center gap-2 text-red-700 text-[11px] font-semibold"
              >
                <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>No options available for "{query}". Try thalis or biryani!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── DESKTOP CONTAINER (>= lg) ── */}
      <section 
        className="hidden lg:block relative overflow-hidden pt-10 pb-24 border-b border-gray-100"
        style={{
          background: 'radial-gradient(circle at top right, rgba(12, 78, 45, 0.09), transparent 45%), linear-gradient(180deg, #FAF8F4 0%, #FFFFFF 100%)'
        }}
      >

        {/* 1. Decorative Graphics (Line Illustrations) */}
        <svg
          className="absolute pointer-events-none select-none text-brand-green z-0"
          style={{
            top: '4%',
            left: '8%',
            width: '320px',
            height: '320px',
            opacity: 0.06
          }}
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          aria-hidden="true"
        >
          <path d="M50,15 C35,30 32,55 45,75 C52,85 62,82 68,72 C76,60 70,30 50,15 Z" />
          <path d="M50,15 C48,40 50,60 45,75" strokeWidth="0.5" />
          <path d="M49,32 C42,36 38,42 48,46" strokeWidth="0.4" />
          <path d="M49,45 C56,49 58,54 47,59" strokeWidth="0.4" />
          <path d="M47,58 C41,62 38,68 45,72" strokeWidth="0.4" />
        </svg>

        <svg
          className="absolute pointer-events-none select-none text-brand-green z-0"
          style={{
            bottom: '8%',
            left: '34%',
            width: '340px',
            height: '340px',
            opacity: 0.06
          }}
          viewBox="0 0 120 120"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          aria-hidden="true"
        >
          <circle cx="60" cy="60" r="50" />
          <circle cx="60" cy="60" r="40" strokeDasharray="3 3" />
          <circle cx="60" cy="60" r="30" />
          <path d="M52,50 C55,48 65,48 68,50" strokeWidth="0.5" />
          <path d="M48,60 C53,58 67,58 72,60" strokeWidth="0.5" />
          <path d="M54,70 C57,68 63,68 66,70" strokeWidth="0.5" />
        </svg>

        <svg
          className="absolute pointer-events-none select-none text-brand-green z-0"
          style={{
            top: '32%',
            right: '44%',
            width: '240px',
            height: '240px',
            opacity: 0.05,
            transform: 'rotate(25deg)'
          }}
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          aria-hidden="true"
        >
          <path d="M45,20 C38,20 36,32 45,42 C54,32 52,20 45,20 Z" />
          <path d="M45,42 C45,55 48,70 47,82" strokeWidth="1.2" />
          <circle cx="47" cy="82" r="1.5" fill="currentColor" />
        </svg>

        {/* ── Main layout ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">

            {/* LEFT COLUMN ─────────────────────────────────────────────── */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left z-20 relative"
            >
              
              {/* 2. Ambient Glow (Behind desktop heading) */}
              <div 
                className="absolute top-[40px] left-[160px] w-[260px] h-[260px] rounded-full pointer-events-none z-0" 
                style={{
                  background: 'rgba(12, 78, 45, 0.08)',
                  filter: 'blur(90px)'
                }}
              />
              {/* Badge */}
              <motion.div
                variants={itemVariants}
                className="inline-flex items-center gap-2 bg-[#EBF3ED] text-[#0A4D2B] text-[10px] font-black px-3.5 py-1.5 rounded-full mb-6 tracking-widest uppercase shadow-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                <span>Serving verified kitchens in Pune &amp; Mumbai</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={itemVariants}
                className="text-center lg:text-left text-[3rem] sm:text-[4rem] lg:text-[4.75rem] font-black tracking-[-0.05em] leading-[0.92] mb-5"
                style={{
                  fontFamily: '"Plus Jakarta Sans", sans-serif'
                }}
              >
                <span className="block text-[#0F172A]" style={{ textShadow: '0 2px 8px rgba(12, 78, 45, 0.08)' }}>Good food.</span>
                <span 
                  className="block bg-gradient-to-r from-[#0C4E2D] to-[#198754] bg-clip-text text-transparent filter drop-shadow-[0_2px_8px_rgba(12,78,45,0.08)] pb-1.5"
                >
                  Made nearby.
                </span>
              </motion.h1>

              {/* Subtext */}
              <motion.p
                variants={itemVariants}
                className="text-gray-500 text-sm sm:text-base font-semibold mb-8 max-w-xl leading-relaxed"
              >
                Discover verified home kitchens in your neighborhood. Nutritious, freshly prepared, small-batch meals made with love, ready for easy self-pickup.
              </motion.p>

              {/* Trust chips */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-x-4 sm:gap-y-2 mb-8 justify-center lg:justify-start w-full"
              >
                {[
                  { icon: Leaf,        title: '100% Homemade',    sub: 'Small batches'  },
                  { icon: ShieldCheck, title: 'Verified Kitchens', sub: 'Hygiene checked' },
                  { icon: Soup,        title: 'Fresh Daily',      sub: 'Cooked today'   },
                  { icon: ShoppingBag, title: 'Easy Self-Pickup', sub: 'From neighbours' },
                ].map(({ icon: Icon, title, sub }) => (
                  <div key={title} className="flex items-center gap-2 bg-white py-1.5 px-3 rounded-xl border border-gray-100 shadow-sm shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-[#EBF3ED] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-[#0A4D2B]" />
                    </div>
                    <div className="text-left leading-tight">
                      <p className="text-xs font-black text-gray-800">{title}</p>
                      <p className="text-[9px] font-semibold text-gray-400 mt-0.5">{sub}</p>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Airbnb-style Search bar */}
              <motion.div variants={itemVariants} className="w-full max-w-2xl mb-8 relative">
                <form
                  onSubmit={handleSearch}
                  className={`bg-white rounded-2xl sm:rounded-full border p-1.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 transition-all duration-300 relative ${
                    isQueryInvalid 
                      ? 'border-red-300 shadow-[0_12px_42px_rgba(239,68,68,0.06)] focus-within:border-red-400 focus-within:shadow-[0_12px_48px_rgba(239,68,68,0.1)]' 
                      : 'border-gray-200 shadow-[0_12px_42px_rgba(0,0,0,0.06)] focus-within:border-brand-green/30 focus-within:shadow-[0_12px_48px_rgba(10,77,43,0.08)]'
                  }`}
                >
                  {/* Location Selector */}
                  <div className="relative flex items-center w-full sm:w-48 shrink-0" ref={dropdownRef}>
                    <button
                      type="button"
                      aria-expanded={dropdownOpen}
                      aria-haspopup="listbox"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center justify-between w-full px-4 py-2 sm:border-r border-gray-100 text-left gap-2 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <MapPin className="w-4.5 h-4.5 text-brand-green shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[9px] uppercase font-black text-gray-400 leading-none mb-0.5 tracking-wider">Location</p>
                          <p className="text-xs font-bold text-gray-800 truncate">
                            {location || 'Select your area'}
                          </p>
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          role="listbox"
                          initial={{ opacity: 0, y: 12, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 12, scale: 0.96 }}
                          transition={{ duration: 0.15, ease: 'easeOut' }}
                          className="absolute left-0 top-full mt-2.5 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-black/8 z-50 p-2.5"
                        >
                          {/* ── INTERNAL LOCATION SEARCH INPUT ── */}
                          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-2.5 py-1.5 mb-2 bg-gray-50 focus-within:border-brand-green/40 focus-within:bg-white transition-colors">
                            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <input 
                              type="text"
                              placeholder="Search your area..."
                              value={locationSearch}
                              onChange={(e) => setLocationSearch(e.target.value)}
                              className="w-full bg-transparent text-xs font-semibold focus:outline-none text-gray-800 placeholder-gray-400"
                            />
                            {locationSearch && (
                              <button type="button" onClick={() => setLocationSearch('')} className="cursor-pointer">
                                <X className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                              </button>
                            )}
                          </div>

                          <div 
                            className="overflow-y-auto max-h-[200px] pr-1"
                            style={{
                              WebkitOverflowScrolling: 'touch',
                              touchAction: 'pan-y',
                              overscrollBehavior: 'contain'
                            }}
                          >
                            {loadingLocations ? (
                              <div className="px-3 py-4 text-xs font-semibold text-gray-400 text-center select-none">
                                Loading locations...
                              </div>
                            ) : Object.keys(groupedLocations).length === 0 ? (
                              <div className="px-3 py-4 text-xs font-semibold text-gray-400 text-center select-none">
                                No matching areas found
                              </div>
                            ) : (
                              Object.entries(groupedLocations).map(([city, items]) => (
                                <div key={city} className="mb-2 last:mb-0">
                                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold px-3 py-1 bg-gray-50/70 rounded-md mb-1">{city}</p>
                                  {items.map((item) => {
                                    const displayString = `${item.area}, ${item.city}`;
                                    const isSelected = location === displayString;
                                    return (
                                      <button
                                        key={displayString}
                                        type="button"
                                        role="option"
                                        aria-selected={isSelected}
                                        onClick={() => {
                                          setLocation(displayString);
                                          localStorage.setItem('selectedLocation', displayString);
                                          setDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 mt-0.5 cursor-pointer ${
                                          isSelected
                                            ? 'text-brand-green bg-[#EBF3ED] font-bold'
                                            : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                      >
                                        <span className={`w-1.5 h-1.5 rounded-full bg-brand-green shrink-0 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                                        {item.area}
                                      </button>
                                    );
                                  })}
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Query Input */}
                  <div className="flex-1 flex items-center px-4 gap-2 py-3 sm:py-0 min-w-0">
                    <Search className={`w-4 h-4 shrink-0 ${isQueryInvalid ? 'text-red-400' : 'text-gray-400'}`} />
                    <div className="w-full">
                      <p className="text-[9px] uppercase font-black text-gray-400 leading-none mb-0.5 tracking-wider hidden sm:block">Search Dishes</p>
                      <input
                        type="text"
                        placeholder="Try thalis, biryani, cakes..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-transparent text-xs font-bold text-gray-800 placeholder-gray-400 focus:outline-none py-1"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className={`px-6 py-3 rounded-full font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer ${
                      isQueryInvalid 
                        ? 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20' 
                        : 'bg-brand-green text-white hover:bg-[#083a21] hover:shadow-lg hover:shadow-brand-green/20'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    <span className="hidden sm:inline">Search</span>
                  </button>
                </form>

                {/* Desktop Alert Backdrop Banner for unmatched queries */}
                <AnimatePresence>
                  {isQueryInvalid && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 18 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-4 right-4 top-full bg-red-50 border border-red-100 rounded-xl p-3 shadow-lg shadow-red-900/5 z-40 flex items-center gap-2.5 text-red-700 text-xs font-semibold"
                    >
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <div>
                        We couldn't find matches for <span className="font-extrabold text-red-800">"{query}"</span> active in this zone. Try matching keywords like <span className="underline">thali</span> or <span className="underline">biryani</span>.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* CTAs */}
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-4 w-full"
              >
                <button
                  onClick={() => navigate('/food')}
                  className="px-7 py-3.5 bg-brand-green text-white font-bold rounded-xl hover:bg-[#083a21] hover:shadow-lg hover:shadow-brand-green/20 active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-2 text-xs uppercase tracking-wider"
                >
                  <span>Browse Meals</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => navigate('/search')}
                  className="px-7 py-3.5 bg-white border border-gray-200 text-gray-700 hover:border-gray-300 font-bold rounded-xl hover:shadow-sm active:scale-95 transition-all duration-200 cursor-pointer text-xs uppercase tracking-wider"
                >
                  Find Cooks
                </button>
              </motion.div>
            </motion.div>

            {/* RIGHT COLUMN ────────────────────────────────────────────── */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end relative z-20 lg:-mr-20 xl:-mr-32 lg:pl-10">
              <div className="relative w-full max-w-[480px] lg:max-w-[580px] xl:max-w-[640px] aspect-square flex items-center justify-center -translate-y-4 lg:-translate-y-6">
                <div 
                  className="absolute inset-[-15%] rounded-full opacity-[0.45] pointer-events-none blur-3xl z-0"
                  style={{
                    background: 'radial-gradient(circle, rgba(10,77,43,0.15) 0%, rgba(250,251,248,0) 70%)',
                  }}
                />

                <svg
                  className="absolute -inset-16 w-[130%] h-[130%] pointer-events-none z-0 opacity-[0.08]"
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10,100 C10,40 50,10 100,10 C150,10 190,40 190,100 C190,160 150,190 100,190 C50,190 10,160 10,100 Z"
                    stroke="#0A4D2B"
                    strokeWidth="0.6"
                    strokeDasharray="3 4"
                  />
                  <path
                    d="M30,100 C30,60 60,30 100,30 C140,30 170,60 170,100 C170,140 140,170 100,170 C60,170 30,140 30,100 Z"
                    stroke="#0A4D2B"
                    strokeWidth="0.4"
                  />
                </svg>

                <motion.div
                  animate={{ rotate: [6, 9, 6], scale: [1.02, 1.04, 1.02] }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 border border-[#0A4D2B]/10 pointer-events-none"
                  style={{ borderRadius: '40% 60% 65% 35% / 45% 45% 55% 55%' }}
                />
                <motion.div
                  animate={{ rotate: [-3, -6, -3], scale: [0.98, 0.96, 0.98] }}
                  transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute inset-0 border border-[#0A4D2B]/05 pointer-events-none"
                  style={{ borderRadius: '35% 65% 55% 45% / 40% 50% 50% 60%' }}
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
                  transition={{
                    opacity: { duration: 0.8 },
                    scale:   { duration: 0.8 },
                    y:       { duration: 6, repeat: Infinity, ease: 'easeInOut' },
                  }}
                  className="relative w-full h-full p-2 bg-white border border-gray-100/70 overflow-hidden group z-10"
                  style={{
                    borderRadius: '35% 65% 55% 45% / 45% 40% 60% 55%',
                    boxShadow: '0 32px 72px rgba(10,77,43,0.12), 0 12px 28px rgba(0,0,0,0.04)',
                  }}
                >
                  <div
                    className="w-full h-full overflow-hidden relative"
                    style={{ borderRadius: '35% 65% 55% 45% / 45% 40% 60% 55%' }}
                  >
                    <img
                      src="/indian_home_chef.png"
                      alt="Smiling Indian home cook serving fresh food in her kitchen"
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/12 via-transparent to-transparent pointer-events-none" />
                  </div>
                </motion.div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;