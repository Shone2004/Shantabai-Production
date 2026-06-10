import React, { useState } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import StatsCards from "../components/dashboard/StatsCards";
import CustomerBookings from "../components/customer/CustomerBookings";
import { LayoutDashboard, CalendarDays } from "lucide-react";

const CustomerDash = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-brand-cream">
      {/* We can pass activeTab down to Sidebar if we refactor it, but for now we'll just handle it here or modify Sidebar later. */}
      {/* For simplicity, let's just show standard Sidebar, but we might want a simple navigation for the customer here. */}
      
      {/* Assuming Sidebar handles its own nav, we'll keep it as is, or we'll inject a mini nav here for the MVP. */}
      <Sidebar />

      <div className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col h-screen overflow-y-auto">
        <Topbar />

        {/* Mini tabs for Customer Dashboard */}
        <div className="mt-8 flex gap-4 border-b border-gray-200 pb-4 mb-6">
          <button 
            onClick={() => setActiveTab("dashboard")} 
            className={`flex items-center gap-2 font-bold pb-2 ${activeTab === 'dashboard' ? 'text-brand-green border-b-2 border-brand-green' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab("bookings")} 
            className={`flex items-center gap-2 font-bold pb-2 ${activeTab === 'bookings' ? 'text-brand-green border-b-2 border-brand-green' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <CalendarDays className="w-5 h-5" /> My Reservations
          </button>
        </div>

        {activeTab === "dashboard" ? (
          <>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                Welcome Back 👋
              </h1>
              <p className="text-gray-500 mt-2">
                Manage your bookings, discover cooks, and track your orders.
              </p>
            </div>

            <StatsCards />

            <div className="mt-10 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Recent Activity
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <span>Booked Home Cook Service</span>
                  <span className="text-brand-green font-medium">
                    Confirmed
                  </span>
                </div>
                <div className="flex justify-between items-center border-b pb-3">
                  <span>Tiffin Subscription Renewed</span>
                  <span className="text-brand-green font-medium">
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Added New Favorite Chef</span>
                  <span className="text-brand-green font-medium">
                    Saved
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <CustomerBookings />
        )}
      </div>
    </div>
  );
};

export default CustomerDash;