import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Hero from '../../components/home/Hero.jsx';
import Categories from '../../components/home/Categories.jsx';
import SectionHeader from '../../components/home/SectionHeader.jsx';
import FoodCard from '../../components/food/FoodCard.jsx';
import CookCard from '../../components/home/CookCard.jsx';
import ProviderCTA from '../../components/home/ProviderCTA.jsx';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useGeoLocation from "../../hooks/useGeoLocation";
// ─── New components ───────────────────────────────────────────────────────────
import ChefSection from '../../components/chef/ChefSection.jsx';
import AIConsultant from '../../components/ai/AIConsultant.jsx';
import SubscribedFoodList from '../../components/home/SubscribedFoodList.jsx';
import HeroCarousel from '../../components/home/HeroCarousel.jsx';

// ─── Backend Food Mapper ──────────────────────────────────────────────────────
const mapBackendFoodToCard = (backendFood) => {
  const isAvailable = backendFood.status === "available" && backendFood.quantity > 0;
  
  return {
    id: backendFood._id,
    name: backendFood.name,
    price: backendFood.price,
    pricePer: backendFood.pricePer || 'per plate',
    image: backendFood.images?.[0] || 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
    description: backendFood.description,
    availabilityDetails: {
      isAvailable: isAvailable,
      ordersToday: backendFood.ordersToday || 0,
      left: backendFood.quantity || 0,
      total: backendFood.totalQuantity || backendFood.quantity || 0
    },
    serviceDate: backendFood.serviceDate,
    startTime: backendFood.startTime,
    endTime: backendFood.endTime,
    timeWindow: backendFood.timeWindow || '12:00 - 2:00 PM',
    location: backendFood.provider ? `${backendFood.provider.area}, ${backendFood.provider.city}` : 'Pune',
    distance: '1.5 km away',
    bringContainer: backendFood.bringContainer,
    isVeg: backendFood.isVeg,
    tags: [
      backendFood.isVeg ? 'Veg' : 'Non-Veg',
      ...(backendFood.tags || [])
    ],
    provider: {
      name: backendFood.provider?.kitchenName || 'Home Cook',
      avatar: backendFood.provider?.avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150',
      rating: backendFood.provider?.rating || 4.8,
      ordersCount: '100+',
      isVerified: true,
      badges: []
    }
  };
};

const cardVariants = {
  hidden:  { opacity: 0, y: 40, scale: 0.94 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', bounce: 0.4, duration: 0.7, delay: i * 0.08 },
  }),
};

const TRUST_PILLARS = [
  { emoji: '🛡️', title: 'Verified Identity', desc: 'Secure cook verification' },
  { emoji: '🏠', title: 'Kitchen Approved', desc: 'Hygiene & safety checked' },
  { emoji: '🤝', title: 'Community Cooks', desc: 'Real local neighbours' },
  { emoji: '🥗', title: 'Fresh Daily Listings', desc: 'Cooked fresh today' },
];

const FOOTER_LINKS = {
  Company: [
    { label: 'About Us',  to: '/about'        },
    { label: 'Careers',   to: '/careers'      },
    { label: 'Contact',   to: '/contact'      },
    { label: 'Blog',      to: '/blog'         },
  ],
  Legal: [
    { label: 'Privacy Policy',   to: '/privacy'  },
    { label: 'Terms of Service', to: '/terms'    },
    { label: 'FAQ',              to: '/faq'      },
    { label: 'Cookie Policy',    to: '/cookies'  },
  ],
  Explore: [
    { label: 'Browse Food', to: '/food' },
    { label: 'Find Cooks', to: '/search' },
    { label: 'Become a Cook', to: '/chef-signup' },
    { label: 'How it Works', to: '/how-it-works' },
  ],
};

