import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Package, Clock, MapPin, ChefHat, CheckCircle, AlertCircle } from 'lucide-react';

const CustomerBookings = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get('/bookings/customer');
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-amber-100 text-amber-800',
      ACCEPTED: 'bg-blue-100 text-blue-800',
      PREPARING: 'bg-purple-100 text-purple-800',
      READY_FOR_PICKUP: 'bg-emerald-100 text-emerald-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-rose-100 text-rose-800',
    };
    return colors[status] || colors.PENDING;
  };

  const getStatusSteps = (status) => {
    const steps = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'COMPLETED'];
    if (status === 'CANCELLED') return -1;
    return steps.indexOf(status);
  };

  if (loading) return <div className="animate-pulse p-4">Loading your reservations...</div>;
  if (error) return <div className="text-rose-500 p-4">{error}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Reservation History</h2>
      
      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700">No reservations found</h3>
          <p className="text-gray-500">You haven't made any food reservations yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const currentStep = getStatusSteps(order.status);
            
            return (
              <div key={order._id} className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-4 pb-4 border-b border-gray-50">
                  <div className="flex gap-4 items-center">
                    {order.foodItem?.images?.[0] ? (
                      <img src={order.foodItem.images[0]} alt={order.foodItem.name} className="w-16 h-16 rounded-xl object-cover" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{order.foodItem?.name} <span className="text-sm text-gray-500 font-normal">x{order.quantity}</span></h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <ChefHat className="w-3.5 h-3.5" /> {order.provider?.kitchenName}
                      </p>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <div className="font-black text-brand-green text-xl">₹{order.totalPrice}</div>
                    <div className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold mt-1 ${getStatusColor(order.status)}`}>
                      {order.status.replace(/_/g, ' ')}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-gray-900 block">Pickup Location</strong>{order.pickupAddressSnapshot}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span><strong className="text-gray-900 block">Pickup Window</strong>{order.pickupWindowSnapshot}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>
                        {order.bringContainer ? (
                          <strong className="text-amber-600">🥡 Bring Your Own Container</strong>
                        ) : (
                          <strong className="text-emerald-600">🍱 Container Included</strong>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {order.status !== 'CANCELLED' && (
                  <div className="relative pt-4">
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-100">
                      <div style={{ width: `${(Math.max(0, currentStep) / 4) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-brand-green transition-all duration-500"></div>
                    </div>
                    <div className="flex justify-between text-[10px] md:text-xs font-bold text-gray-400 px-1">
                      <span className={currentStep >= 0 ? 'text-brand-green' : ''}>Pending</span>
                      <span className={currentStep >= 1 ? 'text-brand-green' : ''}>Accepted</span>
                      <span className={currentStep >= 2 ? 'text-brand-green' : ''}>Preparing</span>
                      <span className={currentStep >= 3 ? 'text-brand-green' : ''}>Ready</span>
                      <span className={currentStep >= 4 ? 'text-brand-green' : ''}>Completed</span>
                    </div>
                  </div>
                )}
                
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerBookings;
