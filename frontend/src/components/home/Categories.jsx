import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const categories = [
  { id: 1, name: 'All', icon: '🍽️', query: '' },
  { id: 2, name: 'Veg Meals', icon: '🥗', query: 'veg' },
  { id: 3, name: 'Non Veg', icon: '🍗', query: 'non-veg' },
  { id: 4, name: 'Tiffins', icon: '🍱', query: 'tiffin' },
  { id: 5, name: 'Healthy', icon: '🥑', query: 'healthy' },
  { id: 6, name: 'Breakfast', icon: '🥐', query: 'breakfast' },
  { id: 7, name: 'Snacks', icon: '🥟', query: 'snacks' },
  { id: 8, name: 'Desserts', icon: '🍰', query: 'desserts' },
  { id: 9, name: 'Fasting', icon: '🙏', query: 'fasting' },
];

const Categories = () => {
  const [active, setActive] = useState(1);
  const navigate = useNavigate();

  const handleClick = (cat) => {
    setActive(cat.id);
    if (cat.query) {
      navigate(`/food?category=${cat.query}`);
    } else {
      navigate('/food');
    }
  };

  return (
    <div className="relative py-4 overflow-x-auto hide-scrollbar">
      {/* Fade-out hint on right edge */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10" />

      <div className="flex gap-3 sm:gap-4 min-w-max px-4 sm:px-6 lg:px-8">
        {categories.map((cat, idx) => {
          const isActive = active === cat.id;
          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07, duration: 0.35 }}
              onClick={() => handleClick(cat)}
              className={`flex flex-col items-center gap-2.5 cursor-pointer group focus:outline-none`}
            >
              <div
                className={`w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl flex items-center justify-center text-3xl sm:text-[2rem] transition-all duration-300 border ${
                  isActive
                    ? 'bg-brand-green border-brand-green shadow-lg shadow-brand-green/20 scale-105'
                    : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-brand-green/20'
                }`}
              >
                {cat.icon}
              </div>
              <span
                className={`text-xs font-bold transition-colors duration-200 whitespace-nowrap ${
                  isActive ? 'text-brand-green' : 'text-gray-600 group-hover:text-brand-green'
                }`}
              >
                {cat.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default Categories;