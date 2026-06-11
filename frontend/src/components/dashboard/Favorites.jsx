import React, { useState } from "react";
import { Heart, MapPin, Star } from "lucide-react";

const initialFavorites = [
  {
    _id: "1",
    kitchenName: "Meena's Kitchen",
    city: "Pune",
    area: "Kothrud",
    rating: 4.8,
    startingPrice: 150,
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b293f?w=500",
  },
  {
    _id: "2",
    kitchenName: "Sweet Bites Bakery",
    city: "Pune",
    area: "Viman Nagar",
    rating: 4.9,
    startingPrice: 500,
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500",
  },
];

export default function Favorites() {
  const [favorites, setFavorites] = useState(initialFavorites);

  const removeFavorite = (id) => {
    setFavorites((prev) => prev.filter((item) => item._id !== id));
  };

  return (
    <div className="mt-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          My Favorites ❤️
        </h1>

        <p className="text-gray-500 mt-2">
          Your saved chefs and kitchens.
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm border">
          <h3 className="text-xl font-semibold text-gray-800">
            No Favorites Yet
          </h3>

          <p className="text-gray-500 mt-2">
            Save your favorite chefs to see them here.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {favorites.map((chef) => (
            <div
              key={chef._id}
              className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition"
            >
              <img
                src={chef.avatar}
                alt={chef.kitchenName}
                className="w-full h-52 object-cover"
              />

              <div className="p-5">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg text-gray-800">
                    {chef.kitchenName}
                  </h3>

                  <button
                    onClick={() => removeFavorite(chef._id)}
                    className="text-red-500 hover:scale-110 transition"
                  >
                    <Heart size={20} fill="currentColor" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-gray-500 mt-3">
                  <MapPin size={16} />
                  <span>
                    {chef.area}, {chef.city}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <Star
                    size={16}
                    fill="currentColor"
                    className="text-yellow-500"
                  />
                  <span className="font-medium">
                    {chef.rating}
                  </span>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <span className="font-bold text-brand-green text-lg">
                    ₹{chef.startingPrice}
                  </span>

                  <button className="bg-brand-green text-white px-4 py-2 rounded-xl hover:opacity-90 transition">
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}