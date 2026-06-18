
import React from "react";
import { Crown, CheckCircle, Sparkles } from "lucide-react";

export default function Subscription() {
  const usedListings = 5;
  const totalListings = 20;
  const percentage = (usedListings / totalListings) * 100;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-900">
          Subscription Plans
        </h1>
        <p className="text-slate-500 mt-2">
          Grow your kitchen and reach more customers
        </p>
      </div>

      {/* Current Plan */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
              CURRENT PLAN
            </span>

            <h2 className="text-2xl font-black mt-4">Free Plan</h2>

            <p className="text-slate-500 mt-1">
              Start selling your homemade food today
            </p>
          </div>

          <button className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition">
            Upgrade Now
          </button>
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-sm font-medium mb-2">
            <span>Listings Usage</span>
            <span>
              {usedListings} / {totalListings}
            </span>
          </div>

          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p className="text-xs text-slate-500 mt-2">
            You have {totalListings - usedListings} listings remaining.
          </p>
        </div>
      </div>

      {/* Plans */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Free */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8">
          <h3 className="text-2xl font-black">Free</h3>

          <div className="mt-4">
            <span className="text-5xl font-black">₹0</span>
            <span className="text-slate-500"> /month</span>
          </div>

          <ul className="mt-6 space-y-4">
            <li className="flex items-center gap-2">
              <CheckCircle size={18} className="text-green-500" />
              20 Listings
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={18} className="text-green-500" />
              Customer Chats
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={18} className="text-green-500" />
              Basic Visibility
            </li>
          </ul>

          <button className="mt-8 w-full border border-slate-300 py-3 rounded-xl font-semibold">
            Current Plan
          </button>
        </div>

        {/* Growth */}
        <div className="relative bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl p-8 text-white shadow-2xl scale-105">

          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs font-black px-4 py-1 rounded-full">
            MOST POPULAR
          </div>

          <Sparkles className="w-10 h-10 mb-4" />

          <h3 className="text-2xl font-black">Growth</h3>

          <div className="mt-4">
            <span className="text-5xl font-black">₹299</span>
            <span className="text-white/80"> /month</span>
          </div>

          <p className="mt-2 text-white/90 text-sm">
            Perfect for serious home chefs
          </p>

          <ul className="mt-6 space-y-4">
            <li>✓ Unlimited Listings</li>
            <li>✓ Verified Kitchen Badge</li>
            <li>✓ Priority Ranking</li>
            <li>✓ Featured Search Placement</li>
            <li>✓ More Customer Reach</li>
          </ul>

          <button className="mt-8 w-full bg-white text-green-600 py-3 rounded-xl font-black">
            Upgrade to Growth
          </button>
        </div>

        {/* Premium */}
        <div className="bg-white rounded-3xl border-2 border-yellow-400 p-8 relative">
          <div className="absolute top-5 right-5">
            <Crown className="text-yellow-500" />
          </div>

          <h3 className="text-2xl font-black">Premium</h3>

          <div className="mt-4">
            <span className="text-5xl font-black">₹499</span>
            <span className="text-slate-500"> /month</span>
          </div>

          <p className="mt-2 text-slate-500 text-sm">
            Maximum visibility & growth
          </p>

          <ul className="mt-6 space-y-4">
            <li>✓ Everything in Growth</li>
            <li>✓ Homepage Featured Listing</li>
            <li>✓ Priority Support</li>
            <li>✓ Premium Badge</li>
            <li>✓ Top Search Placement</li>
          </ul>

          <button className="mt-8 w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-xl font-black">
            Go Premium
          </button>
        </div>
      </div>
    </div>
  );
}

