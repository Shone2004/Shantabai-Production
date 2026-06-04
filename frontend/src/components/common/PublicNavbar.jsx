import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Browse Food', to: '/food' },
  { label: 'Find Cooks', to: '/search' },
];

const PublicNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">

            {/* ── Logo ── */}
          <Link to="/" className="shrink-0">
  <img
    src="/logonavbar.png"
    alt="Shantabai"
    className="h-18 w-auto"
  />
</Link>

            {/* ── Desktop Center Nav Links ── */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                      isActive
                        ? 'text-brand-green bg-brand-light'
                        : 'text-gray-600 hover:text-brand-green hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-indicator"
                        className="absolute inset-0 bg-brand-light rounded-full -z-10"
                        transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* ── Right Actions ── */}
            <div className="flex items-center gap-2 sm:gap-3">

              {/* Location Pill — md+ */}
              <button className="hidden md:flex items-center gap-2 bg-gray-50 hover:bg-gray-100 px-3.5 py-2 rounded-full cursor-pointer transition-colors border border-gray-200 group">
                <svg className="w-4 h-4 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-semibold text-gray-800">Pune</span>
                <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Notification Bell */}
              <button className="relative p-2.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>

              {/* Become a Cook — lg+ */}
              <Link
                to="/provider"
                className="hidden lg:flex items-center gap-1.5 text-sm font-semibold text-brand-green border border-brand-green/30 hover:bg-brand-light px-4 py-2 rounded-full transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Become a Cook
              </Link>

              {/* Sign In */}
              <Link
                to="/login"
                className="bg-brand-green text-white px-4 sm:px-5 py-2 rounded-full text-sm font-bold hover:bg-brand-green/90 active:scale-95 transition-all duration-200 shadow-sm shadow-brand-green/20"
              >
                Sign In
              </Link>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                <motion.div animate={menuOpen ? 'open' : 'closed'} className="w-5 h-5 flex flex-col justify-center gap-[5px]">
                  <motion.span
                    variants={{ open: { rotate: 45, y: 7 }, closed: { rotate: 0, y: 0 } }}
                    className="block w-5 h-0.5 bg-gray-700 rounded-full origin-center transition-transform"
                  />
                  <motion.span
                    variants={{ open: { opacity: 0, x: -6 }, closed: { opacity: 1, x: 0 } }}
                    className="block w-5 h-0.5 bg-gray-700 rounded-full"
                  />
                  <motion.span
                    variants={{ open: { rotate: -45, y: -7 }, closed: { rotate: 0, y: 0 } }}
                    className="block w-5 h-0.5 bg-gray-700 rounded-full origin-center transition-transform"
                  />
                </motion.div>
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Dropdown Menu ── */}
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

                {/* Location pill in mobile menu */}
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium">Pune</span>
                  <span className="text-gray-400">— change location</span>
                </div>

                <div className="mt-2 pt-3 border-t border-gray-100">
                  <Link
                    to="/provider"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-brand-green/30 text-brand-green font-semibold text-sm hover:bg-brand-light transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Become a Cook
                  </Link>
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