import { useState } from "react";

const spicyLabels = ["Mild", "Medium", "Hot", "Extra Hot"];
const spicyColors = ["text-green-600", "text-amber-600", "text-red-500", "text-red-900"];
const spicyBg     = ["bg-green-50", "bg-amber-50", "bg-red-50", "bg-red-100"];
const spicyEmojis = ["🌿", "🌶️", "🔥", "💥"];

export default function FoodPreviewCard({ food = {} }) {
  const {
    name        = "Food Item Name",
    category    = "Category",
    price       = "0",
    description = "Your delicious food description will appear here...",
    prepTime    = "30",
    quantity    = "10",
    isVeg       = true,
    spicyLevel  = 0,
    status      = "available",
    images      = [],
    bringContainer = false,
  } = food;

  const [activeImg, setActiveImg] = useState(0);
  const spicyIdx = Math.min(Number(spicyLevel), 3);

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden w-full max-w-[300px] border border-gray-100">

      {/* Image */}
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {images.length > 0 ? (
          <img src={images[activeImg]} alt={name} className="w-full h-full object-cover transition-all duration-300" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <span className="text-4xl mb-1">🍽️</span>
            <span className="text-xs font-medium">Image Preview</span>
          </div>
        )}

        {/* Status */}
        <div className={`absolute top-2.5 right-2.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${status === "available" ? "bg-brand-green text-white" : "bg-red-500 text-white"}`}>
          {status === "available" ? "● Available" : "✕ Out of Stock"}
        </div>

        {/* Veg indicator */}
        <div className="absolute top-2.5 left-2.5 bg-white rounded-md px-1.5 py-1 flex items-center gap-1 shadow-sm">
          <span className={`w-2.5 h-2.5 ${isVeg ? "rounded-full bg-green-500 border border-green-800" : "rounded-sm bg-red-500 border border-red-800"}`} />
          <span className="text-[9px] font-extrabold text-gray-700">{isVeg ? "VEG" : "NON-VEG"}</span>
        </div>

        {/* Dots navigation */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button key={i} onClick={() => setActiveImg(i)}
                className={`h-1.5 rounded-full transition-all border-none cursor-pointer ${i === activeImg ? "w-5 bg-amber-400" : "w-1.5 bg-white/70"}`} />
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Category chip */}
        <span className="text-[10px] font-bold bg-green-50 text-brand-green px-2.5 py-0.5 rounded-full">
          {category}
        </span>

        {/* Name + Price */}
        <div className="flex items-start justify-between mt-2 mb-2 gap-2">
          <h3 className="font-extrabold text-gray-900 text-sm leading-snug flex-1">{name}</h3>
          <div className="bg-amber-400 text-white text-xs font-extrabold px-2.5 py-1 rounded-lg whitespace-nowrap flex-shrink-0">
            ₹{price}
          </div>
        </div>

        {/* Description */}
        <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2 mb-3">{description}</p>

        {/* Spicy bar */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-3 ${spicyBg[spicyIdx]}`}>
          <span className="text-sm">{spicyEmojis[spicyIdx]}</span>
          <span className="text-[11px] text-gray-500">Spice:</span>
          <span className={`text-[11px] font-bold ${spicyColors[spicyIdx]}`}>{spicyLabels[spicyIdx]}</span>
          <div className="flex gap-1 ml-auto">
            {[0,1,2,3].map(i => (
              <div key={i} className={`w-3 h-1.5 rounded-full transition-colors ${i <= spicyIdx ? (spicyIdx === 0 ? "bg-green-500" : spicyIdx === 1 ? "bg-amber-400" : spicyIdx === 2 ? "bg-red-500" : "bg-red-900") : "bg-gray-200"}`} />
            ))}
          </div>
        </div>

        {/* Meta */}
        <div className="flex justify-around pt-3 border-t border-dashed border-gray-100">
          <MetaChip icon="⏱️" label="Prep" value={`${prepTime} min`} />
          <MetaChip icon="📦" label="Qty" value={`${quantity} left`} />
          <MetaChip icon={bringContainer ? "🥡" : "🍱"} label="Container" value={bringContainer ? "Bring Own" : "Included"} />
        </div>
      </div>
    </div>
  );
}

function MetaChip({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-base">{icon}</span>
      <span className="text-[10px] text-gray-400">{label}</span>
      <span className="text-xs font-bold text-gray-800">{value}</span>
    </div>
  );
}