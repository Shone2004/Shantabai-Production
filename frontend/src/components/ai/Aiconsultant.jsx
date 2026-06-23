import { useState, useEffect } from "react";
import api from "../../services/api";

// ─── Schema field value maps ──────────────────────────────────────────────────
// ProviderProfile.js: oilLevel: "Low Oil" | "Normal" | "Extra"
// ProviderProfile.js: spiceLevel: "Mild" | "Medium" | "Spicy"
// ProviderProfile.js: dietaryType: ["Veg", "Non-Veg", "Vegan"]

// ─── AI matching logic (runs on real chef data) ───────────────────────────────
function getAIRecommendations(chefs, prefs) {
  const scored = chefs.map((chef) => {
    let score = (chef.rating ?? 5) * 10; // base from rating (max 50)

    // ── Oil level match ──
    // Schema: "Low Oil" | "Normal" | "Extra"
    // Pref:   "Low Oil" | "Medium Oil" | "Rich/Ghee-based"
    if (prefs.oilLevel !== "No Preference") {
      const prefToSchema = {
        "Low Oil":        "Low Oil",
        "Medium Oil":     "Normal",
        "Rich/Ghee-based":"Extra",
      };
      if (chef.oilLevel === prefToSchema[prefs.oilLevel]) score += 25;
      else score -= 10;
    }

    // ── Spice level match ──
    // Schema: "Mild" | "Medium" | "Spicy"
    // Pref:   "Mild (No spice)" | "Medium Spiced" | "Spicy" | "Extra Hot"
    if (prefs.spiceLevel !== "No Preference") {
      const prefToSchema = {
        "Mild (No spice)": "Mild",
        "Medium Spiced":   "Medium",
        "Spicy":           "Spicy",
        "Extra Hot":       "Spicy",
      };
      if (chef.spiceLevel === prefToSchema[prefs.spiceLevel]) score += 20;
      else score -= 8;
    }

    // ── Diet match ──
    // Schema dietaryType: ["Veg", "Non-Veg", "Vegan"]
    const dietTags = chef.dietaryType || [];
    if (prefs.dietType === "Pure Vegetarian" || prefs.dietType === "Jain" || prefs.dietType === "Vegan-Friendly") {
      if (dietTags.includes("Veg") || dietTags.includes("Vegan")) score += 20;
      else score -= 20;
    }
    if (prefs.dietType === "Non-Vegetarian") {
      if (dietTags.includes("Non-Veg")) score += 15;
    }

    // ── Budget match ──
    const budgetMap = {
      "Under ₹100/meal":  [0, 100],
      "₹100–₹150/meal":  [100, 150],
      "₹150–₹200/meal":  [150, 200],
      "₹200+/meal":       [200, 9999],
    };
    if (prefs.budget !== "No Preference") {
      const [min, max] = budgetMap[prefs.budget] || [0, 9999];
      const price = chef.startingPrice ?? 0;
      if (price >= min && price <= max) score += 20;
      else score -= 10;
    }

    // ── Availability bonus ──
    if (chef.isAvailable) score += 10;

    // ── Reviews bonus ──
    score += Math.min((chef.totalReviews ?? 0) / 20, 10);

    // ── Health goals ──
    if (prefs.healthGoals.includes("Kids-friendly")  && chef.spiceLevel === "Mild")    score += 15;
    if (prefs.healthGoals.includes("Low-calorie")    && chef.oilLevel === "Low Oil")   score += 15;
    if (prefs.healthGoals.includes("High-protein")   && dietTags.includes("Non-Veg")) score += 10;
    if (prefs.healthGoals.includes("Diabetic-friendly") && chef.oilLevel === "Low Oil") score += 12;
    if (prefs.healthGoals.includes("Heart-healthy")  && chef.oilLevel === "Low Oil")   score += 12;

    // ── Cuisine / speciality match ──
    if (prefs.cuisine !== "No Preference") {
      const specialities = (chef.specialities || []).map((s) => s.toLowerCase());
      if (specialities.some((s) => s.includes(prefs.cuisine.toLowerCase()))) score += 15;
    }

    return { ...chef, score: Math.round(Math.min(Math.max(score, 10), 99)) };
  });

  const sorted = scored.sort((a, b) => b.score - a.score);
  const top3 = sorted.slice(0, 3);

  return {
    summary: buildSummary(prefs, top3[0], chefs.length),
    recommendations: top3.map((c, i) => ({
      chef: c,
      rank: i + 1,
      matchScore: c.score,
      reason: buildReason(c, prefs),
    })),
  };
}

