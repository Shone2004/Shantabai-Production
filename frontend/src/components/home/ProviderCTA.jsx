import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, Shield, Users } from 'lucide-react';

const BENEFITS = [
  {
    icon: <Clock className="w-5 h-5" />,
    title: 'Cook on Your Schedule',
    desc: 'You decide the days, menu, and time slots. Complete flexibility.',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Keep 100% Earnings',
    desc: 'Direct customer payments with zero commission fees.',
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: 'Feed Your Community',
    desc: 'Share your recipes and build a loyal customer base of neighbours.',
  },
];

const ProviderCTA = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mx-4 sm:mx-6 lg:mx-8 my-14 bg-[#FAFBF8] rounded-2xl overflow-hidden border border-gray-150 shadow-sm"
    >
      <div className="flex flex-col lg:flex-row">

        {/* ── Left: Text ── */}
        <div className="p-8 lg:p-12 lg:w-1/2 flex flex-col justify-center">
          <span className="inline-flex items-center gap-1.5 bg-brand-green/10 text-brand-green text-[10px] font-black px-3.5 py-1.5 rounded-full w-fit mb-5 uppercase tracking-widest">
            Home Chef Onboarding
          </span>

          <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4 leading-tight tracking-tight">
            Start a home kitchen business from your house.
          </h2>
          <p className="text-gray-500 font-semibold mb-8 text-sm lg:text-base max-w-md leading-relaxed">
            Turn your culinary passion into direct income. Empower your neighborhood with fresh, healthy home food. No professional restaurant experience required.
          </p>

          <Link
            to="/chef-signup"
            className="inline-flex items-center justify-center gap-2 bg-brand-green hover:bg-[#083a21] text-white px-7 py-4 rounded-xl font-bold text-xs uppercase tracking-wider hover:shadow-lg hover:shadow-brand-green/10 active:scale-95 transition-all w-full sm:w-fit cursor-pointer"
          >
            <span>Become a Cook</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        {/* ── Center: Authentic Image ── */}
        <div className="lg:w-1/4 relative overflow-hidden h-64 lg:h-auto shrink-0">
          <img
            src="/indian_home_cook.png"
            alt="Warm and smiling local Indian home cook in her home kitchen"
            className="absolute inset-0 w-full h-full object-cover object-center"
            loading="lazy"
          />
        </div>

        {/* ── Right: Benefits ── */}
        <div className="lg:w-1/4 p-8 flex flex-col justify-center gap-6 border-t lg:border-t-0 lg:border-l border-gray-150 bg-white">
          {BENEFITS.map((b, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#EBF3ED] flex items-center justify-center text-[#0A4D2B] shrink-0 shadow-sm border border-brand-green/5">
                {b.icon}
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-gray-900 leading-snug">{b.title}</p>
                <p className="text-xs text-gray-500 font-semibold mt-1 leading-normal">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProviderCTA;