import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CUISINE_OPTIONS = [
  'North Indian', 'South Indian', 'Maharashtrian', 'Gujarati', 
  'Bengali', 'Chinese', 'Italian', 'Healthy/Diet', 'Baking', 
  'Street Food', 'Vegan', 'Keto', 'Desserts', 'Mughlai', 'Continental',
  'Punjabi', 'Rajasthani', 'Biryani Special', 'Seafood'
];

export default function CookFilter({ filters, onChange, isMobileOpen, onCloseMobile }) {
  // Local state for autocomplete
  const [cuisineInput, setCuisineInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleArrayItem = (key, item) => {
    const current = filters[key] || [];
    const updated = current.includes(item) 
      ? current.filter(i => i !== item)
      : [...current, item];
    handleChange(key, updated);
  };

  const handleAddCuisine = (cuisine) => {
    if (!filters.cuisines?.includes(cuisine)) {
      handleChange('cuisines', [...(filters.cuisines || []), cuisine]);
    }
    setCuisineInput('');
    setShowSuggestions(false);
  };

  const handleRemoveCuisine = (cuisine) => {
    handleChange('cuisines', filters.cuisines.filter(c => c !== cuisine));
  };

  const filteredSuggestions = CUISINE_OPTIONS.filter(c => 
    c.toLowerCase().includes(cuisineInput.toLowerCase()) && 
    !filters.cuisines?.includes(c)
  );

  const filterContent = (
    <div className="flex flex-col gap-8">
      {/* Location */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">Location</label>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Enter city or area..."
            value={filters.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 focus:border-brand-green focus:bg-white focus:ring-4 focus:ring-brand-green/10 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-gray-900 outline-none transition-all"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </div>
      </div>

      {/* Cuisines Autocomplete */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">Cuisines</label>
        <div className="relative" ref={suggestionRef}>
          <input 
            type="text" 
            placeholder="Search cuisines..."
            value={cuisineInput}
            onChange={(e) => {
              setCuisineInput(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="w-full bg-gray-50 border border-gray-200 focus:border-brand-green focus:bg-white focus:ring-4 focus:ring-brand-green/10 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 outline-none transition-all"
          />
          <AnimatePresence>
            {showSuggestions && filteredSuggestions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute z-20 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-48 overflow-y-auto"
              >
                {filteredSuggestions.map(cuisine => (
                  <div 
                    key={cuisine}
                    onClick={() => handleAddCuisine(cuisine)}
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-brand-light hover:text-brand-green cursor-pointer transition-colors"
                  >
                    {cuisine}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Selected Chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          <AnimatePresence>
            {filters.cuisines?.map(cuisine => (
              <motion.span 
                key={cuisine}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-green/10 text-brand-green text-xs font-bold border border-brand-green/20"
              >
                {cuisine}
                <button onClick={() => handleRemoveCuisine(cuisine)} className="hover:text-red-500 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Dietary Preferences */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-3">Dietary Preferences</label>
        <div className="space-y-2.5">
          {['Veg', 'Non-Veg', 'Vegan', 'Healthy'].map(diet => (
            <label key={diet} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  checked={filters.dietary?.includes(diet) || false}
                  onChange={() => toggleArrayItem('dietary', diet)}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:border-brand-green peer-checked:bg-brand-green transition-colors"></div>
                <svg className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{diet}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-3">Availability</label>
        <div className="space-y-2.5">
          {['Anytime', 'Available Now', 'Breakfast', 'Lunch', 'Dinner'].map(time => (
            <label key={time} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="radio" 
                  name="availability"
                  checked={filters.availability === time}
                  onChange={() => handleChange('availability', time)}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-brand-green transition-colors"></div>
                <div className="w-2.5 h-2.5 bg-brand-green rounded-full absolute opacity-0 peer-checked:opacity-100 transition-opacity"></div>
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{time}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Ratings */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">Minimum Rating</label>
        <div className="relative">
          <select 
            value={filters.rating || 'any'}
            onChange={(e) => handleChange('rating', e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 focus:border-brand-green focus:ring-4 focus:ring-brand-green/10 rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium text-gray-700 outline-none appearance-none transition-all cursor-pointer"
          >
            <option value="any">Any Rating</option>
            <option value="4.5">4.5★ & Above</option>
            <option value="4.0">4.0★ & Above</option>
            <option value="3.5">3.5★ & Above</option>
          </select>
          <svg className="w-4 h-4 text-gray-500 absolute right-4 top-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>

      {/* Price Range Slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-bold text-gray-900">Max Price (per meal)</label>
          <span className="text-xs font-bold text-brand-green">₹{filters.maxPrice || 500}</span>
        </div>
        <input 
          type="range" 
          min="50" 
          max="1000" 
          step="50"
          value={filters.maxPrice || 500}
          onChange={(e) => handleChange('maxPrice', parseInt(e.target.value))}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-green"
        />
        <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2">
          <span>₹50</span>
          <span>₹1000</span>
        </div>
      </div>

      {/* Services */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-3">Services</label>
        <div className="space-y-2.5">
          {['Delivery', 'Pickup', 'Event Catering', 'Daily Tiffin'].map(service => (
            <label key={service} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  checked={filters.services?.includes(service) || false}
                  onChange={() => toggleArrayItem('services', service)}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:border-brand-green peer-checked:bg-brand-green transition-colors"></div>
                <svg className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{service}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (visible lg+) */}
      <div className="hidden lg:block w-72 shrink-0">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-gray-900">Filters</h2>
            <button 
              onClick={() => onChange({ 
                location: '', cuisines: [], dietary: [], 
                availability: 'Anytime', rating: 'any', maxPrice: 1000, services: [] 
              })}
              className="text-xs font-bold text-brand-green hover:text-green-700 transition-colors"
            >
              Reset All
            </button>
          </div>
          {filterContent}
        </div>
      </div>

      {/* Mobile Drawer (visible <lg) */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50 lg:hidden flex flex-col"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                <h2 className="text-lg font-black text-gray-900">Filters</h2>
                <button onClick={onCloseMobile} className="p-2 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                {filterContent}
              </div>
              <div className="p-4 border-t border-gray-100 bg-white shrink-0">
                <button 
                  onClick={onCloseMobile}
                  className="w-full bg-brand-green text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-green/30"
                >
                  Show Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
