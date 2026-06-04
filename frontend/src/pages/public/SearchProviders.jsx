import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api';

// Import Reusable UI Components
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import IconLabel from '../../components/IconLabel.jsx';

export default function SearchProviders() {
  const [searchParams] = useSearchParams();
  const { isMock } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  
  // Reference search filter states
  const [dietFilter, setDietFilter] = useState('all'); // all, veg, nonveg
  const [ratingFilter, setRatingFilter] = useState(false); // boolean for 4.8+ rating

  const fallbackChefs = [
    {
      id: 'mock-uuid-chef-1',
      name: 'Sunita Home Chef',
      specialty: 'North Indian, Mughlai, Traditional gravies',
      diet: 'veg',
      experience: '10+ Years Exp',
      rating: 4.9,
      reviews: 120,
      rate: '₹150 / meal',
      avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400',
      locality: 'Connaught Place, New Delhi',
      description: 'Specialist in authentic Punjabi cuisine and Slow-Cooked Mughlai gravies. Custom home catering for family meals.'
    },
    {
      id: 'mock-uuid-chef-2',
      name: "Meena's Tiffin Service",
      specialty: 'Maharashtrian, Konkani, Tiffin boxes',
      diet: 'veg',
      experience: '5+ Years Exp',
      rating: 4.8,
      reviews: 95,
      rate: '₹120 / meal',
      avatar: 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=400',
      locality: 'Andheri West, Mumbai',
      description: 'Providing healthy daily tiffin deliveries. Low oil, balanced home-style nutrition customized to your diet plan.'
    },
    {
      id: 'mock-uuid-chef-3',
      name: 'Latha Cook',
      specialty: 'South Indian, Traditional, Seafood specialties',
      diet: 'nonveg',
      experience: '8+ Years Exp',
      rating: 4.7,
      reviews: 88,
      rate: '₹140 / meal',
      avatar: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400',
      locality: 'Panaji, Goa',
      description: 'Expert in South Indian breakfasts, traditional curries, and Goan seafood preparations. Highly rated for parties.'
    }
  ];

  const [chefs, setChefs] = useState([]);
  const [filteredChefs, setFilteredChefs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChefs = async () => {
      if (isMock) {
        setChefs(fallbackChefs);
        setFilteredChefs(fallbackChefs);
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/providers');
        if (res.data && res.data.length > 0) {
          const mapped = res.data.map(p => ({
            id: p.id,
            name: p.name || 'Chef Partner',
            specialty: p.specialty || 'General Home Cook',
            diet: p.specialty?.toLowerCase().includes('non-veg') || p.specialty?.toLowerCase().includes('fish') ? 'nonveg' : 'veg',
            experience: p.experience || '5+ Years Exp',
            rating: p.rating || 4.8,
            reviews: p.reviews?.length || 42,
            rate: p.rate ? `₹${p.rate} / meal` : '₹150 / meal',
            locality: p.location || 'Local Area',
            avatar: p.avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400',
            description: p.description || 'Verified kitchen partner.'
          }));
          setChefs(mapped);
          setFilteredChefs(mapped);
        } else {
          setChefs(fallbackChefs);
          setFilteredChefs(fallbackChefs);
        }
      } catch (err) {
        console.warn("Failed to fetch listings, using fallback:", err.message);
        setChefs(fallbackChefs);
        setFilteredChefs(fallbackChefs);
      } finally {
        setLoading(false);
      }
    };
    fetchChefs();
  }, [isMock]);

  useEffect(() => {
    let result = chefs;

    // Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        chef =>
          chef.name.toLowerCase().includes(q) ||
          chef.specialty.toLowerCase().includes(q) ||
          chef.locality.toLowerCase().includes(q)
      );
    }

    // Diet filter (veg vs nonveg)
    if (dietFilter !== 'all') {
      result = result.filter(chef => chef.diet === dietFilter);
    }

    // Rating 4.8+ filter
    if (ratingFilter) {
      result = result.filter(chef => chef.rating >= 4.8);
    }

    setFilteredChefs(result);
  }, [chefs, searchQuery, dietFilter, ratingFilter]);

  return (
    <div className="bg-brand-cream min-h-screen pb-12 text-brand-brown antialiased">
      {/* Navbar */}
      <nav className="bg-white border-b border-brand-beige py-4 mb-6 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="Shanta Bai Logo" className="h-10 w-auto" />
            <span className="text-xl font-bold text-brand-brown">Shanta Bai</span>
          </Link>
          <Link to="/" className="text-sm font-semibold text-brand-orange hover:text-brand-orange/80">
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Search header & Filter bar matching search flow in reference */}
        <div className="bg-white border border-brand-beige rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search home chefs & cooks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-brand-beige focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange text-brand-brown text-sm font-medium"
              />
            </div>
            
            {/* Horizontal Reference Filters Row */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <button
                onClick={() => {
                  setDietFilter('all');
                  setRatingFilter(false);
                }}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-colors ${
                  dietFilter === 'all' && !ratingFilter
                    ? 'bg-brand-orange border-brand-orange text-white'
                    : 'bg-white border-brand-beige text-brand-brown hover:bg-brand-beige/35'
                }`}
              >
                Filters
              </button>
              <button
                onClick={() => setDietFilter(dietFilter === 'veg' ? 'all' : 'veg')}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-colors ${
                  dietFilter === 'veg'
                    ? 'bg-brand-orange border-brand-orange text-white'
                    : 'bg-white border-brand-beige text-brand-brown hover:bg-brand-beige/35'
                }`}
              >
                Veg Only
              </button>
              <button
                onClick={() => setDietFilter(dietFilter === 'nonveg' ? 'all' : 'nonveg')}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-colors ${
                  dietFilter === 'nonveg'
                    ? 'bg-brand-orange border-brand-orange text-white'
                    : 'bg-white border-brand-beige text-brand-brown hover:bg-brand-beige/35'
                }`}
              >
                Non-Veg
              </button>
              <button
                onClick={() => setRatingFilter(!ratingFilter)}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-colors ${
                  ratingFilter
                    ? 'bg-brand-orange border-brand-orange text-white'
                    : 'bg-white border-brand-beige text-brand-brown hover:bg-brand-beige/35'
                }`}
              >
                Rating 4.8+
              </button>
            </div>
          </div>
        </div>

        {/* Cook Listings Grid */}
        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {filteredChefs.length} Search results found
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-orange border-t-transparent"></div>
            </div>
          ) : filteredChefs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredChefs.map((chef) => (
                <Card 
                  key={chef.id}
                  hoverable
                  onClick={() => navigate(`/provider/${chef.id}`)}
                  className="flex flex-col justify-between h-full hover:scale-102 transform transition-transform"
                  padding="p-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={chef.avatar} 
                        alt={chef.name} 
                        className="h-16 w-16 rounded-2xl object-cover border-2 border-brand-orange/15 shadow-sm"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-extrabold text-brand-brown truncate">{chef.name}</h3>
                        <div className="flex items-center mt-0.5">
                          <IconLabel type="location" label={chef.locality.split(', ')[0]} labelClassName="text-[11px] font-bold text-brand-orange" />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="yellow" size="sm">
                            <IconLabel type="star" label={chef.rating} labelClassName="text-[10px] font-black" />
                          </Badge>
                          <span className="text-[10px] text-gray-400 font-bold">{chef.experience}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Specialties</span>
                      <p className="text-xs text-gray-700 font-semibold line-clamp-1">{chef.specialty}</p>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{chef.description}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-brand-beige flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Rate Estimate</span>
                      <span className="text-sm font-extrabold text-brand-orange">{chef.rate}</span>
                    </div>
                    <Button variant="primary" size="sm">
                      View Profile
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-16">
              <h3 className="text-lg font-bold text-brand-brown mb-1">No Cooks Found</h3>
              <p className="text-xs text-gray-400">Try adjusting your filters or search keywords.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
