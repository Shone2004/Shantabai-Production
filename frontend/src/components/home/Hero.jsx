import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const TRUST_BADGES = [
  { icon: '⭐', label: '4.8 Rating' },
  { icon: '🏠', label: '500+ Home Cooks' },
  { icon: '🥘', label: 'Fresh Daily' },
  { icon: '✅', label: 'Verified Kitchens' },
];

const LOCATIONS = [
  'Baner, Pune',
  'Kothrud, Pune',
  'Deccan, Pune',
  'Andheri, Mumbai',
  'Bandra, Mumbai',
];

const Hero = () => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('Baner, Pune');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}&loc=${encodeURIComponent(location)}`);
    }
  };

  return (
    <section className="relative bg-brand-cream overflow-hidden pt-8 sm:pt-12 pb-10">

      {/* Soft background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-brand-green/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 bg-brand-orange/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-0 lg:min-h-[460px]">

          {/* ── Left: Text Content ── */}
          <div className="lg:w-[56%] text-center lg:text-left lg:pr-12 z-20">

            {/* Pill badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-brand-green/10 border border-brand-green/20 text-brand-green text-xs font-bold px-4 py-1.5 rounded-full mb-5 tracking-wide uppercase"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
              Now Live in Pune · Mumbai
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="text-4xl sm:text-5xl lg:text-[3.75rem] font-black text-gray-900 leading-[1.1] tracking-tight mb-5"
            >
              Get Fresh{' '}
              <span className="text-brand-green relative">
                Homemade
                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                  <path d="M2 6 Q50 2 100 5 Q150 8 198 4" stroke="#0A4D2B" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.4"/>
                </svg>
              </span>
              <br className="hidden lg:block" />
              {' '}Food From{' '}
              <br className="hidden lg:block" />
              Nearby{' '}
              <span className="text-brand-green">Home Cooks.</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="text-gray-500 text-base sm:text-lg font-medium mb-7 max-w-lg mx-auto lg:mx-0 leading-relaxed"
            >
              Discover affordable home-cooked meals prepared by trusted local kitchens. Perfect for bachelors, students and working professionals.
            </motion.p>

            {/* Trust badges row */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-0"
            >
              {TRUST_BADGES.map((badge) => (
                <span
                  key={badge.label}
                  className="inline-flex items-center gap-1.5 bg-white border border-gray-100 shadow-sm text-xs font-semibold text-gray-700 px-3 py-1.5 rounded-full"
                >
                  <span>{badge.icon}</span>
                  {badge.label}
                </span>
              ))}
            </motion.div>
          </div>

          {/* ── Right: Food Image ── */}
          <div className="hidden lg:flex lg:w-[44%] justify-end items-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, rotate: 8 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.9, type: 'spring', bounce: 0.3 }}
              className="relative w-[420px] h-[420px]"
            >
              {/* Decorative ring */}
              <div className="absolute inset-0 rounded-full border-[12px] border-brand-green/8" />
              <div className="absolute inset-3 rounded-full border-[6px] border-brand-green/5" />

              <img
                src="https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=900"
                alt="Homemade Thali"
                className="w-full h-full object-cover rounded-full shadow-2xl shadow-brand-green/20"
              />

              {/* Floating card — Orders today */}
              <motion.div
                initial={{ opacity: 0, x: 30, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="absolute -right-6 top-16 bg-white rounded-2xl shadow-xl shadow-black/10 px-4 py-3 flex items-center gap-3 border border-gray-100"
              >
                <div className="w-9 h-9 bg-brand-green/10 rounded-xl flex items-center justify-center text-lg">🍱</div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Orders today</p>
                  <p className="text-base font-black text-gray-900">1,240+</p>
                </div>
              </motion.div>

              {/* Floating card — Top Rated */}
              <motion.div
                initial={{ opacity: 0, x: -30, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.75, duration: 0.5 }}
                className="absolute -left-8 bottom-20 bg-white rounded-2xl shadow-xl shadow-black/10 px-4 py-3 flex items-center gap-3 border border-gray-100"
              >
                <div className="w-9 h-9 bg-yellow-50 rounded-xl flex items-center justify-center text-lg">⭐</div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Avg Rating</p>
                  <p className="text-base font-black text-gray-900">4.8 / 5.0</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Search Bar (in-flow, no float) ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-10 relative z-30">
        <motion.form
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', bounce: 0.4 }}
          onSubmit={handleSearch}
          className="bg-white rounded-2xl sm:rounded-full shadow-2xl shadow-brand-green/10 border border-gray-100 p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
        >
          {/* Location */}
          <div className="flex items-center gap-2 px-4 py-2 sm:border-r border-gray-100 w-full sm:w-auto shrink-0">
            <svg className="w-4 h-4 text-brand-green shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-transparent text-sm font-bold text-gray-900 focus:outline-none cursor-pointer appearance-none"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Search input */}
          <div className="flex-1 flex items-center px-4 gap-2 min-w-0">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search for Poha, Veg Thali, Chicken Curry…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none py-2"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="bg-brand-green text-white px-6 py-3 rounded-xl sm:rounded-full font-bold text-sm hover:bg-brand-green/90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md shadow-brand-green/20 w-full sm:w-auto shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Search</span>
          </button>
        </motion.form>
      </div>
    </section>
  );
};

export default Hero;