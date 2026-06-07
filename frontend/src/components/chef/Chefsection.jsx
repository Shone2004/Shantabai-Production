import { useState } from "react";

// ─── Color tokens matched EXACTLY to Shantabai's Tailwind theme ──────────────
// brand-green ≈ #1A4731 (dark forest green from screenshot)
// accent / CTA = #F6A623 (amber)
// bg = white / gray-50
// text = gray-900 / gray-500

const MOCK_CHEF_IMAGES = [
  "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&auto=format&fit=crop",
];

const MOCK_FOOD_IMAGES = [
  "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1626074964464-f6df4149dc8c?w=600&auto=format&fit=crop",
];

const ALL_CHEFS = [
  {
    id: 1,
    name: "Sunita's Kitchen",
    location: "Koramangala, Pune",
    experience: "10+ Years Exp",
    rating: 4.9, reviews: 120, pricePerMeal: 150,
    verified: true, avatar: MOCK_CHEF_IMAGES[0],
    specialties: ["North Indian", "South Indian"],
    tags: ["Veg", "Non Veg"],
    oilLevel: "low", spiceLevel: "medium",
    description: "Over 10 years of experience crafting wholesome homemade meals. Specialises in North & South Indian cuisine with Jain options available.",
    available: true, badge: "Top Rated",
    foodImages: [MOCK_FOOD_IMAGES[0], MOCK_FOOD_IMAGES[4]],
    ordersToday: 18,
  },
  {
    id: 2,
    name: "Meena's Tiffin",
    location: "HSR Layout, Pune",
    experience: "4+ Years Exp",
    rating: 4.8, reviews: 95, pricePerMeal: 120,
    verified: true, avatar: MOCK_CHEF_IMAGES[1],
    specialties: ["Tiffin Service", "South Indian"],
    tags: ["Veg"],
    oilLevel: "medium", spiceLevel: "mild",
    description: "Fresh, healthy tiffin meals prepared daily. Pure vegetarian with low-oil cooking — ideal for working professionals.",
    available: true, badge: "Popular",
    foodImages: [MOCK_FOOD_IMAGES[5], MOCK_FOOD_IMAGES[3]],
    ordersToday: 24,
  },
  {
    id: 3,
    name: "Latha Cook",
    location: "Indiranagar, Pune",
    experience: "8+ Years Exp",
    rating: 4.7, reviews: 88, pricePerMeal: 140,
    verified: true, avatar: MOCK_CHEF_IMAGES[2],
    specialties: ["Event Chef", "Bakery"],
    tags: ["Non Veg"],
    oilLevel: "high", spiceLevel: "spicy",
    description: "Specialist in event catering and baked goods. Non-veg platters are crowd favorites for parties and gatherings.",
    available: false, badge: null,
    foodImages: [MOCK_FOOD_IMAGES[1]],
    ordersToday: 0,
  },
  {
    id: 4,
    name: "Priya Kitchen",
    location: "Baner, Pune",
    experience: "6+ Years Exp",
    rating: 4.6, reviews: 74, pricePerMeal: 110,
    verified: false, avatar: MOCK_CHEF_IMAGES[3],
    specialties: ["Home Chef", "North Indian"],
    tags: ["Veg", "Non Veg"],
    oilLevel: "low", spiceLevel: "mild",
    description: "Home-style meals made with love. Low-oil, less spicy — perfect for kids and health-conscious families.",
    available: true, badge: "New",
    foodImages: [MOCK_FOOD_IMAGES[2], MOCK_FOOD_IMAGES[0]],
    ordersToday: 9,
  },
  {
    id: 5,
    name: "Rajan's Kitchen",
    location: "Kothrud, Pune",
    experience: "12+ Years Exp",
    rating: 4.5, reviews: 203, pricePerMeal: 180,
    verified: true, avatar: MOCK_CHEF_IMAGES[4],
    specialties: ["Chinese", "Continental"],
    tags: ["Non Veg", "Veg"],
    oilLevel: "medium", spiceLevel: "medium",
    description: "Hotel-trained chef serving restaurant-quality Chinese and Continental cuisine right to your doorstep.",
    available: true, badge: "Top Rated",
    foodImages: [MOCK_FOOD_IMAGES[3], MOCK_FOOD_IMAGES[1]],
    ordersToday: 31,
  },
  {
    id: 6,
    name: "Ananya Bakes",
    location: "Deccan, Pune",
    experience: "3+ Years Exp",
    rating: 4.8, reviews: 61, pricePerMeal: 90,
    verified: false, avatar: MOCK_CHEF_IMAGES[5],
    specialties: ["Bakery"],
    tags: ["Veg"],
    oilLevel: "low", spiceLevel: "mild",
    description: "Artisan baker specialising in whole-grain breads, low-sugar pastries, and healthy snacks with clean ingredients.",
    available: true, badge: null,
    foodImages: [MOCK_FOOD_IMAGES[4], MOCK_FOOD_IMAGES[5]],
    ordersToday: 12,
  },
];

