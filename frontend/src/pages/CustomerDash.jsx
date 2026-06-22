import React, { useState, useEffect, useMemo, useTransition } from "react";

// Layout & Global Components
import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import StatsCards from "../components/dashboard/StatsCards";

// Core View Subcomponents
import FindServices from "../components/dashboard/FindServices";
import Bookings from "../components/dashboard/Bookings";
import Favorites from "../components/dashboard/Favorites";
import CustomerSupport from "../components/customer/CustomerSupport";
import ChatSection from "../components/chat/ChatSection";

/**
 * Tab view configuration layout matrix
 */
const TAB_CONFIG = {
  "find-services": { component: FindServices, wrapperClass: "mt-8" },
  "bookings":      { component: Bookings,     wrapperClass: "mt-8" },
  "favorites":     { component: Favorites,    wrapperClass: "mt-8" },
  "chats":         { component: ChatSection,  wrapperClass: "mt-8 h-full" },
  "support":       { component: CustomerSupport, wrapperClass: "mt-8" },
};

const CustomerDash = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [recentBookings, setRecentBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, startTransition] = useTransition();

  const handleTabChange = (tabId) => {
    startTransition(() => {
      setActiveTab(tabId);
    });
  };

  useEffect(() => {
    if (activeTab !== "dashboard") return;
    
    let isMounted = true;
    setIsLoading(true);

    try {
      const rawBookings = localStorage.getItem("bookings");
      const savedBookings = rawBookings ? JSON.parse(rawBookings) : [];
      
      if (isMounted) {
        setRecentBookings(Array.isArray(savedBookings) ? savedBookings.slice(-3).reverse() : []);
      }
    } catch (error) {
      console.error("Dashboard Storage Hydration Exception Error:", error);
    } finally {
      if (isMounted) setIsLoading(false);
    }

    return () => { isMounted = false; };
  }, [activeTab]);

  const RenderedSubView = useMemo(() => {
    const config = TAB_CONFIG[activeTab];
    if (!config) return null;
    const Component = config.component;
    return (
      <div className={`${config.wrapperClass} animate-fadeIn`}>
        <Component />
      </div>
    );
  }, [activeTab]);

  return (
    <div className="flex min-h-screen bg-[#faf9f5] font-sans antialiased overflow-x-hidden text-slate-800">
      {/* Primary Sidebar Control Unit */}
      <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* Main Viewport Content Engine */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64 w-full transition-all duration-300">
        
        {/* Topbar safely nested inside the content layout container */}
        <Topbar onNotificationClick={() => {}} onProfileClick={() => {}} />

        {/* Dynamic Inner Component Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 pt-6 overflow-y-auto max-w-[1600px] w-full mx-auto tracking-tight">
          
          {/* Dashboard Home view */}
          {activeTab === "dashboard" && (
            <div className="space-y-10 animate-fadeIn">
              
              {/* Premium Glassmorphic Mesh Hero Banner Panel */}
              <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-tr from-emerald-950 via-emerald-900 to-teal-800 p-8 md:p-12 text-white shadow-xl shadow-emerald-950/10 border border-emerald-800/40">
                {/* Modern Abstract Mesh Gradients */}
                <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-gradient-to-br from-emerald-400/20 to-teal-300/10 rounded-full blur-[80px] pointer-events-none transform translate-x-20 -translate-y-20"></div>
                <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none"></div>

                <div className="relative z-10 max-w-3xl space-y-4">
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 text-emerald-200 border border-white/10 backdrop-blur-md shadow-inner tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse"></span>
                    Premium Client Workspace Active
                  </span>
                  <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none drop-shadow-md bg-gradient-to-r from-white via-white to-emerald-100 bg-clip-text text-transparent">
                    Welcome Back 👋
                  </h1>
                  <p className="text-emerald-100/80 text-sm md:text-lg font-normal max-w-2xl leading-relaxed">
                    Manage your customized dining preferences, evaluate artisan chefs, and monitor your current household meal plans easily from your command center.
                  </p>
                </div>
              </header>

              {/* Grid System Split for Analytics and Logs */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                
                {/* Left/Center: Metrics & Visual Action Cards */}
                <div className="xl:col-span-2 space-y-8">
                  <section aria-label="System Metrics Overview">
                    <div className="flex items-center gap-3 mb-4 pl-1">
                      <div className="w-1.5 h-5 bg-emerald-600 rounded-full"></div>
                      <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Performance Summary</h2>
                    </div>
                    <StatsCards triggerUpdate={activeTab} />
                  </section>

                  {/* High-End Quick Actions Banner Panel */}
                  <section className="bg-gradient-to-r from-teal-900 to-emerald-900 rounded-3xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-6 border border-emerald-800 shadow-lg">
                    <div className="space-y-1 text-center sm:text-left">
                      <h3 className="text-lg font-bold">Ready for something fresh?</h3>
                      <p className="text-emerald-200/80 text-xs">Explore local award-winning culinary talent active in Pune today.</p>
                    </div>
                    <button 
                      onClick={() => handleTabChange("find-services")}
                      className="px-5 py-2.5 bg-white text-emerald-950 hover:bg-emerald-50 active:scale-95 text-xs font-bold rounded-xl transition-all shadow-md shadow-black/10 shrink-0"
                    >
                      Browse Chefs & Meals 🍽️
                    </button>
                  </section>
                </div>

                {/* Right Column: Premium Activity Log Matrix */}
                <section className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-slate-100 flex flex-col self-stretch" aria-label="Recent Account Activities">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700 font-bold text-sm">🗓️</div>
                      <div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">Activity Log</h2>
                        <p className="text-[11px] text-slate-400 font-medium">Real-time status tracking</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50/80 border border-emerald-100 px-3 py-1 rounded-full tracking-wider uppercase">
                      Live
                    </span>
                  </div>

                  <div className="relative flex-1 space-y-6 pl-2">
                    {/* Vertical Connecting Timeline Line */}
                    <div className="absolute top-2 bottom-2 left-[19px] w-[2px] bg-slate-100 pointer-events-none"></div>

                    {isLoading ? (
                      [...Array(3)].map((_, idx) => (
                        <div key={idx} className="relative flex gap-4 animate-pulse">
                          <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0 z-10"></div>
                          <div className="space-y-2 flex-1 pt-1">
                            <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                            <div className="h-3 bg-slate-100 rounded w-1/3"></div>
                          </div>
                        </div>
                      ))
                    ) : recentBookings.length > 0 ? (
                      recentBookings.map((bk) => (
                        <div key={bk.id} className="relative flex gap-4 group transition-all">
                          {/* Status Timeline Ring Node */}
                          <div className={`w-10 h-10 rounded-full border-4 border-white flex items-center justify-center shrink-0 z-10 shadow-sm transition-all group-hover:scale-110 ${
                            bk.status === 'Cancelled' ? 'bg-rose-50 text-rose-600 shadow-rose-100' : 'bg-emerald-50 text-emerald-700 shadow-emerald-100'
                          }`}>
                            <span className="text-sm font-bold">{bk.status === 'Cancelled' ? '✕' : '✓'}</span>
                          </div>

                          {/* Content Bubble Block */}
                          <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-bold text-sm text-slate-800 truncate transition-colors group-hover:text-emerald-900">
                                {bk.providerName}
                              </h4>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md tracking-wide shrink-0 ${
                                bk.status === 'Cancelled' 
                                  ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                              }`}>
                                {bk.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 font-medium truncate">{bk.serviceType}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      /* High-End Design Fallback States */
                      <>
                        <div className="relative flex gap-4 group">
                          <div className="w-10 h-10 rounded-full border-4 border-white bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 z-10 shadow-sm">
                            <span className="text-sm font-bold">✓</span>
                          </div>
                          <div className="flex-1 pt-0.5">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-bold text-sm text-slate-800">Booked Home Cook Service</h4>
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100">Confirmed</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 font-medium">Standard Gourmet Lunch Rotation</p>
                          </div>
                        </div>

                        <div className="relative flex gap-4 group">
                          <div className="w-10 h-10 rounded-full border-4 border-white bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 z-10 shadow-sm">
                            <span className="text-sm font-bold">✓</span>
                          </div>
                          <div className="flex-1 pt-0.5">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-bold text-sm text-slate-800">Tiffin Subscription</h4>
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100">Active</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 font-medium">Auto-renewed successfully</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </section>

              </div>
            </div>
          )}

          {/* Render Active Sub-tab components securely */}
          {RenderedSubView}
        </main>
      </div>
    </div>
  );
};

export default CustomerDash;