function buildReason(chef, prefs) {
  if (!chef) return "";
  const parts = [];
  const dietTags = chef.dietaryType || [];

  if (chef.oilLevel === "Low Oil" && prefs.oilLevel === "Low Oil")
    parts.push("uses minimal oil in all cooking");
  if (chef.spiceLevel === "Mild" && (prefs.spiceLevel === "Mild (No spice)" || prefs.spiceLevel === "Medium Spiced"))
    parts.push("known for gentle, well-balanced flavours");
  if (dietTags.includes("Veg") && prefs.dietType === "Pure Vegetarian")
    parts.push("100% pure vegetarian kitchen");
  if (dietTags.includes("Vegan") && prefs.dietType === "Vegan-Friendly")
    parts.push("vegan-friendly cooking");
  if (chef.isAvailable) parts.push("currently accepting orders");
  if ((chef.rating ?? 0) >= 4.8) parts.push(`highly rated at ${chef.rating}★`);
  if ((chef.startingPrice ?? 999) <= 120) parts.push("great value for money");

  if (parts.length === 0)
    parts.push(`excellent match with ${chef.rating ?? "5.0"}★ rating and ${chef.totalReviews ?? 0} happy customers`);

  return `${chef.kitchenName || "This chef"} ${parts.slice(0, 2).join(" and ")}.`;
}

function buildSummary(prefs, topChef, totalCount) {
  if (!topChef) return "Based on your preferences, here are our top chef recommendations.";
  const wants = [];
  if (prefs.oilLevel === "Low Oil") wants.push("low-oil cooking");
  if (prefs.spiceLevel === "Mild (No spice)") wants.push("mild flavours");
  if (prefs.dietType === "Pure Vegetarian") wants.push("pure vegetarian meals");
  if (prefs.dietType === "Vegan-Friendly") wants.push("vegan-friendly meals");
  const wantStr = wants.length ? `You prefer ${wants.join(" and ")}. ` : "";
  return `${wantStr}We analysed ${totalCount} verified chef${totalCount !== 1 ? "s" : ""} and found your top matches. ${topChef.kitchenName || "Our top pick"} is our #1 recommendation with a ${topChef.score}% compatibility score.`;
}

// ─── Step config ──────────────────────────────────────────────────────────────
const OIL_OPTIONS   = ["No Preference", "Low Oil", "Medium Oil", "Rich/Ghee-based"];
const SPICE_OPTIONS = ["No Preference", "Mild (No spice)", "Medium Spiced", "Spicy", "Extra Hot"];
const DIET_OPTIONS  = ["No Preference", "Pure Vegetarian", "Jain", "Non-Vegetarian", "Vegan-Friendly"];
const CUISINE_OPTS  = ["No Preference", "North Indian", "South Indian", "Chinese", "Continental", "Bakery", "Tiffin Service", "Maharashtrian", "Gujarati", "Street Food"];
const BUDGET_OPTS   = ["No Preference", "Under ₹100/meal", "₹100–₹150/meal", "₹150–₹200/meal", "₹200+/meal"];
const HEALTH_OPTS   = ["None", "Diabetic-friendly", "Low-calorie", "High-protein", "Heart-healthy", "Kids-friendly"];

