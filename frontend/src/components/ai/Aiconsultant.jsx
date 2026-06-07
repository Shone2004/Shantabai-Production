import { useState } from "react";

// ─── Mock chef data with real images ─────────────────────────────────────────
const CHEFS = [
  {
    id: 1, name: "Sunita's Kitchen", location: "Koramangala, Pune",
    experience: "10+ Years", rating: 4.9, reviews: 120, pricePerMeal: 150,
    verified: true,
    avatar: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&auto=format&fit=crop",
    specialties: ["North Indian", "South Indian"],
    tags: ["Veg", "Non Veg"], oilLevel: "low", spiceLevel: "medium",
    description: "10+ years cooking homemade meals. Specialises in North & South Indian food. Clean, wholesome ingredients.",
    available: true, badge: "Top Rated",
  },
  {
    id: 2, name: "Meena's Tiffin", location: "HSR Layout, Pune",
    experience: "4+ Years", rating: 4.8, reviews: 95, pricePerMeal: 120,
    verified: true,
    avatar: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=200&auto=format&fit=crop",
    specialties: ["Tiffin Service", "South Indian"],
    tags: ["Veg"], oilLevel: "medium", spiceLevel: "mild",
    description: "Fresh, healthy daily tiffins. Pure vegetarian, low-oil. Perfect for working professionals.",
    available: true, badge: "Popular",
  },
  {
    id: 3, name: "Latha Cook", location: "Indiranagar, Pune",
    experience: "8+ Years", rating: 4.7, reviews: 88, pricePerMeal: 140,
    verified: true,
    avatar: "https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=200&auto=format&fit=crop",
    specialties: ["Event Chef", "Bakery"],
    tags: ["Non Veg"], oilLevel: "high", spiceLevel: "spicy",
    description: "Event catering specialist. Known for bold flavors and rich non-veg platters.",
    available: false, badge: null,
  },
  {
    id: 4, name: "Priya Kitchen", location: "Baner, Pune",
    experience: "6+ Years", rating: 4.6, reviews: 74, pricePerMeal: 110,
    verified: false,
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&auto=format&fit=crop",
    specialties: ["Home Chef", "North Indian"],
    tags: ["Veg", "Non Veg"], oilLevel: "low", spiceLevel: "mild",
    description: "Home-style meals with love. Low-oil, less spicy — perfect for kids and health-conscious families.",
    available: true, badge: "New",
  },
  {
    id: 5, name: "Rajan's Kitchen", location: "Kothrud, Pune",
    experience: "12+ Years", rating: 4.5, reviews: 203, pricePerMeal: 180,
    verified: true,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop",
    specialties: ["Chinese", "Continental"],
    tags: ["Non Veg", "Veg"], oilLevel: "medium", spiceLevel: "medium",
    description: "Hotel-trained chef. Restaurant-quality Chinese and Continental cuisine at your doorstep.",
    available: true, badge: "Top Rated",
  },
  {
    id: 6, name: "Ananya Bakes", location: "Deccan, Pune",
    experience: "3+ Years", rating: 4.8, reviews: 61, pricePerMeal: 90,
    verified: false,
    avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop",
    specialties: ["Bakery"],
    tags: ["Veg"], oilLevel: "low", spiceLevel: "mild",
    description: "Artisan baker. Whole-grain breads, low-sugar pastries, healthy snacks.",
    available: true, badge: null,
  },
];

