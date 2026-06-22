import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ProviderCTA = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mx-4 sm:mx-6 lg:mx-8 mt-2 mb-4 md:mt-8 md:mb-16 bg-[#FAFBF8] rounded-[24px] sm:rounded-[28px] overflow-hidden border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
    >
      <div className="flex flex-col lg:flex-row lg:min-h-[420px]">

        {/* ── 1. Chef Image (Top on mobile, Left on desktop) ── */}
        <div className="w-full lg:w-[45%] h-[160px] sm:h-[180px] lg:h-auto relative overflow-hidden shrink-0">
          <img
            src="/indian_home_cook.png"
            alt="Warm and smiling local Indian home cook in her home kitchen preparing meals"
            className="absolute inset-0 w-full h-full object-cover filter brightness-[0.98]"
            style={{ objectPosition: 'center 15%' }}
            loading="lazy"
          />
        </div>

        {/* ── Content Container (Headline, Supporting text, Benefits, CTA) ── */}
        <div className="w-full lg:w-[55%] pt-3.5 pb-4 px-4 sm:p-10 lg:p-12 xl:p-16 flex flex-col justify-center bg-white text-left">
          
          {/* Eyebrow Label */}
          <span className="inline-flex items-center gap-1 bg-[#FAFBF8] text-brand-green/80 text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-full w-fit mb-1.5 lg:mb-5 uppercase tracking-widest border border-brand-green/10">
            Join Our Community
          </span>

          {/* 2. Headline */}
          <h2 className="text-[19px] sm:text-2xl lg:text-3xl font-extrabold text-gray-900 leading-[1.15] tracking-tight">
            Become a Home Chef.
          </h2>

          {/* 3. Short Supporting Text */}
          <p className="text-slate-500 font-semibold mt-1.5 sm:mt-2 text-[11px] sm:text-sm leading-relaxed max-w-md">
            Cook from home, set your own timings, and earn from every meal you sell.
          </p>

          {/* 4. Three Key Benefits (Chips on mobile, list on desktop) */}
          <div className="mt-2.5 lg:mt-6 flex flex-wrap gap-1 lg:flex-col lg:gap-0 lg:space-y-3">
            {[
              "Work From Your Own Kitchen",
              "Set Your Own Timings",
              "Earn From Every Meal You Sell"
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-1 bg-brand-green/5 border border-brand-green/10 rounded-full py-0.5 px-2 lg:bg-transparent lg:border-0 lg:p-0">
                <span className="flex items-center justify-center w-3.5 h-3.5 lg:w-5 lg:h-5 rounded-full bg-brand-green/10 text-brand-green text-[9px] lg:text-xs font-bold shrink-0">
                  ✓
                </span>
                <span className="text-[10px] sm:text-xs lg:text-sm font-extrabold text-gray-800">
                  {benefit}
                </span>
              </div>
            ))}
          </div>

          {/* 5. Primary CTA */}
          <div className="mt-3 lg:mt-8 flex flex-col items-start w-full">
            <Link
              to="/chef-signup"
              className="inline-flex items-center justify-center gap-2 bg-brand-green hover:bg-[#083a21] text-white px-6 py-3.5 lg:px-8 lg:py-4 rounded-xl font-bold text-xs uppercase tracking-wider hover:shadow-lg hover:shadow-brand-green/10 active:scale-95 transition-all w-full sm:w-fit cursor-pointer"
            >
              <span>Become a Home Chef</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default ProviderCTA;