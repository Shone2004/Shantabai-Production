import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CookCard = ({ cook }) => {
  const specialties = cook.specialities && cook.specialities.length > 0
    ? cook.specialities.slice(0, 2).join(', ')
    : 'Home Style Specialities';

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md overflow-hidden cursor-pointer group transition-all"
    >
      {/* Visual Header / Avatar Container */}
      <div className="relative pt-6 pb-4 flex flex-col items-center bg-[#FAFBF8] border-b border-gray-50">
        <div className="relative">
          <img
            src={cook.image}
            alt={cook.name}
            className="w-20 h-20 rounded-full object-cover border-3 border-white shadow-md"
            loading="lazy"
          />
          <span className="absolute bottom-0 right-1 w-5 h-5 bg-brand-green rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-white shadow">✓</span>
        </div>

        {/* Rating */}
        <div className="mt-2.5 flex items-center gap-1 bg-white px-2 py-0.5 rounded-full shadow-sm border border-gray-100">
          <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-xs font-black text-gray-800">{cook.rating}</span>
        </div>
      </div>

      {/* Profile Details */}
      <div className="p-4 flex flex-col gap-2">
        <div>
          <h3 className="text-sm font-extrabold text-gray-900 group-hover:text-brand-green transition-colors truncate text-center">
            {cook.name}
          </h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center mt-0.5">
            {cook.experience || 'Local Cook'}
          </p>
        </div>

        <div className="space-y-1.5 border-t border-gray-50 pt-2.5">
          {/* Locality */}
          <div className="flex items-center justify-center gap-1 text-xs text-gray-600 font-semibold">
            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span className="truncate">{cook.area || 'Pune'}</span>
          </div>

          {/* Specialties */}
          <p className="text-[11px] text-gray-500 font-medium text-center truncate px-1">
            {specialties}
          </p>
        </div>

        <Link
          to={`/provider/${cook.id}`}
          className="mt-3 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-brand-light text-brand-green text-xs font-extrabold hover:bg-brand-green hover:text-white transition-all duration-200"
        >
          View Menu
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </motion.div>
  );
};

export default CookCard;