import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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
    <div className="relative bg-brand-cream pb-12 lg:pb-24 pt-8 sm:pt-16 lg:pt-20 mb-24 lg:mb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 lg:min-h-[500px] flex items-center">
        <div className="flex flex-col lg:flex-row items-center w-full">
          
          {/* Left Text Content */}
          <div className="lg:w-[55%] lg:pr-8 z-20 text-center lg:text-left mb-12 lg:mb-0 lg:py-10">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-brand-brown leading-[1.1] tracking-tight mb-6"
            >
              Get Fresh <span className="text-brand-green">Homemade</span><br className="hidden lg:block"/>
              Food From Nearby<br className="hidden lg:block"/>
              <span className="text-brand-green">Home Cooks.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-base sm:text-lg text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed"
            >
              Discover affordable home-cooked meals prepared by trusted local kitchens. Perfect for bachelors, students and working professionals.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center lg:justify-start gap-2 text-sm font-bold text-gray-700 bg-white px-4 py-2 rounded-full w-fit mx-auto lg:mx-0 shadow-sm border border-gray-100"
            >
              <svg className="w-4 h-4 text-brand-orange" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              <span>4.8 Rating</span>
              <span className="text-gray-300 mx-1">•</span>
              <span>500+ Home Cooks</span>
              <span className="text-gray-300 mx-1">•</span>
              <span>Fresh Daily</span>
            </motion.div>
          </div>

          {/* Right Image Area (Half circle plate) */}
          <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-[30%] w-[650px] h-[650px] z-0 pointer-events-none">
            <motion.img 
              initial={{ opacity: 0, rotate: 45, x: 100 }}
              animate={{ opacity: 1, rotate: 0, x: 0 }}
              transition={{ duration: 1.2, type: "spring", bounce: 0.3 }}
              src="https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=1000" 
              alt="Homemade Thali" 
              className="w-full h-full object-cover rounded-full shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)]"
            />
          </div>

        </div>
      </div>

      {/* Floating Search Bar */}
      <div className="max-w-4xl mx-auto px-4 relative z-30 -mt-8 sm:mt-0 lg:absolute lg:bottom-0 lg:left-1/2 lg:-translate-x-1/2 lg:translate-y-1/2 w-full">
        <motion.form 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
          onSubmit={handleSearch}
          className="bg-white rounded-full shadow-xl shadow-brand-green/10 border border-gray-100 p-2 flex flex-col sm:flex-row items-center gap-2"
        >
          {/* Location Dropdown */}
          <div className="flex items-center gap-2 px-4 py-2 border-b sm:border-b-0 sm:border-r border-gray-100 w-full sm:w-auto shrink-0">
            <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <div className="flex flex-col">
              <select 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-transparent text-sm font-bold text-gray-900 focus:outline-none cursor-pointer appearance-none outline-none"
              >
                <option value="Baner, Pune">Baner, Pune</option>
                <option value="Kothrud, Pune">Kothrud, Pune</option>
                <option value="Andheri, Mumbai">Andheri, Mumbai</option>
              </select>
            </div>
            <svg className="w-4 h-4 text-gray-500 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>

          {/* Search Input */}
          <div className="flex-1 flex items-center px-4 w-full">
            <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Search for Puran Poli, Veg Thali, Chicken Curry..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-base font-medium text-gray-900 placeholder-gray-400 focus:outline-none py-2"
            />
          </div>

          {/* Search Button */}
          <button type="submit" className="bg-brand-green text-white p-3 sm:px-8 sm:py-3 rounded-full hover:bg-brand-green/90 transition-colors w-full sm:w-auto font-bold flex justify-center items-center">
            <span className="hidden sm:inline">Search</span>
            <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
        </motion.form>
      </div>

    </div>
  );
};

export default Hero;
