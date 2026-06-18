import React, { useState, useEffect } from "react";
import { Crown, CheckCircle, Sparkles, Loader2 } from "lucide-react";

// Utility helper to inject Razorpay checkout script cleanly onto the DOM
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Subscription() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [kitchenData, setKitchenData] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/subscription";
  
  // Shared configurations for authenticated API requests
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token"); // Assumes JWT is stored under 'token' key
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/status`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch account limits.");
      }

      const data = await response.json();
      setKitchenData(data);
    } catch (err) {
      console.error("Subscription retrieval error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- REPLACED: TEMPORARY POPUP MOCK UPGRADE LOGIC ---
  const handleUpgrade = async (planType) => {
    if (planType === kitchenData?.planType) return;

    setActionLoading(true);

    // Create a temporary simulated checkout interactive window prompt
    const confirmPayment = window.confirm(
      `[MOCK CHECKOUT]\n\nWould you like to simulate a successful payment processing flow for the ${planType} tier (₹${planType === 'GROWTH' ? '299' : '499'})?`
    );

    if (!confirmPayment) {
      setActionLoading(false);
      return;
    }

    try {
      // Dispatch validation payload straight to backend mock-enabled routing path
      const verifyResponse = await fetch(`${API_BASE_URL}/verify-payment`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          planType,
          razorpay_payment_id: "mock_pay_" + Math.random().toString(36).substr(2, 9),
          razorpay_subscription_id: "mock_sub_" + Math.random().toString(36).substr(2, 9),
          razorpay_signature: "mock_signature_passed", // Special string key to bypass crypto on backend
        }),
      });

      const verifyData = await verifyResponse.json();

      if (verifyData.success) {
        alert(`Success! Your account has been temporarily upgraded to ${planType}.`);
        fetchSubscriptionStatus(); // Instantly pull updated database allocations
      } else {
        alert("Mock checkout verification rejected by server.");
      }
    } catch (err) {
      console.error("Mock processing runtime error:", err);
      alert("Failed connecting to local development server endpoint.");
    } finally {
      setActionLoading(false);
    }
  };
  // --- END OF REPLACED SECTION ---

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="animate-spin text-emerald-500 w-12 h-12" />
        <p className="text-slate-500 font-medium text-sm">Synchronizing membership data...</p>
      </div>
    );
  }

  const { usedListings, totalListings, planType } = kitchenData || { usedListings: 0, totalListings: 20, planType: "FREE" };
  const isUnlimited = totalListings > 1000;
  const percentage = isUnlimited ? 100 : Math.min((usedListings / totalListings) * 100, 100);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-900">Subscription Plans</h1>
        <p className="text-slate-500 mt-2">Grow your kitchen and reach more customers</p>
      </div>

      {/* Account Usage Status Panel */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
          <div>
            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full tracking-wide">
              CURRENT PLAN
            </span>
            <h2 className="text-2xl font-black mt-3">
              {planType.charAt(0) + planType.slice(1).toLowerCase()} Plan
            </h2>
            <p className="text-slate-500 mt-1">
              {planType === "FREE" ? "Start selling your homemade food today" : "Enjoy premium distribution advantages"}
            </p>
          </div>

          {planType === "FREE" && (
            <button
              disabled={actionLoading}
              onClick={() => handleUpgrade("GROWTH")}
              className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition disabled:opacity-50 flex items-center gap-2"
            >
              {actionLoading && <Loader2 className="animate-spin w-4 h-4" />}
              Upgrade Now
            </button>
          )}
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-sm font-medium mb-2">
            <span className="text-slate-700">Listings Capacity Usage</span>
            <span className="text-slate-900 font-bold">
              {usedListings} / {isUnlimited ? "∞" : totalListings}
            </span>
          </div>

          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p className="text-xs text-slate-500 mt-2">
            {isUnlimited 
              ? "Your upgraded privileges grant you unlimited listings." 
              : `You have ${totalListings - usedListings} menu slots available before hitting limit parameters.`}
          </p>
        </div>
      </div>

      {/* Plans Comparison Deck */}
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Tier: Free */}
        <div className={`bg-white rounded-3xl border p-8 transition-all ${planType === "FREE" ? "border-emerald-500 ring-4 ring-emerald-500/10" : "border-slate-200"}`}>
          <h3 className="text-2xl font-black text-slate-900">Free</h3>
          <div className="mt-4">
            <span className="text-5xl font-black text-slate-900">₹0</span>
            <span className="text-slate-500"> /month</span>
          </div>
          <ul className="mt-6 space-y-4 text-slate-600 text-sm font-medium">
            <li className="flex items-center gap-2">
              <CheckCircle size={18} className="text-green-500 shrink-0" /> 20 Active Listings
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={18} className="text-green-500 shrink-0" /> Direct Customer Chats
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={18} className="text-green-500 shrink-0" /> Basic Geographic Search
            </li>
          </ul>
          <button disabled className="mt-8 w-full border border-slate-200 py-3 rounded-xl font-bold bg-slate-50 text-slate-400 cursor-not-allowed">
            {planType === "FREE" ? "Active Account Default" : "Standard Tier Locked"}
          </button>
        </div>

        {/* Tier: Growth */}
        <div className={`relative rounded-3xl p-8 text-white shadow-xl transition transform hover:scale-[1.02] ${planType === "GROWTH" ? "bg-slate-900 ring-4 ring-emerald-400" : "bg-gradient-to-br from-emerald-500 to-green-600"}`}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider">
            Most Popular
          </div>
          <Sparkles className="w-10 h-10 mb-4 text-yellow-300 animate-pulse" />
          <h3 className="text-2xl font-black">Growth</h3>
          <div className="mt-4">
            <span className="text-5xl font-black">₹299</span>
            <span className="text-white/80"> /month</span>
          </div>
          <p className="mt-2 text-white/95 text-sm">Perfect for active home micro-kitchens</p>
          <ul className="mt-6 space-y-4 text-sm font-medium text-emerald-50">
            <li className="flex items-center gap-2">✓ Unlimited Menu Listings</li>
            <li className="flex items-center gap-2">✓ Verified Professional Badge</li>
            <li className="flex items-center gap-2">✓ Local Customer Search Booster</li>
            <li className="flex items-center gap-2">✓ Dynamic Priority Placement</li>
          </ul>
          <button
            disabled={actionLoading || planType === "GROWTH"}
            onClick={() => handleUpgrade("GROWTH")}
            className="mt-8 w-full bg-white text-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 py-3 rounded-xl font-black shadow-md transition active:translate-y-0.5 flex items-center justify-center gap-2"
          >
            {actionLoading && planType === "FREE" && <Loader2 className="animate-spin w-4 h-4 text-emerald-600" />}
            {planType === "GROWTH" ? "Current Subscription" : "Upgrade to Growth"}
          </button>
        </div>

        {/* Tier: Premium */}
        <div className={`bg-white rounded-3xl border-2 p-8 relative transition-all ${planType === "PREMIUM" ? "border-emerald-500 ring-4 ring-emerald-500/10" : "border-yellow-400"}`}>
          <div className="absolute top-6 right-6">
            <Crown className="text-yellow-500 w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">Premium</h3>
          <div className="mt-4">
            <span className="text-5xl font-black text-slate-900">₹499</span>
            <span className="text-slate-500"> /month</span>
          </div>
          <p className="mt-2 text-slate-500 text-sm">Maximum market visibility & operations scale</p>
          <ul className="mt-6 space-y-4 text-slate-600 text-sm font-medium">
            <li className="flex items-center gap-2 text-slate-900 font-bold">
              <CheckCircle size={18} className="text-yellow-500 shrink-0" /> Includes Everything in Growth
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={18} className="text-yellow-500 shrink-0" /> Top-of-Search Ad Carousel
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={18} className="text-yellow-500 shrink-0" /> Dedicated 24/7 Priority Support
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={18} className="text-yellow-500 shrink-0" /> Premium VIP Kitchen Badge
            </li>
          </ul>
          <button
            disabled={actionLoading || planType === "PREMIUM"}
            onClick={() => handleUpgrade("PREMIUM")}
            className="mt-8 w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-100 disabled:text-slate-400 text-white py-3 rounded-xl font-black transition shadow-sm flex items-center justify-center gap-2"
          >
            {actionLoading && planType !== "PREMIUM" && <Loader2 className="animate-spin w-4 h-4" />}
            {planType === "PREMIUM" ? "Current Subscription" : "Go Premium Elite"}
          </button>
        </div>
      </div>
    </div>
  );
}