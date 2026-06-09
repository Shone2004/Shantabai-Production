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
      badges: [],
    },
  } = food || {};

  const isAvailable = availabilityDetails.isAvailable;

  return (
    <Link to={`/food/${id}`} className="block w-full max-w-[340px] mx-auto outline-none">
      <motion.div
        whileHover={{ y: -5, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.12)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full"
      >

        {/* ── Image ── */}
        <div className="relative h-44 w-full overflow-hidden shrink-0">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/5 pointer-events-none" />

          {/* Availability pill */}
          <div className={`absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm backdrop-blur-sm ${
            isAvailable ? 'bg-white/95 text-brand-green' : 'bg-white/90 text-gray-500'
          }`}>
            {isAvailable ? (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            {isAvailable ? 'Available Now' : 'Sold Out'}
          </div>

          {/* Heart */}
          <button
            onClick={(e) => { e.preventDefault(); setLiked(v => !v); }}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
          >
            <svg className={`w-4 h-4 transition-colors ${liked ? 'fill-red-500 text-red-500' : 'fill-none text-gray-500'}`} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* Orders today */}
          {availabilityDetails.ordersToday > 0 && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/55 backdrop-blur-sm px-2.5 py-1 rounded-lg text-white">
              <svg className="w-3 h-3 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span className="text-[11px] font-semibold">{availabilityDetails.ordersToday} orders today</span>
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="p-4 flex flex-col flex-1 gap-3">

          {/* Name + Price */}
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-base font-black text-gray-900 leading-tight flex-1">{name}</h2>
            <div className="text-right shrink-0">
              <span className="text-base font-black text-brand-green">₹{price}</span>
              <p className="text-[10px] text-gray-400 font-medium leading-none mt-0.5">{pricePer}</p>
            </div>
          </div>

          {/* Description — capped at 2 lines */}
          <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-2">{description}</p>

          {/* Stats — compact single row */}
          {/* Stats Layout */}
<div className="bg-gradient-to-b from-gray-50 to-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

  {/* Time */}
  <div className="flex items-center justify-center gap-2 py-3 border-b border-gray-200">
    <svg
      className="w-4 h-4 text-orange-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>

    <span className="text-sm font-bold text-gray-800">
      {timeWindow}
    </span>
  </div>

  {/* Quantity + Distance */}
  <div className="flex justify-around items-center py-3">

      <div className="flex flex-col items-center">
      <span className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
        Quantity
      </span>

      <span className="text-sm font-bold text-gray-900 mt-1">
        {availabilityDetails.left} Left
      </span>
    </div>

   <div className="flex flex-col items-center">
      <span className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
        Distance
      </span>

      <span className="text-sm font-bold text-gray-900 mt-1">
        {distance}
      </span>
    </div>

  </div>
</div>

          {/* Tags — max 3, single row, no wrap */}
          {tags.slice(0, 3).map((tag, index) => {
  const isVeg = tag.toLowerCase() === 'veg';

  return (
    <span
      key={`${tag}-${index}`}
      className={`text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap flex items-center gap-1 ${
        isVeg
          ? 'bg-green-50 text-green-700'
          : tag.toLowerCase() === 'non-veg'
          ? 'bg-red-50 text-red-700'
          : 'bg-gray-100 text-gray-600'
      }`}
    >
      {isVeg && (
        <svg
          className="w-2.5 h-2.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
      {tag}
    </span>
  );
})}

          {/* ── Provider row (compact) ── */}
          <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
            {!hideProviderInfo && (
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={provider.avatar}
                  alt={provider.name}
                  className="w-8 h-8 rounded-full object-cover border border-white shadow-sm shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-gray-900 truncate max-w-[90px]">{provider.name}</span>
                    {provider.isVerified && (
                      <svg className="w-3 h-3 text-brand-green shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-[11px] font-bold text-gray-800">{provider.rating}</span>
                    <span className="text-[11px] text-gray-400 font-medium truncate">· {provider.ordersCount} orders</span>
                  </div>
                </div>
              </div>
            )}

            {/* Reserve button — compact */}
            <button
              onClick={(e) => e.preventDefault()}
              disabled={!isAvailable}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                hideProviderInfo ? 'w-full' : ''
              } ${
                isAvailable
                  ? 'bg-brand-green text-white hover:bg-brand-green/90 shadow-sm shadow-brand-green/20'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {isAvailable ? 'Reserve' : 'Sold Out'}
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default FoodCard;