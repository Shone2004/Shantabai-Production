import React from 'react';

const STEPS = [
  {
    num: "01",
    title: "Choose a Dish",
    desc: "Browse homemade meals from nearby kitchens.",
    img: "/illustrations/step_01.png"
  },
  {
    num: "02",
    title: "Select a Home Cook",
    desc: "Pick from trusted and verified local cooks.",
    img: "/illustrations/step_02.png"
  },
  {
    num: "03",
    title: "Meal Gets Prepared",
    desc: "Your order is freshly cooked after confirmation.",
    img: "/illustrations/step_03.png"
  },
  {
    num: "04",
    title: "Pick Up Your Meal",
    desc: "Collect your meal directly from the kitchen at your chosen time.",
    img: "/illustrations/step_04.png"
  },
  {
    num: "05",
    title: "Enjoy Homemade Food",
    desc: "Fresh, local and prepared with care.",
    img: "/illustrations/step_05.png"
  }
];

export default function HowItWorks() {
  return (
    <section className="bg-gradient-to-b from-[#FAF8F4] via-[#FCFAF6] to-[#FAF8F4] pt-4 pb-3 md:pt-20 md:pb-12 relative overflow-hidden border-y border-gray-100/50">
      
      {/* Background radial soft light overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.7)_0%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Divider above header */}
        <div className="w-full flex justify-center mt-0.5 mb-2.5 md:mb-6">
          <div className="w-12 h-[1px] bg-brand-green/20 relative">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#0A4D2B]" />
          </div>
        </div>

        {/* Section Header */}
        <div className="px-4 sm:px-6 lg:px-8 text-center max-w-2xl mx-auto mb-3 md:mb-16">
          <span className="text-[10px] sm:text-xs font-black tracking-[0.2em] text-[#0A4D2B] uppercase block mb-1">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] leading-tight tracking-tight mt-1">
            How Shantabai Works
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-semibold mt-2 leading-relaxed max-w-[230px] sm:max-w-md mx-auto">
            Your homemade meal journey in five simple steps.
          </p>
        </div>

        {/* ── Mobile Layout (Swipeable Carousel) ── */}
        <div className="md:hidden">
          <div className="snap-x snap-mandatory flex overflow-x-auto gap-4 hide-scrollbar px-6 pb-4 relative z-10">
            {STEPS.map((step, idx) => (
              <div 
                key={idx} 
                className="snap-center shrink-0 w-[260px] h-[260px] bg-white rounded-2xl border border-gray-100/80 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col items-center justify-between text-center relative overflow-hidden group"
              >
                {/* 1. Illustration: 60-70% of card height (~150px) */}
                <img
                  src={step.img}
                  alt={step.title}
                  className="h-[145px] w-auto object-contain select-none pointer-events-none transition-transform duration-300 group-hover:scale-105 shrink-0"
                  loading="lazy"
                />

                {/* 2. Step Info */}
                <div className="flex flex-col items-center mt-2 flex-grow justify-start">
                  {/* Step Number */}
                  <span className="text-[11px] font-extrabold text-brand-green tracking-wide">
                    {step.num}
                  </span>
                  {/* Step Title */}
                  <h4 className="text-sm font-extrabold text-gray-900 mt-0.5 leading-tight">
                    {step.title}
                  </h4>
                  {/* Description */}
                  <p className="text-[11px] text-slate-500 font-semibold leading-snug mt-0.5 max-w-[95%]">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Desktop Layout (Horizontal Infographic Timeline) ── */}
        <div className="hidden md:block max-w-7xl mx-auto px-6 lg:px-8 mt-4 relative">
          
          {/* Dashed connector line positioned behind circular nodes */}
          <div className="absolute top-[260px] left-[10%] right-[10%] h-0.5 border-t-2 border-dashed border-brand-green/20 z-0" />
          
          {/* Timeline Grid */}
          <div className="grid grid-cols-5 gap-8 text-center relative z-10">
            {STEPS.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center group">
                
                {/* 1. Large Illustration (Top of node) */}
                <div className="w-full h-[220px] flex items-center justify-center relative overflow-hidden shrink-0 bg-[#FAF8F4]/40 rounded-2xl p-2 border border-gray-100/30 group-hover:border-brand-green/10 transition-colors duration-300">
                  <img
                    src={step.img}
                    alt={step.title}
                    className="h-full max-h-[200px] object-contain select-none pointer-events-none filter brightness-[0.98] transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* 2. Step Number (Circular timeline node) */}
                <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center text-xs font-black shadow-md mt-6 z-10 relative border-2 border-white ring-4 ring-brand-green/10 group-hover:scale-110 transition-transform duration-300">
                  {step.num}
                </div>

                {/* 3. Step Title & Description */}
                <div className="mt-4 px-2">
                  <h4 className="text-base font-extrabold text-gray-900 leading-tight group-hover:text-brand-green transition-colors duration-300">
                    {step.title}
                  </h4>
                  <p className="text-xs sm:text-[13px] text-gray-500 font-semibold leading-relaxed mt-2 max-w-[95%] mx-auto">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

