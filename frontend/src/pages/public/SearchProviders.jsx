import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CookFilter from '../../components/search/CookFilter.jsx';
import api from '../../services/api';

export default function SearchProviders() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  
  // Mobile Filter Drawer State
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // New Complex Filter State
  const [filters, setFilters] = useState({
    location: '',
    cuisines: [],
    dietary: [],
    availability: 'Anytime',
    rating: 'any',
    maxPrice: 1000,
    services: []
  });




  const [chefs, setChefs] = useState([]);
  const [filteredChefs, setFilteredChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChefs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/providers');
        if (response.data.success) {
          const mappedChefs = response.data.providers.map(p => ({
            id: p._id,
            name: p.kitchenName || 'Home Cook',
            specialty: p.specialities?.join(', ') || 'Home Cooked Meals',
            cuisines: p.specialities || [],
            // Use actual dietaryType from ProviderProfile — not a hardcoded fallback
            dietary: Array.isArray(p.dietaryType) && p.dietaryType.length > 0
              ? p.dietaryType
              : [],
            availability: p.isAvailable ? 'Anytime' : 'Unavailable',
            // Use actual serviceTypes from ProviderProfile
            services: Array.isArray(p.serviceTypes) && p.serviceTypes.length > 0
              ? p.serviceTypes
              : [],
            experience: `${p.experience || 0}+ Years Exp`,
            rating: p.rating || 5.0,
            reviews: p.totalReviews || 0,
            price: p.startingPrice || 0,
            avatar: p.avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400',
            locality: `${p.area || ''}, ${p.city || ''}`.replace(/^, |, $/, ''),
            description: p.bio || ''
          }));
          setChefs(mappedChefs);
          setFilteredChefs(mappedChefs);
        }
      } catch (err) {
        console.error('Error fetching chefs:', err);
        setError('Failed to load home cooks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchChefs();
  }, []);


  useEffect(() => {
    if (loading) return;
    let result = chefs;
    
    // 1. Text Search
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        chef =>
          chef.name.toLowerCase().includes(q) ||
          chef.specialty.toLowerCase().includes(q) ||
          chef.locality.toLowerCase().includes(q)
      );
    }

    // 2. Location
    if (filters.location.trim() !== '') {
      result = result.filter(chef => chef.locality.toLowerCase().includes(filters.location.toLowerCase()));
    }

    // 3. Cuisines (Chef must have AT LEAST ONE of selected cuisines)
    if (filters.cuisines.length > 0) {
      result = result.filter(chef => 
        filters.cuisines.some(c => chef.cuisines.includes(c))
      );
    }

    // 4. Dietary (Chef must have ALL selected dietary preferences)
    if (filters.dietary.length > 0) {
      result = result.filter(chef => 
        filters.dietary.every(d => chef.dietary.includes(d))
      );
    }

    // 5. Availability
    if (filters.availability && filters.availability !== 'Anytime') {
      result = result.filter(chef => 
        chef.availability === filters.availability || chef.availability === 'Anytime'
      );
    }

    // 6. Rating
    if (filters.rating !== 'any') {
      const minRating = parseFloat(filters.rating);
      result = result.filter(chef => chef.rating >= minRating);
    }

    // 7. Max Price
    if (filters.maxPrice) {
      result = result.filter(chef => chef.price <= filters.maxPrice);
    }

    // 8. Services (Chef must have ALL selected services)
    if (filters.services.length > 0) {
      result = result.filter(chef => 
        filters.services.every(s => chef.services.includes(s))
      );
    }

    setFilteredChefs(result);
  }, [chefs, searchQuery, filters, loading]);

  return (
    <div className="min-h-screen bg-slate-50/30 text-slate-800 font-sans selection:bg-brand-green selection:text-white pb-24">
      {/* Sticky Header/Search Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/60 shadow-sm transition-all pt-4 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex gap-4 items-center w-full">
            {/* Search Bar */}
            <div className="flex-1 relative group">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a specific cook or dish (e.g. 'Sunita' or 'Poha')..."
                className="w-full bg-gray-50 border border-gray-200 focus:border-brand-green focus:bg-white focus:ring-4 focus:ring-brand-green/10 rounded-2xl pl-12 pr-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none transition-all duration-300"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3.5 pointer-events-none group-focus-within:text-brand-green transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Mobile Filter Toggle */}
            <button 
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden shrink-0 flex items-center justify-center bg-gray-50 border border-gray-200 text-gray-700 w-12 h-12 rounded-2xl hover:bg-brand-light hover:text-brand-green transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-2">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              Find Home Cooks
            </h2>
            <p className="text-gray-500 font-medium mt-1 text-sm">Discover local kitchens tailored to your taste.</p>
          </div>
          <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 shrink-0">
            <span className="text-sm font-semibold text-gray-600">Showing <span className="text-brand-green font-bold">{filteredChefs.length}</span> cooks</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* COOK FILTER COMPONENT */}
          <CookFilter 
            filters={filters} 
            onChange={setFilters} 
            isMobileOpen={isMobileFilterOpen}
            onCloseMobile={() => setIsMobileFilterOpen(false)}
          />

          {/* Grid Area */}
          <div className="flex-1 w-full">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
                {[1, 2, 3].map(n => (
                  <div key={n} className="bg-slate-50 border border-slate-100 rounded-[2rem] h-72 animate-pulse w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12 text-rose-500 font-bold text-sm bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                ⚠️ {error}
              </div>
            ) : filteredChefs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
                <AnimatePresence>
                  {filteredChefs.map((chef, idx) => (
                    <motion.div
                      key={chef.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 100, damping: 15, delay: idx * 0.05 }}
                      className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-black/5 overflow-hidden flex flex-col transition-shadow group"
                    >
                      <div className="p-6 flex-1 flex flex-col relative">
                        <div className="flex items-start gap-4 mb-5">
                          <img src={chef.avatar} alt={chef.name} className="w-16 h-16 rounded-2xl object-cover shadow-sm border border-gray-100 group-hover:scale-105 transition-transform shrink-0" />
                          <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-extrabold text-gray-900 text-base leading-snug truncate">{chef.name}</h3>
                              <span className="bg-brand-green/10 text-brand-green text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0">
                                Verified
                              </span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500 gap-1">
                              <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              <span className="truncate">{chef.locality.split(',')[0]}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-5">
                          <div className="flex items-center gap-1 text-xs font-bold text-gray-900 bg-amber-50/50 px-2 py-1 rounded-md border border-amber-100">
                            <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {chef.rating}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                            <span>{chef.reviews} reviews</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span>{chef.experience}</span>
                          </div>
                        </div>

                        <div className="mb-4 flex-1">
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {chef.cuisines.slice(0,3).map(c => (
                              <span key={c} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded">
                                {c}
                              </span>
                            ))}
                          </div>
                          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{chef.description}</p>
                        </div>

                        <div className="pt-5 border-t border-gray-100 flex items-center justify-between mt-auto">
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Price Per Meal</span>
                            <span className="text-xl font-black text-brand-green">₹{chef.price}</span>
                          </div>
                          <Link 
                            to={`/provider/${chef.id}`}
                            className="bg-brand-light text-brand-green hover:bg-brand-green hover:text-white transition-colors px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5"
                          >
                            Menu
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-gray-100 shadow-sm w-full"
              >
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl">👨🍳</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No cooks found</h3>
                <p className="text-gray-500 font-medium max-w-sm mb-6 text-sm">We couldn't find anyone matching your exact filters. Try adjusting your preferences or expanding the search.</p>
                <button 
                  onClick={() => { 
                    setSearchQuery('');
                    setFilters({ location: '', cuisines: [], dietary: [], availability: 'Anytime', rating: 'any', maxPrice: 1000, services: [] });
                  }}
                  className="px-5 py-2.5 rounded-full bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition-colors"
                >
                  Reset Filters
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
