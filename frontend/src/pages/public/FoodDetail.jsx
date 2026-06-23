import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Share2, 
  Heart, 
  Star, 
  MapPin, 
  Clock, 
  ShoppingBag, 
  Utensils, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ReviewSection from '../../components/ReviewSection';
import FoodCard from '../../components/food/FoodCard';
import { LocationContext } from '../../context/LocationContext';

const FoodDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [isReserved, setIsReserved] = useState(false);
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [customerNote, setCustomerNote] = useState('');
  const [reserving, setReserving] = useState(false);

  // Swipeable image gallery index
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Saved/liked state persisted in localStorage
  const [isSaved, setIsSaved] = useState(() => {
    try {
      const savedList = JSON.parse(localStorage.getItem('savedDishes') || '[]');
      return savedList.includes(id);
    } catch {
      return false;
    }
  });

  // Copied state for share feedback
  const [copied, setCopied] = useState(false);

  // Similar dishes state
  const [similarFoods, setSimilarFoods] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(true);

  const fetchFoodDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/foods/${id}`);
      if (response.data.success) {
        const item = response.data.foodItem;
        const providerInfo = item.provider || {};

        setFood({
          id: item._id,
          name: item.name,
          description: item.description,
          price: item.price,
          images: item.images && item.images.length > 0 ? item.images : [
            item.imageUrl ||
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1200'
          ],
          category: item.category,
          mealType: item.mealType || 'Main Course',
          quantityAvailable: item.quantity,
          totalQuantity: item.totalQuantity || item.quantity || 10,
          ordersToday: item.ordersToday || 0,
          prepTime: item.prepTime || 30,
          serviceDate: item.serviceDate,
          timeWindow: item.timeWindow || 'Contact Provider',
          bringContainer: item.bringContainer ?? false,
          spicyLevel: item.spicyLevel !== undefined ? item.spicyLevel : 1,
          averageRating: item.averageRating || 0,
          provider: {
            id: providerInfo._id,
            name: providerInfo.kitchenName || 'Home Cook',
            rating: providerInfo.rating || 0,
            reviewsCount: providerInfo.totalReviews || 0,
            avatar: providerInfo.avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=256',
            joined: providerInfo.createdAt ? new Date(providerInfo.createdAt).getFullYear() : null,
            bio: providerInfo.bio || '',
            tagline: providerInfo.tagline || '',
            experience: providerInfo.experience || 0,
            verificationStatus: providerInfo.verificationStatus || 'PENDING',
            city: providerInfo.city || '',
            area: providerInfo.area || '',
            fullAddress: providerInfo.fullAddress || '',
          },
          reviews: item.reviews || [],
        });
      } else {
        throw new Error('Dish details could not be loaded.');
      }
    } catch (err) {
      console.error('Error fetching food detail:', err);
      setError(err.message || 'Failed to load dish details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchFoodDetail();
  }, [fetchFoodDetail]);

  // Fetch similar dishes
  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        setLoadingSimilar(true);
        const res = await api.get(`/foods/similar/${id}`);
        if (res.data && res.data.success) {
          setSimilarFoods(res.data.foodItems || []);
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error("Error fetching similar foods:", err);
        }
      } finally {
        setLoadingSimilar(false);
      }
    };
    if (id) {
      fetchSimilar();
    }
  }, [id]);

  const toggleSave = () => {
    try {
      const savedList = JSON.parse(localStorage.getItem('savedDishes') || '[]');
      let newList;
      if (isSaved) {
        newList = savedList.filter(item => item !== id);
      } else {
        newList = [...savedList, id];
      }
      localStorage.setItem('savedDishes', JSON.stringify(newList));
      setIsSaved(!isSaved);
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    }
  };

  const handleShare = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Error copying link:', err);
    }
  };

  const handleReserveClick = () => {
    if (!user) {
      navigate('/login', { state: { from: `/food/${id}` } });
      return;
    }
    setShowModal(true);
  };

  const confirmReservation = async () => {
    try {
      setReserving(true);
      const response = await api.post('/bookings', {
        foodItemId: food.id,
        quantity,
        customerNote,
      });

      if (response.data.success) {
        setIsReserved(true);
        setShowModal(false);
        alert('Reservation created successfully!');
        setFood((prev) => ({
          ...prev,
          quantityAvailable: prev.quantityAvailable - quantity,
        }));
      }
    } catch (err) {
      console.error('Reservation failed:', err);
      alert(err.response?.data?.message || 'Failed to create reservation');
    } finally {
      setReserving(false);
    }
  };

  const handlePrevImage = () => {
    if (!food) return;
    setActiveImageIndex((prev) => (prev === 0 ? food.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!food) return;
    setActiveImageIndex((prev) => (prev === food.images.length - 1 ? 0 : prev + 1));
  };

  const renderChilis = (level) => {
    const lvl = String(level).trim().toLowerCase();
    if (lvl === '0' || lvl === 'mild') return '🌶️ Mild';
    if (lvl === '2' || lvl === 'spicy') return '🌶️🌶️🌶️ Spicy';
    if (lvl === '3' || lvl === 'hot' || lvl === 'extra spicy') return '🌶️🌶️🌶️🌶️ Extra Hot';
    return '🌶️🌶️ Medium';
  };

  // Helper to format dynamic urgency text
  const getUrgencyText = (qty) => {
    if (qty === 0) return { text: "Sold Out Today", type: "error" };
    if (qty <= 3) return { text: "🔥 Only a few portions left today", type: "danger" };
    if (qty <= 7) return { text: "⚡ Selling fast", type: "warning" };
    return { text: "✅ Fresh batch available today", type: "success" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 md:pt-20 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-3xl h-[45vh] bg-gray-200 mb-6" />
              <div className="h-8 bg-gray-200 rounded w-2/3 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-8" />
              <div className="h-32 bg-gray-200 rounded-3xl mb-6" />
            </div>
            <div className="hidden lg:block lg:col-span-5 h-[400px] bg-gray-200 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !food) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-lg font-black text-gray-900 mb-2">Error Loading Dish</h2>
          <p className="text-sm text-gray-500 mb-6">{error || 'Dish not found'}</p>
          <button 
            onClick={() => navigate('/food')} 
            className="w-full py-3 bg-[#0A4D2B] text-white font-bold rounded-xl hover:bg-[#083a21] transition-colors"
          >
            Browse Food
          </button>
        </div>
      </div>
    );
  }

  const isAvailable = food.quantityAvailable > 0;
  const progressPercentage = Math.min(100, Math.max(0, (food.quantityAvailable / food.totalQuantity) * 100));
  const urgency = getUrgencyText(food.quantityAvailable);

  const mapBackendSimilarFoodToCard = (item) => {
    return {
      id: item._id,
      name: item.name,
      price: item.price,
      image: item.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600',
      location: item.provider?.area || 'Pune',
      distance: '', 
      isVeg: item.isVeg ?? true,
      availabilityDetails: { isAvailable: item.quantity > 0 && item.status === 'available' }
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-56 lg:pb-16 pt-12 md:pt-20">
      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 sm:gap-6 items-start">
          
          {/* LEFT COLUMN: Immersive details (mobile-first) */}
          <div className="lg:col-span-7 space-y-3">
            
            {/* Section 1: Hero image swipeable gallery */}
            <div className="relative rounded-none sm:rounded-2xl overflow-hidden bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)] border-b sm:border border-gray-200 aspect-[4/3] max-h-[45vh] lg:max-h-[50vh] w-full shrink-0 group">
              <img
                src={food.images[activeImageIndex]}
                alt={food.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25 pointer-events-none" />

              {/* Floating Back Action Overlay */}
              <button
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer z-10"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-800" />
              </button>

              {/* Floating Share & Save Action Overlays */}
              <div className="absolute top-4 right-4 flex items-center gap-2.5 z-10">
                <button
                  onClick={handleShare}
                  className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer relative"
                  aria-label="Share dish link"
                >
                  <Share2 className="w-4.5 h-4.5 text-gray-800" />
                  {copied && (
                    <span className="absolute bottom-11 right-0 bg-gray-950 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md whitespace-nowrap">
                      Link Copied!
                    </span>
                  )}
                </button>
                <button
                  onClick={toggleSave}
                  className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={`w-4.5 h-4.5 transition-colors ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-gray-800'}`} />
                </button>
              </div>

              {/* Multiple Images Navigation Controls */}
              {food.images.length > 1 && (
                <>
                  <button 
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 active:scale-90"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 active:scale-90"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Swipe Gallery Indicator Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase shadow-sm select-none">
                    {activeImageIndex + 1} / {food.images.length}
                  </div>

                  {/* Dot Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                    {food.images.map((_, i) => (
                      <span 
                        key={i} 
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                          activeImageIndex === i ? 'w-3.5 bg-white' : 'bg-white/50'
                        }`} 
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Section 2: Food Summary */}
            <div className="mx-4 sm:mx-0 bg-white rounded-2xl border border-gray-200 shadow-[0_4px_20px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 transition-all duration-300 p-4 sm:p-5 space-y-3.5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  {/* Veg/Non-Veg Badge Row */}
                  <div className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-[4px]">
                    <span className={`w-2 h-2 rounded-full ${food.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                    <span className="text-[10px] font-bold text-gray-500 tracking-wider">
                      {food.isVeg ? 'VEG' : 'NON-VEG'}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight select-text font-jakarta">
                    {food.name}
                  </h1>
                  
                  {/* Tagline/Description */}
                  <p className="italic text-slate-500 text-sm select-text">
                    "{food.description}"
                  </p>
                  
                  {/* Star Rating, Category, and Meal Type elegant row */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold text-gray-500 pt-1">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                      <span>{food.averageRating > 0 ? food.averageRating.toFixed(1) : '5.0'}</span>
                      <span className="text-gray-400 font-semibold">({food.reviews.length || '1'} {food.reviews.length === 1 ? 'review' : 'reviews'})</span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <span>{food.category}</span>
                    <span className="text-gray-300">|</span>
                    <span>{food.mealType}</span>
                    {food.serviceDate && (
                      <>
                        <span className="text-gray-300">|</span>
                        <span>{new Date(food.serviceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Highly dominating price display */}
                <div className="text-right shrink-0">
                  <span className="text-3xl sm:text-4xl font-bold text-brand-green tracking-tight block">
                    ₹{food.price}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mt-0.5 block">PER PORTION</span>
                </div>
              </div>

              {/* Urgency Indicators side by side */}
              <div className="flex flex-wrap gap-2 pt-1">
                {food.quantityAvailable === 0 ? (
                  <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-500 text-xs font-bold px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                    Sold out today
                  </span>
                ) : food.quantityAvailable <= 3 ? (
                  <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 text-xs font-bold px-3 py-1 rounded-full border border-rose-100 shadow-sm">
                    🔥 Only a few portions left today
                  </span>
                ) : food.quantityAvailable <= 7 ? (
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1 rounded-full border border-amber-100 shadow-sm">
                    ⚡ Selling fast
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100 shadow-sm">
                    ✅ Fresh batch available today
                  </span>
                )}
                {food.ordersToday > 0 && (
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1 rounded-full border border-amber-100 shadow-sm">
                    🔥 {food.ordersToday} {food.ordersToday === 1 ? 'order' : 'orders'} placed today
                  </span>
                )}
              </div>
            </div>

            {/* Section 3: Availability Card */}
            <div className="mx-4 sm:mx-0 bg-white border border-gray-200 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 transition-all duration-300 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-normal font-jakarta">Availability</h2>
                <span className={`border text-xs font-bold px-2 py-0.5 rounded-[6px] ${
                  food.quantityAvailable === 0 ? 'bg-gray-50 text-gray-500 border-gray-200' :
                  food.quantityAvailable <= 3 ? 'bg-rose-50 text-rose-600 border-rose-100' :
                  food.quantityAvailable <= 7 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                }`}>
                  {food.quantityAvailable} / {food.totalQuantity} left
                </span>
              </div>
              
              <div className="space-y-2.5 pt-0.5">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-jakarta">
                  {food.quantityAvailable === 0 ? (
                    "Sold out today"
                  ) : food.quantityAvailable <= 3 ? (
                    "Only a few portions left today"
                  ) : food.quantityAvailable <= 7 ? (
                    "Selling fast"
                  ) : (
                    "Fresh batch available today"
                  )}
                </h3>
                
                {/* Premium Progress Bar */}
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      food.quantityAvailable <= 3 ? 'bg-rose-500' :
                      food.quantityAvailable <= 7 ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>

                {/* Humanized Batch Text */}
                <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed pt-0.5 font-jakarta">
                  {food.quantityAvailable <= 3 
                    ? "Only a few portions remain of today's fresh batch. Reserve yours before they're gone!" 
                    : food.quantityAvailable <= 7 
                      ? "Selling fast. Secure your portions from today's freshly cooked batch." 
                      : "Prepared fresh today. Secure your portions before this batch sells out."}
                </p>
              </div>
            </div>

            {/* Section 4: Pickup Details Card */}
            <div className="mx-4 sm:mx-0 bg-white border border-gray-200 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 transition-all duration-300 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-normal font-jakarta">Pickup Details</h2>
              </div>
              
              <div className="flex flex-col gap-3.5 pt-0.5 text-xs font-semibold text-gray-600 font-jakarta">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-900 font-bold text-sm sm:text-base leading-snug">
                      {food.provider.area && food.provider.city ? `${food.provider.area}, ${food.provider.city}` : food.provider.area || food.provider.city || 'Contact Cook'}
                    </p>
                    <p className="text-slate-400 font-medium text-[11px] mt-0.5">Exact address shared post-reservation</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-900 font-bold text-sm sm:text-base leading-snug">{food.timeWindow}</p>
                    <p className="text-slate-400 font-medium text-[11px] mt-0.5">Pickup window</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    {food.bringContainer ? (
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <div>
                    <p className={`font-bold text-sm sm:text-base leading-snug ${food.bringContainer ? 'text-amber-600' : 'text-green-600'}`}>
                      {food.bringContainer ? 'Please bring your own container' : 'Container included in purchase'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-base shrink-0 mt-0.5">🌶️</span>
                  <div>
                    <p className="text-slate-900 font-bold text-sm sm:text-base leading-snug">
                      {renderChilis(food.spicyLevel)} • Serves 1 adult
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 6: About This Dish */}
            <div className="mx-4 sm:mx-0 bg-white border border-gray-200 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 transition-all duration-300 p-4 sm:p-5 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-normal font-jakarta">About This Dish</h2>
              </div>
              <div className="pt-0.5">
                <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed font-jakarta select-text whitespace-pre-line">
                  {food.description}
                </p>
              </div>
            </div>

            {/* Section 7: Customer Reviews */}
            <div className="mx-4 sm:mx-0 space-y-2.5">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-normal font-jakarta pl-2">Customer Reviews</h3>

              {food.reviews.length === 0 ? (
                <div className="text-center py-5 bg-white border border-gray-200 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] p-4">
                  <p className="text-xs sm:text-sm font-extrabold text-gray-400">Be the first customer to review this homemade meal.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {food.reviews.map((rev) => {
                    const revInitial = rev.userName?.charAt(0)?.toUpperCase() || '?';
                    return (
                      <div key={rev._id} className="bg-white border border-gray-200 rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 transition-all duration-300 p-4 sm:p-5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green text-xs font-black shrink-0">
                              {revInitial}
                            </div>
                            <div>
                              <p className="text-sm sm:text-base font-extrabold text-slate-900">{rev.userName}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                            </div>
                          </div>
                          
                          {/* Stars */}
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star 
                                key={s} 
                                className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        {rev.comment && (
                          <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed pl-[52px] select-text font-jakarta">
                            "{rev.comment}"
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Rates Submission Form - only shown to logged-in non-providers */}
              {user && food?.provider && user._id !== food.provider.id && (
                <ReviewSection
                  foodId={food.id}
                  onReviewSubmit={fetchFoodDetail}
                />
              )}
            </div>

            {/* Section 8: Meet Your Home Chef */}
            <div className="mx-4 sm:mx-0 bg-white border border-gray-200 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 transition-all duration-300 p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-normal font-jakarta">Meet Your Home Chef</h2>
                {food.provider.verificationStatus === 'APPROVED' && (
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase font-black tracking-widest text-brand-green bg-brand-light px-2.5 py-1 rounded-full shadow-sm font-jakarta">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Verified Cook
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pt-0.5">
                <Link to={`/provider/${food.provider.id}`} className="shrink-0 group">
                  <img
                    src={food.provider.avatar}
                    alt={food.provider.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-brand-green/15 group-hover:border-brand-green transition-all duration-300 shadow-sm"
                  />
                </Link>
                <div className="space-y-1 flex-1 min-w-0 text-center sm:text-left">
                  <Link to={`/provider/${food.provider.id}`} className="font-extrabold text-slate-900 hover:text-brand-green transition-colors text-xl sm:text-2xl block truncate font-jakarta">
                    {food.provider.name}
                  </Link>
                  {food.provider.experience > 0 && (
                    <p className="text-xs sm:text-sm font-bold text-brand-green">
                      🌟 {food.provider.experience} years experience
                    </p>
                  )}
                  <p className="text-xs sm:text-sm text-gray-400 font-semibold leading-relaxed">
                    📍 {food.provider.area && food.provider.city ? `${food.provider.area}, ${food.provider.city}` : food.provider.area || food.provider.city || 'Contact cook'}
                  </p>
                </div>
              </div>

              {food.provider.tagline && (
                <blockquote className="border-l-2 border-brand-green/30 pl-3.5 py-0.5 text-xs sm:text-sm italic font-semibold text-slate-700 my-1">
                  "{food.provider.tagline}"
                </blockquote>
              )}

              {food.provider.bio && (
                <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed select-text font-jakarta">
                  {food.provider.bio}
                </p>
              )}

              {/* Trust Banner Grid */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                {food.provider.verificationStatus === 'APPROVED' && (
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <ShieldCheck className="w-4.5 h-4.5 text-brand-green shrink-0" />
                    <span>Verified Chef</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Utensils className="w-4.5 h-4.5 text-brand-green shrink-0" />
                  <span>Fresh Meals</span>
                </div>
                {food.totalQuantity <= 15 && (
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Sparkles className="w-4.5 h-4.5 text-brand-green shrink-0" />
                    <span>Small Batch</span>
                  </div>
                )}
                {food.provider.verificationStatus === 'APPROVED' && (
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <MapPin className="w-4.5 h-4.5 text-brand-green shrink-0" />
                    <span>Verified Cook</span>
                  </div>
                )}
              </div>
            </div>

            {/* Section 9: Similar Dishes Carousel */}
            {!loadingSimilar && similarFoods.length > 0 && (
              <div className="mx-4 sm:mx-0 space-y-2.5 pt-4 border-t border-gray-200">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-normal font-jakarta pl-2">You Might Also Like</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar px-1">
                  {similarFoods.map((item) => (
                    <div key={item._id} className="w-[180px] sm:w-[220px] shrink-0">
                      <FoodCard food={mapBackendSimilarFoodToCard(item)} />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Desktop Sticky Reservation Card (lg:col-span-5) */}
          <div className="hidden lg:block lg:col-span-5 sticky top-24 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(15,23,42,0.06)] border border-gray-200 p-5 sm:p-6 space-y-4 hover:shadow-[0_12px_40px_rgba(15,23,42,0.08)] transition-shadow duration-300">
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-3xl font-black text-brand-green font-jakarta">₹{food.price}</span>
                  <span className="text-slate-400 font-semibold text-xs ml-1.5">per portion</span>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  food.quantityAvailable <= 3 ? 'bg-rose-50 text-rose-700' :
                  food.quantityAvailable <= 7 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-800'
                }`}>
                  {food.quantityAvailable <= 3 ? 'Only a few left' :
                   food.quantityAvailable <= 7 ? 'Selling fast' : 'Fresh batch'}
                </div>
              </div>

              {/* Quantity Select */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider">Select portions</label>
                <div className="flex items-center justify-between border border-gray-200 rounded-2xl p-2.5 bg-white shadow-inner">
                  <button
                    type="button"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(v => Math.max(1, v - 1))}
                    className="w-9 h-9 rounded-full bg-slate-50 border border-gray-200 text-slate-800 font-bold hover:bg-slate-100 active:scale-90 disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center shadow-sm select-none"
                  >
                    −
                  </button>
                  <span className="font-black text-slate-800 text-xl select-none">{quantity}</span>
                  <button
                    type="button"
                    disabled={quantity >= food.quantityAvailable}
                    onClick={() => setQuantity(v => Math.min(food.quantityAvailable, v + 1))}
                    className="w-9 h-9 rounded-full bg-slate-50 border border-gray-200 text-slate-800 font-bold hover:bg-slate-100 active:scale-90 disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center shadow-sm select-none"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Calculation List */}
              <div className="space-y-2.5 text-xs font-semibold text-slate-500 bg-slate-50/50 border border-slate-100/60 p-3.5 rounded-xl">
                <div className="flex justify-between">
                  <span>₹{food.price} × {quantity} portions</span>
                  <span className="text-slate-800 font-extrabold">₹{food.price * quantity}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200/55 pt-2.5 mt-1.5">
                  <span className="text-slate-800 font-extrabold text-sm">Total amount</span>
                  <span className="text-brand-green font-black text-lg">₹{food.price * quantity}</span>
                </div>
              </div>

              {/* Urgency and Social Proof Directly Above CTA */}
              <div className="pt-1.5 pb-0.5 text-center space-y-0.5">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                  <span className={`w-2 h-2 rounded-full ${
                    urgency.type === 'danger' ? 'bg-rose-500 animate-ping' :
                    urgency.type === 'warning' ? 'bg-amber-500 animate-pulse' : 
                    urgency.type === 'error' ? 'bg-gray-300' : 'bg-emerald-500'
                  }`} />
                  <span className={`font-extrabold ${
                    urgency.type === 'danger' ? 'text-rose-600' :
                    urgency.type === 'warning' ? 'text-amber-600' :
                    urgency.type === 'error' ? 'text-gray-400' : 'text-emerald-600'
                  }`}>
                    {urgency.text}
                  </span>
                </div>
                {food.ordersToday > 0 && (
                  <p className="text-[10px] font-extrabold text-slate-400">
                    🔥 {food.ordersToday} {food.ordersToday === 1 ? 'order' : 'orders'} placed today!
                  </p>
                )}
              </div>

              {/* Confirm/Order CTA */}
              <button
                disabled={food.quantityAvailable === 0}
                onClick={handleReserveClick}
                className="w-full h-14 bg-brand-green hover:bg-[#083a20] text-white font-extrabold text-base rounded-2xl shadow-lg shadow-brand-green/20 hover:shadow-xl active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-jakarta"
              >
                {food.quantityAvailable === 0 ? 'Sold out' : 'Reserve meal'}
              </button>
              
              <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-1">
                🔒 Safe booking • Cash on pickup
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* MOBILE STICKY PURCHASE BAR ( floats above bottom navigation ) */}
      <div className="md:hidden fixed bottom-[calc(88px+env(safe-area-inset-bottom,0px))] left-4 right-4 z-40 bg-white border border-gray-200 rounded-[24px] px-4 py-3 shadow-[0_8px_32px_rgba(15,23,42,0.15)] backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          {/* Left Side: Pricing */}
          <div className="flex flex-col min-w-0 shrink-0">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider leading-none mb-1">TOTAL</span>
            <span className="text-2xl font-black text-brand-green font-jakarta leading-none">₹{food.price * quantity}</span>
          </div>

          {/* Center: Premium Quantity Selector (Circular, larger tap targets) */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="flex items-center gap-2 bg-slate-50 border border-gray-200 rounded-full px-2 py-1 shadow-inner">
              <button
                type="button"
                disabled={quantity <= 1}
                onClick={() => setQuantity(v => Math.max(1, v - 1))}
                className="w-7 h-7 rounded-full bg-white border border-gray-200 text-slate-800 font-black hover:bg-gray-100 disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-90 text-xs select-none"
              >
                −
              </button>
              <span className="font-black text-slate-800 text-xs w-3 text-center select-none">{quantity}</span>
              <button
                type="button"
                disabled={quantity >= food.quantityAvailable}
                onClick={() => setQuantity(v => Math.min(food.quantityAvailable, v + 1))}
                className="w-7 h-7 rounded-full bg-white border border-gray-200 text-slate-800 font-black hover:bg-gray-100 disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-90 text-xs select-none"
              >
                +
              </button>
            </div>
            <span className="text-[9px] text-slate-400 font-semibold mt-0.5">Max {food.quantityAvailable} portions</span>
          </div>

          {/* Right Side: Large CTA Button dominating */}
          <button
            disabled={food.quantityAvailable === 0}
            onClick={handleReserveClick}
            className="flex-1 h-[52px] bg-brand-green hover:bg-[#083a20] text-white rounded-2xl shadow-lg shadow-brand-green/20 hover:shadow-xl active:scale-95 transition-all duration-300 disabled:opacity-50 text-center font-jakarta shrink-0 flex items-center justify-center select-none"
          >
            <div className="flex flex-col items-center justify-center leading-none">
              <span className="font-extrabold text-sm sm:text-base">Reserve Meal</span>
              {food.quantityAvailable > 0 && (
                <span className="text-[9px] sm:text-[10px] font-bold text-amber-300 mt-1 flex items-center gap-0.5">
                  {food.quantityAvailable <= 3 ? "🔥 Only a few portions left!" :
                   food.quantityAvailable <= 7 ? "⚡ Selling fast!" : "✅ Fresh batch available!"}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Reservation Confirmation Popup Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-black text-gray-900 tracking-tight font-jakarta">Confirm reservation</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full hover:bg-gray-200/50 flex items-center justify-center transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body Scroll */}
            <div className="p-5 overflow-y-auto space-y-5">
              <div className="flex gap-4 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                <img
                  src={food.images[0]}
                  alt={food.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-extrabold text-gray-900 truncate font-jakarta">{food.name}</h3>
                  <p className="text-xs text-gray-500 font-semibold">by {food.provider.name}</p>
                  <p className="text-brand-green font-extrabold text-xs mt-1.5">
                    ₹{food.price} × {quantity} portions
                  </p>
                </div>
              </div>

              {/* Pickup Summary */}
              <div className="space-y-3 text-xs font-semibold text-gray-600 bg-gray-50/50 border border-gray-100 p-4 rounded-xl">
                <div className="flex justify-between border-b border-gray-100/60 pb-2">
                  <span className="text-gray-400">Pickup locality</span>
                  <span className="font-bold text-gray-800 text-right">
                    {food.provider.area && food.provider.city ? `${food.provider.area}, ${food.provider.city}` : food.provider.area || food.provider.city || 'Contact Cook'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-100/60 pb-2">
                  <span className="text-gray-400">Pickup window</span>
                  <span className="font-bold text-brand-green">{food.timeWindow}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100/60 pb-2">
                  <span className="text-gray-400">Container instruction</span>
                  <span className={`font-bold ${food.bringContainer ? 'text-amber-600' : 'text-green-600'}`}>
                    {food.bringContainer ? '🥡 Bring container' : '🍱 Provided'}
                  </span>
                </div>
              </div>

              {/* Note for Chef */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-wider">Note for chef (optional)</label>
                <textarea
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="E.g. Please make it mild spicy..."
                  className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green outline-none resize-none h-18 text-gray-800 font-medium"
                />
              </div>

              {/* Portions selector in modal */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-wider">Quantity portions</label>
                <div className="flex items-center justify-between border border-gray-200 rounded-xl p-3">
                  <span className="text-xs text-gray-500 font-bold">Select portions</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity(v => Math.max(1, v - 1))}
                      className="w-8 h-8 rounded-lg border border-gray-200 text-base font-bold bg-white hover:bg-gray-50 active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer"
                    >
                      −
                    </button>
                    <span className="w-5 text-center font-extrabold text-gray-800">{quantity}</span>
                    <button
                      type="button"
                      disabled={quantity >= food.quantityAvailable}
                      onClick={() => setQuantity(v => Math.min(food.quantityAvailable, v + 1))}
                      className="w-8 h-8 rounded-lg border border-gray-200 text-base font-bold bg-white hover:bg-gray-50 active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 font-bold">Portions remaining today: {food.quantityAvailable}</p>
              </div>

              {/* Total Calculation */}
              <div className="bg-brand-green/5 border border-brand-green/10 p-4 rounded-xl flex justify-between items-center">
                <span className="font-extrabold text-gray-700 text-xs font-jakarta">Total amount</span>
                <span className="text-2xl font-black text-brand-green font-jakarta">₹{food.price * quantity}</span>
              </div>

              {/* Submit Reservation Action */}
              <button
                onClick={confirmReservation}
                disabled={reserving}
                className="w-full bg-brand-green text-white font-extrabold text-base py-3.5 rounded-xl shadow-md hover:bg-brand-green/90 active:scale-98 transition-all disabled:opacity-70 flex justify-center items-center gap-2 cursor-pointer font-jakarta"
              >
                {reserving ? 'Confirming...' : 'Confirm reservation'}
              </button>
              
              <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                💵 Payment mode: Cash on pickup
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodDetail;