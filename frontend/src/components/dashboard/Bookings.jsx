import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ChatWidget from '../chat/ChatWidget';

const avatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0A4D2B&color=fff&size=128`;

const mockBookings = [
  {
    id: 'BKG-001',
    providerName: 'Savita Home Cook',
    serviceType: 'Daily Cooking (Dinner)',
    date: '10 Jun 2026',
    time: '7:30 PM',
    status: 'Confirmed',
    price: '₹180/day',
    paymentStatus: 'Paid via UPI',
    image: avatar('Savita Home Cook'),
    tab: 'upcoming',
    providerUserId: null
  },
  {
    id: 'BKG-002',
    providerName: 'Rohit Event Chef',
    serviceType: 'Birthday Party Catering',
    date: '15 Jun 2026',
    time: '6:00 PM',
    status: 'Pending',
    price: '₹3,500',
    paymentStatus: 'Payment Pending',
    image: avatar('Rohit Event Chef'),
    tab: 'upcoming',
    providerUserId: null
  },
  {
    id: 'BKG-003',
    providerName: "Meena's Kitchen",
    serviceType: 'Tiffin Service (Lunch)',
    date: '05 Jun 2026',
    time: '12:30 PM',
    status: 'Completed',
    price: '₹150/day',
    paymentStatus: 'Paid',
    image: avatar("Meena's Kitchen"),
    tab: 'completed',
    providerUserId: null
  }
];

export default function Bookings() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatPartner, setChatPartner] = useState(null);

  // Core function to load transactions from API or LocalStorage fallback
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/customer');
      if (res.data.success && res.data.orders && res.data.orders.length > 0) {
        const dbBookings = res.data.orders.map(order => ({
          id: order._id,
          providerName: order.provider?.kitchenName || 'Chef',
          providerUserId: order.provider?.user,
          serviceType: order.foodItem?.name || 'Home Cook Service',
          date: new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          time: new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          status: order.status === 'COMPLETED' ? 'Completed' : (order.status === 'CANCELLED' ? 'Cancelled' : (order.status === 'PENDING' ? 'Pending' : 'Confirmed')),
          price: `₹${order.totalPrice}`,
          paymentStatus: order.paymentMethod === 'CASH_ON_PICKUP' ? 'Cash on Pickup' : 'Paid',
          image: order.provider?.avatar || avatar(order.provider?.kitchenName || 'Chef'),
          tab: order.status === 'COMPLETED' ? 'completed' : (order.status === 'CANCELLED' ? 'cancelled' : 'upcoming'),
          rawOrder: order
        }));
        setAllBookings(dbBookings);
        localStorage.setItem('bookings', JSON.stringify(dbBookings));
      } else {
        setAllBookings(mockBookings);
      }
    } catch (err) {
      console.error('Failed to fetch user bookings from API:', err);
      const stored = JSON.parse(localStorage.getItem('bookings'));
      setAllBookings(stored && stored.length > 0 ? stored : mockBookings);
    } finally {
      setLoading(false);
    }
  };

  // Run once on component layout mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Broadcasts changes globally so the main dashboard triggers an instant update
  const dispatchDashboardSync = (updatedData) => {
    localStorage.setItem('bookings', JSON.stringify(updatedData));
    window.dispatchEvent(new Event('storage-update'));
  };

  // Dynamic Cancel Handler (Using ESM Browser Safe Syntax)
  const handleCancelBooking = async (bookingId) => {
    const isMock = mockBookings.some((m) => m.id === bookingId);
    
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    if (!isMock) {
      try {
        // Hits your newly added backend route layout: /bookings/customer/:orderId/cancel
        const res = await api.patch(`/bookings/customer/${bookingId}/cancel`, { 
          status: 'CANCELLED' 
        });
        
        if (res.data.success || res.status === 200) {
          const updated = allBookings.map(b => 
            b.id === bookingId ? { ...b, status: 'Cancelled', tab: 'cancelled' } : b
          );
          
          setAllBookings(updated);
          dispatchDashboardSync(updated);
          alert('Booking cancelled successfully!');
        }
      } catch (err) {
        console.error('Cancel request execution error:', err);
        alert(
          err.response?.data?.message || 
          'Failed to securely update backend records. Please try again.'
        );
      }
      return;
    }

    // Mock data update logic
    const updatedBookings = allBookings.map((booking) => {
      if (booking.id === bookingId) {
        return {
          ...booking,
          status: 'Cancelled',
          tab: 'cancelled',
          paymentStatus: booking.paymentStatus === 'Paid' ? 'Refunded' : booking.paymentStatus,
        };
      }
      return booking;
    });

    setAllBookings(updatedBookings);
    dispatchDashboardSync(updatedBookings);
  };

  // Comprehensive Review Handler (Includes Date & Time Details)
  const handleLeaveReview = async (booking) => {
    const reviewPayload = {
      bookingId: booking.id,
      providerName: booking.providerName,
      serviceRendered: booking.serviceType,
      transactionValue: booking.price,
      completionDate: booking.date, 
      completionTime: booking.time, 
      submittedAt: new Date().toISOString()
    };

    const rating = prompt(`Leave a Review for ${reviewPayload.providerName}\nService: ${reviewPayload.serviceRendered}\nDate: ${reviewPayload.completionDate} at ${reviewPayload.completionTime}\n\nEnter Rating (1 to 5):`, "5");
    if (!rating) return;
    
    const comment = prompt("Enter your review notes / comments:");
    if (!comment) return;

    try {
      const res = await api.post('/reviews', { ...reviewPayload, rating, comment });
      if (res.data.success) {
        alert('Thank you! Your feedback has been securely posted.');
      }
    } catch (err) {
      console.warn("API Review endpoint missing; logging structured transaction metadata:", reviewPayload);
      alert(`Mock Review Saved Successfully!\n\nLogged Data:\n- Provider: ${reviewPayload.providerName}\n- Date: ${reviewPayload.completionDate}\n- Time: ${reviewPayload.completionTime}\n- Feedback: "${comment}" (${rating}⭐)`);
    }
  };

  // Dynamic Rebooking Action
  const handleRebook = async (booking) => {
    try {
      if (!booking.providerUserId) {
        alert(`Rebooking Mock Feature: Initializing a new fresh request for "${booking.serviceType}" with ${booking.providerName}.`);
        return;
      }

      const rebookPayload = {
        providerId: booking.providerUserId,
        items: [{ name: booking.serviceType, quantity: 1 }],
        totalPrice: booking.price.replace(/[^\d]/g, ''), 
        paymentMethod: booking.paymentStatus === 'Cash on Pickup' ? 'CASH_ON_PICKUP' : 'ONLINE'
      };

      const res = await api.post('/bookings', rebookPayload);
      if (res.data.success) {
        alert('Rebooked successfully! Check your upcoming tab.');
        fetchOrders();
      }
    } catch (err) {
      console.error('Rebooking process broke:', err);
      alert('Could not execute rebook request.');
    }
  };

  const handleOpenChat = (booking) => {
    setChatPartner({
      id: booking.providerUserId,
      name: booking.providerName,
      role: 'PROVIDER'
    });
    setChatOpen(true);
  };

  const filteredBookings = allBookings.filter(
    (booking) => booking.tab === activeTab
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-50 text-green-600 border-green-100';
      case 'Pending': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Completed': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Cancelled': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-300 pb-12">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-500">
            Manage your past and upcoming service appointments.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto scrollbar-hide">
        {['upcoming', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-4 text-sm font-bold capitalize whitespace-nowrap transition-colors relative flex items-center gap-2 ${
              activeTab === tab
                ? 'text-primary'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-6">
        {loading ? (
          <div className="animate-pulse p-8 text-center text-gray-400">Loading bookings...</div>
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="flex items-center gap-5 w-full md:w-auto">
                  <img
                    src={booking.image}
                    alt={booking.providerName}
                    className="w-16 h-16 rounded-xl object-cover border border-gray-100 shadow-sm"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/100x100/png?text=Chef';
                    }}
                  />
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 leading-tight">
                      {booking.providerName}
                    </h3>
                    <p className="text-sm text-gray-500">{booking.serviceType}</p>
                    <p className="text-xs text-gray-400 mt-1 font-mono">
                      ID: {booking.id}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-6 w-full md:w-auto mt-4 md:mt-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{booking.date}</p>
                      <p className="text-xs text-gray-500">{booking.time}</p>
                    </div>
                  </div>

                  <div className="hidden md:block w-px h-10 bg-gray-200"></div>

                  <div className="flex flex-col items-start md:items-end gap-1.5">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusBadge(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                    <p className="text-sm font-black text-gray-900">{booking.price}</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  {booking.paymentStatus.includes('Paid') ||
                  booking.paymentStatus === 'Refunded' || booking.paymentStatus === 'Cash on Pickup' ? (
                    <svg
                      className="w-4 h-4 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-orange-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                  {booking.paymentStatus}
                </div>

                <div className="flex gap-3 w-full sm:w-auto justify-end">
                  {booking.providerUserId && (
                    <button
                      onClick={() => handleOpenChat(booking)}
                      className="flex-1 sm:flex-none px-5 py-2 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>💬 Chat with Cook</span>
                    </button>
                  )}

                  {activeTab === 'upcoming' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="flex-1 sm:flex-none px-5 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}

                  {activeTab === 'completed' && (
                    <>
                      <button 
                        onClick={() => handleLeaveReview(booking)}
                        className="flex-1 sm:flex-none px-5 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
                      >
                        Leave Review
                      </button>
                      <button 
                        onClick={() => handleRebook(booking)}
                        className="flex-1 sm:flex-none px-5 py-2 text-sm font-bold text-white bg-[#0A4D2B] rounded-xl hover:bg-[#07361e] transition-colors cursor-pointer"
                      >
                        Rebook
                      </button>
                    </>
                  )}

                  {activeTab === 'cancelled' && (
                    <button className="w-full sm:w-auto px-5 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer">
                      View Details
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              No {activeTab} bookings
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              You don't have any {activeTab} service appointments right now.
            </p>
          </div>
        )}
      </div>

      {/* Reusable Chat Widget */}
      <ChatWidget
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        partnerId={chatPartner?.id}
        partnerName={chatPartner?.name}
        partnerRole={chatPartner?.role}
        conversationType="CUSTOMER_PROVIDER"
      />
    </div>
  );
}