const STEPS = [
  { icon: "🫙", title: "Oil Level",    sub: "How much oil do you prefer?" },
  { icon: "🌶️", title: "Spice Level",  sub: "What's your spice tolerance?" },
  { icon: "🥗", title: "Diet Type",    sub: "Any dietary preferences?" },
  { icon: "💰", title: "Budget",       sub: "What's your meal budget?" },
  { icon: "💪", title: "Health Goals", sub: "Any health goals to consider?" },
  { icon: "✨", title: "Review",       sub: "Confirm your preferences" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AIConsultant({ onClose, onBookChef }) {
  const [step, setStep]       = useState(0);
  const [prefs, setPrefs]     = useState({
    oilLevel: "No Preference", spiceLevel: "No Preference",
    dietType: "No Preference", cuisine: "No Preference",
    budget: "No Preference",   healthGoals: [], extraNote: "",
  });
  const [loading, setLoading]   = useState(false);
  const [chefsFetching, setChefsFetching] = useState(false);
  const [chefs, setChefs]       = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [results, setResults]   = useState(null);

  // Fetch verified chefs once on mount
  useEffect(() => {
    const loadChefs = async () => {
      try {
        setChefsFetching(true);
        setFetchError("");
        const res = await api.get("/providers/verified");
        if (res.data.success) {
          setChefs(res.data.providers || res.data.chefs || []);
        } else {
          setFetchError("Could not load chefs. Please try again.");
        }
      } catch (err) {
        console.error("Failed to fetch verified chefs:", err);
        setFetchError("Could not connect to the server. Please try again.");
      } finally {
        setChefsFetching(false);
      }
    };
    loadChefs();
  }, []);

  const set       = (k, v) => setPrefs((p) => ({ ...p, [k]: v }));
  const toggleHealth = (item) =>
    setPrefs((p) => ({
      ...p,
      healthGoals: p.healthGoals.includes(item)
        ? p.healthGoals.filter((h) => h !== item)
        : [...p.healthGoals, item],
    }));

  const handleGetRec = () => {
    if (chefs.length === 0) return;
    setLoading(true);
    setTimeout(() => {
      setResults(getAIRecommendations(chefs, prefs));
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
            <p className="text-green-300 text-[11px] font-bold uppercase tracking-widest mb-0.5">
              ✨ AI Chef Consultant
            </p>
            <h2 className="text-white font-extrabold text-xl">
              {step === 6 ? "Your Perfect Chefs 🎯" : "Find Your Ideal Chef"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center text-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-5 flex-1">

          {/* Fetch error state */}
          {fetchError && (
            <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-3 text-center">
              <p className="text-xs font-semibold text-red-500">{fetchError}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-xs font-bold text-brand-green underline mt-1"
              >
                Retry
              </button>
            </div>
          )}

          {/* Progress bar */}
          {step < 6 && (
            <div className="mb-5">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-green rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-400 font-medium">
                  Step {Math.min(step + 1, 5)} of 5
                </span>
                <span className="text-xs text-brand-green font-bold">{progress}% complete</span>
              </div>
            </div>
          )}

          {/* Loading spinner (while computing recommendations) */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-14 h-14 border-4 border-green-100 border-t-brand-green rounded-full animate-spin" />
              <div className="text-center">
                <p className="font-bold text-gray-800">Analysing chefs...</p>
                <p className="text-sm text-gray-500 mt-1">
                  Matching your preferences with {chefs.length} verified chefs
                </p>
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
            <OptionList
              options={OIL_OPTIONS}
              selected={prefs.oilLevel}
              onSelect={(v) => set("oilLevel", v)}
              labels={{
                "No Preference":   "🤷 No Preference",
                "Low Oil":         "💧 Low Oil — Light & healthy",
                "Medium Oil":      "🫙 Medium Oil — Balanced",
                "Rich/Ghee-based": "🧈 Rich / Ghee-based",
              }}
            />
          )}

          {/* STEP 1 – Spice */}
          {!loading && step === 1 && (
            <OptionList
              options={SPICE_OPTIONS}
              selected={prefs.spiceLevel}
              onSelect={(v) => set("spiceLevel", v)}
              labels={{
                "No Preference":   "🤷 No Preference",
                "Mild (No spice)": "🌿 Mild — No spice at all",
                "Medium Spiced":   "🌶️ Medium — Gentle warmth",
                "Spicy":           "🔥 Spicy — Good heat",
                "Extra Hot":       "💥 Extra Hot — Bring it!",
              }}
            />
          )}

          {/* STEP 2 – Diet + Cuisine */}
          {!loading && step === 2 && (
            <div className="space-y-4">
              <OptionList
                options={DIET_OPTIONS}
                selected={prefs.dietType}
                onSelect={(v) => set("dietType", v)}
                labels={{
                  "No Preference":   "🤷 No Preference",
                  "Pure Vegetarian": "🥦 Pure Vegetarian",
                  "Jain":            "🙏 Jain — No root vegetables",
                  "Non-Vegetarian":  "🍗 Non-Vegetarian",
                  "Vegan-Friendly":  "🌱 Vegan-Friendly",
                }}
              />
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Preferred Cuisine
                </p>
                <div className="flex flex-wrap gap-2">
                  {CUISINE_OPTS.map((c) => (
                    <button
                      key={c}
                      onClick={() => set("cuisine", c)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                        prefs.cuisine === c
                          ? "bg-brand-green border-brand-green text-white"
                          : "bg-white border-gray-200 text-gray-600 hover:border-brand-green hover:text-brand-green"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 – Budget */}
          {!loading && step === 3 && (
            <OptionList
              options={BUDGET_OPTS}
              selected={prefs.budget}
              onSelect={(v) => set("budget", v)}
              labels={{
                "No Preference":    "🤷 No Preference",
                "Under ₹100/meal":  "💚 Under ₹100 / meal",
                "₹100–₹150/meal":  "💛 ₹100 – ₹150 / meal",
                "₹150–₹200/meal":  "🧡 ₹150 – ₹200 / meal",
                "₹200+/meal":       "💜 ₹200+ / meal",
              }}
            />
          )}

          {/* STEP 4 – Health Goals */}
          {!loading && step === 4 && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <span className="text-4xl">💪</span>
                <p className="font-extrabold text-gray-900 text-lg mt-2">Health Goals</p>
                <p className="text-sm text-gray-500">Select all that apply</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {HEALTH_OPTS.map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleHealth(item)}
                    className={`text-sm font-semibold px-4 py-2 rounded-full border transition-all ${
                      prefs.healthGoals.includes(item)
                        ? "bg-brand-green border-brand-green text-white"
                        : "bg-white border-gray-200 text-gray-600 hover:border-brand-green hover:text-brand-green"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Anything else?
                </p>
                <textarea
                  placeholder="e.g. My mother has diabetes and needs less salt..."
                  value={prefs.extraNote}
                  onChange={(e) => set("extraNote", e.target.value)}
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
                  <div
                    key={label}
                    className="flex justify-between items-center border-b border-green-100 pb-2 last:border-0 last:pb-0"
                  >
                    <span className="text-xs text-gray-500">{label}</span>
                    <span className="text-xs font-bold text-brand-green">{val}</span>
                  </div>
                ))}
                {prefs.extraNote && (
                  <p className="text-xs text-gray-600 pt-1">
                    📝 <span className="font-semibold">Note:</span> {prefs.extraNote}
                  </p>
                )}
              </div>

              {/* Warn if no chefs loaded yet */}
              {chefsFetching && (
                <p className="text-xs text-center text-gray-400 mt-3 animate-pulse">
                  Loading chef data...
                </p>
              )}
              {!chefsFetching && chefs.length === 0 && !fetchError && (
                <p className="text-xs text-center text-amber-500 mt-3 font-semibold">
                  ⚠️ No verified chefs available right now.
                </p>
              )}
            </div>
          )}

          {/* STEP 6 – Results */}
          {!loading && step === 6 && results && (
            <div>
              {/* Summary */}
              <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-4 flex gap-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <p className="text-xs font-bold text-brand-green uppercase tracking-wide mb-1">
                    AI Recommendation
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">{results.summary}</p>
                </div>
              </div>

              {results.recommendations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-4xl mb-2">😔</p>
                  <p className="font-bold text-gray-700">No matches found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Try adjusting your preferences for better results.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.recommendations.map((rec, idx) => {
                    const chef = rec.chef;
                    const avatarUrl   = chef.avatar || "";
                    const displayName = chef.kitchenName || "Home Chef";
                    const location    = chef.area || chef.city || "";
                    const price       = chef.startingPrice ?? 0;
                    const rating      = chef.rating ?? "5.0";

                    return (
                      <div
                        key={chef._id}
                        className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex gap-3 items-start">
                          {/* Rank badge */}
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0 ${
                              idx === 0 ? "bg-amber-400" : idx === 1 ? "bg-gray-400" : "bg-amber-700"
                            }`}
                          >
                            #{rec.rank}
                          </div>

                          {/* Avatar */}
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={displayName}
                              className="w-11 h-11 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm"
                              onError={(e) => { e.target.style.display = "none"; }}
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-brand-green flex items-center justify-center text-white font-black text-sm flex-shrink-0 border-2 border-white shadow-sm">
                              {displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <div>
                                <p className="font-bold text-gray-900 text-sm">{displayName}</p>
                                <p className="text-xs text-gray-500">
                                  ★ {rating}
                                  {price > 0 ? ` · ₹${price}/meal` : ""}
                                  {location ? ` · ${location}` : ""}
                                </p>
                              </div>
                              <span className="text-xs font-bold bg-green-50 text-brand-green px-2 py-1 rounded-full flex-shrink-0">
                                {rec.matchScore}% match
                              </span>
                            </div>

                            {/* AI reason */}
                            <div className="bg-gray-50 rounded-xl px-3 py-2 mt-2">
                              <p className="text-xs text-gray-600 leading-relaxed">
                                💡 {rec.reason}
                              </p>
                            </div>

                            <div className="mt-2.5 flex justify-end">
                              {chef.isAvailable ? (
                                <button
                                  onClick={() => onBookChef?.(chef)}
                                  className="text-xs font-bold bg-brand-green text-white px-4 py-1.5 rounded-xl hover:bg-green-900 transition-colors"
                                >
                                  Book Now
                                </button>
                              ) : (
                                <span className="text-xs font-semibold text-red-500">
                                  Currently Unavailable
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

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
                onClick={() => (step > 0 ? setStep((s) => s - 1) : onClose())}
                className="flex-1 py-3 border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:border-gray-300 transition-colors"
              >
                {step === 0 ? "Cancel" : "← Back"}
              </button>
              {step < 5 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  className="flex-1 py-3 bg-brand-green text-white rounded-2xl text-sm font-bold hover:bg-green-900 transition-colors"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleGetRec}
                  disabled={chefsFetching || chefs.length === 0}
                  className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-colors ${
                    chefsFetching || chefs.length === 0
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-brand-green text-white hover:bg-green-900"
                  }`}
                >
                  {chefsFetching ? "Loading chefs..." : "✨ Get Recommendation"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Reusable option list ─────────────────────────────────────────────────────
function OptionList({ options, selected, onSelect, labels = {} }) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
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