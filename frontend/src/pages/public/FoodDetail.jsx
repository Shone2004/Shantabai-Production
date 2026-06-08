import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import QuantitySelector from '../../components/food/QuantitySelector';
import ReserveButton from '../../components/food/ReserveButton';
import api from '../../services/api';

const FoodDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [isReserved, setIsReserved] = useState(false);
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFoodDetail = async () => {
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
            imageUrl: item.images?.[0] || 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
            category: item.category,
            availabilityTime: item.timeWindow || 'Today, 12:30 - 2:00 PM',
            quantityAvailable: item.quantity,
            ingredients: item.tags && item.tags.length > 0 ? item.tags : ['Homemade', 'Freshly Prepared', 'Healthy Spices'],
            provider: {
              id: providerInfo._id,
              name: providerInfo.kitchenName || 'Home Cook',
              rating: providerInfo.rating || 5.0,
              reviewsCount: providerInfo.totalReviews || 24,
              avatar: providerInfo.avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=256',
              joined: providerInfo.createdAt ? new Date(providerInfo.createdAt).getFullYear() : '2025',
              bio: providerInfo.bio || 'Passionate about sharing home cooking with the community.'
            },
            reviews: [
              { id: 1, user: 'John D.', rating: 5, comment: 'Absolutely delicious! Tastes just like home.', date: '2 days ago' },
              { id: 2, user: 'Sarah M.', rating: 4, comment: 'Very rich and flavorful. Will definitely order again.', date: '1 week ago' }
            ]
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
    };
    fetchFoodDetail();
  }, [id]);

  const handleReserve = () => {
    setIsReserved(true);
    setTimeout(() => alert(`Reserved ${quantity}x ${food.name}!`), 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-28 md:pb-10 pt-16 md:pt-20 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="w-full lg:w-2/3">
              <div className="rounded-3xl h-96 bg-gray-200 animate-pulse mb-8" />
              <div className="bg-white rounded-3xl p-6 md:p-8 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
              </div>
            </div>
            <div className="w-full lg:w-1/3 space-y-6">
              <div className="bg-white rounded-3xl p-6 h-48 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !food) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500 text-3xl">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Dish</h2>
          <p className="text-gray-500 mb-6 text-sm">{error || 'Dish not found'}</p>
          <div className="flex gap-3 justify-center">
            <Link to="/food" className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-gray-800 transition-colors">
              Back to Food
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 md:pb-10 pt-16 md:pt-20">
      {/* Top Header / Breadcrumbs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/food" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-brand-green transition-colors">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Food
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Left Column */}
          <div className="w-full lg:w-2/3">
            <div className="rounded-3xl overflow-hidden bg-white shadow-sm border border-gray-100 mb-8">
              <div className="aspect-[16/9] w-full relative">
                <img 
                  src={food.imageUrl} 
                  alt={food.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-sm font-bold text-gray-800 shadow-sm">
                  {food.category}
                </div>
              </div>
              
              <div className="p-6 md:p-8">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                  <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{food.name}</h1>
                    <div className="flex items-center text-gray-500 gap-4 text-sm">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {food.availabilityTime}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        {food.quantityAvailable} left
                      </div>
                    </div>
                  </div>
                  <div className="text-right hidden md:block">
                    <div className="text-3xl font-black text-brand-green">₹{food.price}</div>
                    <div className="text-sm text-gray-500">per portion</div>
                  </div>
                </div>

                <div className="prose max-w-none text-gray-600 mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Description</h3>
                  <p>{food.description}</p>
                </div>

                {food.ingredients && (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Tags & Properties</h3>
                    <div className="flex flex-wrap gap-2">
                      {food.ingredients.map((ingredient, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8 lg:mb-0">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                Reviews 
                <span className="ml-3 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-sm font-medium">{food.reviews.length}</span>
              </h3>
              <div className="space-y-6">
                {food.reviews.map(review => (
                  <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-gray-900">{review.user}</div>
                      <div className="text-sm text-gray-500">{review.date}</div>
                    </div>
                    <div className="flex text-amber-400 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-full lg:w-1/3 space-y-6 relative">
            {/* Desktop Action Panel */}
            <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-brand-green/20 p-6 sticky top-24">
              <div className="text-3xl font-black text-brand-green mb-1">₹{food.price} <span className="text-sm font-medium text-gray-500">per portion</span></div>
              <div className="text-sm text-gray-500 mb-6">Total: ₹{(food.price * quantity)}</div>
              
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Quantity</label>
                <QuantitySelector quantity={quantity} setQuantity={setQuantity} max={food.quantityAvailable} />
              </div>

              <ReserveButton 
                onClick={handleReserve} 
                price={food.price} 
                quantity={quantity} 
                disabled={isReserved || food.quantityAvailable === 0} 
              />
              
              {isReserved && (
                <p className="mt-3 text-sm text-center font-medium text-green-600 bg-green-50 py-2 rounded-lg">Reservation successful!</p>
              )}
            </div>

            {/* Provider Info Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">About the Provider</h3>
              <div className="flex items-center gap-4 mb-4">
                <img src={food.provider.avatar} alt={food.provider.name} className="w-16 h-16 rounded-full object-cover shadow-sm" />
                <div>
                  <div className="font-bold text-lg text-gray-900">{food.provider.name}</div>
                  <div className="flex items-center text-sm font-medium text-amber-500">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    {food.provider.rating} ({food.provider.reviewsCount} reviews)
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">{food.provider.bio}</p>
              <div className="text-sm text-gray-500 mb-6">Joined {food.provider.joined}</div>
              
              <Link to={`/provider/${food.provider.id}`} className="block w-full py-2.5 px-4 text-center rounded-xl font-bold text-brand-green border-2 border-brand-green/20 hover:bg-brand-green/5 transition-colors">
                View Profile
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] z-50 flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <div className="text-sm font-bold text-gray-500">Total</div>
          <div className="text-xl font-black text-brand-green">₹{(food.price * quantity)}</div>
        </div>
        <div className="flex items-center gap-3">
          <QuantitySelector quantity={quantity} setQuantity={setQuantity} max={food.quantityAvailable} />
          <button 
            onClick={handleReserve}
            disabled={isReserved || food.quantityAvailable === 0}
            className="bg-brand-green text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-brand-green/30 disabled:opacity-50 min-w-[100px]"
          >
            {isReserved ? 'Reserved' : 'Reserve'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodDetail;
