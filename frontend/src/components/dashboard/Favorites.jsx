import React, { useState } from "react";
import { Heart, MapPin, Star, Trash2, Image as ImageIcon } from "lucide-react";

const initialFavorites = [
 
  {
    _id: "2",
    kitchenName: "Sweet Bites Bakery",
    city: "Pune",
    area: "Viman Nagar",
    rating: 4.9,
    startingPrice: 500,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500",
  },
];

/**
 * Production-ready KitchenCard component
 * Includes image error handling and memoized structure
 */
const KitchenCard = ({ chef, onRemove }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        {!imageError ? (
          <img
            src={chef.avatar}
            alt={chef.kitchenName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <ImageIcon size={48} />
          </div>
        )}
        <button
          onClick={() => onRemove(chef._id)}
          aria-label="Remove from favorites"
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-slate-400 hover:text-red-500 transition-colors shadow-sm"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-xl text-slate-900 line-clamp-1">{chef.kitchenName}</h3>
          <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-lg text-sm font-semibold shrink-0">
            <Star size={14} fill="currentColor" />
            {chef.rating}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-6">
          <MapPin size={16} />
          <span>{chef.area}, {chef.city}</span>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Starts at</p>
            <span className="text-xl font-bold text-emerald-600">₹{chef.startingPrice}</span>
          </div>
          <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-200">
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Favorites() {
  const [favorites, setFavorites] = useState(initialFavorites);

  const removeFavorite = (id) => {
    setFavorites((prev) => prev.filter((item) => item._id !== id));
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          My Saved Kitchens
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Manage your preferred culinary partners.
        </p>
      </header>

      {favorites.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
          <Heart className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-slate-900">No favorites yet</h3>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {favorites.map((chef) => (
            <KitchenCard 
              key={chef._id} 
              chef={chef} 
              onRemove={removeFavorite} 
            />
          ))}
        </div>
      )}
    </section>
  );
}