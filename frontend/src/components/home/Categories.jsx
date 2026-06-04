import React from 'react';
import { motion } from 'framer-motion';

const categories = [
  { id: 1, name: 'Veg Meals', icon: '🥗' },
  { id: 2, name: 'Non Veg', icon: '🍗' },
  { id: 3, name: 'Tiffins', icon: '🍱' },
  { id: 4, name: 'Healthy', icon: '🥑' },
  { id: 5, name: 'Breakfast', icon: '🥐' },
  { id: 6, name: 'Snacks', icon: '🥟' },
  { id: 7, name: 'Desserts', icon: '🍰' },
];

const Categories = () => {
  return (
    <div className="py-6 overflow-x-auto hide-scrollbar">
      <div className="flex gap-4 sm:gap-6 min-w-max px-4 sm:px-6 lg:px-8">
        {categories.map((cat, idx) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex flex-col items-center gap-3 cursor-pointer group"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-gray-100 flex items-center justify-center text-3xl sm:text-4xl group-hover:shadow-[0_8px_20px_rgba(10,77,43,0.15)] group-hover:-translate-y-1 transition-all duration-300">
              {cat.icon}
            </div>
            <span className="text-xs sm:text-sm font-bold text-gray-700 group-hover:text-brand-green transition-colors">{cat.name}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
