import { useState, useEffect } from "react";
import api from "../../services/api";

const spiceMap = {
  Mild:   { label: "Mild",   emoji: "🌿", color: "#16A34A" },
  Medium: { label: "Medium", emoji: "🌶️", color: "#D97706" },
  Spicy:  { label: "Spicy",  emoji: "🔥", color: "#DC2626" },
};

const oilMap = {
  "Low Oil": { label: "Low Oil", color: "#16A34A" },
  Normal:    { label: "Med Oil", color: "#D97706" },
  Extra:     { label: "Rich",    color: "#DC2626" },
};

export default function ChefSection({ onConsultAI, onViewProfile }) {
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(new Set());

  useEffect(() => {
    const fetchChefs = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/providers/verified");
        if (res.data.success) {
          // /verified returns { providers: [...] }
          setChefs(res.data.providers || []);
        } else {
          setError("Could not load chefs. Please try again.");
        }
      } catch (err) {
        console.error("Failed to fetch verified chefs:", err);
        setError("Could not load chefs. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchChefs();
  }, []);

  const toggle = (id) =>
    setSaved((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return (
    <section className="py-10">

      {/* ── Header ── */}
      <div className="px-4 sm:px-6 lg:px-8 mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-green mb-1">
          🍳 Our Chefs
        </p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
          Top Rated Home Chefs
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Verified home chefs, ready to cook for you
        </p>
      </div>

      {/* ── AI Banner ── */}
      <div className="mx-4 sm:mx-6 lg:mx-8 mb-8 rounded-3xl overflow-hidden relative border border-brand-green/20"
        style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)" }}
      >
        {/* Subtle green accent blob */}
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-brand-green/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 px-6 py-7 sm:px-10 sm:py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex-1">
            <span className="inline-flex items-center gap-1.5 bg-brand-green/10 border border-brand-green/20 text-brand-green text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
              ✨ AI Powered
            </span>
            <h3 className="text-gray-900 font-extrabold text-xl sm:text-2xl leading-tight">
              Not sure which chef to pick?
            </h3>
            <p className="text-gray-500 text-sm mt-2 max-w-md leading-relaxed">
              Tell our AI your preferences — oil level, spice, diet needs — and get a personalised recommendation instantly.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {["🫙 Oil Level", "🌶️ Spice", "🥗 Diet Type", "💰 Budget"].map((chip) => (
                <span key={chip} className="text-[11px] font-semibold text-brand-green bg-white border border-brand-green/20 px-3 py-1 rounded-full shadow-sm">
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-center gap-2 flex-shrink-0">
            <button
              onClick={onConsultAI}
              className="flex items-center gap-2 bg-brand-green hover:bg-green-700 text-white font-bold text-sm px-6 py-3.5 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              🤖 Ask AI Consultant →
            </button>
          </div>
        </div>
      </div>

      {/* ── States ── */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 px-4 sm:px-6 lg:px-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
              <div className="h-36 bg-gray-100" />
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-2.5 bg-gray-100 rounded w-full" />
                <div className="h-2.5 bg-gray-100 rounded w-4/5" />
                <div className="h-9 bg-gray-100 rounded-xl mt-2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="mx-4 sm:mx-6 lg:mx-8 bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
          <p className="text-red-500 font-semibold text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-xs font-bold text-brand-green underline"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && chefs.length === 0 && (
        <div className="mx-4 sm:mx-6 lg:mx-8 bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
          <p className="text-4xl mb-3">🍳</p>
          <h3 className="text-lg font-bold text-gray-700">No Chefs Available Yet</h3>
          <p className="text-sm text-gray-400 mt-1">
            Our verified chefs will appear here soon.
          </p>
        </div>
      )}

      {/* ── Grid ── */}
      {!loading && !error && chefs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 px-4 sm:px-6 lg:px-8">
          {chefs.map((chef) => (
            <ChefCard
              key={chef._id}
              chef={chef}
              saved={saved.has(chef._id)}
              onToggleSave={() => toggle(chef._id)}
              onViewProfile={() => onViewProfile?.(chef._id, chef)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ChefCard({ chef, saved, onToggleSave, onViewProfile }) {
  const [imgErr, setImgErr] = useState(false);

  // Map schema fields to display values
  const spice = spiceMap[chef.spiceLevel] || spiceMap["Medium"];
  const oil   = oilMap[chef.oilLevel]    || oilMap["Normal"];

  const displayName     = chef.kitchenName || "Home Chef";
  const displayLocation = chef.area && chef.city ? `${chef.area}, ${chef.city}` : chef.city || "";
  const displayExp      = chef.experience ? `${chef.experience}+ Yrs` : "";
  const displayRating   = chef.rating   ?? "5.0";
  const displayReviews  = chef.totalReviews ?? 0;
  const displayPrice    = chef.startingPrice ?? 0;
  const displayBio      = chef.bio || chef.tagline || "";
  const isAvailable     = chef.isAvailable ?? true;
  const isVerified      = chef.isVerified ?? false;
  const avatarUrl       = chef.avatar || "";
  const coverUrl        = chef.coverImage || "";

  // Derive diet tags from dietaryType array
  const dietTags = chef.dietaryType || [];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">

      {/* Food / Cover image strip */}
      <div className="relative h-36 bg-gray-100 overflow-hidden">
        {coverUrl && (
          <img
            src={coverUrl}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Availability badge */}
        <div
          className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full ${
            isAvailable ? "bg-brand-green text-white" : "bg-red-500 text-white"
          }`}
        >
          {isAvailable ? "● Available" : "✕ Unavailable"}
        </div>

        {/* Save / Wishlist button */}
        <button
          onClick={onToggleSave}
          className="absolute top-3 left-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-sm hover:scale-110 transition-transform shadow-sm"
        >
          {saved ? "❤️" : "🤍"}
        </button>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-3 flex-1">

        {/* Avatar + Name */}
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            {!imgErr && avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
                onError={() => setImgErr(true)}
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-brand-green flex items-center justify-center text-white font-black text-sm border-2 border-white shadow-sm">
                {displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
            )}
            {isVerified && (
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-brand-green rounded-full flex items-center justify-center text-white text-[9px] font-bold border-2 border-white">
                ✓
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-gray-900 text-sm truncate">{displayName}</span>
            </div>
            <p className="text-xs text-gray-500 truncate">
              📍 {displayLocation}{displayExp ? ` · ${displayExp}` : ""}
            </p>
          </div>
        </div>

        {/* Rating + Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-amber-400 text-sm">★</span>
            <span className="font-bold text-gray-900 text-sm">{displayRating}</span>
            <span className="text-gray-400 text-xs">({displayReviews})</span>
          </div>
          {displayPrice > 0 && (
            <span className="font-bold text-brand-green text-sm">
              ₹{displayPrice} / meal
            </span>
          )}
        </div>

        {/* Bio */}
        {displayBio && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{displayBio}</p>
        )}

        {/* Diet tags + specialities */}
        {(dietTags.length > 0 || (chef.specialities || []).length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {dietTags.map((tag) => (
              <span
                key={tag}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  tag === "Veg" ? "bg-green-50 text-green-700" :
                  tag === "Vegan" ? "bg-emerald-50 text-emerald-700" :
                  "bg-red-50 text-red-700"
                }`}
              >
                {tag}
              </span>
            ))}
            {(chef.specialities || []).slice(0, 3).map((s) => (
              <span key={s} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Oil + Spice chips */}
        <div className="flex gap-2">
          <span
            className="flex items-center gap-1 text-[11px] font-semibold bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg"
            style={{ color: oil.color }}
          >
            🫙 {oil.label}
          </span>
          <span
            className="flex items-center gap-1 text-[11px] font-semibold bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg"
            style={{ color: spice.color }}
          >
            {spice.emoji} {spice.label}
          </span>
        </div>

        {/* CTA buttons */}
        <div className="flex gap-2 mt-auto pt-1">
          <button
            onClick={onViewProfile}
            className="flex-1 py-2.5 text-xs font-bold rounded-xl border border-brand-green text-brand-green hover:bg-green-50 transition-colors"
          >
            View Profile
          </button>
          {isAvailable && (
            <button className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-brand-green text-white hover:bg-green-900 transition-colors">
              Book Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}