// ─── Mock AI matching logic (no API) ─────────────────────────────────────────
function getAIRecommendations(prefs) {
  const scored = CHEFS.map(chef => {
    let score = chef.rating * 10; // base from rating

    // Oil match
    if (prefs.oilLevel !== "No Preference") {
      if (prefs.oilLevel === "Low Oil" && chef.oilLevel === "low")      score += 25;
      if (prefs.oilLevel === "Medium Oil" && chef.oilLevel === "medium") score += 25;
      if (prefs.oilLevel === "Rich/Ghee-based" && chef.oilLevel === "high") score += 25;
      if (chef.oilLevel !== { "Low Oil":"low","Medium Oil":"medium","Rich/Ghee-based":"high" }[prefs.oilLevel]) score -= 10;
    }

    // Spice match
    if (prefs.spiceLevel !== "No Preference") {
      const spiceMap = { "Mild (No spice)":"mild","Medium Spiced":"medium","Spicy":"spicy","Extra Hot":"spicy" };
      if (chef.spiceLevel === spiceMap[prefs.spiceLevel]) score += 20;
      else score -= 8;
    }

    // Diet match
    if (prefs.dietType === "Pure Vegetarian" || prefs.dietType === "Vegan-Friendly") {
      if (chef.tags.includes("Veg")) score += 20;
      else score -= 20;
    }
    if (prefs.dietType === "Non-Vegetarian") {
      if (chef.tags.includes("Non Veg")) score += 15;
    }

    // Budget match
    const budgetMap = {
      "Under ₹100/meal": [0, 100],
      "₹100–₹150/meal": [100, 150],
      "₹150–₹200/meal": [150, 200],
      "₹200+/meal": [200, 9999],
    };
    if (prefs.budget !== "No Preference") {
      const [min, max] = budgetMap[prefs.budget] || [0, 9999];
      if (chef.pricePerMeal >= min && chef.pricePerMeal <= max) score += 20;
      else score -= 10;
    }

    // Availability bonus
    if (chef.available) score += 10;

    // Reviews bonus
    score += Math.min(chef.reviews / 20, 10);

    // Health goals
    if (prefs.healthGoals.includes("Kids-friendly") && chef.spiceLevel === "mild") score += 15;
    if (prefs.healthGoals.includes("Low-calorie") && chef.oilLevel === "low")      score += 15;
    if (prefs.healthGoals.includes("High-protein") && chef.tags.includes("Non Veg")) score += 10;

    return { ...chef, score: Math.round(Math.min(score, 99)) };
  });

  const sorted = scored.sort((a, b) => b.score - a.score);
  const top3 = sorted.slice(0, 3);

  // Generate reasons based on preferences
  const reasons = {
    [top3[0]?.id]: buildReason(top3[0], prefs, 1),
    [top3[1]?.id]: buildReason(top3[1], prefs, 2),
    [top3[2]?.id]: buildReason(top3[2], prefs, 3),
  };

  return {
    summary: buildSummary(prefs, top3[0]),
    recommendations: top3.map((c, i) => ({ chef: c, rank: i + 1, matchScore: c.score, reason: reasons[c.id] })),
  };
}

function buildReason(chef, prefs, rank) {
  if (!chef) return "";
  const parts = [];
  if (chef.oilLevel === "low" && prefs.oilLevel === "Low Oil") parts.push("uses minimal oil in all cooking");
  if (chef.spiceLevel === "mild" && (prefs.spiceLevel === "Mild (No spice)" || prefs.spiceLevel === "Medium Spiced")) parts.push("known for gentle, well-balanced flavours");
  if (chef.tags.includes("Veg") && (prefs.dietType === "Pure Vegetarian")) parts.push("100% pure vegetarian kitchen");
  if (chef.available) parts.push("currently accepting orders");
  if (chef.rating >= 4.8) parts.push(`highly rated at ${chef.rating}★`);
  if (chef.pricePerMeal <= 120) parts.push("great value for money");
  if (parts.length === 0) parts.push(`excellent match with ${chef.rating}★ rating and ${chef.reviews} happy customers`);
  return `${chef.name} ${parts.slice(0, 2).join(" and ")}.`;
}

function buildSummary(prefs, topChef) {
  if (!topChef) return "Based on your preferences, here are our top chef recommendations.";
  const wants = [];
  if (prefs.oilLevel === "Low Oil") wants.push("low-oil cooking");
  if (prefs.spiceLevel === "Mild (No spice)") wants.push("mild flavours");
  if (prefs.dietType === "Pure Vegetarian") wants.push("pure vegetarian meals");
  const wantStr = wants.length ? `You prefer ${wants.join(" and ")}. ` : "";
  return `${wantStr}We analysed ${CHEFS.length} chefs and found your top matches. ${topChef.name} is our #1 recommendation with a ${topChef.score}% compatibility score.`;
}

