import { useState } from "react";

const spicyLabels = ["Mild", "Medium", "Hot", "Extra Hot"];
const spicyColors = ["text-emerald-700", "text-amber-700", "text-rose-600", "text-red-950"];
const spicyBg     = ["bg-emerald-50/70", "bg-amber-50/70", "bg-rose-50/70", "bg-red-100/80"];
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
    <div className="group bg-white rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 w-full max-w-[310px] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 flex flex-col">

      {/* ── Image Header ── */}
      <div className="relative h-48 bg-gray-50 overflow-hidden flex-shrink-0">
        {images.length > 0 ? (
          <img 
            src={images[activeImg]} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
            <span className="text-4xl mb-1.5 animate-pulse">🍽️</span>
            <span className="text-xs font-semibold tracking-wide uppercase opacity-70">Image Preview</span>
          </div>
        )}

        {/* Gradient Overlay for bottom text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60" />

        {/* Status Badge */}
        <div className={`absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md transition-colors ${
          status === "available" 
            ? "bg-brand-green text-white" 
            : "bg-rose-600 text-white"
        }`}>
          {status === "available" ? "● Available" : "✕ Out of Stock"}
        </div>

        {/* Veg / Non-Veg Indicator */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-xl px-2 py-1 flex items-center gap-1.5 shadow-sm border border-gray-100">
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
            isVeg 
              ? "bg-emerald-500 ring-2 ring-emerald-500/30" 
              : "bg-rose-500 ring-2 ring-rose-500/30"
          }`} />
          <span className="text-[9px] font-black tracking-wider text-gray-700">{isVeg ? "VEG" : "NON-VEG"}</span>
        </div>

        {/* Carousel Dots Indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/20 backdrop-blur-md px-2 py-1 rounded-full">
            {images.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setActiveImg(i)}
                className={`h-1.5 rounded-full transition-all duration-300 border-none cursor-pointer ${
                  i === activeImg ? "w-4 bg-amber-400" : "w-1.5 bg-white/60 hover:bg-white"
                }`} 
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Card Contents ── */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Chip */}
          <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest bg-brand-green/10 text-brand-green px-2.5 py-0.5 rounded-md">
            {category}
          </span>

          {/* Name & Pricing Block */}
          <div className="flex items-start justify-between mt-2.5 mb-2 gap-3">
            <h3 className="font-black text-gray-950 text-base leading-tight tracking-tight flex-1 group-hover:text-brand-green transition-colors line-clamp-1">
              {name}
            </h3>
            <div className="text-brand-green text-base font-black tracking-tight flex-shrink-0">
              ₹{price}
            </div>
          </div>

          {/* Food Item Bio Description */}
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4">
            {description}
          </p>

          {/* Custom Heat / Spicy Meter Bar */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-4 border border-black/5 ${spicyBg[spicyIdx]}`}>
            <span className="text-sm flex-shrink-0">{spicyEmojis[spicyIdx]}</span>
            <span className="text-[11px] font-medium text-gray-500">Spice Level:</span>
            <span className={`text-[11px] font-extrabold tracking-wide ${spicyColors[spicyIdx]}`}>{spicyLabels[spicyIdx]}</span>
            <div className="flex gap-1 ml-auto">
              {[0, 1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`w-3.5 h-1.5 rounded-full transition-all duration-300 ${
                    i <= spicyIdx 
                      ? (spicyIdx === 0 ? "bg-emerald-500" : spicyIdx === 1 ? "bg-amber-500" : spicyIdx === 2 ? "bg-rose-500" : "bg-red-950") 
                      : "bg-gray-200/70"
                  }`} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Informational Meta Chips Block ── */}
        <div className="grid grid-cols-3 gap-2 pt-3.5 border-t border-dashed border-gray-100">
          <MetaChip icon="⏱️" label="Prep Time" value={`${prepTime}m`} />
          <MetaChip icon="📦" label="Left" value={`${quantity} items`} />
          <MetaChip icon={bringContainer ? "🥡" : "🍱"} label="Box Policy" value={bringContainer ? "Bring Own" : "Included"} />
        </div>
      </div>

    </div>
  );
}

function MetaChip({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center justify-center p-1.5 bg-gray-50/60 hover:bg-gray-50 border border-gray-100/50 rounded-xl transition-colors text-center">
      <span className="text-sm mb-0.5">{icon}</span>
      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">{label}</span>
      <span className="text-[11px] font-black text-gray-800 mt-0.5 truncate max-w-full">{value}</span>
    </div>
  );
}