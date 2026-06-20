import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Leaf, Flame, Box, Heart, Sunrise, Cookie, Cake, Sparkles } from 'lucide-react';

const categories = [
  { id: 1, name: 'All', icon: LayoutGrid, query: '' },
  { id: 2, name: 'Veg Meals', icon: Leaf, query: 'veg' },
  { id: 3, name: 'Non Veg', icon: Flame, query: 'non-veg' },
  { id: 4, name: 'Tiffins', icon: Box, query: 'tiffin' },
  { id: 5, name: 'Healthy', icon: Heart, query: 'healthy' },
  { id: 6, name: 'Breakfast', icon: Sunrise, query: 'breakfast' },
  { id: 7, name: 'Snacks', icon: Cookie, query: 'snacks' },
  { id: 8, name: 'Desserts', icon: Cake, query: 'desserts' },
  { id: 9, name: 'Fasting', icon: Sparkles, query: 'fasting' },
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

      <div className="flex gap-4 sm:gap-6 min-w-max px-4 sm:px-6 lg:px-8">
        {categories.map((cat, idx) => {
          const isActive = active === cat.id;
          const Icon = cat.icon;
          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.3 }}
              onClick={() => handleClick(cat)}
              className="flex flex-col items-center gap-2 cursor-pointer group focus:outline-none"
            >
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 border ${
                  isActive
                    ? 'bg-brand-green border-brand-green shadow-md shadow-brand-green/10 text-white scale-105'
                    : 'bg-white border-gray-100 text-gray-500 hover:border-brand-green/20 hover:text-brand-green hover:-translate-y-0.5 hover:shadow-sm shadow-sm'
                }`}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span
                className={`text-[11px] sm:text-xs font-bold transition-colors duration-200 whitespace-nowrap tracking-wide ${
                  isActive ? 'text-brand-green font-extrabold' : 'text-gray-500 group-hover:text-brand-green'
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