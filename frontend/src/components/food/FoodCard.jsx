import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FoodCard = ({ food }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Fallbacks for data properties
  const {
    id = 'f1',
    name = 'Poha',
    price = 40,
    pricePer = 'per plate',
    image = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
    description = 'Delicious homemade food made with love.',
    availabilityDetails = { isAvailable: true, ordersToday: 0, left: 0, total: 0 },
    timeWindow = '9:00 - 10:00 AM',
    location = 'Pune',
    distance = '1.0 km away',
    tags = [],
    provider = {
      name: 'Home Cook',
      avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150',
      rating: 4.8,
      ordersCount: '100+',
      isVerified: true,
      badges: []
    }
  } = food || {};

  return (
    <Link to={`/food/${id}`} className="block w-full h-full max-w-[420px] mx-auto outline-none">
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
        className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden transition-all duration-300 h-full flex flex-col"
      >
        {/* Top Image Section */}
        <div className="relative h-64 w-full overflow-hidden">
          <motion.img
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
          
          {/* Gradient Overlay for bottom text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

          {/* Top Left Badge: Availability */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
            {availabilityDetails.isAvailable ? (
              <>
                <svg className="w-4 h-4 text-brand-green" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                <span className="text-sm font-bold text-brand-green">Available Now</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                <span className="text-sm font-bold text-gray-600">Sold Out</span>
              </>
            )}
          </div>

          {/* Top Right Heart Icon */}
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-4 right-4 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:text-red-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
          </motion.button>

          {/* Bottom Left Badge: Orders Today */}
          {availabilityDetails.ordersToday > 0 && (
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white shadow-lg">
              <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>
              <span className="text-xs font-semibold">{availabilityDetails.ordersToday} orders today</span>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-4 sm:p-5 flex flex-col flex-1">
          {/* Header Row: Title & Price */}
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">{name}</h2>
            <div className="text-right flex flex-col justify-start">
              <span className="text-3xl font-black text-brand-green leading-none">₹{price}</span>
              <span className="text-xs font-medium text-brand-green/80 mt-1">{pricePer}</span>
            </div>
          </div>

          <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6 pr-4">
            {description}
          </p>

          {/* Stats Area */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 bg-gray-50/80 rounded-2xl p-4 mb-5 border border-gray-100">
            {/* Left Box */}
            <div className="flex items-center gap-2 text-brand-green">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <div className="flex flex-col">
                <span className="text-[11px] font-extrabold text-gray-900 leading-none mb-0.5">{availabilityDetails.left} Left</span>
                <span className="text-[9px] text-gray-500 font-medium leading-none">of {availabilityDetails.total} plates</span>
              </div>
            </div>

            {/* Middle Box */}
            <div className="flex items-center gap-2 text-orange-500">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <div className="flex flex-col">
                <span className="text-[11px] font-extrabold text-gray-900 leading-none mb-0.5">Pickup</span>
                <span className="text-[9px] text-gray-500 font-medium leading-none">{timeWindow}</span>
              </div>
            </div>

            {/* Right Box */}
            <div className="flex items-center gap-2 text-blue-500">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <div className="flex flex-col">
                <span className="text-[11px] font-extrabold text-gray-900 leading-none mb-0.5">{distance}</span>
                <span className="text-[9px] text-gray-500 font-medium leading-none truncate max-w-[80px]">{location.split(',')[0]}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.map((tag) => {
                let bgStyle, icon;
                if (tag.toLowerCase() === 'veg') {
                  bgStyle = 'bg-green-50 text-green-700';
                  icon = <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>;
                } else if (tag.toLowerCase() === 'healthy') {
                  bgStyle = 'bg-amber-50 text-amber-700';
                  icon = <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>;
                } else if (tag.toLowerCase() === 'homemade') {
                  bgStyle = 'bg-purple-50 text-purple-700';
                  icon = <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>;
                } else {
                  bgStyle = 'bg-gray-100 text-gray-700';
                  icon = null;
                }

                return (
                  <span key={tag} className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${bgStyle}`}>
                    {icon}
                    {tag}
                  </span>
                );
              })}
            </div>
          )}

          {/* Provider Profile Section */}
          <div className="mt-auto">
            <div className="bg-[#FCFAF7] rounded-[1.5rem] p-5 mb-6 border border-orange-100">
              {/* Top row: Avatar & Name */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                  <img src={provider.avatar} alt={provider.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-base font-bold text-gray-900 truncate">{provider.name}</h4>
                    {provider.isVerified && (
                      <svg className="w-4 h-4 text-brand-green flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 whitespace-nowrap">
                    <motion.svg 
                      animate={{ rotate: isHovered ? [0, 15, -15, 0] : 0 }}
                      transition={{ duration: 0.5, repeat: isHovered ? Infinity : 0, repeatDelay: 2 }}
                      className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </motion.svg>
                    <span className="text-sm font-bold text-gray-900">{provider.rating}</span>
                    <span className="text-xs sm:text-sm text-gray-500 font-medium">({provider.ordersCount} orders)</span>
                  </div>
                </div>
              </div>

              {/* Bottom row: Badges */}
              {provider.badges && provider.badges.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200/60">
                  {provider.badges.map((badge, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                      <div className="text-brand-green">
                        {badge.icon === 'shield' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>}
                        {badge.icon === 'users' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>}
                        {badge.icon === 'medal' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>}
                      </div>
                      <span className="text-[10px] font-bold text-gray-800">{badge.title} {badge.subtitle}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reserve CTA Button */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg text-white shadow-lg transition-colors ${
                availabilityDetails.isAvailable 
                  ? 'bg-brand-green hover:bg-brand-green/90 shadow-brand-green/30' 
                  : 'bg-gray-400 cursor-not-allowed shadow-gray-400/30'
              }`}
              disabled={!availabilityDetails.isAvailable}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              {availabilityDetails.isAvailable ? 'Reserve Now' : 'Sold Out'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default FoodCard;
