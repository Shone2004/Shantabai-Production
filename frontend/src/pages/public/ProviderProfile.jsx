import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import FoodCard from '../../components/food/FoodCard.jsx';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const provider = {
  id: 'c1',
  name: "Sunita's Kitchen",
  tagline: 'Authentic Maharashtrian · North Indian · Healthy Tiffins',
  location: 'Baner, Pune',
  distance: '1.2 km away',
  coverImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400',
  avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=300',
  isVerified: true,
  isAvailable: true,
  rating: 4.9,
  totalReviews: 248,
  experience: '8+ Yrs',
  hygiene: 'Certified',
  repeatRate: '94%',
  startingPrice: 80,
  about:
    "Hi! I'm Sunita, a home cook from Baner with a passion for traditional Maharashtrian cooking. I prepare fresh, oil-controlled meals every day using locally sourced vegetables. Every dish is made to order — no reheating, no preservatives. I cater to bachelors, working professionals and families who want ghar ka khana without any compromise.",
  specialities: ['Veg Thali', 'Poha', 'Sabudana Khichdi', 'Puran Poli', 'Misal Pav'],
  whyBook: [
    'FSSAI Registered Kitchen',
    'Oil-controlled, low-spice options',
    'Customisable meal plans',
    'Fresh ingredients sourced daily',
    'Packaging in food-grade containers',
  ],
};

const mockMenu = [
  {
    id: 'f1',
    name: "Aai's Veg Thali",
    price: 99,
    pricePer: 'per plate',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800',
    description: 'Authentic Maharashtrian thali with 2 sabzis, dal, rice, and chapatis.',
    availabilityDetails: { isAvailable: true, ordersToday: 12, left: 3, total: 20 },
    timeWindow: '12:30 - 2:00 PM',
    location: 'Baner, Pune',
    distance: '1.2 km away',
    tags: ['Veg', 'Authentic', 'Homemade'],
    provider: { name: "Sunita's Kitchen", avatar: provider.avatar, rating: 4.9, ordersCount: '500+', isVerified: true, badges: [] },
  },
  {
    id: 'f4',
    name: 'Poha',
    price: 40,
    pricePer: 'per plate',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
    description: 'Soft and light poha with peanuts, curry leaves, lemon and mild spices.',
    availabilityDetails: { isAvailable: true, ordersToday: 7, left: 7, total: 15 },
    timeWindow: '9:00 - 10:00 AM',
    location: 'Baner, Pune',
    distance: '1.2 km away',
    tags: ['Veg', 'Healthy', 'Homemade'],
    provider: { name: "Sunita's Kitchen", avatar: provider.avatar, rating: 4.9, ordersCount: '500+', isVerified: true, badges: [] },
  },
  {
    id: 'f10',
    name: 'Sabudana Khichdi',
    price: 50,
    pricePer: 'per plate',
    image: 'https://images.unsplash.com/photo-1626074964464-f6df4149dc8c?w=800',
    description: 'Soft tapioca pearls with crushed peanuts, potatoes, and cumin.',
    availabilityDetails: { isAvailable: true, ordersToday: 18, left: 5, total: 25 },
    timeWindow: '9:00 - 12:00 PM',
    location: 'Baner, Pune',
    distance: '1.2 km away',
    tags: ['Veg', 'Fasting', 'Healthy'],
    provider: { name: "Sunita's Kitchen", avatar: provider.avatar, rating: 4.9, ordersCount: '500+', isVerified: true, badges: [] },
  },
];

