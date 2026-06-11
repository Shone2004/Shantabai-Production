import React, { useState, useEffect } from 'react';

const avatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f43f5e&color=fff&size=128`;

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
    tab: 'upcoming'
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
    tab: 'upcoming'
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
    tab: 'completed'
  },
  {
    id: 'BKG-004',
    providerName: 'Chef Prakash',
    serviceType: 'Sunday Special Lunch',
    date: '31 May 2026',
    time: '1:00 PM',
    status: 'Completed',
    price: '₹800',
    paymentStatus: 'Paid via Card',
    image: avatar('Chef Prakash'),
    tab: 'completed'
  },
  {
    id: 'BKG-005',
    providerName: "Anjali's Tiffin",
    serviceType: 'Monthly Tiffin Plan',
    date: '01 Jun 2026',
    time: '8:00 AM',
    status: 'Cancelled',
    price: '₹3,000/month',
    paymentStatus: 'Refunded',
    image: avatar("Anjali's Tiffin"),
    tab: 'cancelled'
  }
];

export default function Bookings() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [allBookings, setAllBookings] = useState([]);

  useEffect(() => {
    const syncBookings = () => {
      const savedBookings = JSON.parse(localStorage.getItem('bookings')) || [];
      setAllBookings([
        ...mockBookings,
        ...savedBookings
      ]);
    };

    syncBookings();
    
    window.addEventListener('focus', syncBookings);
    return () => window.removeEventListener('focus', syncBookings);
  }, [activeTab]);

  const filteredBookings = allBookings.filter(
    (booking) => booking.tab === activeTab
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-50 text-green-600 border-green-100';
      case 'Pending':
        return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Completed':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-500 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const handleCancelBooking = (bookingId) => {
    const updatedBookings = allBookings.map((booking) => {
      if (booking.id === bookingId) {
        return {
          ...booking,
          status: 'Cancelled',
          tab: 'cancelled',
          paymentStatus:
            booking.paymentStatus === 'Paid'
              ? 'Refunded'
              : booking.paymentStatus,
        };
      }
      return booking;
    });

    setAllBookings(updatedBookings);

    const customBookings = updatedBookings.filter(
      (booking) => !mockBookings.some((m) => m.id === booking.id)
    );

    localStorage.setItem(
      'bookings',
      JSON.stringify(customBookings)
    );
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-300 pb-12">
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
        {filteredBookings.length > 0 ? (
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
                  booking.paymentStatus === 'Refunded' ? (
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

                <div className="flex gap-3 w-full sm:w-auto">
                  {activeTab === 'upcoming' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="flex-1 sm:flex-none px-5 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      Cancel
                    </button>
                  )}

                  {activeTab === 'completed' && (
                    <>
                      <button className="flex-1 sm:flex-none px-5 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors">
                        Leave Review
                      </button>
                      <button className="flex-1 sm:flex-none px-5 py-2 text-sm font-bold text-primary bg-primary/10 border border-transparent rounded-xl hover:bg-primary/20 transition-colors">
                        Rebook
                      </button>
                    </>
                  )}

                  {activeTab === 'cancelled' && (
                    <button className="w-full sm:w-auto px-5 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors">
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
            {activeTab === 'upcoming' && (
              <button className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors shadow-sm">
                Find Services
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}