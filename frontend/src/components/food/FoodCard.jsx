import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FoodCard = ({ food, hideProviderInfo = false }) => {
  const [liked, setLiked] = useState(false);

  const {
    id = 'f1',
    name = 'Poha',
    price = 40,
    pricePer = 'per plate',
    image = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
    description = 'Delicious homemade food made with love.',
    availabilityDetails = { isAvailable: true, ordersToday: 0, left: 0, total: 0 },
    serviceDate,
    startTime,
    endTime,
    timeWindow = '9:00 - 10:00 AM',
    location = 'Pune',
    distance = '1.5 km away',
    tags = [],
    bringContainer = false,
    isVeg = true,
    provider = {
      name: 'Home Cook',
      avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150',
      rating: 4.8,
      ordersCount: '100+',
      isVerified: true,
      badges: [],
    },
  } = food || {};

  const isAvailable = availabilityDetails.isAvailable;
  
  // Format Service Date (e.g. "15 Jun 2026")
  const dateObj = serviceDate ? new Date(serviceDate) : null;
  const formattedDate = dateObj && !isNaN(dateObj.getTime())
    ? dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '15 Jun 2026';

  // Format Time Window if startTime/endTime exist, otherwise fallback
  const formattedTimeWindow = startTime && endTime
    ? `${startTime} - ${endTime}`
    : timeWindow;

  return (
    <Link to={`/food/${id}`} className="block w-full max-w-[360px] mx-auto outline-none">
      <motion.div
        whileHover={{ y: -6, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm flex flex-col h-full group"
      >
        {/* 1. Image section with overlays */}
        <div className="relative aspect-[4/3] w-full overflow-hidden shrink-0">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

          {/* Availability badge */}
          <div className={`absolute top-4 left-4 flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur-md ${
            isAvailable ? 'bg-green-500 text-white' : 'bg-gray-700/95 text-slate-200'
          }`}>
            {isAvailable ? '⚡ Available Now' : '⚫ Sold Out'}
          </div>

          {/* Wishlist Icon */}
          <button
            onClick={(e) => { e.preventDefault(); setLiked(v => !v); }}
            className="absolute top-4 right-4 w-9 h-9 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
          >
            <svg className={`w-4.5 h-4.5 transition-colors ${liked ? 'fill-red-500 text-red-500' : 'fill-none text-gray-600'}`} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* Orders today overlay */}
          {availabilityDetails.ordersToday > 0 && (
            <div className="absolute bottom-3 left-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg text-white">
              <svg className="w-3.5 h-3.5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span className="text-[10px] font-bold tracking-wide">{availabilityDetails.ordersToday} orders today</span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-5 flex flex-col flex-1 gap-4">
          {/* 2. Food Name + Price */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-extrabold text-gray-900 leading-tight flex-1 group-hover:text-brand-green transition-colors">{name}</h3>
            <div className="text-right shrink-0">
              <span className="text-lg font-black text-gray-900">₹{price}</span>
              <p className="text-[10px] text-gray-400 font-bold leading-none mt-0.5">{pricePer}</p>
            </div>
          </div>

          {/* 3. Short Description */}
          <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-2">{description}</p>

          {/* 4. Date & Time Row */}
          <div className="flex items-center gap-4 text-xs font-semibold text-gray-600 bg-gray-50/70 p-2.5 rounded-xl border border-gray-100">
            <div className="flex items-center gap-1.5">
              <span className="text-base text-gray-400">📅</span>
              <span>{formattedDate}</span>
            </div>
            <div className="w-px h-3 bg-gray-200" />
            <div className="flex items-center gap-1.5">
              <span className="text-base text-gray-400">🕒</span>
              <span>{formattedTimeWindow}</span>
            </div>
          </div>

          {/* 5. Quantity + Distance Row */}
          <div className="flex items-center justify-between text-xs font-bold text-gray-700 px-1">
            <div className="flex items-center gap-1.5">
              <span className="text-base">🥡</span>
              <span className={availabilityDetails.left > 0 ? 'text-green-600' : 'text-rose-500'}>
                {availabilityDetails.left > 0 ? `${availabilityDetails.left} Left` : 'Sold Out'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500 font-semibold">
              <span className="text-base">📍</span>
              <span>{distance}</span>
            </div>
          </div>

          {/* 6. Container Included Row */}
          <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold ${
            bringContainer
              ? 'bg-amber-50 text-amber-800 border border-amber-100/50'
              : 'bg-green-50 text-green-800 border border-green-100/50'
          }`}>
            <span>{bringContainer ? '🥡 Bring Container' : '🍱 Container Included'}</span>
          </div>

          {/* 7. Tags Row (Veg, Healthy, etc.) */}
          <div className="flex flex-wrap gap-2">
            {/* Explicit Veg/Non-Veg tag */}
            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-1 ${
              isVeg
                ? 'bg-green-50 text-green-700 border border-green-100'
                : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
              {isVeg ? 'Veg' : 'Non-Veg'}
            </span>
            {/* Other tags */}
            {tags.filter(t => t.toLowerCase() !== 'veg' && t.toLowerCase() !== 'non-veg').slice(0, 2).map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 border border-gray-100"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* 8. Provider Section & 9. Reserve Button */}
          <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
            {!hideProviderInfo && (
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={provider.avatar}
                  alt={provider.name}
                  className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-gray-900 truncate max-w-[100px]">{provider.name}</span>
                    {provider.isVerified && (
                      <svg className="w-3.5 h-3.5 text-brand-green shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold">
                    <span className="text-amber-500 text-xs">★</span>
                    <span className="text-gray-800">{provider.rating}</span>
                    <span className="text-gray-400 font-medium">· {provider.ordersCount}</span>
                  </div>
                </div>
              </div>
            )}

            <button
              disabled={!isAvailable}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                hideProviderInfo ? 'w-full' : ''
              } ${
                isAvailable
                  ? 'bg-brand-green text-white hover:bg-brand-green/95 active:scale-95 shadow-md shadow-brand-green/10 cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              }`}
            >
              {isAvailable ? 'Reserve' : 'Sold Out'}
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default FoodCard;