const STATS = [
  {
    label: 'Rating',
    value: '4.9',
    icon: (
      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ),
    sub: '248 reviews',
  },
  {
    label: 'Experience',
    value: '8+ Yrs',
    icon: <span className="text-brand-green text-base">🍳</span>,
    sub: 'Home cooking',
  },
  {
    label: 'Hygiene',
    value: 'Certified',
    icon: (
      <svg className="w-4 h-4 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    sub: 'FSSAI registered',
  },
  {
    label: 'Repeat Rate',
    value: '94%',
    icon: <span className="text-brand-green text-base">🔄</span>,
    sub: 'Loyal customers',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProviderProfile() {
  const [activeTab, setActiveTab] = useState('menu');

  return (
    <div className="bg-gray-50 min-h-screen pb-20 md:pb-0">

      {/* ── Cover Banner ── */}
      <div className="relative h-52 sm:h-64 lg:h-72 overflow-hidden">
        <img
          src={provider.coverImage}
          alt="Kitchen cover"
          className="w-full h-full object-cover"
        />
        {/* Clean dark gradient — no colour tinting */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Availability pill */}
        {provider.isAvailable && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-4 left-4 sm:left-6 flex items-center gap-2 bg-white/95 backdrop-blur-sm text-xs font-bold text-gray-800 px-3 py-1.5 rounded-full shadow-md"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Available for booking today
          </motion.div>
        )}
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ══ LEFT COLUMN ══ */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Top: Avatar + Name + Location */}
              <div className="flex items-start gap-4 p-6 pb-5">
                <div className="relative shrink-0">
                  <img
                    src={provider.avatar}
                    alt={provider.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md"
                  />
                  {provider.isVerified && (
                    <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-brand-green rounded-full flex items-center justify-center border-2 border-white">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <h1 className="text-xl font-black text-gray-900 leading-tight">{provider.name}</h1>
                      <p className="text-sm text-gray-500 font-medium mt-0.5">{provider.tagline}</p>
                    </div>
                    <button className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500 font-medium">
                    <svg className="w-3.5 h-3.5 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {provider.location}
                    <span className="text-gray-300 mx-1">·</span>
                    {provider.distance}
                  </div>

                  {/* Speciality tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {provider.specialities.slice(0, 4).map((s) => (
                      <span key={s} className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                        {s}
                      </span>
                    ))}
                    {provider.specialities.length > 4 && (
                      <span className="text-[11px] font-semibold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                        +{provider.specialities.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Stats row */}
              <div className="grid grid-cols-4 divide-x divide-gray-100">
                {STATS.map((stat) => (
                  <div key={stat.label} className="flex flex-col items-center py-4 px-2 gap-1">
                    <div className="flex items-center gap-1">
                      {stat.icon}
                      <span className="text-sm font-black text-gray-900">{stat.value}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-center">{stat.label}</span>
                    <span className="text-[10px] text-gray-400 font-medium hidden sm:block">{stat.sub}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── Tabs ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex border-b border-gray-100">
                {['menu', 'about', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3.5 text-sm font-bold capitalize transition-colors relative ${
                      activeTab === tab ? 'text-brand-green' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-green"
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {/* Menu Tab */}
                {activeTab === 'menu' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10">
                    {mockMenu.map((food, idx) => (
                      <motion.div
                        key={food.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="flex justify-center"
                      >
                        <FoodCard food={food} />
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* About Tab */}
                {activeTab === 'about' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-5"
                  >
                    <div>
                      <h3 className="text-sm font-black text-gray-900 mb-2">About the Cook</h3>
                      <p className="text-sm text-gray-500 leading-relaxed font-medium">{provider.about}</p>
                    </div>
                    <div className="border-t border-gray-100 pt-5">
                      <h3 className="text-sm font-black text-gray-900 mb-3">Specialities</h3>
                      <div className="flex flex-wrap gap-2">
                        {provider.specialities.map((s) => (
                          <span key={s} className="text-xs font-semibold bg-brand-light text-brand-green px-3 py-1.5 rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-10 text-center gap-3"
                  >
                    <div className="text-4xl">⭐</div>
                    <p className="text-2xl font-black text-gray-900">4.9 / 5.0</p>
                    <p className="text-sm text-gray-400 font-medium">Based on {provider.totalReviews} reviews</p>
                    <p className="text-xs text-gray-300 mt-2">Full reviews coming soon</p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* ══ RIGHT SIDEBAR ══ */}
          <div className="w-full lg:w-80 shrink-0 space-y-4 lg:sticky lg:top-24">

            {/* Booking Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.45 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
            >
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Starting rate</p>
              <div className="flex items-baseline gap-1.5 mb-5">
                <span className="text-3xl font-black text-gray-900">₹{provider.startingPrice}</span>
                <span className="text-sm text-gray-400 font-medium">/ meal</span>
              </div>

              <button className="w-full bg-brand-green text-white py-3.5 rounded-xl font-bold text-sm hover:bg-brand-green/90 active:scale-[0.98] transition-all shadow-md shadow-brand-green/20">
                Request Booking
              </button>
              <button className="w-full mt-2.5 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                Message Cook
              </button>

              <p className="text-center text-xs text-gray-400 font-medium mt-3">
                Free cancellation · No advance payment
              </p>
            </motion.div>

            {/* Why Book Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.45 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <h3 className="text-sm font-black text-gray-900 mb-4">Why book through Shantabai?</h3>
              <ul className="space-y-3">
                {provider.whyBook.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600 font-medium">
                    <div className="w-4 h-4 rounded-full bg-brand-light flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-2.5 h-2.5 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Share */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.45 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <h3 className="text-sm font-black text-gray-900 mb-3">Share this cook</h3>
              <div className="flex gap-2">
                {['WhatsApp', 'Copy link'].map((action) => (
                  <button
                    key={action}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}