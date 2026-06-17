import React, { useState, useEffect } from "react";

import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import StatsCards from "../components/dashboard/StatsCards";

import FindServices from "../components/dashboard/FindServices";
import Bookings from "../components/dashboard/Bookings";
import Favorites from "../components/dashboard/Favorites";
import CustomerSupport from "../components/customer/CustomerSupport";
import ChatSection from "../components/chat/ChatSection";


const CustomerDash = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [recentBookings, setRecentBookings] = useState([]);

  // Fetch updated local storage items whenever the dashboard tab comes into focus
  useEffect(() => {
    if (activeTab === "dashboard") {
      const savedBookings = JSON.parse(localStorage.getItem("bookings")) || [];
      // Keep the 3 most recent interactive user activities
      setRecentBookings(savedBookings.slice(-3).reverse());
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-brand-cream">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col h-screen overflow-y-auto pt-20 lg:pt-8 lg:ml-64">
        {/* Dashboard Home tab view */}
        {activeTab === "dashboard" && (
          <>
            <div className="mt-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                Welcome Back 👋
              </h1>
              <p className="text-gray-500 mt-2">
                Manage your bookings, discover cooks, and track your orders.
              </p>
            </div>

            {/* Passes activeTab down to allow an internal update trigger if needed */}
            <StatsCards triggerUpdate={activeTab} />

            <div className="mt-10 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Recent Activity
              </h2>

              <div className="space-y-4">
                {recentBookings.length > 0 ? (
                  recentBookings.map((bk) => (
                    <div key={bk.id} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
                      <div>
                        <span className="font-medium text-gray-800 block md:inline">{bk.providerName}</span>
                        <span className="text-xs text-gray-400 md:ml-2">({bk.serviceType})</span>
                      </div>
                      <span 
                        className={`font-bold text-sm ${
                          bk.status === 'Cancelled' ? 'text-red-500' : 'text-green-600'
                        }`}
                      >
                        {bk.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex justify-between items-center border-b pb-3">
                      <span>Booked Home Cook Service</span>
                      <span className="text-green-600 font-medium">Confirmed</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-3">
                      <span>Tiffin Subscription Renewed</span>
                      <span className="text-green-600 font-medium">Active</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {/* Find Services View */}
        {activeTab === "find-services" && (
          <div className="mt-8">
            <FindServices />
          </div>
        )}

        {/* Bookings Management View */}
        {activeTab === "bookings" && (
          <div className="mt-8">
            <Bookings />
          </div>
        )}

        {/* Favorites Management View */}
        {activeTab === "favorites" && (
          <div className="mt-8">
            <Favorites />
          </div>
        )}

        {/* Chats view */}
        {activeTab === "chats" && (
          <div className="mt-8 h-full">
            <ChatSection />
          </div>
        )}

        {/* Support Ticket View */}
        {activeTab === "support" && (
          <div className="mt-8">
            <CustomerSupport />
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDash;