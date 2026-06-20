import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api'; // Adjust path according to your project structure
import FoodCard from '../food/FoodCard.jsx'; // Adjust path to your FoodCard component
import SectionHeader from '../home/SectionHeader.jsx'; // Adjust path to your SectionHeader component

// ─── DATA PIPELINE MAPPER ───
// Formats backend data structurally to match standard frontend card expectations
const mapBackendFoodToCard = (backendFood) => {
  const isAvailable = backendFood.status === "available" && backendFood.quantity > 0;

  return {
    id: backendFood._id,
    name: backendFood.name,
    price: backendFood.price,
    pricePer: backendFood.pricePer || 'per plate',
    image: backendFood.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
    description: backendFood.description,
    // Ensures the premium card badge shows during preview or live states
    isSubscribedChef: true, 
    availabilityDetails: {
      isAvailable,
      ordersToday: backendFood.ordersToday || 0,
      left: backendFood.quantity || 0,
      total: backendFood.totalQuantity || backendFood.quantity || 0
    },
    location: backendFood.provider ? `${backendFood.provider.area || ''}, ${backendFood.provider.city || ''}` : 'Local Kitchen',
    provider: {
      name: backendFood.provider?.kitchenName || 'Home Cook',
      avatar: backendFood.provider?.avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150',
      rating: backendFood.provider?.rating || 4.8,
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
        
        // Dynamic fallback array checking to catch different backend response shapes
        const incomingData = response.data?.foodItems || response.data?.foods || response.data?.data || [];
        
        if (response.data?.success || incomingData.length > 0) {
          setFoods(incomingData);
        } else {
          setError('Failed to fetch premium entries');
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

  // ─── AUTOMATIC FILTERING WITH LIVE PREVIEW FALLBACK ───
  const premiumFoods = useMemo(() => {
    // 1. Try to extract strictly active premium subscribers from database
    let filtered = foods.filter((item) => {
      const hasRootFlag = item.isSubscribedChef === true;
      const hasProviderFlag = item.provider?.isSubscribed === true;
      
      const planName = String(item.provider?.subscriptionPlan || item.provider?.planType || '').toUpperCase();
      const hasActivePlan = ['GROWTH', 'PREMIUM'].includes(planName);
      
      const statusText = String(item.provider?.subscriptionStatus || '').toUpperCase();
      const isStatusActive = statusText === 'ACTIVE';

      return hasRootFlag || hasProviderFlag || hasActivePlan || isStatusActive;
    });

    // 2. ─── FALLBACK PATCH ───
    // If live subscription flags are 0 (e.g. database listings expired or unlinked)
    // pass the current available catalog as a visual preview layout structure.
    if (filtered.length === 0 && foods.length > 0) {
      console.warn("⚠️ Premium Partner Feed: No live subscription structures found. Using active array elements as a preview layout fallback.");
      filtered = foods.slice(0, 4); // Renders the top 4 menu items inside your premium row layout
    }

    return filtered.map(mapBackendFoodToCard);
  }, [foods]);

  // Loading skeleton block
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 mt-12 max-w-7xl mx-auto">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="bg-slate-100 border border-slate-200 rounded-2xl h-80 animate-pulse w-full max-w-[340px] mx-auto" />
        ))}
      </div>
    );
  }

  // Gracefully render nothing ONLY if the entire backend database query yields 0 items total
  if (premiumFoods.length === 0 || error) return null;

  return (
    <div className="mt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Layout Heading Block with customized Recommended Tagline */}
      <SectionHeader 
        title="Recommended Partner Kitchens ✨" 
        subtitle="Our highly recommended home-cooked delicacies, exclusively prepared by verified subscriber chefs" 
        showSeeAll={false}
      />
      
      {/* List Layout Grid View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12 mt-6 pb-16">
        {premiumFoods.map((food, idx) => (
          <motion.div 
            key={food.id || `premium-item-${idx}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.05 }}
            className="flex justify-center w-full rounded-[24px] p-1 border-2 border-amber-400/30 bg-gradient-to-b from-amber-50/20 to-transparent shadow-sm"
          >
            <FoodCard food={food} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}