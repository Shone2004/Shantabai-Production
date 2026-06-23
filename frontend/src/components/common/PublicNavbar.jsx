import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import { LocationContext } from '../../context/LocationContext';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Browse Food', to: '/food' },
  { label: 'Find Cooks', to: '/search' },
];

const PublicNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { 
    selectedLocation, 
    setSelectedLocation, 
    locationsList, 
    loadingLocations, 
    errorLocations 
  } = useContext(LocationContext);
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const locationRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
    setLocationMenuOpen(false);
  }, [location.pathname]);

  // Close location menu if clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setLocationMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'PROVIDER') return '/chef/dashboard';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    return '/customer/dashboard';
  };

  const getDashboardLabel = () => {
    if (!user) return 'Dashboard';
    if (user.role === 'PROVIDER') return 'Chef Dashboard';
    if (user.role === 'ADMIN') return 'Admin Dashboard';
    return 'My Account';
  };

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || '?';

  const groupedLocations = {};
  locationsList.forEach(loc => {
    const city = loc.city;
    if (!groupedLocations[city]) {
      groupedLocations[city] = [];
    }
    groupedLocations[city].push(loc);
  });

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md shadow-black/5 border-b border-gray-100'
            : 'bg-white border-b border-gray-100'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          
          {/* ── MOBILE HEADER CONTAINER (< lg) ── */}
          <div className="flex lg:hidden items-center justify-between h-16 px-4">
            
            {/* Left: Logo */}
            <div className="flex items-center justify-start shrink-0">
              <Link to="/">
                <img
                  src="/logonavbar.png"
                  alt="Shantabai"
                  className="h-10 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Center: Compact Location Selector */}
            <div className="flex-1 flex justify-center px-2" ref={locationRef}>
              <button 
                type="button"
                aria-expanded={locationMenuOpen}
                aria-haspopup="listbox"
                onClick={() => setLocationMenuOpen(v => !v)}
                className="flex items-center gap-1.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-200/80 px-3 py-1.5 rounded-full cursor-pointer transition-all active:scale-95 text-center shadow-sm"
              >
                <svg className="w-3.5 h-3.5 text-brand-green shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs font-bold text-gray-800 truncate max-w-[80px] sm:max-w-[120px]">
                  {selectedLocation}
                </span>
                <svg className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${locationMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {locationMenuOpen && (
                  <motion.div
                    role="listbox"
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute left-1/2 -translate-x-1/2 mt-10 w-44 bg-white border border-gray-100 rounded-xl shadow-xl shadow-black/8 overflow-y-auto max-h-[280px] z-50 p-1"
                    style={{
                      WebkitOverflowScrolling: 'touch',
                      touchAction: 'pan-y',
                      overscrollBehavior: 'contain'
                    }}
                  >
                    {loadingLocations ? (
                      <div className="px-3.5 py-2 text-xs font-semibold text-gray-400 text-center select-none">
                        Loading...
                      </div>
                    ) : locationsList.length === 0 ? (
                      <div className="px-3.5 py-2 text-xs font-semibold text-gray-400 text-center select-none" role="option" aria-selected="false">
                        No locations
                      </div>
                    ) : (
                      Object.entries(groupedLocations).map(([city, items]) => (
                        <div key={city} className="mb-2 last:mb-0">
                          <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold px-3 py-1">{city}</p>
                          {items.map((item) => {
                            const displayString = `${item.area}, ${item.city}`;
                            const isSelected = selectedLocation === displayString;
                            return (
                              <button
                                key={displayString}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => {
                                  setSelectedLocation(displayString);
                                  setLocationMenuOpen(false);
                                }}
                                className={`w-full text-left px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                                  isSelected
                                    ? 'text-brand-green bg-brand-light font-bold'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {item.area}
                              </button>
                            );
                          })}
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: Actions (Notification + User or Sign In + Hamburger) */}
            <div className="flex items-center gap-2 px-1 shrink-0 justify-end">
              {/* Notification Bell */}
              <button className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-full transition-all active:scale-95">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white" />
              </button>

              {user ? (
                /* Profile Avatar Dropdown */
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(v => !v)}
                    className="w-7 h-7 rounded-full bg-brand-green flex items-center justify-center text-white text-xs font-black ring-1 ring-brand-green/10 cursor-pointer active:scale-95"
                  >
                    {userInitial}
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl shadow-black/8 overflow-hidden z-50 p-1.5"
                      >
                        <div className="px-3 py-2 border-b border-gray-100">
                          <p className="text-xs font-black text-gray-900 truncate">{user.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{user.role}</p>
                        </div>
                        <div className="py-1">
                          <Link
                            to={getDashboardLink()}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            Dashboard
                          </Link>
                        </div>
                        <div className="py-1 border-t border-gray-100">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* Compact Sign In */
                <Link
                  to="/login"
                  className="bg-brand-green text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-brand-green/90 active:scale-95 transition-all shadow-sm"
                >
                  Sign In
                </Link>
              )}

              {/* Hamburger Button */}
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                <div className="w-4 h-4 flex flex-col justify-center gap-[4px]">
                  <span className={`block w-4 h-0.5 bg-gray-700 rounded-full transition-transform duration-200 ${menuOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
                  <span className={`block w-4 h-0.5 bg-gray-700 rounded-full transition-opacity duration-200 ${menuOpen ? 'opacity-0' : 'opacity-100'}`} />
                  <span className={`block w-4 h-0.5 bg-gray-700 rounded-full transition-transform duration-200 ${menuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
                </div>
              </button>
            </div>

          </div>

          {/* ── DESKTOP HEADER CONTAINER (>= lg) ── */}
          <div className="hidden lg:flex items-center justify-between h-[72px] px-8">

            {/* Left: Logo */}
            <Link to="/" className="shrink-0">
              <img
                src="/logonavbar.png"
                alt="Shantabai"
                className="h-14 w-auto"
              />
            </Link>

            {/* Center Nav Links */}
            <div className="flex items-center gap-8">
              {NAV_LINKS.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`relative py-2 text-sm font-semibold tracking-wide transition-colors duration-200 ${
                      isActive
                        ? 'text-brand-green font-bold'
                        : 'text-gray-600 hover:text-brand-green'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-indicator"
                        className="absolute bottom-[-24px] left-0 right-0 h-0.5 bg-brand-green rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
              {user && (
                <Link
                  to={getDashboardLink()}
                  className={`relative py-2 text-sm font-semibold tracking-wide transition-colors duration-200 ${
                    location.pathname.includes('dashboard')
                      ? 'text-brand-green font-bold'
                      : 'text-gray-600 hover:text-brand-green'
                  }`}
                >
                  {getDashboardLabel()}
                  {location.pathname.includes('dashboard') && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute bottom-[-24px] left-0 right-0 h-0.5 bg-brand-green rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              )}
            </div>

            {/* Right: Location + Notification + User Menu */}
            <div className="flex items-center gap-4">
              
              {/* Location selector */}
              <div className="relative" ref={locationRef}>
                <button 
                  type="button"
                  aria-expanded={locationMenuOpen}
                  aria-haspopup="listbox"
                  onClick={() => setLocationMenuOpen(v => !v)}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50 px-4 py-2 rounded-full cursor-pointer transition-all border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow active:scale-98 group"
                >
                  <svg className="w-4 h-4 text-brand-green shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-bold text-gray-800">{selectedLocation}</span>
                  <svg className={`w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${locationMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {locationMenuOpen && (
                    <motion.div
                      role="listbox"
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-xl shadow-black/8 overflow-y-auto max-h-[280px] z-50 p-1"
                      style={{
                        WebkitOverflowScrolling: 'touch',
                        touchAction: 'pan-y',
                        overscrollBehavior: 'contain'
                      }}
                    >
                      {loadingLocations ? (
                        <div className="px-3.5 py-2 text-sm font-semibold text-gray-400 text-center select-none">
                          Loading...
                        </div>
                      ) : locationsList.length === 0 ? (
                        <div className="px-3.5 py-2 text-sm font-semibold text-gray-400 text-center select-none" role="option" aria-selected="false">
                          No locations
                        </div>
                      ) : (
                        Object.entries(groupedLocations).map(([city, items]) => (
                          <div key={city} className="mb-2 last:mb-0">
                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold px-3 py-1">{city}</p>
                            {items.map((item) => {
                              const displayString = `${item.area}, ${item.city}`;
                              const isSelected = selectedLocation === displayString;
                              return (
                                <button
                                  key={displayString}
                                  type="button"
                                  role="option"
                                  aria-selected={isSelected}
                                  onClick={() => {
                                    setSelectedLocation(displayString);
                                    setLocationMenuOpen(false);
                                  }}
                                  className={`w-full text-left px-3.5 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                                    isSelected
                                      ? 'text-brand-green bg-brand-light font-bold'
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  {item.area}
                                </button>
                              );
                            })}
                          </div>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Notification bell */}
              <button className="relative p-2.5 text-gray-500 hover:text-gray-800 hover:bg-gray-50 border border-transparent hover:border-gray-100 rounded-full transition-all active:scale-95">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              </button>

              {user ? (
                /* Profile Dropdown */
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(v => !v)}
                    className="flex items-center gap-2 bg-white hover:bg-gray-50 hover:border-gray-300 px-3 py-1.5 rounded-full border border-gray-200 transition-all shadow-sm hover:shadow cursor-pointer active:scale-98"
                  >
                    <div className="w-7 h-7 rounded-full bg-brand-green flex items-center justify-center text-white text-xs font-black ring-1 ring-brand-green/10">
                      {userInitial}
                    </div>
                    <span className="text-sm font-bold text-gray-700 max-w-[100px] truncate">
                      {user.name?.split(' ')[0]}
                    </span>
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-black/8 overflow-hidden z-50 p-1.5"
                      >
                        <div className="px-4 py-3.5 border-b border-gray-100">
                          <p className="text-sm font-extrabold text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-400 font-semibold capitalize tracking-wider mt-0.5">{user.role?.toLowerCase()}</p>
                        </div>
                        <div className="py-1">
                          <Link
                            to={getDashboardLink()}
                            className="flex items-center gap-2.5 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                          >
                            <svg className="w-4.5 h-4.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            {getDashboardLabel()}
                          </Link>
                        </div>
                        <div className="py-1 border-t border-gray-100">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <svg className="w-4.5 h-4.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    to="/chef-signup"
                    className="flex items-center gap-1.5 text-sm font-semibold text-brand-green border border-brand-green/30 hover:bg-brand-light px-4 py-2 rounded-full transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Become a Cook
                  </Link>

                  <Link
                    to="/login"
                    className="bg-brand-green text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-brand-green/90 active:scale-95 transition-all duration-200 shadow-sm"
                  >
                    Sign In
                  </Link>
                </>
              )}

            </div>
          </div>

        </div>

        {/* ── Mobile Hamburger Drawer ── */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="lg:hidden overflow-hidden border-t border-gray-100 bg-white"
            >
              <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
                {NAV_LINKS.map((link) => {
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                        isActive
                          ? 'text-brand-green bg-brand-light'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                {user && (
                  <Link
                    to={getDashboardLink()}
                    className="px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {getDashboardLabel()}
                  </Link>
                )}

                <div className="pt-2 flex flex-col gap-2">
                  {user ? (
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  ) : (
                    <>
                      <Link
                        to="/chef-signup"
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-brand-green/30 text-brand-green font-semibold text-sm hover:bg-brand-light transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Become a Cook
                      </Link>
                      <Link
                        to="/login"
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-brand-green text-white font-semibold text-sm hover:bg-brand-green/90 transition-colors"
                      >
                        Sign In
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default PublicNavbar;