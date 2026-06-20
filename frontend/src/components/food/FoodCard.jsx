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
    <Link to={`/food/${id}`} className="block w-full max-w-[340px] mx-auto outline-none">
      <motion.div
        whileHover={{ y: -5, boxShadow: '0 12px 30px rgba(0, 0, 0, 0.06)' }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col h-full group"
      >
        {/* 1. Full-bleed Image section */}
        <div className="relative aspect-[16/11] w-full overflow-hidden shrink-0">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

          {/* Availability Badge */}
          <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider shadow-sm backdrop-blur-md text-white ${
            isAvailable ? 'bg-emerald-600/90' : 'bg-gray-800/90'
          }`}>
            {isAvailable ? 'Available' : 'Sold Out'}
          </div>

          {/* Wishlist Heart Icon */}
          <button
            onClick={(e) => { e.preventDefault(); setLiked(v => !v); }}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-all cursor-pointer"
          >
            <svg className={`w-4 h-4 transition-colors ${liked ? 'fill-rose-500 text-rose-500' : 'fill-none text-gray-500'}`} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* Active Orders overlay */}
          {availabilityDetails.ordersToday > 0 && (
            <div className="absolute bottom-2.5 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded text-white text-[9px] font-bold tracking-wide">
              <span>{availabilityDetails.ordersToday} ordered today</span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-4 flex flex-col flex-1 gap-3.5">
          
          {/* 2. Veg/Non-Veg & Food Name & Price */}
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {/* Standard Indian Veg/Non-Veg Marker */}
                <div className={`border p-[2px] w-3.5 h-3.5 flex items-center justify-center shrink-0 rounded-[3px] ${
                  isVeg ? 'border-green-650 bg-green-50/50' : 'border-red-650 bg-red-50/50'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    isVeg ? 'bg-green-600' : 'bg-red-600'
                  }`} />
                </div>
                
                <h3 className="text-base font-extrabold text-gray-905 leading-snug truncate group-hover:text-brand-green transition-colors">
                  {name}
                </h3>
              </div>
              <div className="text-right shrink-0">
                <span className="text-base font-black text-gray-900">₹{price}</span>
                <span className="text-[9px] text-gray-400 font-semibold block leading-none">{pricePer}</span>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed line-clamp-2">
              {description}
            </p>
          </div>

          {/* 3. Locality, Date & Time (Clean metadata rows) */}
          <div className="space-y-2 border-t border-gray-50 pt-3">
            {/* Locality first */}
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-bold">
              <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span>{location}</span>
              <span className="text-gray-300 font-normal">·</span>
              <span className="font-semibold text-gray-400">{distance}</span>
            </div>

            {/* Date & Time */}
            <div className="flex items-center gap-1.5 text-[11px] text-gray-650 font-bold">
              <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formattedDate}</span>
              <span className="text-gray-300 font-normal">|</span>
              <span className="text-gray-500 font-semibold">{formattedTimeWindow}</span>
            </div>
          </div>

          {/* 4. Serving Quantity & Container Info */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-extrabold tracking-wide uppercase pt-1 border-t border-gray-50">
            <div className="flex items-center gap-1 text-gray-600">
              <span className="text-xs">🥡</span>
              <span className={availabilityDetails.left > 0 ? 'text-emerald-700' : 'text-rose-600'}>
                {availabilityDetails.left > 0 ? `${availabilityDetails.left} Servings Left` : 'Sold Out'}
              </span>
            </div>

            <div className={`px-2 py-0.5 rounded font-black text-[9px] ${
              bringContainer
                ? 'bg-amber-50 text-amber-800'
                : 'bg-emerald-50 text-emerald-800'
            }`}>
              {bringContainer ? 'Bring Container' : 'Container Included'}
            </div>
          </div>

          {/* 5. Provider & Action CTA */}
          <div className="mt-auto pt-3.5 border-t border-gray-100 flex items-center justify-between gap-3">
            {!hideProviderInfo && (
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={provider.avatar}
                  alt={provider.name}
                  className="w-8 h-8 rounded-full object-cover border border-gray-150 shadow-sm shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-extrabold text-gray-900 truncate max-w-[90px]">{provider.name}</span>
                    {provider.isVerified && (
                      <svg className="w-3 h-3 text-brand-green shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 text-[10px] text-gray-800 font-bold leading-none mt-0.5">
                    <span className="text-amber-500">★</span>
                    <span>{provider.rating}</span>
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
                  ? 'bg-brand-green text-white hover:bg-[#083a21] active:scale-95 shadow shadow-brand-green/10 cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none'
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