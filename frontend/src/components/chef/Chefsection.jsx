import { useState } from "react";

const ALL_CHEFS = [];

const spiceMap = { mild: { label: "Mild", emoji: "🌿", color: "#16A34A" }, medium: { label: "Medium", emoji: "🌶️", color: "#D97706" }, spicy: { label: "Spicy", emoji: "🔥", color: "#DC2626" } };
const oilMap   = { low: { label: "Low Oil", color: "#16A34A" }, medium: { label: "Med Oil", color: "#D97706" }, high: { label: "Rich", color: "#DC2626" } };

export default function ChefSection({ onConsultAI, onViewProfile }) {
  const [saved, setSaved] = useState(new Set());

  const toggle = id => setSaved(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <section className="py-10">

      {/* ── Header ── */}
      <div className="px-4 sm:px-6 lg:px-8 mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-green mb-1">🍳 Our Chefs</p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
          Top Rated Home Chefs
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          As a user what u will expect
        </p>
      </div>

      {/* ── AI Banner ── */}
      <div className="mx-4 sm:mx-6 lg:mx-8 mb-6 rounded-2xl overflow-hidden">
        <div className="bg-brand-green px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-white font-extrabold text-lg leading-snug">✨ Not sure which chef to pick?</p>
            <p className="text-white/75 text-sm mt-1 max-w-md">
              Tell our AI your preferences — less oily, mild spice, diet needs — and get a personalised recommendation instantly.
            </p>
          </div>
          <button
            onClick={onConsultAI}
            className="flex-shrink-0 bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold text-sm px-5 py-3 rounded-xl transition-all duration-200 hover:shadow-lg active:scale-95 whitespace-nowrap"
          >
            🤖 Ask AI Consultant
          </button>
        </div>
      </div>

      {/* ── Grid ── */}
      {ALL_CHEFS.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 px-4 sm:px-6 lg:px-8">
          {ALL_CHEFS.map(chef => (
            <ChefCard
              key={chef.id}
              chef={chef}
              saved={saved.has(chef.id)}
              onToggleSave={() => toggle(chef.id)}
              onViewProfile={() => onViewProfile?.(chef)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ChefCard({ chef, saved, onToggleSave, onViewProfile }) {
  const [imgErr, setImgErr] = useState(false);
  const spice = spiceMap[chef.spiceLevel];
  const oil   = oilMap[chef.oilLevel];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">

      {/* Food image strip */}
      <div className="relative h-36 bg-gray-100 overflow-hidden">
        {chef.foodImages?.[0] && (
          <img
            src={chef.foodImages[0]}
            alt={chef.name}
            className="w-full h-full object-cover"
            onError={e => { e.target.style.display = "none"; }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <div className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full ${chef.available ? "bg-brand-green text-white" : "bg-red-500 text-white"}`}>
          {chef.available ? "● Available" : "✕ Unavailable"}
        </div>

        {chef.available && chef.ordersToday > 0 && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-2 py-1 rounded-lg">
            🍱 {chef.ordersToday} orders today
          </div>
        )}

        <button
          onClick={onToggleSave}
          className="absolute top-3 left-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-sm hover:scale-110 transition-transform shadow-sm"
        >
          {saved ? "❤️" : "🤍"}
        </button>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-3 flex-1">

        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            {!imgErr && chef.avatar ? (
              <img
                src={chef.avatar}
                alt={chef.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
                onError={() => setImgErr(true)}
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-brand-green flex items-center justify-center text-white font-black text-sm border-2 border-white shadow-sm">
                {chef.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
              </div>
            )}
            {chef.verified && (
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-brand-green rounded-full flex items-center justify-center text-white text-[9px] font-bold border-2 border-white">✓</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-gray-900 text-sm truncate">{chef.name}</span>
              {chef.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  chef.badge === "Top Rated" ? "bg-green-50 text-green-700" :
                  chef.badge === "New"       ? "bg-indigo-50 text-indigo-700" :
                                              "bg-amber-50 text-amber-700"
                }`}>{chef.badge}</span>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate">📍 {chef.location} · {chef.experience}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-amber-400 text-sm">★</span>
            <span className="font-bold text-gray-900 text-sm">{chef.rating}</span>
            <span className="text-gray-400 text-xs">({chef.reviews})</span>
          </div>
          <span className="font-bold text-brand-green text-sm">₹{chef.pricePerMeal} / meal</span>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{chef.description}</p>

        <div className="flex flex-wrap gap-1.5">
          {chef.tags.map(tag => (
            <span key={tag} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tag === "Veg" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {tag}
            </span>
          ))}
          {chef.specialties.map(s => (
            <span key={s} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{s}</span>
          ))}
        </div>

        <div className="flex gap-2">
          <span className="flex items-center gap-1 text-[11px] font-semibold bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg" style={{ color: oil.color }}>
            🫙 {oil.label}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-semibold bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg" style={{ color: spice.color }}>
            {spice.emoji} {spice.label}
          </span>
        </div>

        <div className="flex gap-2 mt-auto pt-1">
          <button
            onClick={() => onViewProfile?.()}
            className="flex-1 py-2.5 text-xs font-bold rounded-xl border border-brand-green text-brand-green hover:bg-green-50 transition-colors"
          >
            View Profile
          </button>
          {chef.available && (
            <button className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-brand-green text-white hover:bg-green-900 transition-colors">
              Book Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export { ALL_CHEFS };