import React from "react";
import StatsGrid from "./StatsGrid";
import DashboardCharts from "./DashboardCharts";
import RecentActivity from "./RecentActivity";

export default function OverviewPage({
  stats,
  foods,
  providers,
  statsLoading,
  providersLoading,
  foodsLoading,
  usersLoading,
  fetchStats,
  fetchProviders,
  fetchFoods,
  fetchUsers,
  showToast,
  setActiveTab,
  setSelectedProvider,
  setIsDrawerOpen,
  setSelectedFood,
  setIsFoodModalOpen,
  setFoodToDelete,
  setIsDeleteConfirmOpen,
  formatDateTime
}) {
  const isOverviewLoading = statsLoading || providersLoading || foodsLoading || usersLoading;

  const isToday = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const foodsAddedToday = foods.filter(f => isToday(f.createdAt)).length;
  const chefsRegisteredToday = providers.filter(p => isToday(p.createdAt)).length;
  
  const pendingChefs = providers.filter(p => p.verificationStatus === "PENDING");
  
  const latestChefs = [...providers]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
    
  const recentFoods = [...foods]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
    
  const getActivityFeed = () => {
    const list = [];
    providers.forEach(p => {
      list.push({
        id: `prov-${p._id}`,
        type: "provider",
        title: p.kitchenName,
        detail: `New chef registered from ${p.city || "Unknown Location"}`,
        time: new Date(p.createdAt),
        icon: "👩‍🍳",
        color: "bg-indigo-50 border-indigo-100 text-indigo-650"
      });
    });
    foods.forEach(f => {
      list.push({
        id: `food-${f._id}`,
        type: "food",
        title: f.name,
        detail: `New dish listed by ${f.provider?.kitchenName || "Unknown Kitchen"}`,
        time: new Date(f.createdAt),
        icon: "🍛",
        color: "bg-purple-50 border-purple-100 text-purple-650"
      });
    });
    
    return list
      .sort((a, b) => b.time - a.time)
      .slice(0, 5);
  };

  const activityTimeline = getActivityFeed();
  
  const getHistoricalChartData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const last6Months = [];
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(d.getFullYear(), d.getMonth() - i, 1);
      last6Months.push({
        name: months[targetDate.getMonth()],
        monthIndex: targetDate.getMonth(),
        year: targetDate.getFullYear(),
        "New Chefs": 0,
        "New Dishes": 0
      });
    }
    
    providers.forEach(p => {
      const date = new Date(p.createdAt);
      const match = last6Months.find(m => m.monthIndex === date.getMonth() && m.year === date.getFullYear());
      if (match) match["New Chefs"]++;
    });
    foods.forEach(f => {
      const date = new Date(f.createdAt);
      const match = last6Months.find(m => m.monthIndex === date.getMonth() && m.year === date.getFullYear());
      if (match) match["New Dishes"]++;
    });
    
    return last6Months;
  };

  const historicalChartData = getHistoricalChartData();
  
  const handleRefreshAll = () => {
    fetchStats();
    fetchProviders();
    fetchFoods();
    fetchUsers();
    showToast("success", "Dashboard data refreshed successfully");
  };

  if (isOverviewLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white border border-slate-150 rounded-2xl p-5 h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-150 rounded-3xl p-6 h-64" />
            <div className="bg-white border border-slate-150 rounded-3xl p-6 h-64" />
          </div>
          <div className="space-y-6">
            <div className="bg-white border border-slate-150 rounded-3xl p-6 h-48" />
            <div className="bg-white border border-slate-150 rounded-3xl p-6 h-48" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <StatsGrid
        stats={stats}
        foodsAddedToday={foodsAddedToday}
        chefsRegisteredToday={chefsRegisteredToday}
      />

      {/* CRITICAL FIX: Wrapped the chart in a container with a guaranteed height
        This ensures ResponsiveContainer always has a valid size to measure.
      */}
      <div className="w-full h-[300px] min-h-[300px]">
        <DashboardCharts historicalChartData={historicalChartData} />
      </div>

      <RecentActivity
        latestChefs={latestChefs}
        recentFoods={recentFoods}
        activityTimeline={activityTimeline}
        stats={stats}
        setActiveTab={setActiveTab}
        handleRefreshAll={handleRefreshAll}
        setSelectedProvider={setSelectedProvider}
        setIsDrawerOpen={setIsDrawerOpen}
        setSelectedFood={setSelectedFood}
        setIsFoodModalOpen={setIsFoodModalOpen}
        setFoodToDelete={setFoodToDelete}
        setIsDeleteConfirmOpen={setIsDeleteConfirmOpen}
        formatDateTime={formatDateTime}
      />
    </div>
  );
}