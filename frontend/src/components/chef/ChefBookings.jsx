import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CalendarDays, MapPin, Clock, User, Phone, CheckCircle, Package, Truck, XCircle, AlertCircle } from 'lucide-react';

const ChefBookings = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/provider');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      const res = await api.patch(`/bookings/provider/${orderId}/status`, { status });
      if (res.data.success) {
        setOrders(orders.map(o => o._id === orderId ? { ...o, status } : o));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
      ACCEPTED: 'bg-blue-100 text-blue-800 border-blue-200',
      PREPARING: 'bg-purple-100 text-purple-800 border-purple-200',
      READY_FOR_PICKUP: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      COMPLETED: 'bg-gray-100 text-gray-800 border-gray-200',
      CANCELLED: 'bg-rose-100 text-rose-800 border-rose-200',
    };
    return `px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || styles.PENDING}`;
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading bookings...</div>;
  if (error) return <div className="p-8 text-center text-rose-500">{error}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manage Reservations</h2>
          <p className="text-sm text-slate-500 mt-1">Review and update customer orders.</p>
        </div>
        <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
          <CalendarDays className="w-6 h-6" />
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No Bookings Yet</h3>
          <p className="text-slate-500">When customers reserve your food, they will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map(order => (
            <div key={order._id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-5">
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-slate-900">{order.foodItem?.name} <span className="text-emerald-600">x{order.quantity}</span></h3>
                  <span className={getStatusBadge(order.status)}>{order.status.replace(/_/g, ' ')}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" /> {order.customer?.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" /> {order.customer?.phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" /> {new Date(order.createdAt).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-slate-400" /> Total: ₹{order.totalPrice}
                  </div>
                </div>

                {order.customerNote && (
                  <div className="bg-amber-50 text-amber-900 p-3 rounded-xl text-sm border border-amber-100">
                    <span className="font-bold block mb-1">Note from customer:</span>
                    {order.customerNote}
                  </div>
                )}
                
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span className={`px-2 py-1 rounded font-bold ${order.bringContainer ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                    {order.bringContainer ? '🥡 Bring Container' : '🍱 Container Included'}
                  </span>
                </div>
              </div>

              <div className="md:border-l md:pl-5 border-slate-100 flex flex-col justify-center gap-2 md:w-48">
                {order.status === 'PENDING' && (
                  <>
                    <button onClick={() => updateStatus(order._id, 'ACCEPTED')} className="bg-emerald-500 text-white py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors">Accept</button>
                    <button onClick={() => updateStatus(order._id, 'CANCELLED')} className="bg-rose-100 text-rose-700 py-2 rounded-xl text-sm font-bold hover:bg-rose-200 transition-colors">Reject</button>
                  </>
                )}
                {order.status === 'ACCEPTED' && (
                  <button onClick={() => updateStatus(order._id, 'PREPARING')} className="bg-blue-500 text-white py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-colors">Start Preparing</button>
                )}
                {order.status === 'PREPARING' && (
                  <button onClick={() => updateStatus(order._id, 'READY_FOR_PICKUP')} className="bg-emerald-500 text-white py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors">Mark Ready</button>
                )}
                {order.status === 'READY_FOR_PICKUP' && (
                  <button onClick={() => updateStatus(order._id, 'COMPLETED')} className="bg-slate-900 text-white py-2 rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-colors">Mark Completed</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChefBookings;