// ─── Step config ─────────────────────────────────────────────────────────────
const OIL_OPTIONS   = ["No Preference", "Low Oil", "Medium Oil", "Rich/Ghee-based"];
const SPICE_OPTIONS = ["No Preference", "Mild (No spice)", "Medium Spiced", "Spicy", "Extra Hot"];
const DIET_OPTIONS  = ["No Preference", "Pure Vegetarian", "Jain", "Non-Vegetarian", "Vegan-Friendly"];
const CUISINE_OPTS  = ["No Preference", "North Indian", "South Indian", "Chinese", "Continental", "Bakery", "Tiffin Service"];
const BUDGET_OPTS   = ["No Preference", "Under ₹100/meal", "₹100–₹150/meal", "₹150–₹200/meal", "₹200+/meal"];
const HEALTH_OPTS   = ["None", "Diabetic-friendly", "Low-calorie", "High-protein", "Heart-healthy", "Kids-friendly"];

const STEPS = [
  { icon: "🫙", title: "Oil Level",   sub: "How much oil do you prefer?" },
  { icon: "🌶️", title: "Spice Level", sub: "What's your spice tolerance?" },
  { icon: "🥗", title: "Diet Type",   sub: "Any dietary preferences?" },
  { icon: "💰", title: "Budget",      sub: "What's your meal budget?" },
  { icon: "💪", title: "Health Goals",sub: "Any health goals to consider?" },
  { icon: "✨", title: "Review",      sub: "Confirm your preferences" },
];

