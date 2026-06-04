import React, { useState } from 'react';

export default function FoodPage() {
  // Prototype view management state: 'active' | 'empty-search' | 'empty-location'
  const [currentViewState, setCurrentViewState] = useState('active');
  const [activeCategory, setActiveCategory] = useState('All Meals');
  const [vegOnly, setVegOnly] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-slate-800 font-sans selection:bg-amber-500 selection:text-white">
      
      {/* --- PROTOTYPE CONTROLLER HEADER (For Testing All States) --- */}
      <div className="bg-slate-900 text-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-700 select-none">
        <span className="font-mono text-amber-400 font-bold">🛠️ SHANTA BAI DESKTOP/MOBILE PROTOTYPE CONTROLLER</span>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentViewState('active')}
            className={`px-3 py-1 rounded font-medium transition-all ${currentViewState === 'active' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700'}`}
          >
            1. Active Feed View
          </button>
          <button 
            onClick={() => setCurrentViewState('empty-search')}
            className={`px-3 py-1 rounded font-medium transition-all ${currentViewState === 'empty-search' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700'}`}
          >
            2. State A: No Results
          </button>
          <button 
            onClick={() => setCurrentViewState('empty-location')}
            className={`px-3 py-1 rounded font-medium transition-all ${currentViewState === 'empty-location' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700'}`}
          >
            3. State B: Out-of-Bounds
          </button>
        </div>
      </div>

      {/* --- LAYER 1: HYPERLOCAL SEARCH BAR COMPONENT (STICKY) --- */}
      <header className="sticky top-0 z-40 bg-[#FFFDF8]/90 backdrop-blur-md border-b border-slate-200/60 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Identity & Location Indicator Combo */}
            <div className="flex items-center gap-4 justify-between md:justify-start">
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                Shanta <span className="text-amber-500">Bai</span>
              </h1>
              <div className="h-4 w-px bg-slate-300 hidden sm:block" />
              {/* Location Indicator Accent */}
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 transition-colors text-xs font-semibold text-slate-700 group">
                <span className="text-amber-500 animate-pulse">📍</span> 
                Navi Mumbai, MH
                <svg className="w-3 h-3 text-slate-400 group-hover:text-slate-600 transition-transform group-hover:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Core Search Input Shell */}
            <div className="flex-1 max-w-2xl w-full relative">
              <div className="relative flex items-center">
                <input 
                  type="text"
                  placeholder="Search for homemade Poha, regional Tiffin services, or local Cooks..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium text-slate-900 placeholder-slate-400 shadow-inner outline-none transition-all"
                />
                <svg className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {/* Contextual Discovery Micro-Copy */}
              <p className="mt-1.5 text-[11px] text-slate-500 font-medium px-1 tracking-wide truncate">
                <span className="text-amber-600 font-bold">Popular right now:</span> Indori Poha, Homemade Idli, Homestyle Dal Khichdi
              </p>
            </div>

          </div>
        </div>
      </header>

      {/* --- LAYER 2: SEGMENTED FILTER & SORTING MATRIX --- */}
      <section className="bg-[#FFFDF8] border-b border-slate-100 py-3 sticky top-[105px] md:top-[73px] z-30 shadow-sm/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
            
            {/* Horizontally Scrollable Category Chips Container */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
              {['All Meals', 'Breakfast Specials', 'Daily Tiffins', 'Festive / Event Catering', 'Home-baked Goods'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`snap-center px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border tracking-wide ${activeCategory === cat ? 'bg-gradient-to-r from-amber-400 to-amber-500 border-amber-500 text-slate-950 shadow-sm shadow-amber-500/20' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Inline Toggles & Sort Dropdown controls */}
            <div className="flex items-center flex-wrap gap-2 justify-between lg:justify-end">
              <div className="flex items-center gap-2">
                {/* Veg Toggle Chip */}
                <button 
                  onClick={() => setVegOnly(!vegOnly)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 transition-all ${vegOnly ? 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-500/10' : 'bg-white border-slate-200 text-slate-600'}`}
                >
                  <span className="text-emerald-600 text-xs">🟢</span> Veg Only
                </button>
                
                {/* Non-Veg Static View Chip */}
                <button className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 inline-flex items-center gap-1.5 transition-all">
                  <span className="text-red-500 text-xs">🔴</span> Non-Veg
                </button>

                {/* Star Rating Toggle */}
                <button className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 inline-flex items-center gap-1.5 transition-all">
                  <span className="text-amber-500">⭐</span> Top Rated (4.5★+)
                </button>

                {/* Speed Filter */}
                <button className="hidden sm:inline-flex px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 items-center gap-1.5 transition-all">
                  <span className="text-amber-500">⚡</span> Available in 30 Mins
                </button>
              </div>

              {/* Refined Sort Dropdown Wrapper */}
              <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sort:</span>
                <select className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer pr-1">
                  <option>Relevance</option>
                  <option>Price: Low to High</option>
                  <option>Distance: Closest First</option>
                  <option>Earliest Delivery</option>
                </select>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- CONTENT LAYOUT ENGINE (DYNAMIC VIEWS) --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* --- VIEW STATE 1: ACTIVE FOOD INVENTORY FEED --- */}
        {currentViewState === 'active' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                🍛 Fresh Homemade Dishes Nearby 
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] uppercase font-black tracking-widest">Live</span>
              </h2>
              <span className="text-xs font-semibold text-slate-500">Showing 3 verified options</span>
            </div>

            {/* Inventory Core Flexbox Grid Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* CARD 1: THE QUICK BREAKFAST */}
              <div className="bg-white border border-slate-200/80 rounded-[2rem] p-4 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-amber-200 group transition-all duration-300">
                <div>
                  <div className="relative aspect-[4/3] w-full rounded-[1.5rem] overflow-hidden bg-slate-100">
                    <img 
                      src="https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600" 
                      alt="Authentic Indori Poha" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm shadow-sm text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                        🟢 Veg
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-sm text-xs font-bold text-white shadow-sm">
                        ⭐ 4.9 <span className="text-slate-300 text-[10px] font-normal">(120+)</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 px-1 flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-heading text-base font-black text-slate-900 leading-snug group-hover:text-amber-600 transition-colors">
                        Authentic Indori Poha
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">by Savitri's Kitchen</p>
                    </div>
                    <span className="font-heading text-xl font-black text-slate-900 shrink-0">₹40</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                    <span className="px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 inline-flex items-center gap-1">
                      ⏱️ Only 7 left for today!
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 inline-flex items-center gap-1">
                      🚚 Slotted: 9:00 AM - 10:00 AM
                    </span>
                  </div>
                  <button className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-widest shadow-sm shadow-amber-500/10 transition-all active:scale-[0.99]">
                    Add to Plate
                  </button>
                </div>
              </div>

              {/* CARD 2: THE DAILY TIFFIN PACK */}
              <div className="bg-white border border-slate-200/80 rounded-[2rem] p-4 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-amber-200 group transition-all duration-300">
                <div>
                  <div className="relative aspect-[4/3] w-full rounded-[1.5rem] overflow-hidden bg-slate-100">
                    <img 
                      src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600" 
                      alt="Homestyle Premium Veg Tiffin" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm shadow-sm text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                        🟢 Veg
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-sm text-xs font-bold text-white shadow-sm">
                        ⭐ 4.8 <span className="text-slate-300 text-[10px] font-normal">(450+)</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 px-1 flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-heading text-base font-black text-slate-900 leading-snug group-hover:text-amber-600 transition-colors">
                        Homestyle Premium Veg Tiffin
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">by Ghar Ka Swaad Network</p>
                    </div>
                    <span className="font-heading text-xl font-black text-slate-900 shrink-0">₹120</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                    <span className="px-2 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 inline-flex items-center gap-1">
                      🔥 14 slots left this afternoon
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 inline-flex items-center gap-1">
                      🚚 Slotted: 12:30 PM - 2:00 PM
                    </span>
                  </div>
                  <button className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-widest shadow-sm shadow-amber-500/10 transition-all active:scale-[0.99]">
                    Subscribe / Add
                  </button>
                </div>
              </div>

              {/* CARD 3: REGIONAL GOURMET COMFORT */}
              <div className="bg-white border border-slate-200/80 rounded-[2rem] p-4 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-amber-200 group transition-all duration-300">
                <div>
                  <div className="relative aspect-[4/3] w-full rounded-[1.5rem] overflow-hidden bg-slate-100">
                    <img 
                      src="https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=600" 
                      alt="Kolhapuri Chicken Thali" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm shadow-sm text-[10px] font-black text-red-700 uppercase tracking-wider">
                        🔴 Non-Veg
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-sm text-xs font-bold text-white shadow-sm">
                        ⭐ 4.9 <span className="text-slate-300 text-[10px] font-normal">(80+)</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 px-1 flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-heading text-base font-black text-slate-900 leading-snug group-hover:text-amber-600 transition-colors">
                        Kolhapuri Chicken Thali
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">by Chef Aarav's Culinary</p>
                    </div>
                    <span className="font-heading text-xl font-black text-slate-900 shrink-0">₹180</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                    <span className="px-2 py-1 rounded-lg bg-red-50 border border-red-200 text-red-800 inline-flex items-center gap-1">
                      ⏳ Selling fast! 3 left
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 inline-flex items-center gap-1">
                      🚚 Slotted: 8:00 PM - 9:30 PM
                    </span>
                  </div>
                  <button className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-widest shadow-sm shadow-amber-500/10 transition-all active:scale-[0.99]">
                    Add to Plate
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* --- VIEW STATE 2: STATE A (ZERO SEARCH RESULTS FOUND) --- */}
        {currentViewState === 'empty-search' && (
          <div className="max-w-xl mx-auto py-12 text-center animate-fadeIn">
            {/* Minimalist Graphic Element */}
            <div className="w-32 h-32 mx-auto mb-6 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center relative shadow-inner">
              <span className="text-5xl">🍲</span>
              <div className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shadow border border-white">
                ?
              </div>
            </div>
            
            <h3 className="text-2xl font-black text-slate-900 tracking-tight font-heading">
              "We couldn't find that exact recipe nearby."
            </h3>
            
            <p className="mt-3 text-sm text-slate-600 font-medium leading-relaxed">
              Our local home chefs prepare fresh food daily based on market ingredients. Try checking for broader terms like 'Poha', 'Tiffin', or look at other active kitchens in your locality.
            </p>
            
            {/* Interactive Action Routes */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button 
                onClick={() => setCurrentViewState('active')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest shadow transition-all active:scale-95"
              >
                Clear Search Filters
              </button>
              <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs uppercase tracking-widest shadow-sm transition-all">
                Post a Custom Cooking Requirement
              </button>
            </div>
          </div>
        )}

        {/* --- VIEW STATE 3: STATE B (NO PROVIDERS IN AREA BOUNDARY) --- */}
        {currentViewState === 'empty-location' && (
          <div className="max-w-xl mx-auto py-12 text-center animate-fadeIn">
            {/* Minimalist Location Graphic */}
            <div className="w-32 h-32 mx-auto mb-6 bg-slate-50 border border-slate-200 rounded-3xl flex items-center justify-center relative shadow-inner group">
              <span className="text-5xl group-hover:scale-110 transition-transform duration-300">🏡</span>
              <div className="absolute bottom-1 right-1 bg-amber-500 text-slate-950 px-2 py-0.5 rounded-lg text-[9px] font-black tracking-wider shadow border border-white uppercase">
                Resting
              </div>
            </div>
            
            <h3 className="text-2xl font-black text-slate-900 tracking-tight font-heading">
              "All kitchen counters are currently resting here."
            </h3>
            
            <p className="mt-3 text-sm text-slate-600 font-medium leading-relaxed">
              It looks like our certified home chefs in this sector haven't opened up their scheduling slots for this specific timeline yet.
            </p>
            
            {/* Interactive Action Routes */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest shadow shadow-amber-500/10 transition-all active:scale-95">
                Notify Me When Active
              </button>
              <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs uppercase tracking-widest shadow-sm transition-all">
                Change My Location Context
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
