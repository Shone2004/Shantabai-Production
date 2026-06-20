import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Leaf, ShieldCheck, Soup, ShoppingBag, ArrowRight, ChevronDown } from 'lucide-react';

// ─── IMPORT SUBSCRIBED FOOD LIST COMPONENT ───
import SubscribedFoodList from '../home/SubscribedFoodList'; 

const LOCATIONS = [
  'Andheri, Mumbai',
  'Bandra, Mumbai',
  'Baner, Pune',
  'Kothrud, Pune',
  'Deccan, Pune',
];

const Hero = () => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('Andheri, Mumbai');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

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

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const qParam  = query.trim() ? `q=${encodeURIComponent(query.trim())}` : '';
    const locParam = location    ? `loc=${encodeURIComponent(location)}`    : '';
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

  return (
    <>
      {/* HERO HERO CONTAINER */}
      <section className="relative bg-[#FAFBF8] overflow-hidden pt-4 sm:pt-8 lg:pt-10 pb-16 sm:pb-24 border-b border-gray-100">

        {/* ── Soft radial glows (depth) ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
          <div className="absolute -top-[260px] -right-[60px]  w-[520px] h-[520px] bg-brand-green/[0.025]  rounded-full blur-[90px]" />
          <div className="absolute  bottom-0    -left-[160px]  w-[440px] h-[440px] bg-brand-orange/[0.018] rounded-full blur-[75px]"  />
          <div className="absolute  top-[30%]    left-[16%]    w-[300px] h-[300px] bg-amber-50/[0.6]       rounded-full blur-[80px]"  />
          <div className="absolute  top-[42%]    right-[3%]    w-[360px] h-[360px] bg-brand-green/[0.018]  rounded-full blur-[100px]" />
        </div>

        {/* ── Thin decorative SVG curves ── */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          viewBox="0 0 1440 780"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M-60,180 C180,100 240,470 60,570"
            stroke="#0A4D2B" strokeWidth="1.1" strokeOpacity="0.05" fill="none" />
          <path d="M880,20 C1230,85 1380,450 920,760"
            stroke="#0A4D2B" strokeWidth="1.3" strokeOpacity="0.05" fill="none" />
          <path d="M770,320 C830,115 1170,55 1270,255 C1370,455 1120,610 920,695"
            stroke="#0A4D2B" strokeWidth="1.1" strokeOpacity="0.055"
            strokeDasharray="4 5" fill="none" />
        </svg>

        {/* ── Dot-grid accent (far-left) ── */}
        <div
          className="absolute left-3 top-[44%] -translate-y-1/2 w-12 h-24 opacity-[0.07] pointer-events-none z-0"
          aria-hidden="true"
          style={{
            backgroundImage:  'radial-gradient(#0A4D2B 1.4px, transparent 1.4px)',
            backgroundSize:   '10px 10px',
          }}
        />

        {/* ── Main layout ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">

            {/* LEFT COLUMN ─────────────────────────────────────────────── */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left z-20"
            >
              {/* Badge */}
              <motion.div
                variants={itemVariants}
                className="inline-flex items-center gap-2 bg-[#EBF3ED] text-[#0A4D2B] text-[10px] font-black px-3.5 py-1.5 rounded-full mb-6 tracking-widest uppercase shadow-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                <span>Serving Pune &amp; Mumbai</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={itemVariants}
                className="text-4xl sm:text-5xl lg:text-[3.5rem] lg:leading-[1.12] font-black text-gray-900 tracking-tight mb-5"
              >
                Taste the comfort of{' '}
                <br className="hidden sm:block" />
                <span className="text-brand-green relative inline-block">
                  home-cooked meals,
                  <svg
                    className="absolute -bottom-2.5 left-0 w-full"
                    viewBox="0 0 200 8"
                    fill="none"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 6 Q50 2 100 5 Q150 8 198 4"
                      stroke="#0A4D2B"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </span>{' '}
                <br className="hidden sm:block" />
                prepared by your{' '}
                <br className="hidden sm:block" />
                neighbors.
              </motion.h1>

              {/* Subtext */}
              <motion.p
                variants={itemVariants}
                className="text-gray-500 text-sm sm:text-base font-medium mb-8 max-w-xl leading-relaxed"
              >
                Discover nutritious, freshly prepared meals made by trusted home
                cooks in your area. Easy self-pickup, real food and real people.
              </motion.p>

              {/* Trust chips */}
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap gap-x-8 gap-y-4 mb-8 justify-center lg:justify-start w-full"
              >
                {[
                  { icon: Leaf,        title: 'Homemade',    sub: 'With Love'  },
                  { icon: ShieldCheck, title: 'Verified',    sub: 'Home Cooks' },
                  { icon: Soup,        title: 'Freshly',     sub: 'Prepared'   },
                  { icon: ShoppingBag, title: 'Self Pickup', sub: 'Convenient' },
                ].map(({ icon: Icon, title, sub }) => (
                  <div key={title} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#EBF3ED] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-[#0A4D2B]" />
                    </div>
                    <div className="text-left leading-tight">
                      <p className="text-sm font-bold   text-gray-800">{title}</p>
                      <p className="text-xs font-medium text-gray-500">{sub}</p>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Search bar */}
              <motion.div variants={itemVariants} className="w-full max-w-2xl mb-8">
                <form
                  onSubmit={handleSearch}
                  className="bg-white rounded-[2rem] sm:rounded-full border border-gray-200 shadow-[0_10px_36px_rgba(0,0,0,0.04)] p-1.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 focus-within:border-brand-green/25 focus-within:shadow-[0_10px_40px_rgba(10,77,43,0.07)] transition-all duration-300"
                >
                  {/* Custom Enhanced Dropdown Location */}
                  <div className="relative flex items-center w-full sm:w-48 shrink-0" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center justify-between w-full px-5 py-3 sm:border-r border-gray-100 text-left gap-2 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin className="w-4 h-4 text-brand-green shrink-0" />
                        <span className="text-sm font-bold text-gray-900 truncate">
                          {location}
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 top-full mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-black/5 overflow-hidden z-50 p-2"
                        >
                          {/* Mumbai Subsection */}
                          <div className="mb-2">
                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold px-3 py-1">Mumbai</p>
                            {LOCATIONS.filter(loc => loc.includes('Mumbai')).map((loc) => (
                              <button
                                key={loc}
                                type="button"
                                onClick={() => {
                                  setLocation(loc);
                                  setDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 ${
                                  location === loc
                                    ? 'text-brand-green bg-[#EBF3ED]'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full bg-brand-green shrink-0 ${location === loc ? 'opacity-100' : 'opacity-0'}`} />
                                {loc.split(',')[0]}
                              </button>
                            ))}
                          </div>

                          {/* Pune Subsection */}
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold px-3 py-1">Pune</p>
                            {LOCATIONS.filter(loc => loc.includes('Pune')).map((loc) => (
                              <button
                                key={loc}
                                type="button"
                                onClick={() => {
                                  setLocation(loc);
                                  setDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 ${
                                  location === loc
                                    ? 'text-brand-green bg-[#EBF3ED]'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full bg-brand-green shrink-0 ${location === loc ? 'opacity-100' : 'opacity-0'}`} />
                                {loc.split(',')[0]}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Query */}
                  <div className="flex-1 flex items-center px-4 gap-2.5 py-3 sm:py-0 min-w-0">
                    <Search className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search dishes, cuisines or home cooks..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none py-1.5"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="bg-brand-green text-white px-7 py-3.5 rounded-full font-bold text-sm hover:bg-brand-green/90 hover:shadow-lg hover:shadow-brand-green/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </button>
                </form>
              </motion.div>

              {/* CTAs */}
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-4 w-full"
              >
                <button
                  onClick={() => navigate('/food')}
                  className="px-8 py-4 bg-brand-green text-white font-bold rounded-full hover:bg-brand-green/90 hover:shadow-lg hover:shadow-brand-green/20 active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center gap-2 group text-sm"
                >
                  <span>Browse Food</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => navigate('/search')}
                  className="px-8 py-4 bg-white border border-[#0A4D2B]/30 text-[#0A4D2B] hover:border-[#0A4D2B]/60 font-bold rounded-full hover:shadow-md active:scale-[0.98] transition-all duration-200 cursor-pointer text-sm"
                >
                  Find Home Cooks
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

      {/* ─── PREMIUM PARTNER KITCHENS SECTION GRID FILTER ─── */}
      <SubscribedFoodList />
    </>
  );
};

export default Hero;