const FILTERS = ["All", "Veg", "Non Veg", "Top Rated", "Available", "Low Oil", "Mild"];
const SORTS   = ["Rating", "Price: Low", "Price: High", "Reviews"];

const spiceMap = { mild: { label: "Mild", emoji: "🌿", color: "#16A34A" }, medium: { label: "Medium", emoji: "🌶️", color: "#D97706" }, spicy: { label: "Spicy", emoji: "🔥", color: "#DC2626" } };
const oilMap   = { low: { label: "Low Oil", color: "#16A34A" }, medium: { label: "Med Oil", color: "#D97706" }, high: { label: "Rich", color: "#DC2626" } };

export default function ChefSection({ onConsultAI, onViewProfile }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy]             = useState("Rating");
  const [search, setSearch]             = useState("");
  const [saved, setSaved]               = useState(new Set());

  const toggle = id => setSaved(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const chefs = ALL_CHEFS
    .filter(c => {
      const q = search.toLowerCase();
      const matchQ = c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q) || c.specialties.some(s => s.toLowerCase().includes(q));
      if (!matchQ) return false;
      if (activeFilter === "Veg")       return c.tags.includes("Veg");
      if (activeFilter === "Non Veg")   return c.tags.includes("Non Veg");
      if (activeFilter === "Top Rated") return c.badge === "Top Rated";
      if (activeFilter === "Available") return c.available;
      if (activeFilter === "Low Oil")   return c.oilLevel === "low";
      if (activeFilter === "Mild")      return c.spiceLevel === "mild";
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "Rating")      return b.rating - a.rating;
      if (sortBy === "Price: Low")  return a.pricePerMeal - b.pricePerMeal;
      if (sortBy === "Price: High") return b.pricePerMeal - a.pricePerMeal;
      if (sortBy === "Reviews")     return b.reviews - a.reviews;
      return 0;
    });

  return (
    <section className="py-10">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-4 sm:px-6 lg:px-8 mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-green mb-1">🍳 Our Chefs</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
            Top Rated Home Chefs
          </h2>
          <p className="text-sm text-gray-500 mt-1">{chefs.length} chefs available near you in Pune</p>
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="self-start sm:self-auto text-sm font-semibold border border-gray-200 rounded-xl px-3 py-2.5 bg-white text-gray-700 outline-none cursor-pointer focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green"
        >
          {SORTS.map(o => <option key={o}>{o}</option>)}
        </select>
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

      {/* ── Search + Filters ── */}
      <div className="px-4 sm:px-6 lg:px-8 mb-6 space-y-3">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search chefs, cuisines, locations..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-800 outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green focus:bg-white transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`text-xs font-bold px-4 py-2 rounded-full border transition-all duration-150 ${
                activeFilter === f
                  ? "bg-brand-green border-brand-green text-white shadow-sm"
                  : "bg-white border-gray-200 text-gray-600 hover:border-brand-green hover:text-brand-green"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ── */}
      {chefs.length === 0 ? (
        <div className="text-center py-16 text-gray-400 px-4">
          <p className="text-5xl mb-3">🍽️</p>
          <p className="font-bold text-gray-700 text-lg">No chefs found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 px-4 sm:px-6 lg:px-8">
          {chefs.map(chef => (
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
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Availability pill */}
        <div className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full ${chef.available ? "bg-brand-green text-white" : "bg-red-500 text-white"}`}>
          {chef.available ? "● Available" : "✕ Unavailable"}
        </div>

        {/* Orders today */}
        {chef.available && chef.ordersToday > 0 && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-2 py-1 rounded-lg">
            🍱 {chef.ordersToday} orders today
          </div>
        )}

        {/* Save button */}
        <button
          onClick={onToggleSave}
          className="absolute top-3 left-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-sm hover:scale-110 transition-transform shadow-sm"
        >
          {saved ? "❤️" : "🤍"}
        </button>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-3 flex-1">

        {/* Avatar + Name row */}
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

        {/* Rating + Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-amber-400 text-sm">★</span>
            <span className="font-bold text-gray-900 text-sm">{chef.rating}</span>
            <span className="text-gray-400 text-xs">({chef.reviews})</span>
          </div>
          <span className="font-bold text-brand-green text-sm">₹{chef.pricePerMeal} / meal</span>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{chef.description}</p>

        {/* Tag chips */}
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

        {/* Oil & Spice row */}
        <div className="flex gap-2">
          <span className="flex items-center gap-1 text-[11px] font-semibold bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg" style={{ color: oil.color }}>
            🫙 {oil.label}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-semibold bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg" style={{ color: spice.color }}>
            {spice.emoji} {spice.label}
          </span>
        </div>

        {/* Action buttons — push to bottom */}
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