export default function HomePage() {
  const navigate = useNavigate();
  const [showAI, setShowAI] = useState(false);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cooks, setCooks] = useState([]);
  const [cooksLoading, setCooksLoading] = useState(true);
  useGeoLocation();

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await api.get('/foods');
        if (response.data.success) {
          setFoods(response.data.foodItems);
        } else {
          setError('Failed to fetch food items');
        }
      } catch (err) {
        console.error('Error fetching foods:', err);
        setError('Could not connect to service. Please verify server state.');
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();

    // Fetch approved providers for the Nearby Home Cooks section
    const fetchCooks = async () => {
      try {
        const res = await api.get('/providers');
        if (res.data.success) {
          setCooks(res.data.providers.slice(0, 4).map(p => ({
            id: p._id,
            name: p.kitchenName || 'Home Cook',
            rating: (p.rating || 5.0).toFixed(1),
            orders: p.totalReviews > 0 ? `${p.totalReviews}+` : '10+',
            distance: '1.2 km away',
            image: p.avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400',
            area: p.area ? `${p.area}, ${p.city || 'Pune'}` : 'Pune',
            experience: p.experience ? `${p.experience} Yrs Exp` : 'Verified Chef',
            specialities: p.specialities || []
          })));
        }
      } catch (err) {
        console.error('Error fetching cooks:', err);
      } finally {
        setCooksLoading(false);
      }
    };
    fetchCooks();
  }, []);

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">

      {/* Hero (contains Mobile Compact Search & Desktop search) */}
      <Hero />

      {/* ── Categories (Moved Up) ── */}
      <div className="max-w-7xl mx-auto mt-2 px-4 sm:px-6 lg:px-8">
        <SectionHeader title="What are you craving?" showSeeAll link="/food" />
        <Categories />
      </div>

      {/* ── Hero Carousel (Moved Up) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5 mb-2">
        <HeroCarousel />
      </div>

      {/* ── Recommended Partner Kitchens (Hidden on Mobile) ── */}
      <div className="hidden lg:block">
        <SubscribedFoodList />
      </div>

      <div className="max-w-7xl mx-auto">

        {/* ── Popular Near You (Horizontal Scroll Carousel on Mobile/Tablet) ── */}
        <div className="mt-6 md:mt-10">
          <SectionHeader
            title="Popular Near You"
            subtitle="Fresh picks from local kitchens this morning"
            showSeeAll link="/food"
          />
          {loading ? (
            <div className="flex lg:grid lg:grid-cols-4 gap-4 md:gap-6 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 px-4 sm:px-6 lg:px-8 mt-6 hide-scrollbar">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="bg-slate-50 border border-slate-100 rounded-2xl h-64 animate-pulse shrink-0 w-[180px] sm:w-[220px] lg:w-auto" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 text-rose-500 font-bold text-sm">
              ⚠️ {error}
            </div>
          ) : foods.length === 0 ? (
            <div className="text-center py-16 text-slate-400 font-bold text-sm bg-slate-50/50 rounded-2xl mx-4">
              🍲 No fresh local thalis or food items live right now.
            </div>
          ) : (
            <div className="flex lg:grid lg:grid-cols-4 gap-4 md:gap-6 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 px-4 sm:px-6 lg:px-8 mt-6 hide-scrollbar">
              {foods.slice(0, 4).map((food, idx) => (
                <motion.div key={food._id} custom={idx} variants={cardVariants} initial="hidden"
                  whileInView="visible" viewport={{ once: true, margin: '-40px' }} className="shrink-0 w-[180px] sm:w-[220px] lg:w-auto flex justify-center">
                  <FoodCard food={mapBackendFoodToCard(food)} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* ── Premium Maharashtrian Food Banner (Editorial Break) ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-[28px] md:my-[32px]">
          <div 
            className="relative w-full aspect-[3/1] rounded-[24px] overflow-hidden shadow-xl border border-gray-100/10 flex items-center bg-[#021F12] group"
            style={{ contentVisibility: 'auto' }}
          >
            {/* Background Image with slow hover scale */}
            <img
              src="/banners/maharashtrian_food_banner.png"
              alt="Authentic Maharashtrian homemade food thali"
              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none opacity-100 transition-transform duration-[1500ms] ease-out group-hover:scale-[1.03]"
              loading="lazy"
            />

            {/* Premium Dark Green Gradient Overlay with Backdrop Blur */}
            <div className="absolute inset-y-0 left-0 w-[65%] sm:w-[50%] bg-gradient-to-r from-[#021F12]/92 via-[#021F12]/60 to-transparent backdrop-blur-[3px] pointer-events-none z-10" />

            {/* Soft Vignette Overlay */}
            <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(3,30,18,0.55)] pointer-events-none z-20" />

            {/* Text Overlay Content */}
            <div className="relative z-30 pl-6 pr-4 sm:pl-12 md:pl-16 lg:pl-20 text-white flex flex-col justify-center max-w-[65%] sm:max-w-[50%]">
              <h2 className="text-lg sm:text-3xl md:text-4xl lg:text-5xl xl:text-[3.5rem] font-black tracking-[-0.035em] leading-[0.95] text-[#FAF6EE] select-text">
                Aai Chya Hathacha Swaad. Ata Tumchya Jawal.
              </h2>
              <p className="text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg text-[#EFE9DC]/90 font-medium mt-1.5 sm:mt-3.5 leading-snug select-text max-w-[85%] sm:max-w-[70%]">
                Fresh homemade meals from trusted neighbourhood kitchens.
              </p>
            </div>
          </div>
        </div>

        {/* ── Trending Today (Horizontal Scroll Carousel on Mobile/Tablet) ── */}
        <div className="mt-6 md:mt-10 bg-gray-50 py-8 md:py-10 rounded-2xl md:rounded-[2.5rem] mx-2 sm:mx-6 lg:mx-8 mb-8 border border-gray-100">
          <SectionHeader title="Trending Today 🔥" subtitle="Most ordered in the last 24 hours" showSeeAll link="/food" />
          {loading ? (
            <div className="flex lg:grid lg:grid-cols-4 gap-4 md:gap-6 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 px-4 sm:px-6 lg:px-8 mt-6 hide-scrollbar">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="bg-white border border-slate-100 rounded-2xl h-64 animate-pulse shrink-0 w-[180px] sm:w-[220px] lg:w-auto" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 text-rose-500 font-bold text-sm">
              ⚠️ {error}
            </div>
          ) : foods.length === 0 ? (
            <div className="text-center py-16 text-slate-400 font-bold text-sm bg-white rounded-2xl mx-4">
              🍲 No trending items right now. Check back soon!
            </div>
          ) : (
            <div className="flex lg:grid lg:grid-cols-4 gap-4 md:gap-6 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 px-4 sm:px-6 lg:px-8 mt-6 hide-scrollbar">
              {foods.slice(4, 8).concat(foods.slice(0, Math.max(0, 4 - foods.length + 4))).slice(0, 4).map((food, idx) => (
                <motion.div key={food._id} custom={idx} variants={cardVariants} initial="hidden"
                  whileInView="visible" viewport={{ once: true, margin: '-40px' }} className="shrink-0 w-[180px] sm:w-[220px] lg:w-auto flex justify-center">
                  <FoodCard food={mapBackendFoodToCard(food)} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* ── Nearby Home Cooks (Horizontal Scroll Carousel on Mobile/Tablet) ── */}
        <div className="mt-6 md:mt-10">
          <SectionHeader title="Nearby Home Cooks" subtitle="Trusted kitchens just around the corner" showSeeAll link="/search" />
          {cooksLoading ? (
            <div className="flex lg:grid lg:grid-cols-4 gap-4 md:gap-6 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 px-4 sm:px-6 lg:px-8 mt-6 hide-scrollbar">
              {[1,2,3,4].map(n => (
                <div key={n} className="bg-slate-50 border border-slate-100 rounded-2xl h-[220px] animate-pulse shrink-0 w-[210px] sm:w-[240px] lg:w-auto" />
              ))}
            </div>
          ) : cooks.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-medium text-sm mx-4">
              🍳 No verified home cooks registered yet. Check back soon!
            </div>
          ) : (
            <div className="flex lg:grid lg:grid-cols-4 gap-4 md:gap-6 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 px-4 sm:px-6 lg:px-8 mt-4 hide-scrollbar">
              {cooks.map((cook, idx) => (
                <motion.div key={cook.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.45, delay: idx * 0.09 }}
                  className="shrink-0 w-[210px] sm:w-[240px] lg:w-auto">
                  <CookCard cook={cook} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* ── Trust Strip (Relocated Lower Down) ── */}
        <div className="bg-brand-green py-6 rounded-2xl md:rounded-[2rem] mx-2 sm:mx-6 lg:mx-8 mt-10 md:mt-14 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            {TRUST_PILLARS.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 px-4 sm:justify-center first:pt-0 pt-4 sm:pt-0">
                <span className="text-xl sm:text-2xl shrink-0">{item.emoji}</span>
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-extrabold text-white leading-tight">{item.title}</p>
                  <p className="text-[10px] sm:text-xs font-semibold text-white/60 leading-tight mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Trust & Safety Section (New) ── */}
        <div className="mt-4 mb-10 bg-slate-50/50 border border-slate-100 py-8 md:py-12 px-6 sm:px-8 rounded-2xl md:rounded-[2rem] mx-2 sm:mx-6 lg:mx-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#0A4D2B] bg-[#EBF3ED] px-3.5 py-1.5 rounded-full">
              Trust &amp; Safety
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mt-4">
              Wholesome food prepared with absolute trust
            </h2>
            <p className="text-sm text-gray-500 font-semibold mt-2">
              We maintain strict verification and quality controls to ensure peace of mind with every order.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
              <span className="text-3xl shrink-0">🛡️</span>
              <div className="text-left">
                <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">Identity &amp; Kitchen Verified</h4>
                <p className="text-xs text-gray-500 font-semibold leading-relaxed mt-1">
                  Every home cook is government ID verified and their kitchen undergoes physical hygiene audits before active listing status.
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
              <span className="text-3xl shrink-0">🥗</span>
              <div className="text-left">
                <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">Hygienic Home Kitchens</h4>
                <p className="text-xs text-gray-500 font-semibold leading-relaxed mt-1">
                  Meals are prepared in clean domestic kitchens in small batches. No commercial flavorings, additives, or recycled oils.
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
              <span className="text-3xl shrink-0">🤝</span>
              <div className="text-left">
                <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">Neighbourhood Support</h4>
                <p className="text-xs text-gray-500 font-semibold leading-relaxed mt-1">
                  Real feedback and ratings from verified local customers. Support local women entrepreneurs and home cooks directly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Chef Section (Dietary AI Consultant) ── */}
        <div className="mt-8">
          <ChefSection
            onConsultAI={() => setShowAI(true)}
          />
        </div>

        {/* ── Provider CTA ── */}
        <ProviderCTA />

      </div>

      {/* ── AI Consultant Modal ── */}
      {showAI && (
        <AIConsultant
          onClose={() => setShowAI(false)}
          onBookChef={(chef) => {
            setShowAI(false);
            navigate(`/provider/${chef.id}`);
          }}
        />
      )}

      {/* ── Footer ── */}
      <motion.footer
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.7 }}
        className="bg-gray-950 text-white mt-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 border-b border-white/8 pb-10 mb-8">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-brand-green rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span className="text-xl font-extrabold tracking-tight">Shantabai</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                Empowering home chefs and bringing fresh, healthy, affordable meals to your doorstep. Ghar ka khana, pyar ka swaad.
              </p>
              <div className="flex gap-3 pt-1">
                {[
                  { label: 'Twitter',   path: 'M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z' },
                  { label: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
                ].map((social) => (
                  <a key={social.label} href="#" aria-label={social.label}
                    className="w-9 h-9 rounded-full bg-white/8 hover:bg-brand-green flex items-center justify-center transition-colors duration-200">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d={social.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
            {Object.entries(FOOTER_LINKS).map(([group, links]) => (
              <div key={group}>
                <h4 className="font-bold text-sm text-white mb-4 tracking-wide">{group}</h4>
                <ul className="space-y-2.5">
                  {links.map((l) => (
                    <li key={l.label}>
                      <Link to={l.to} className="text-gray-400 text-sm hover:text-white transition-colors duration-150 font-medium">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-gray-500 text-xs">
            <p>© 2026 Shantabai. All rights reserved. Made with ❤️ by UNEXPECTED SOLUTIONS</p>
            <p className="font-medium">🇮🇳 Proudly Indian</p>
          </div>
        </div>
      </motion.footer>

    </div>
  );
}