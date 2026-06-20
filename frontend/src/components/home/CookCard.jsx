import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CookCard = ({ cook }) => {
  const primarySpecialty = cook.specialities && cook.specialities.length > 0
    ? cook.specialities[0]
    : 'Home Kitchen';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md overflow-hidden cursor-pointer group transition-all flex flex-col h-[220px] justify-between p-3.5 w-full"
    >
      {/* 1. Large Avatar (Centered) */}
      <div className="flex flex-col items-center pt-0.5">
        <div className="relative">
          <img
            src={cook.image}
            alt={cook.name}
            className="w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover border border-gray-100 shadow-sm"
            loading="lazy"
          />
          <span className="absolute bottom-0.5 right-0.5 w-4.5 h-4.5 bg-brand-green rounded-full flex items-center justify-center border-2 border-white shadow">
            <svg className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" fill="none" stroke="currentColor" strokeWidth={3.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        </div>
      </div>

      {/* 2. Info Block (Name, Rating, Location, Specialty) */}
      <div className="flex flex-col items-center text-center mt-1 flex-grow justify-center">
        {/* Kitchen Name (max 2 lines) */}
        <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 group-hover:text-brand-green transition-colors line-clamp-2 w-full px-0.5 leading-tight">
          {cook.name}
        </h3>

        {/* Rating + Location (single line) */}
        <div className="flex items-center justify-center gap-1 text-[10px] sm:text-xs text-gray-500 font-semibold mt-1 w-full leading-none">
          <svg className="w-3 h-3 text-yellow-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="font-black text-gray-800">{cook.rating}</span>
          <span className="text-gray-300">•</span>
          <span className="truncate max-w-[65%]">{cook.area || 'Pune'}</span>
        </div>

        {/* Primary Specialty */}
        <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1 leading-none truncate w-full px-1">
          {primarySpecialty}
        </p>
      </div>

      {/* 3. View Menu CTA */}
      <div className="pt-2">
        <Link
          to={`/provider/${cook.id}`}
          className="flex items-center justify-center gap-1 w-full py-1.5 rounded-lg bg-brand-light text-brand-green text-[10px] sm:text-xs font-black hover:bg-brand-green hover:text-white transition-all duration-200"
        >
          View Menu
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </motion.div>
  );
};

export default CookCard;