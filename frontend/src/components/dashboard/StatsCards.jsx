import React, { useState, useEffect } from 'react';

export default function StatsCards({ triggerUpdate }) {
  const [stats, setStats] = useState({
    totalBookings: 5,
    upcomingBookings: 2,
    completedBookings: 2,
    totalSpent: 4630
  });

  useEffect(() => {
    // 1. Core structural mock baseline values from your Bookings card templates
    const mockBaselineCount = 5;
    const mockUpcomingCount = 2;
    const mockCompletedCount = 2;
    const mockBaselineSpent = 180 + 150 + 800 + 3000; // Base hardcoded values (ignoring pending)

    // 2. Read new changes safely from storage context
    const stored = JSON.parse(localStorage.getItem('bookings')) || [];
    
    const realTimeUpcoming = stored.filter(b => b.status === 'Confirmed' || b.status === 'Pending').length;
    const realTimeCompleted = stored.filter(b => b.status === 'Completed').length;
    
    // Calculate custom pricing increments safely
    const dynamicAdditionalSpend = stored.reduce((sum, item) => {
      if (item.status !== 'Cancelled') {
        const extractNum = parseInt(item.price.replace(/[^0-9]/g, ''), 10);
        return sum + (isNaN(extractNum) ? 0 : extractNum);
      }
      return sum;
    }, 0);

    setStats({
      totalBookings: mockBaselineCount + stored.length,
      upcomingBookings: mockUpcomingCount + realTimeUpcoming,
      completedBookings: mockCompletedCount + realTimeCompleted,
      totalSpent: mockBaselineSpent + dynamicAdditionalSpend
    });

  }, [triggerUpdate]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
      {/* Total Bookings Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Bookings</p>
          <h3 className="text-3xl font-black text-gray-800 mt-1">{stats.totalBookings}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
          📋
        </div>
      </div>

      {/* Upcoming Cards */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Upcoming</p>
          <h3 className="text-3xl font-black text-gray-800 mt-1">{stats.upcomingBookings}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl font-bold">
          ⏳
        </div>
      </div>

      {/* Completed Cards */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Completed</p>
          <h3 className="text-3xl font-black text-gray-800 mt-1">{stats.completedBookings}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xl font-bold">
          ✅
        </div>
      </div>

      {/* Total Outflow Expenses */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Spent</p>
          <h3 className="text-3xl font-black text-gray-800 mt-1">₹{stats.totalSpent.toLocaleString('en-IN')}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-xl font-bold">
          ₹
        </div>
      </div>
    </div>
  );
}