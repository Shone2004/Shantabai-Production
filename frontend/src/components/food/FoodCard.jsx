import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FoodCard = ({ food }) => {
  const [liked, setLiked] = useState(false);

  const {
    id = 'f1',
    name = 'Poha',
    price = 40,
    image = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
    location = 'Pune',
    distance = '1.5 km away',
    isVeg = true,
    availabilityDetails = { isAvailable: true }
  } = food || {};

  const isAvailable = availabilityDetails.isAvailable;

  return (
    <Link to={`/food/${id}`} className="block w-full outline-none">
      <motion.div
        whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)' }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col h-full group relative"
      >
        {/* 1. Image Header - occupies 60-70% height via aspect-[4/3] */}
        <div className="relative aspect-[4/3] w-full overflow-hidden shrink-0">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

          {/* Veg/Non-Veg Marker Overlay (top-left) */}
          <div className="absolute top-2 left-2 z-10">
            <div className={`border p-[2px] w-4.5 h-4.5 flex items-center justify-center rounded-[4px] shadow-sm bg-white/95 ${
              isVeg ? 'border-green-600' : 'border-red-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isVeg ? 'bg-green-600' : 'bg-red-600'
              }`} />
            </div>
          </div>

          {/* Wishlist Heart Icon Overlay (top-right) */}
          <button
            onClick={(e) => { e.preventDefault(); setLiked(v => !v); }}
            className="absolute top-2 right-2 w-7.5 h-7.5 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
            aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          >
            <svg className={`w-3.5 h-3.5 transition-colors ${liked ? 'fill-rose-500 text-rose-500' : 'fill-none text-gray-500'}`} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* Availability Status Overlay (bottom-left) */}
          <div className={`absolute bottom-2 left-2 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shadow-sm text-white ${
            isAvailable ? 'bg-emerald-600/90' : 'bg-gray-800/90'
          }`}>
            {isAvailable ? 'Available' : 'Sold Out'}
          </div>
        </div>

        {/* 2. Card Content Body */}
        <div className="p-3 flex flex-col justify-between flex-grow gap-2">
          <div className="space-y-1">
            {/* Dish Name & Price */}
            <div className="flex items-start justify-between gap-1.5 min-w-0">
              <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 leading-tight truncate group-hover:text-[#0A4D2B] transition-colors flex-1">
                {name}
              </h3>
              <span className="text-xs sm:text-sm font-black text-gray-900 shrink-0">₹{price}</span>
            </div>

            {/* Distance & Locality */}
            <div className="text-[10px] sm:text-xs text-gray-400 font-bold leading-none truncate tracking-wide">
              {distance ? `${distance.replace(' away', '')} • ` : ''}{location.split(',')[0]}
            </div>
          </div>

          {/* Compact Reserve CTA */}
          <button
            disabled={!isAvailable}
            className={`w-full py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
              isAvailable
                ? 'bg-[#0A4D2B] hover:bg-[#083a20] text-white active:scale-95 shadow-sm shadow-[#0A4D2B]/10 cursor-pointer'
                : 'bg-gray-150 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none'
            }`}
          >
            {isAvailable ? 'Reserve' : 'Sold Out'}
          </button>
        </div>
      </motion.div>
    </Link>
  );
};

export default FoodCard;