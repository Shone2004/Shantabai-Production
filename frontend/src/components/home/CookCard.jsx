import React from 'react';
import { motion } from 'framer-motion';

const CookCard = ({ cook }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer"
    >
      <div className="relative h-32 w-full">
        <img src={cook.image} alt={cook.name} className="w-full h-full object-cover" />
        <button className="absolute top-2 right-2 p-1.5 bg-white/50 backdrop-blur-md rounded-full text-white hover:text-red-500 hover:bg-white transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
        </button>
      </div>
      <div className="p-3">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-sm font-bold text-gray-900 truncate pr-2">{cook.name}</h3>
          <div className="flex items-center gap-0.5 text-xs text-brand-green font-bold bg-brand-light px-1.5 py-0.5 rounded">
            <svg className="w-3 h-3 text-brand-orange" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            {cook.rating}
          </div>
        </div>
        <p className="text-xs text-gray-500 mb-2">{cook.orders}+ Orders</p>
        <div className="flex items-center text-xs text-gray-500 font-medium">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          {cook.distance} away
        </div>
      </div>
    </motion.div>
  );
};

export default CookCard;
