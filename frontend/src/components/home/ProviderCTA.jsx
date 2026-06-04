import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const BENEFITS = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Flexible Hours',
    desc: 'Cook and sell on your own schedule.',
  },
  {
    icon: <span className="text-base font-black">0%</span>,
    title: 'Zero Commission',
    desc: 'Keep 100% of what you earn.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: 'Grow Your Fanbase',
    desc: 'Build a loyal local customer base.',
  },
];

const ProviderCTA = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mx-4 sm:mx-6 lg:mx-8 my-12 bg-[#F2F7F2] rounded-[2rem] overflow-hidden border border-[#D8EBD8] shadow-sm"
    >
      <div className="flex flex-col lg:flex-row">

        {/* ── Left: Text ── */}
        <div className="p-8 lg:p-12 lg:w-[38%] flex flex-col justify-center z-20">
          <span className="inline-flex items-center gap-1.5 bg-brand-green/10 text-brand-green text-xs font-bold px-3 py-1.5 rounded-full w-fit mb-4 uppercase tracking-wide">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            For Home Cooks
          </span>

          <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-3 leading-tight tracking-tight">
            Earn from your<br /> cooking skills.
          </h2>
          <p className="text-gray-500 font-medium mb-7 text-sm lg:text-base max-w-xs">
            Join hundreds of home cooks already earning with Shantabai. No restaurant needed.
          </p>

          <Link
            to="/provider/register"
            className="inline-flex items-center gap-2 bg-brand-green text-white px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-brand-green/90 active:scale-95 transition-all shadow-lg shadow-brand-green/25 w-fit"
          >
            Start Selling Today
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        {/* ── Center: Image ── */}
        <div
          className="hidden lg:block lg:w-[38%] relative overflow-hidden"
          style={{ clipPath: 'polygon(8% 0, 100% 0, 100% 100%, 0% 100%)' }}
        >
          <img
            src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=1000"
            alt="Happy Home Cook"
            className="absolute inset-0 w-[115%] h-full object-cover -ml-[8%]"
          />
        </div>

        {/* Mobile Image */}
        <div className="lg:hidden w-full h-56 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800"
            alt="Happy Home Cook"
            className="w-full h-full object-cover object-top"
          />
        </div>

        {/* ── Right: Benefits ── */}
        <div className="lg:w-[24%] p-8 flex flex-col justify-center gap-5 border-t lg:border-t-0 lg:border-l border-[#D8EBD8]">
          {BENEFITS.map((b) => (
            <div key={b.title} className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#D8EBD8] flex items-center justify-center text-brand-green shadow-sm shrink-0">
                {b.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 leading-tight">{b.title}</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5 leading-snug">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProviderCTA;