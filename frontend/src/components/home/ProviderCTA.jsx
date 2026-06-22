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
      className="mx-4 sm:mx-6 lg:mx-8 mt-4 mb-14 md:mt-8 md:mb-16 bg-[#FAFBF8] rounded-[28px] overflow-hidden border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
    >
      <div className="flex flex-col lg:flex-row min-h-[460px]">

        {/* ── 1. Chef Image (Top on mobile, Left on desktop) ── */}
        <div className="w-full lg:w-[45%] h-72 sm:h-96 lg:h-auto relative overflow-hidden shrink-0">
          <img
            src="/indian_home_cook.png"
            alt="Warm and smiling local Indian home cook in her home kitchen preparing meals"
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.98]"
            loading="lazy"
          />
        </div>

        {/* ── Content Container (Headline, Supporting text, Benefits, CTA, Social Proof) ── */}
        <div className="w-full lg:w-[55%] p-6 sm:p-10 lg:p-12 xl:p-16 flex flex-col justify-center bg-white text-left">
          
          {/* Eyebrow Label */}
          <span className="inline-flex items-center gap-1.5 bg-[#FAFBF8] text-brand-green/80 text-[10px] font-black px-3.5 py-1.5 rounded-full w-fit mb-5 uppercase tracking-widest border border-brand-green/10">
            Join Our Community
          </span>

          {/* 2. Headline */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 leading-tight tracking-tight">
            Share Your Cooking.<br />
            Earn From What You Love.
          </h2>

          {/* 3. Short Supporting Text */}
          <p className="text-slate-500 font-semibold mt-3 text-sm sm:text-base leading-relaxed max-w-md">
            Cook from your own kitchen, choose your own timings, and earn by serving homemade food to people nearby.
          </p>

          {/* 4. Three Key Benefits */}
          <div className="mt-6 space-y-3.5">
            {[
              "Work From Your Own Kitchen",
              "Set Your Own Timings",
              "Earn From Every Meal You Sell"
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-green/10 text-brand-green text-xs font-bold shrink-0">
                  ✓
                </span>
                <span className="text-sm sm:text-base font-extrabold text-gray-800">
                  {benefit}
                </span>
              </div>
            ))}
          </div>

          {/* 5. Primary CTA & 6. Social Proof */}
          <div className="mt-8 flex flex-col items-start gap-3 w-full">
            <Link
              to="/chef-signup"
              className="inline-flex items-center justify-center gap-2 bg-brand-green hover:bg-[#083a21] text-white px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-wider hover:shadow-lg hover:shadow-brand-green/10 active:scale-95 transition-all w-full sm:w-fit cursor-pointer"
            >
              <span>Become a Home Chef</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            
            <span className="text-xs text-slate-400 font-semibold">
              Trusted by home cooks across Mumbai & Pune.
            </span>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default ProviderCTA;