export default function AIConsultant({ onClose, onBookChef }) {
  const [step, setStep]     = useState(0);
  const [prefs, setPrefs]   = useState({
    oilLevel: "No Preference", spiceLevel: "No Preference",
    dietType: "No Preference", cuisine: "No Preference",
    budget: "No Preference", healthGoals: [], extraNote: "",
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const set = (k, v) => setPrefs(p => ({ ...p, [k]: v }));
  const toggleHealth = item => setPrefs(p => ({
    ...p, healthGoals: p.healthGoals.includes(item) ? p.healthGoals.filter(h => h !== item) : [...p.healthGoals, item],
  }));

  const handleGetRec = () => {
    setLoading(true);
    setTimeout(() => {
      setResults(getAIRecommendations(prefs));
      setLoading(false);
      setStep(6);
    }, 1600);
  };

  const progress = Math.round((step / 5) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">

        {/* Header */}
        <div className="bg-brand-green px-6 py-5 flex items-center justify-between flex-shrink-0 sm:rounded-t-3xl rounded-t-3xl">
          <div>
            <p className="text-green-300 text-[11px] font-bold uppercase tracking-widest mb-0.5">✨ AI Chef Consultant</p>
            <h2 className="text-white font-extrabold text-xl">
              {step === 6 ? "Your Perfect Chefs 🎯" : "Find Your Ideal Chef"}
            </h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center text-lg transition-colors">✕</button>
        </div>

        <div className="p-5 flex-1">

          {/* Progress bar */}
          {step < 6 && (
            <div className="mb-5">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-green rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-400 font-medium">Step {Math.min(step + 1, 5)} of 5</span>
                <span className="text-xs text-brand-green font-bold">{progress}% complete</span>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-14 h-14 border-4 border-green-100 border-t-brand-green rounded-full animate-spin" />
              <div className="text-center">
                <p className="font-bold text-gray-800">Analysing chefs...</p>
                <p className="text-sm text-gray-500 mt-1">Matching your preferences with available chefs</p>
              </div>
            </div>
          )}

          {/* Step icon + title */}
          {!loading && step < 6 && step < 5 && (
            <div className="text-center mb-5">
              <span className="text-4xl">{STEPS[step].icon}</span>
              <p className="font-extrabold text-gray-900 text-lg mt-2">{STEPS[step].title}</p>
              <p className="text-sm text-gray-500">{STEPS[step].sub}</p>
            </div>
          )}

          {/* STEP 0 – Oil */}
          {!loading && step === 0 && (
            <OptionList options={OIL_OPTIONS} selected={prefs.oilLevel} onSelect={v => set("oilLevel", v)}
              labels={{ "No Preference":"🤷 No Preference","Low Oil":"💧 Low Oil — Light & healthy","Medium Oil":"🫙 Medium Oil — Balanced","Rich/Ghee-based":"🧈 Rich / Ghee-based" }} />
          )}

          {/* STEP 1 – Spice */}
          {!loading && step === 1 && (
            <OptionList options={SPICE_OPTIONS} selected={prefs.spiceLevel} onSelect={v => set("spiceLevel", v)}
              labels={{ "No Preference":"🤷 No Preference","Mild (No spice)":"🌿 Mild — No spice at all","Medium Spiced":"🌶️ Medium — Gentle warmth","Spicy":"🔥 Spicy — Good heat","Extra Hot":"💥 Extra Hot — Bring it!" }} />
          )}

          {/* STEP 2 – Diet */}
          {!loading && step === 2 && (
            <div className="space-y-4">
              <OptionList options={DIET_OPTIONS} selected={prefs.dietType} onSelect={v => set("dietType", v)}
                labels={{ "No Preference":"🤷 No Preference","Pure Vegetarian":"🥦 Pure Vegetarian","Jain":"🙏 Jain — No root vegetables","Non-Vegetarian":"🍗 Non-Vegetarian","Vegan-Friendly":"🌱 Vegan-Friendly" }} />
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Preferred Cuisine</p>
                <div className="flex flex-wrap gap-2">
                  {CUISINE_OPTS.map(c => (
                    <button key={c} onClick={() => set("cuisine", c)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${prefs.cuisine === c ? "bg-brand-green border-brand-green text-white" : "bg-white border-gray-200 text-gray-600 hover:border-brand-green hover:text-brand-green"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 – Budget */}
          {!loading && step === 3 && (
            <OptionList options={BUDGET_OPTS} selected={prefs.budget} onSelect={v => set("budget", v)}
              labels={{ "No Preference":"🤷 No Preference","Under ₹100/meal":"💚 Under ₹100 / meal","₹100–₹150/meal":"💛 ₹100 – ₹150 / meal","₹150–₹200/meal":"🧡 ₹150 – ₹200 / meal","₹200+/meal":"💜 ₹200+ / meal" }} />
          )}

          {/* STEP 4 – Health */}
          {!loading && step === 4 && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <span className="text-4xl">💪</span>
                <p className="font-extrabold text-gray-900 text-lg mt-2">Health Goals</p>
                <p className="text-sm text-gray-500">Select all that apply</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {HEALTH_OPTS.map(item => (
                  <button key={item} onClick={() => toggleHealth(item)}
                    className={`text-sm font-semibold px-4 py-2 rounded-full border transition-all ${prefs.healthGoals.includes(item) ? "bg-brand-green border-brand-green text-white" : "bg-white border-gray-200 text-gray-600 hover:border-brand-green hover:text-brand-green"}`}>
                    {item}
                  </button>
                ))}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Anything else?</p>
                <textarea
                  placeholder="e.g. My mother has diabetes and needs less salt..."
                  value={prefs.extraNote}
                  onChange={e => set("extraNote", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green resize-none bg-gray-50"
                />
              </div>
            </div>
          )}

          {/* STEP 5 – Review */}
          {!loading && step === 5 && (
            <div>
              <div className="text-center mb-4">
                <span className="text-4xl">✨</span>
                <p className="font-extrabold text-gray-900 text-lg mt-2">Your Preferences</p>
                <p className="text-sm text-gray-500">Review before getting your recommendation</p>
              </div>
              <div className="bg-green-50 rounded-2xl p-4 space-y-2.5">
                {[
                  ["🫙 Oil Level", prefs.oilLevel],
                  ["🌶️ Spice",     prefs.spiceLevel],
                  ["🥗 Diet",      prefs.dietType],
                  ["🍽️ Cuisine",   prefs.cuisine],
                  ["💰 Budget",    prefs.budget],
                  ["💪 Health",    prefs.healthGoals.length ? prefs.healthGoals.join(", ") : "None"],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between items-center border-b border-green-100 pb-2 last:border-0 last:pb-0">
                    <span className="text-xs text-gray-500">{label}</span>
                    <span className="text-xs font-bold text-brand-green">{val}</span>
                  </div>
                ))}
                {prefs.extraNote && (
                  <p className="text-xs text-gray-600 pt-1">📝 <span className="font-semibold">Note:</span> {prefs.extraNote}</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 6 – Results */}
          {!loading && step === 6 && results && (
            <div>
              {/* Summary */}
              <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-4 flex gap-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <p className="text-xs font-bold text-brand-green uppercase tracking-wide mb-1">AI Recommendation</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{results.summary}</p>
                </div>
              </div>

              {/* Chef result cards */}
              <div className="space-y-3">
                {results.recommendations.map((rec, idx) => (
                  <div key={rec.chef.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex gap-3 items-start">
                      {/* Rank */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0 ${idx === 0 ? "bg-amber-400" : idx === 1 ? "bg-gray-400" : "bg-amber-700"}`}>
                        #{rec.rank}
                      </div>

                      {/* Avatar */}
                      <img src={rec.chef.avatar} alt={rec.chef.name}
                        className="w-11 h-11 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm"
                        onError={e => { e.target.style.display = "none"; }} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{rec.chef.name}</p>
                            <p className="text-xs text-gray-500">★ {rec.chef.rating} · ₹{rec.chef.pricePerMeal}/meal · {rec.chef.location.split(",")[0]}</p>
                          </div>
                          <span className="text-xs font-bold bg-green-50 text-brand-green px-2 py-1 rounded-full flex-shrink-0">
                            {rec.matchScore}% match
                          </span>
                        </div>

                        {/* AI reason */}
                        <div className="bg-gray-50 rounded-xl px-3 py-2 mt-2">
                          <p className="text-xs text-gray-600 leading-relaxed">💡 {rec.reason}</p>
                        </div>

                        <div className="mt-2.5 flex justify-end">
                          {rec.chef.available ? (
                            <button onClick={() => onBookChef?.(rec.chef)}
                              className="text-xs font-bold bg-brand-green text-white px-4 py-1.5 rounded-xl hover:bg-green-900 transition-colors">
                              Book Now
                            </button>
                          ) : (
                            <span className="text-xs font-semibold text-red-500">Currently Unavailable</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => { setStep(0); setResults(null); }}
                className="w-full mt-4 py-3 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-500 hover:border-brand-green hover:text-brand-green transition-colors"
              >
                🔄 Try with different preferences
              </button>
            </div>
          )}

          {/* Navigation */}
          {!loading && step < 6 && (
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => step > 0 ? setStep(s => s - 1) : onClose()}
                className="flex-1 py-3 border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:border-gray-300 transition-colors"
              >
                {step === 0 ? "Cancel" : "← Back"}
              </button>
              {step < 5 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  className="flex-1 py-3 bg-brand-green text-white rounded-2xl text-sm font-bold hover:bg-green-900 transition-colors"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleGetRec}
                  className="flex-1 py-3 bg-brand-green text-white rounded-2xl text-sm font-bold hover:bg-green-900 transition-colors"
                >
                  ✨ Get Recommendation
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OptionList({ options, selected, onSelect, labels = {} }) {
  return (
    <div className="space-y-2">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
            selected === opt
              ? "bg-green-50 border-brand-green text-brand-green"
              : "bg-white border-gray-200 text-gray-700 hover:border-brand-green hover:bg-green-50/50"
          }`}
        >
          {labels[opt] || opt}
        </button>
      ))}
    </div>
  );
}