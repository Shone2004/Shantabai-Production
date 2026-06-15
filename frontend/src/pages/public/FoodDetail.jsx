import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import QuantitySelector from '../../components/food/QuantitySelector';
import ReserveButton from '../../components/food/ReserveButton';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

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
            availabilityTime: item.timeWindow || 'Contact Provider',
            quantityAvailable: item.quantity,
            bringContainer: item.bringContainer ?? false,
            ingredients: item.tags && item.tags.length > 0 ? item.tags : ['Homemade', 'Freshly Prepared', 'Healthy Spices'],
            provider: {
              id: providerInfo._id,
              name: providerInfo.kitchenName || 'Home Cook',
              rating: providerInfo.rating || 5.0,
              reviewsCount: providerInfo.totalReviews || 24,
              avatar: providerInfo.avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=256',
              joined: providerInfo.createdAt ? new Date(providerInfo.createdAt).getFullYear() : '2025',
              bio: providerInfo.bio || 'Passionate about sharing home cooking with the community.',
              address: providerInfo.fullAddress || 'Contact Provider'
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
        customerNote
      });

      if (response.data.success) {
        setIsReserved(true);
        setShowModal(false);
        alert('Reservation created successfully!');
        // Refresh quantity
        setFood(prev => ({ ...prev, quantityAvailable: prev.quantityAvailable - quantity }));
      }
    } catch (error) {
      console.error('Reservation failed:', error);
      alert(error.response?.data?.message || 'Failed to create reservation');
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-28 md:pb-10 pt-16 md:pt-20 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="w-full lg:w-2/3">
              <div className="rounded-3xl h-96 bg-gray-200 animate-pulse mb-8" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !food) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>{error || 'Not found'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 md:pb-10 pt-16 md:pt-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-10">
          
          <div className="w-full lg:w-2/3">
            <div className="rounded-3xl overflow-hidden bg-white shadow-sm border border-gray-100 mb-8">
              <div className="aspect-[16/9] w-full relative">
                <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-6 md:p-8">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{food.name}</h1>
                <div className="flex items-center text-gray-500 gap-4 text-sm mb-6">
                  <div>⏰ {food.availabilityTime}</div>
                  <div>📦 {food.quantityAvailable} left</div>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${food.bringContainer ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                    {food.bringContainer ? '🥡 Bring Container' : '🍱 Container Included'}
                  </div>
                </div>
                <div className="prose max-w-none text-gray-600 mb-8">
                  <p>{food.description}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/3 space-y-6 relative">
            <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-brand-green/20 p-6 sticky top-24">
              <div className="text-3xl font-black text-brand-green mb-1">₹{food.price} <span className="text-sm text-gray-500">per portion</span></div>
              <div className="text-sm text-gray-500 mb-6">Total: ₹{(food.price * quantity)}</div>
              
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Quantity</label>
                <QuantitySelector quantity={quantity} setQuantity={setQuantity} max={food.quantityAvailable} />
              </div>

              <ReserveButton 
                onClick={handleReserveClick} 
                price={food.price} 
                quantity={quantity} 
                disabled={food.quantityAvailable === 0} 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40 flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <div className="text-sm font-bold text-gray-500">Total</div>
          <div className="text-xl font-black text-brand-green">₹{(food.price * quantity)}</div>
        </div>
        <div className="flex items-center gap-3">
          <QuantitySelector quantity={quantity} setQuantity={setQuantity} max={food.quantityAvailable} />
          <button 
            onClick={handleReserveClick}
            disabled={food.quantityAvailable === 0}
            className="bg-brand-green text-white px-5 py-2.5 rounded-xl font-bold shadow-lg disabled:opacity-50 min-w-[100px]"
          >
            Reserve
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Confirm Reservation</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="flex gap-4 mb-6">
                <img src={food.imageUrl} alt={food.name} className="w-20 h-20 rounded-xl object-cover" />
                <div>
                  <h3 className="font-bold text-gray-900">{food.name}</h3>
                  <p className="text-sm text-gray-500">by {food.provider.name}</p>
                  <p className="text-brand-green font-bold mt-1">₹{food.price} × {quantity}</p>
                </div>
              </div>

              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Pickup Location</span>
                  <span className="font-medium text-right max-w-[200px] truncate">{food.provider.address}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Pickup Time</span>
                  <span className="font-medium">{food.availabilityTime}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Container</span>
                  <span className={`font-bold ${food.bringContainer ? 'text-amber-600' : 'text-green-600'}`}>
                    {food.bringContainer ? '🥡 Bring Your Own' : '🍱 Provided'}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Optional Note for Chef</label>
                <textarea 
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="E.g. Please keep it less spicy..."
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none resize-none h-20"
                />
              </div>

              {/* Quantity Selector */}
<div className="mb-6">
  <label className="block text-sm font-bold text-gray-700 mb-2">
    Quantity
  </label>

  <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-3">
    <span className="text-gray-600 font-medium">
      Portions
    </span>

    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
        className="w-10 h-10 rounded-lg border border-gray-300 bg-white text-xl font-bold hover:bg-gray-100 transition"
      >
        −
      </button>

      <span className="w-8 text-center text-lg font-bold">
        {quantity}
      </span>

      <button
        type="button"
        onClick={() =>
          setQuantity((prev) =>
            Math.min(food.quantityAvailable, prev + 1)
          )
        }
        className="w-10 h-10 rounded-lg border border-gray-300 bg-white text-xl font-bold hover:bg-gray-100 transition"
      >
        +
      </button>
    </div>
  </div>

  <p className="text-xs text-gray-500 mt-2">
    Available: {food.quantityAvailable} portions
  </p>
</div>

              <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center mb-6">
                <span className="font-bold text-gray-700">Total Amount</span>
                <span className="text-2xl font-black text-brand-green">₹{food.price * quantity}</span>
              </div>

              <button 
                onClick={confirmReservation}
                disabled={reserving}
                className="w-full bg-brand-green text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-brand-green/90 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {reserving ? 'Confirming...' : 'Confirm Reservation'}
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">Payment: Cash on Pickup</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodDetail;