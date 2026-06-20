import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import SectionHeader from '../home/SectionHeader.jsx';

// ─── Curated Kitchen Data Mapper ──────────────────────────────────────────────
const mapBackendFoodToCuratedKitchen = (backendFood) => {
  return {
    dish: {
      id: backendFood._id,
      name: backendFood.name,
      price: backendFood.price,
      image: backendFood.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
    },
    provider: {
      id: backendFood.provider?._id || '',
      name: backendFood.provider?.kitchenName || 'Home Kitchen',
      avatar: backendFood.provider?.avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150',
      rating: (backendFood.provider?.rating || 5.0).toFixed(1),
      experience: backendFood.provider?.experience ? `${backendFood.provider.experience} Yrs Exp` : 'Verified Chef',
      area: backendFood.provider?.area ? `${backendFood.provider.area}, ${backendFood.provider.city || 'Pune'}` : 'Pune',
      specialities: backendFood.provider?.specialities || [],
      tagline: backendFood.provider?.tagline || 'Authentic local home-cooked meals'
    }
  };
};

export default function SubscribedFoodList() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        const response = await api.get('/foods'); 
        const incomingData = response.data?.foodItems || response.data?.foods || response.data?.data || [];
        
        if (response.data?.success || incomingData.length > 0) {
          setFoods(incomingData);
        } else {
          setError('Failed to fetch recommended kitchens');
        }
      } catch (err) {
        console.error('Error fetching subscribed food items:', err);
        setError(err.message || 'Network connectivity error');
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, []);

  const premiumKitchens = useMemo(() => {
    let filtered = foods.filter((item) => {
      const hasRootFlag = item.isSubscribedChef === true;
      const hasProviderFlag = item.provider?.isSubscribed === true;
      const planName = String(item.provider?.subscriptionPlan || item.provider?.planType || '').toUpperCase();
      const hasActivePlan = ['GROWTH', 'PREMIUM'].includes(planName);
      const statusText = String(item.provider?.subscriptionStatus || '').toUpperCase();
      const isStatusActive = statusText === 'ACTIVE';

      return hasRootFlag || hasProviderFlag || hasActivePlan || isStatusActive;
    });

    // Fallback preview patch using active catalog elements
    if (filtered.length === 0 && foods.length > 0) {
      filtered = foods.slice(0, 4); 
    }

    // De-duplicate by provider ID so we show unique kitchens
    const seenProviders = new Set();
    const uniqueKitchens = [];
    
    for (const item of filtered) {
      const pId = item.provider?._id || item._id;
      if (!seenProviders.has(pId)) {
        seenProviders.add(pId);
        uniqueKitchens.push(item);
      }
    }

    return uniqueKitchens.map(mapBackendFoodToCuratedKitchen);
  }, [foods]);

  if (loading) {
    return (
      <div className="mt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-slate-50 border border-slate-100 rounded-2xl h-80 animate-pulse w-full max-w-[340px] mx-auto" />
          ))}
        </div>
      </div>
    );
  }

  if (premiumKitchens.length === 0 || error) return null;

  return (
    <div className="mt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <SectionHeader 
        title="Recommended Partner Kitchens ✨" 
        subtitle="Curated local kitchens, preparing highly rated delicacies in your neighbourhood" 
        showSeeAll={false}
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6 pb-16">
        {premiumKitchens.map((kitchen, idx) => {
          const { provider, dish } = kitchen;
          const specialities = provider.specialities.length > 0
            ? provider.specialities.slice(0, 2).join(', ')
            : 'Traditional Indian Cuisines';

          return (
            <motion.div 
              key={provider.id || `kitchen-${idx}`}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              className="bg-white rounded-2xl overflow-hidden border border-amber-200/50 bg-gradient-to-b from-amber-50/10 to-white shadow-sm hover:shadow-md transition-all flex flex-col h-full group"
            >
              {/* Signature Dish Image Header */}
              <div className="relative aspect-[16/9] overflow-hidden shrink-0">
                <img 
                  src={dish.image} 
                  alt={provider.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" 
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                
                {/* Partner Badge */}
                <span className="absolute top-2.5 right-2.5 bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow">
                  Partner
                </span>

                <div className="absolute bottom-2 left-3 text-[10px] text-white/90 font-semibold truncate max-w-[90%]">
                  Signature dish: {dish.name}
                </div>
              </div>

              {/* Kitchen details */}
              <div className="p-4 flex flex-col flex-1 gap-3">
                
                {/* Avatar and Name */}
                <div className="flex gap-2.5 items-start">
                  <img 
                    src={provider.avatar} 
                    alt={provider.name} 
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow shrink-0 -mt-6 z-10"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm font-extrabold text-gray-900 leading-snug truncate group-hover:text-brand-green transition-colors">
                        {provider.name}
                      </h3>
                      <span className="text-[10px] text-amber-500 font-extrabold flex items-center gap-0.5">
                        ★ {provider.rating}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                      {provider.experience}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-gray-50 pt-2 flex-1">
                  {/* Locality */}
                  <div className="flex items-center gap-1 text-xs text-gray-600 font-semibold">
                    <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span className="truncate">{provider.area}</span>
                  </div>

                  <p className="text-[11px] text-gray-500 font-medium line-clamp-1 italic">
                    "{provider.tagline}"
                  </p>

                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                    Specialties: <span className="text-gray-600 font-bold">{specialities}</span>
                  </p>
                </div>

                {/* View Menu Action */}
                <Link 
                  to={provider.id ? `/provider/${provider.id}` : `/search`}
                  className="mt-2.5 flex items-center justify-center gap-1 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 text-center"
                >
                  View Kitchen Menu
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}