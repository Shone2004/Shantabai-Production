import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api";
import {
  Shield,
  Users,
  Utensils,
  CheckCircle,
  Clock,
  LogOut,
  Sliders,
  Eye,
  Check,
  X,
  MapPin,
  Mail,
  Phone,
  UserCheck,
  Ban,
  Copy,
  ExternalLink,
  FileText,
  Star,
  Award,
  Calendar,
  User,
  Menu,
  Trash2,
  Search,
  Send,
  MessageSquare
} from "lucide-react";

// Date time formatter helper functions
const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    const day = date.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${day} ${month} ${year} • ${hours}:${minutes} ${ampm}`;
  } catch (e) {
    return "N/A";
  }
};

const formatDateParts = (dateString) => {
  if (!dateString) return { date: "N/A", time: "N/A" };
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return { date: "N/A", time: "N/A" };
    const day = date.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return {
      date: `${day} ${month} ${year}`,
      time: `${hours}:${minutes} ${ampm}`
    };
  } catch (e) {
    return { date: "N/A", time: "N/A" };
  }
};

const isAadharImage = (url) => {
  if (!url) return false;
  return /\.(jpg|jpeg|png|webp|gif|svg)/i.test(url);
};

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";

const defaultMessages = [
  { id: 1, sender: "Admin", text: "Hello! Please make sure your kitchen photos are up to date.", timestamp: "2:15 PM" },
  { id: 2, sender: "Provider", text: "Sure, I'll upload them today.", timestamp: "2:18 PM" },
  { id: 3, sender: "Admin", text: "Thank you.", timestamp: "2:20 PM" }
];

export default function AdminDash() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard' | 'providers' | 'foods' | 'users'
  
  // Data states
  const [stats, setStats] = useState({
    totalProviders: 0,
    pendingProviders: 0,
    totalFoods: 0,
    pendingFoods: 0,
    totalUsers: 0
  });
  const [providers, setProviders] = useState([]);
  const [foods, setFoods] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Detail drawer states
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleCloseModal = () => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setSelectedProvider(null);
    }, 300);
  };

  // Food Management states
  const [selectedFood, setSelectedFood] = useState(null);
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [foodToDelete, setFoodToDelete] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [foodSearchQuery, setFoodSearchQuery] = useState("");

  const handleCloseFoodModal = () => {
    setIsFoodModalOpen(false);
    setTimeout(() => {
      setSelectedFood(null);
    }, 300);
  };

  // User Management states
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [userSearchQuery, setUserSearchQuery] = useState("");

  const handleCloseUserModal = () => {
    setIsUserModalOpen(false);
    setTimeout(() => {
      setSelectedUser(null);
    }, 300);
  };
  
  // Loaders
  const [statsLoading, setStatsLoading] = useState(true);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [foodsLoading, setFoodsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  
  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // Admin Chat States
  const [providerChats, setProviderChats] = useState({});
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedProvider, providerChats]);

  useEffect(() => {
    if (selectedProvider) {
      setChatInput("");
    }
  }, [selectedProvider]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const providerId = selectedProvider?._id;
    if (!providerId) return;

    const currentMessages = providerChats[providerId] !== undefined
      ? providerChats[providerId]
      : defaultMessages;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessage = {
      id: Date.now(),
      sender: "Admin",
      text: chatInput.trim(),
      timestamp: time
    };

    setProviderChats(prev => ({
      ...prev,
      [providerId]: [...currentMessages, newMessage]
    }));
    setChatInput("");
  };

  const handleClearChat = () => {
    const providerId = selectedProvider?._id;
    if (!providerId) return;
    setProviderChats(prev => ({
      ...prev,
      [providerId]: []
    }));
  };

  // Fetch Stats
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await api.get("/admin/stats");
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Error fetching admin stats:", err);
      showToast("error", "Failed to fetch stats");
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch Providers
  const fetchProviders = async () => {
    try {
      setProvidersLoading(true);
      const res = await api.get("/admin/providers");
      if (res.data.success) {
        setProviders(res.data.providers);
      }
    } catch (err) {
      console.error("Error fetching providers:", err);
      showToast("error", "Failed to load provider list");
    } finally {
      setProvidersLoading(false);
    }
  };

  // Fetch Foods
  const fetchFoods = async () => {
    try {
      setFoodsLoading(true);
      const res = await api.get("/admin/foods");
      if (res.data.success) {
        setFoods(res.data.foods);
      }
    } catch (err) {
      console.error("Error fetching foods:", err);
      showToast("error", "Failed to load food listings");
    } finally {
      setFoodsLoading(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await api.get("/admin/users");
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      showToast("error", "Failed to load users list");
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    setSidebarOpen(false); // Close sidebar on active tab change (for mobile view)
    if (activeTab === "providers") fetchProviders();
    if (activeTab === "foods") fetchFoods();
    if (activeTab === "users") {
      fetchUsers();
      fetchProviders();
    }
    if (activeTab === "dashboard") {
      fetchStats();
      fetchProviders();
      fetchFoods();
      fetchUsers();
    }
  }, [activeTab]);

  // Handle Provider Status Updates (Approve / Reject / Suspend)
  const handleApproveProvider = async (id, status) => {
    try {
      let endpoint = `/admin/providers/${id}/approve`;
      if (status === "REJECTED") {
        endpoint = `/admin/providers/${id}/reject`;
      } else if (status === "SUSPENDED") {
        endpoint = `/admin/providers/${id}/suspend`;
      }

      const res = await api.put(endpoint);
      if (res.data.success) {
        setProviders(prev =>
          prev.map(p => (p._id === id ? { ...p, verificationStatus: status, isVerified: status === "APPROVED" } : p))
        );
        setSelectedProvider(prev => {
          if (prev && prev._id === id) {
            return { ...prev, verificationStatus: status, isVerified: status === "APPROVED" };
          }
          return prev;
        });
        showToast("success", `Provider is now ${status}`);
        fetchStats();
      }
    } catch (err) {
      console.error(`Error setting provider status to ${status}:`, err);
      showToast("error", `Failed to set provider status to ${status}`);
    }
  };

  // Handle Delete Food listing
  const handleDeleteFood = async (id) => {
    try {
      const res = await api.delete(`/admin/foods/${id}`);
      if (res.data.success) {
        setFoods(prev => prev.filter(f => f._id !== id));
        showToast("success", "Food item deleted successfully");
        setIsDeleteConfirmOpen(false);
        setFoodToDelete(null);
        fetchStats();
      }
    } catch (err) {
      console.error("Error deleting food item:", err);
      showToast("error", err.response?.data?.message || "Failed to delete food item");
    }
  };

  // Overview page helper functions
  const isToday = (dateString) => {
    if (!dateString) return false;
    try {
      const d = new Date(dateString);
      const today = new Date();
      return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      );
    } catch (e) {
      return false;
    }
  };

  const getHistoricalChartData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dataMap = {};
    const today = new Date();
    
    // Last 6 months chronological order
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      dataMap[key] = { name: key, "New Chefs": 0, "New Dishes": 0 };
    }
    
    providers.forEach(p => {
      if (!p.createdAt) return;
      const d = new Date(p.createdAt);
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      if (dataMap[key]) {
        dataMap[key]["New Chefs"] += 1;
      }
    });
    
    foods.forEach(f => {
      if (!f.createdAt) return;
      const d = new Date(f.createdAt);
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      if (dataMap[key]) {
        dataMap[key]["New Dishes"] += 1;
      }
    });
    
    return Object.values(dataMap);
  };

  const getActivityFeed = () => {
    const feed = [];
    
    providers.forEach(p => {
      if (!p.createdAt) return;
      feed.push({
        id: `prov-reg-${p._id}`,
        type: "chef_registered",
        title: "Chef Registered",
        detail: `${p.kitchenName || "New Cook"} by ${p.user?.name || "Unknown"}`,
        time: new Date(p.createdAt),
        icon: "👩‍🍳",
        color: "bg-blue-50 text-blue-600 border-blue-100"
      });
      
      if (p.verificationStatus === "APPROVED" && p.updatedAt && p.updatedAt !== p.createdAt) {
        feed.push({
          id: `prov-app-${p._id}`,
          type: "chef_approved",
          title: "Chef Approved",
          detail: `${p.kitchenName || "New Cook"} is now verified`,
          time: new Date(p.updatedAt),
          icon: "✨",
          color: "bg-emerald-50 text-emerald-600 border-emerald-100"
        });
      }
    });
    
    foods.forEach(f => {
      if (!f.createdAt) return;
      feed.push({
        id: `food-add-${f._id}`,
        type: "food_added",
        title: "New Dish Listed",
        detail: `${f.name} under ${f.category}`,
        time: new Date(f.createdAt),
        icon: "🍛",
        color: "bg-purple-50 text-purple-600 border-purple-100"
      });
    });
    
    feed.sort((a, b) => b.time - a.time);
    return feed.slice(0, 8);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans antialiased text-slate-800 overflow-hidden">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border animate-slideIn ${
          toast.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-950" 
            : "bg-rose-50 border-rose-200 text-rose-950"
        }`}>
          <span className="text-xl">{toast.type === "success" ? "✨" : "⚠️"}</span>
          <p className="text-xs font-bold uppercase tracking-wider">{toast.msg}</p>
        </div>
      )}

      {/* Sidebar Backdrop for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-25 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-full flex-shrink-0 fixed lg:relative z-30 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white leading-tight">
                Shantabai <span className="text-indigo-400">Admin</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Control Panel</p>
            </div>
          </div>
          {/* Close Sidebar Button for Mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer touch-target"
            title="Close Navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {[
            { id: "dashboard", label: "Overview", icon: Sliders },
            { id: "providers", label: "Home Cooks", icon: UserCheck },
            { id: "foods", label: "Food Listings", icon: Utensils },
            { id: "users", label: "User Accounts", icon: Users }
          ].map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                  active 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15" 
                    : "hover:bg-slate-800/80 hover:text-slate-100"
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${active ? "text-white" : "text-slate-400 group-hover:text-slate-100"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold hover:bg-rose-500/10 hover:text-rose-400 transition-colors text-slate-400"
          >
            <LogOut className="w-4.5 h-4.5 text-slate-400" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200/80 bg-white px-4 sm:px-8 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Sidebar Toggle Button for Mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-650 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer touch-target flex-shrink-0"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black text-slate-900 capitalize truncate">{activeTab}</h2>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium truncate">Verify partners, dishes, and oversee system users</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex bg-slate-100 rounded-full py-1.5 px-3 border border-slate-200 text-slate-600 text-xs font-bold items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Admin Mode Active</span>
            </div>
            <div className="hidden sm:block w-px h-8 bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                {(user?.name || "A").charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-slate-700 hidden sm:inline">{user?.name || "Administrator"}</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">

          {/* ════ 1. DASHBOARD PAGE ════ */}
          {activeTab === "dashboard" && (() => {
            const isOverviewLoading = statsLoading || providersLoading || foodsLoading || usersLoading;
            
            // Daily metrics computation
            const foodsAddedToday = foods.filter(f => isToday(f.createdAt)).length;
            const chefsRegisteredToday = providers.filter(p => isToday(p.createdAt)).length;
            
            // Queue for pending chefs
            const pendingChefs = providers.filter(p => p.verificationStatus === "PENDING");
            
            // Latest registered chefs
            const latestChefs = [...providers]
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 5);
              
            // Recently added foods
            const recentFoods = [...foods]
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 5);
              
            // Unified activities timeline
            const activityTimeline = getActivityFeed();
            
            // Historical registrations & listings chart data
            const historicalChartData = getHistoricalChartData();
            
            // Helper function to trigger total refresh
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
                  {/* KPI Cards Loading */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="bg-white border border-slate-150 rounded-2xl p-5 h-24" />
                    ))}
                  </div>
                  {/* Main section loaders */}
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
                
                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                  {/* Total Cooks */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:border-slate-250">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Cooks</span>
                      <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalProviders}</h3>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Chef Accounts</p>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-inner">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Pending Cooks */}
                  <div className={`border rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all hover:shadow-md ${
                    stats.pendingProviders > 0 
                      ? "bg-amber-50/40 border-amber-200 text-amber-950" 
                      : "bg-white border-slate-200/60"
                  }`}>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Cooks</span>
                      <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.pendingProviders}</h3>
                      <p className={`text-[10px] font-bold mt-0.5 ${stats.pendingProviders > 0 ? "text-amber-600 animate-pulse" : "text-slate-500"}`}>
                        {stats.pendingProviders > 0 ? "Requires Action" : "Fully Caught Up"}
                      </p>
                    </div>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-inner ${
                      stats.pendingProviders > 0 ? "bg-amber-100 text-amber-600" : "bg-slate-50 text-slate-400"
                    }`}>
                      <Clock className={`w-5 h-5 ${stats.pendingProviders > 0 ? "animate-pulse" : ""}`} />
                    </div>
                  </div>

                  {/* Total Foods */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:border-slate-250">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Foods</span>
                      <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalFoods}</h3>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Active Menu Items</p>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 shadow-inner">
                      <Utensils className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Total Users */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:border-slate-250">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
                      <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalUsers}</h3>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Registered Customers</p>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-inner">
                      <Shield className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Foods Added Today */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:border-slate-250">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Added Today</span>
                      <h3 className="text-2xl font-black text-slate-900 mt-1">{foodsAddedToday}</h3>
                      <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Dishes Added</p>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-inner">
                      <Utensils className="w-5 h-5" />
                    </div>
                  </div>

                  {/* New Chefs Registered Today */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:border-slate-250">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Cooks Today</span>
                      <h3 className="text-2xl font-black text-slate-900 mt-1">{chefsRegisteredToday}</h3>
                      <p className="text-[10px] text-sky-600 font-bold mt-0.5">New Registrations</p>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500 shadow-inner">
                      <UserCheck className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Pending Verification Queue */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Pending Verification Queue</h4>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">Cook profiles awaiting credential audit and approval</p>
                    </div>
                    <span className="bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-black px-2.5 py-1 rounded-xl">
                      {pendingChefs.length} Pending
                    </span>
                  </div>

                  {pendingChefs.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-2xl mt-4">
                      <p className="text-xs font-bold text-slate-500">🎉 No pending chef approvals.</p>
                    </div>
                  ) : (
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full text-left border-collapse hidden sm:table">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                            <th className="py-3.5 px-4">Chef</th>
                            <th className="py-3.5 px-4">Kitchen</th>
                            <th className="py-3.5 px-4">Location</th>
                            <th className="py-3.5 px-4">Submitted On</th>
                            <th className="py-3.5 px-4 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {pendingChefs.map(p => (
                            <tr key={p._id} className="text-xs hover:bg-slate-50/50">
                              <td className="py-3 px-4 font-bold text-slate-900">{p.user?.name || "Unknown"}</td>
                              <td className="py-3 px-4 font-bold text-indigo-650">{p.kitchenName}</td>
                              <td className="py-3 px-4 text-slate-500 font-medium">{p.area}, {p.city}</td>
                              <td className="py-3 px-4 text-slate-400 font-medium">{formatDateTime(p.createdAt)}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleApproveProvider(p._id, "APPROVED")}
                                    className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-150 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                                    title="Approve Chef"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleApproveProvider(p._id, "REJECTED")}
                                    className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 border border-rose-150 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                                    title="Reject Chef"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => { setSelectedProvider(p); setIsDrawerOpen(true); }}
                                    className="w-7 h-7 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer"
                                    title="View Profile Details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      {/* Mobile pending cooks list */}
                      <div className="sm:hidden divide-y divide-slate-100">
                        {pendingChefs.map(p => (
                          <div key={p._id} className="py-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-extrabold text-slate-900 text-xs">{p.user?.name || "Unknown"}</h4>
                                <p className="text-[10px] text-indigo-650 font-bold mt-0.5">{p.kitchenName}</p>
                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Submitted: {formatDateTime(p.createdAt)}</p>
                              </div>
                              <span className="bg-slate-150 text-slate-600 text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase">
                                {p.city}
                              </span>
                            </div>
                            
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApproveProvider(p._id, "APPROVED")}
                                className="flex-1 flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold min-h-[44px] transition-all"
                              >
                                <Check className="w-4.5 h-4.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleApproveProvider(p._id, "REJECTED")}
                                className="flex-1 flex items-center justify-center gap-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-bold min-h-[44px] transition-all"
                              >
                                <X className="w-4.5 h-4.5" />
                                <span>Reject</span>
                              </button>
                              <button
                                onClick={() => { setSelectedProvider(p); setIsDrawerOpen(true); }}
                                className="flex items-center justify-center w-11 border border-slate-200 text-slate-650 hover:bg-slate-50 rounded-xl min-h-[44px] transition-all"
                              >
                                <Eye className="w-4.5 h-4.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Operations Insights Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Side (span 2) */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Registrations & Listings Trend Chart */}
                    <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-2">
                        <div>
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Registrations & Listings Trend</h4>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">Chef sign-ups and food additions over the last 6 months</p>
                        </div>
                        <div className="flex gap-4 text-xs font-bold text-slate-600">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                            <span>New Chefs</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                            <span>New Dishes</span>
                          </span>
                        </div>
                      </div>
                      
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={historicalChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="New Chefs" stroke="#4f46e5" strokeWidth={2.5} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="New Dishes" stroke="#c084fc" strokeWidth={2.5} activeDot={{ r: 6 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Recent Chef Registrations */}
                    <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                        <div>
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Recent Chef Registrations</h4>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">Latest cooks to create profiles on the dashboard</p>
                        </div>
                        <button 
                          onClick={() => setActiveTab("providers")} 
                          className="text-xs font-bold text-indigo-650 hover:text-indigo-850 transition-colors"
                        >
                          View All →
                        </button>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse hidden sm:table">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                              <th className="py-3 px-4">Chef / Kitchen</th>
                              <th className="py-3 px-4">City</th>
                              <th className="py-3 px-4">Joined On</th>
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-4 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {latestChefs.map(p => (
                              <tr key={p._id} className="text-xs hover:bg-slate-50/40">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2.5">
                                    {p.avatar ? (
                                      <img src={p.avatar} className="w-8 h-8 rounded-lg object-cover border border-slate-100 shadow-sm" alt="" />
                                    ) : (
                                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-650 flex items-center justify-center font-bold">👩‍🍳</div>
                                    )}
                                    <div>
                                      <div className="font-extrabold text-slate-900">{p.kitchenName}</div>
                                      <div className="text-[10px] text-slate-400 font-medium">{p.user?.name || "Unknown"}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-slate-500 font-semibold">{p.city}</td>
                                <td className="py-3 px-4 text-slate-400 font-medium">{formatDateTime(p.createdAt)}</td>
                                <td className="py-3 px-4">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                                    p.verificationStatus === "APPROVED" 
                                      ? "bg-green-50 text-green-700 border-green-200" 
                                      : p.verificationStatus === "REJECTED"
                                      ? "bg-rose-50 text-rose-700 border-rose-200"
                                      : p.verificationStatus === "SUSPENDED"
                                      ? "bg-red-50 text-red-700 border-red-200"
                                      : "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                                  }`}>
                                    {p.verificationStatus}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <button
                                    onClick={() => { setSelectedProvider(p); setIsDrawerOpen(true); }}
                                    className="w-7 h-7 rounded-lg border border-slate-200 text-slate-550 hover:bg-slate-150 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-xs mx-auto"
                                    title="View Profile Details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        
                        {/* Mobile Registrations Card Stack */}
                        <div className="sm:hidden divide-y divide-slate-100">
                          {latestChefs.map(p => (
                            <div key={p._id} className="py-3 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                {p.avatar ? (
                                  <img src={p.avatar} className="w-9 h-9 rounded-lg object-cover border border-slate-100 shadow-sm" alt="" />
                                ) : (
                                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-650 flex items-center justify-center font-bold">👩‍🍳</div>
                                )}
                                <div className="min-w-0">
                                  <h5 className="font-extrabold text-slate-900 text-xs truncate">{p.kitchenName}</h5>
                                  <p className="text-[10px] text-slate-400 font-semibold truncate">{p.city} · {p.user?.name || "Unknown"}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => { setSelectedProvider(p); setIsDrawerOpen(true); }}
                                className="w-8 h-8 rounded-lg border border-slate-200 text-slate-550 flex items-center justify-center flex-shrink-0 touch-target"
                              >
                                <Eye className="w-4.5 h-4.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Recently Added Foods */}
                    <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                        <div>
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Recently Added Foods</h4>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">Latest food items listed by cooks</p>
                        </div>
                        <button 
                          onClick={() => setActiveTab("foods")} 
                          className="text-xs font-bold text-indigo-650 hover:text-indigo-850 transition-colors"
                        >
                          View All →
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse hidden sm:table">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                              <th className="py-3 px-4">Dish</th>
                              <th className="py-3 px-4">Kitchen</th>
                              <th className="py-3 px-4">Price</th>
                              <th className="py-3 px-4">Category</th>
                              <th className="py-3 px-4">Listed On</th>
                              <th className="py-3 px-4 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {recentFoods.map(f => (
                              <tr key={f._id} className="text-xs hover:bg-slate-50/40">
                                <td className="py-3 px-4 font-bold text-slate-900">
                                  <div className="flex items-center gap-2.5">
                                    {f.images?.[0] ? (
                                      <img src={f.images[0]} className="w-8 h-8 rounded-lg object-cover border border-slate-100 shadow-sm" alt="" />
                                    ) : (
                                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">🍛</div>
                                    )}
                                    <span>{f.name}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-indigo-650 font-bold">{f.provider?.kitchenName || "Unknown"}</td>
                                <td className="py-3 px-4 text-slate-900 font-bold">₹{f.price}</td>
                                <td className="py-3 px-4 text-slate-500 font-semibold">{f.category}</td>
                                <td className="py-3 px-4 text-slate-400 font-medium">{formatDateTime(f.createdAt)}</td>
                                <td className="py-3 px-4 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => { setSelectedFood(f); setIsFoodModalOpen(true); }}
                                      className="w-7 h-7 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                                      title="View Details"
                                    >
                                      <Eye className="w-4.5 h-4.5" />
                                    </button>
                                    <button
                                      onClick={() => { setFoodToDelete(f); setIsDeleteConfirmOpen(true); }}
                                      className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
                                      title="Delete Listing"
                                    >
                                      <Trash2 className="w-4.5 h-4.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        
                        {/* Mobile Foods Card Stack */}
                        <div className="sm:hidden divide-y divide-slate-100">
                          {recentFoods.map(f => (
                            <div key={f._id} className="py-3 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                {f.images?.[0] ? (
                                  <img src={f.images[0]} className="w-9 h-9 rounded-lg object-cover border border-slate-100 shadow-sm" alt="" />
                                ) : (
                                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">🍛</div>
                                )}
                                <div className="min-w-0">
                                  <h5 className="font-extrabold text-slate-900 text-xs truncate">{f.name}</h5>
                                  <p className="text-[10px] text-slate-400 font-semibold truncate">{f.provider?.kitchenName || "Unknown"} · ₹{f.price}</p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => { setSelectedFood(f); setIsFoodModalOpen(true); }}
                                  className="w-8 h-8 rounded-lg border border-slate-200 text-slate-550 flex items-center justify-center flex-shrink-0 touch-target"
                                >
                                  <Eye className="w-4.5 h-4.5" />
                                </button>
                                <button
                                  onClick={() => { setFoodToDelete(f); setIsDeleteConfirmOpen(true); }}
                                  className="w-8 h-8 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 touch-target"
                                >
                                  <Trash2 className="w-4.5 h-4.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right Side (span 1) */}
                  <div className="space-y-6">
                    
                    {/* Quick Actions Shortcuts */}
                    <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Quick Actions</h4>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">Shortcuts to manage the platform</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                          onClick={() => setActiveTab("providers")}
                          className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-indigo-50/30 border border-indigo-100 text-indigo-700 hover:bg-indigo-50 font-bold transition-all min-h-[80px]"
                        >
                          <UserCheck className="w-5 h-5 text-indigo-500" />
                          <span className="text-[10px] uppercase tracking-wider">Home Cooks</span>
                        </button>
                        <button
                          onClick={() => setActiveTab("foods")}
                          className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-purple-50/30 border border-purple-100 text-purple-700 hover:bg-purple-50 font-bold transition-all min-h-[80px]"
                        >
                          <Utensils className="w-5 h-5 text-purple-500" />
                          <span className="text-[10px] uppercase tracking-wider">Food Items</span>
                        </button>
                        <button
                          onClick={() => setActiveTab("users")}
                          className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-blue-50/30 border border-blue-100 text-blue-700 hover:bg-blue-50 font-bold transition-all min-h-[80px]"
                        >
                          <Users className="w-5 h-5 text-blue-500" />
                          <span className="text-[10px] uppercase tracking-wider">User Accounts</span>
                        </button>
                        <button
                          onClick={handleRefreshAll}
                          className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-slate-55 border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold transition-all min-h-[80px] cursor-pointer"
                        >
                          <Sliders className="w-5 h-5 text-slate-550" />
                          <span className="text-[10px] uppercase tracking-wider">Refresh All</span>
                        </button>
                      </div>
                    </div>

                    {/* Platform Snapshot Summary */}
                    <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Platform Snapshot</h4>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">Summary of verified and pending metrics</p>
                      </div>
                      
                      <div className="space-y-2.5 pt-2">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-650 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span>Total Cooks</span>
                          <span className="text-slate-900 text-sm font-black">{stats.totalProviders}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold text-slate-655 bg-green-50/30 p-2.5 rounded-xl border border-green-100 text-green-800">
                          <span>Approved Cooks</span>
                          <span className="text-emerald-700 text-sm font-black">{stats.totalProviders - stats.pendingProviders}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold text-slate-655 bg-amber-50/40 p-2.5 rounded-xl border border-amber-100 text-amber-800">
                          <span>Pending Cooks</span>
                          <span className="text-amber-700 text-sm font-black">{stats.pendingProviders}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold text-slate-655 bg-purple-50/30 p-2.5 rounded-xl border border-purple-100 text-purple-800">
                          <span>Active Dishes</span>
                          <span className="text-purple-700 text-sm font-black">{stats.totalFoods}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold text-slate-655 bg-indigo-50/30 p-2.5 rounded-xl border border-indigo-100 text-indigo-800">
                          <span>Registered Users</span>
                          <span className="text-indigo-700 text-sm font-black">{stats.totalUsers}</span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Activity Feed */}
                    <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Activity Feed</h4>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">Real-time system event updates</p>
                      </div>

                      <div className="space-y-4 pt-2">
                        {activityTimeline.length === 0 ? (
                          <p className="text-xs text-slate-400 italic text-center py-4">No recent activity found.</p>
                        ) : (
                          activityTimeline.map((item, idx) => (
                            <div key={item.id} className="flex gap-3 text-xs relative">
                              {/* Connective Line */}
                              {idx !== activityTimeline.length - 1 && (
                                <div className="absolute left-4.5 top-9 bottom-0 w-0.5 bg-slate-100" />
                              )}
                              
                              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-sm ${item.color}`}>
                                <span className="text-base">{item.icon}</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <h5 className="font-extrabold text-slate-800 truncate">{item.title}</h5>
                                  <span className="text-[9px] text-slate-400 font-bold shrink-0">
                                    {(() => {
                                      const mins = Math.floor((new Date() - item.time) / 60000);
                                      if (mins < 1) return "Just now";
                                      if (mins < 60) return `${mins}m ago`;
                                      const hrs = Math.floor(mins / 60);
                                      if (hrs < 24) return `${hrs}h ago`;
                                      return item.time.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
                                    })()}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-550 font-semibold truncate mt-0.5">{item.detail}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            );
          })()}

          {/* ════ 2. PROVIDERS LIST PAGE ════ */}
          {activeTab === "providers" && (
            <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm animate-fadeIn">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Chef/Partner Profiles</h3>
                <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-3 py-1 rounded-full">
                  {providers.length} Registered Cooks
                </span>
              </div>
              
              {providersLoading ? (
                <div className="p-12 text-center text-slate-400">Loading partners...</div>
              ) : providers.length === 0 ? (
                <div className="p-12 text-center text-slate-400">No home cooks registered in the database.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-5 px-6">Chef Details</th>
                        <th className="py-5 px-6">Location</th>
                        <th className="py-5 px-6">Exp.</th>
                        <th className="py-5 px-6">Specialities</th>
                        <th className="py-5 px-6">Registered On</th>
                        <th className="py-5 px-6 text-center">Status</th>
                        <th className="py-5 px-6 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {providers.map(p => (
                        <tr 
                          key={p._id} 
                          onClick={() => { setSelectedProvider(p); setIsDrawerOpen(true); }}
                          className="text-xs hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        >
                          {/* Chef Info */}
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-3">
                              {p.avatar ? (
                                <img src={p.avatar} className="w-11 h-11 rounded-2xl object-cover border border-slate-100 shadow-sm" alt="" />
                              ) : (
                                <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-150 text-indigo-650 flex items-center justify-center font-bold text-lg shadow-sm">👩‍🍳</div>
                              )}
                              <div>
                                <h4 className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">{p.kitchenName}</h4>
                                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{p.user?.name || "Unknown"} · {p.user?.email}</p>
                              </div>
                            </div>
                          </td>
                          {/* Location */}
                          <td className="py-5 px-6 text-slate-500 font-semibold">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[120px]">{p.area}, {p.city}</span>
                            </div>
                          </td>
                          {/* Experience */}
                          <td className="py-5 px-6 text-slate-900 font-bold">{p.experience || 0} yrs</td>
                          {/* Specialities */}
                          <td className="py-5 px-6">
                            <div className="flex flex-wrap gap-1 max-w-[150px]">
                              {(p.specialities || []).slice(0, 2).map(s => (
                                <span key={s} className="bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.5 rounded-md font-semibold">
                                  {s}
                                </span>
                              ))}
                              {p.specialities?.length > 2 && (
                                <span className="text-[9px] text-slate-400 font-bold">+{p.specialities.length - 2}</span>
                              )}
                            </div>
                          </td>
                          {/* Registered On */}
                          <td className="py-5 px-6 text-slate-500 font-semibold">
                            {formatDateTime(p.createdAt)}
                          </td>
                          {/* Status */}
                          <td className="py-5 px-6 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                              p.verificationStatus === "APPROVED" 
                                ? "bg-green-50 text-green-700 border-green-200" 
                                : p.verificationStatus === "REJECTED"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : p.verificationStatus === "SUSPENDED"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                p.verificationStatus === "APPROVED" 
                                  ? "bg-emerald-500" 
                                  : p.verificationStatus === "REJECTED" 
                                  ? "bg-rose-500" 
                                  : p.verificationStatus === "SUSPENDED" 
                                  ? "bg-red-500" 
                                  : "bg-amber-500 animate-ping"
                              }`} />
                              {p.verificationStatus}
                            </span>
                          </td>
                          {/* Actions */}
                          <td className="py-5 px-6" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-2">
                              {p.verificationStatus !== "APPROVED" && (
                                <button
                                  onClick={() => handleApproveProvider(p._id, "APPROVED")}
                                  className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                                  title="Approve Partner"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              {p.verificationStatus !== "REJECTED" && p.verificationStatus !== "SUSPENDED" && (
                                <button
                                  onClick={() => handleApproveProvider(p._id, "REJECTED")}
                                  className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                                  title="Reject Partner"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                              {p.verificationStatus === "APPROVED" && (
                                <button
                                  onClick={() => handleApproveProvider(p._id, "SUSPENDED")}
                                  className="w-8 h-8 rounded-xl bg-red-50 text-red-600 border border-red-100 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                                  title="Suspend Partner"
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => { setSelectedProvider(p); setIsDrawerOpen(true); }}
                                className="w-8 h-8 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-indigo-650 flex items-center justify-center transition-all cursor-pointer shadow-sm"
                                title="View Partner Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ════ 3. FOODS LIST PAGE ════ */}
          {activeTab === "foods" && (() => {
            const filteredFoods = foods.filter(f => {
              const query = foodSearchQuery.toLowerCase().trim();
              if (!query) return true;
              return (
                (f.name || "").toLowerCase().includes(query) ||
                (f.category || "").toLowerCase().includes(query) ||
                (f.provider?.kitchenName || "").toLowerCase().includes(query)
              );
            });

            return (
              <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm animate-fadeIn">
                
                {/* Header with Search */}
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-sans">Food Listings Management</h3>
                    <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">Search, inspect specifications, and manage active menu listings</p>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Search Input */}
                    <div className="relative flex-1 md:w-64">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                      </span>
                      <input
                        type="text"
                        placeholder="Search dishes, cooks, or category..."
                        value={foodSearchQuery}
                        onChange={(e) => setFoodSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                      />
                    </div>
                    {/* Items Count Badge */}
                    <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-3 py-2 rounded-xl border border-indigo-100 shrink-0">
                      {filteredFoods.length} Dishes
                    </span>
                  </div>
                </div>
                
                {foodsLoading ? (
                  <div className="p-12 text-center text-slate-400 font-semibold">Loading dishes...</div>
                ) : filteredFoods.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 font-semibold">No food items found matching your search.</div>
                ) : (
                  <>
                    {/* Desktop and Tablet View (Table) */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                            <th className="py-4 px-6">Dish Name</th>
                            <th className="py-4 px-6">Kitchen / Cook</th>
                            <th className="py-4 px-6">Category</th>
                            <th className="py-4 px-6">Price</th>
                            <th className="py-4 px-6 text-center">Qty Left</th>
                            <th className="py-4 px-6 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredFoods.map(f => (
                            <tr key={f._id} className="text-xs hover:bg-slate-50/50">
                              {/* Food Title */}
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  {f.images?.[0] ? (
                                    <img src={f.images[0]} className="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-sm" alt="" loading="lazy" />
                                  ) : (
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">🍛</div>
                                  )}
                                  <div>
                                    <h4 className="font-extrabold text-slate-900">{f.name}</h4>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className={`w-1.5 h-1.5 rounded-full ${f.isVeg ? "bg-green-500" : "bg-red-500"}`} />
                                      <span className="text-[9px] text-slate-400 font-bold uppercase">{f.isVeg ? "Veg" : "Non-Veg"}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              {/* Chef */}
                              <td className="py-4 px-6 text-slate-700 font-semibold">
                                <div className="font-bold">{f.provider?.kitchenName || "Unknown Kitchen"}</div>
                                <div className="text-[10px] text-slate-400 font-medium mt-0.5">{f.provider?.user?.name || ""}</div>
                              </td>
                              {/* Category */}
                              <td className="py-4 px-6 text-slate-500 font-semibold">
                                {f.category}
                              </td>
                              {/* Price */}
                              <td className="py-4 px-6 text-slate-900 font-bold">
                                ₹{f.price} <span className="text-[9px] text-slate-400 font-medium">/{f.pricePer || "meal"}</span>
                              </td>
                              {/* Qty Left */}
                              <td className="py-4 px-6 text-center text-slate-650 font-bold">
                                {f.quantity || 0} <span className="text-[9px] text-slate-400 font-medium">/ {f.totalQuantity || 10}</span>
                              </td>
                              {/* Actions */}
                              <td className="py-4 px-6">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => { setSelectedFood(f); setIsFoodModalOpen(true); }}
                                    className="w-8 h-8 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-indigo-650 flex items-center justify-center transition-all cursor-pointer shadow-sm"
                                    title="View Details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => { setFoodToDelete(f); setIsDeleteConfirmOpen(true); }}
                                    className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                                    title="Delete Food"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile View (Cards) */}
                    <div className="sm:hidden divide-y divide-slate-100">
                      {filteredFoods.map(f => (
                        <div key={f._id} className="p-4 space-y-3">
                          <div className="flex gap-3">
                            {f.images?.[0] ? (
                              <img src={f.images[0]} className="w-14 h-14 rounded-xl object-cover border border-slate-100 shadow-sm flex-shrink-0" alt="" loading="lazy" />
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 flex-shrink-0">🍛</div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-extrabold text-slate-900 truncate text-xs">{f.name}</h4>
                                <span className={`inline-flex shrink-0 w-2 h-2 rounded-full ${f.isVeg ? "bg-green-500" : "bg-red-500"}`} title={f.isVeg ? "Veg" : "Non-Veg"} />
                              </div>
                              <p className="text-[10px] text-slate-500 font-bold mt-0.5 truncate">{f.provider?.kitchenName || "Unknown Kitchen"}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="bg-slate-100 text-slate-650 text-[9px] px-1.5 py-0.5 rounded-md font-bold">{f.category}</span>
                                <span className="text-slate-900 font-black text-xs">₹{f.price}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Card Action Buttons (min-h-[44px] touch targets) */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setSelectedFood(f); setIsFoodModalOpen(true); }}
                              className="flex-1 flex items-center justify-center gap-1.5 border border-slate-200 text-slate-650 hover:bg-slate-50 rounded-xl text-xs font-bold min-h-[44px] transition-all"
                            >
                              <Eye className="w-4 h-4" />
                              <span>View Details</span>
                            </button>
                            <button
                              onClick={() => { setFoodToDelete(f); setIsDeleteConfirmOpen(true); }}
                              className="flex-1 flex items-center justify-center gap-1.5 border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold min-h-[44px] transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })()}

          {/* ════ 4. USERS LIST PAGE ════ */}
          {activeTab === "users" && (() => {
            const filteredUsers = users.filter(u => {
              if (userRoleFilter !== "ALL" && u.role !== userRoleFilter) return false;
              const query = userSearchQuery.toLowerCase().trim();
              if (!query) return true;
              return (
                (u.name || "").toLowerCase().includes(query) ||
                (u.email || "").toLowerCase().includes(query) ||
                (u.phone || "").toLowerCase().includes(query)
              );
            });

            return (
              <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm animate-fadeIn">
                
                {/* Header with Search and Tab filters */}
                <div className="p-6 border-b border-slate-100 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-sans">User Account Management</h3>
                      <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">Filter, search, inspect credentials, and manage active system accounts</p>
                    </div>
                    {/* Search Input */}
                    <div className="relative w-full md:max-w-xs flex-shrink-0">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                      </span>
                      <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                      />
                    </div>
                  </div>

                  {/* Tabs/Chips filters */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50">
                    {[
                      { id: "ALL", label: "All Users", count: users.length },
                      { id: "PROVIDER", label: "Home Cooks", count: users.filter(u => u.role === "PROVIDER").length, color: "text-teal-700 bg-teal-50 border-teal-100" },
                      { id: "CUSTOMER", label: "Customers", count: users.filter(u => u.role === "CUSTOMER").length, color: "text-blue-700 bg-blue-50 border-blue-100" },
                      { id: "ADMIN", label: "Admins", count: users.filter(u => u.role === "ADMIN").length, color: "text-indigo-700 bg-indigo-50 border-indigo-100" }
                    ].map(chip => (
                      <button
                        key={chip.id}
                        onClick={() => setUserRoleFilter(chip.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                          userRoleFilter === chip.id
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <span>{chip.label}</span>
                        <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${
                          userRoleFilter === chip.id
                            ? "bg-slate-800 text-white"
                            : chip.color || "bg-slate-100 text-slate-500"
                        }`}>
                          {chip.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {usersLoading ? (
                  <div className="p-12 text-center text-slate-400 font-semibold">Loading user accounts...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 font-semibold">No accounts match this criteria.</div>
                ) : (
                  <>
                    {/* Desktop and Tablet table */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                            <th className="py-4 px-6">Name</th>
                            <th className="py-4 px-6">Email Address</th>
                            <th className="py-4 px-6">Phone Number</th>
                            <th className="py-4 px-6">Role</th>
                            <th className="py-4 px-6">Joined Date</th>
                            <th className="py-4 px-6 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredUsers.map(u => (
                            <tr key={u._id} className="text-xs hover:bg-slate-50/50">
                              {/* Avatar and Name */}
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  {u.profileImage ? (
                                    <img src={u.profileImage} className="w-9 h-9 rounded-full object-cover border border-slate-100 shadow-sm" alt="" loading="lazy" />
                                  ) : (
                                    <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shadow-sm">
                                      {u.name.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <span className="font-extrabold text-slate-900">{u.name}</span>
                                </div>
                              </td>
                              {/* Email */}
                              <td className="py-4 px-6 text-slate-655 font-bold">
                                {u.email}
                              </td>
                              {/* Phone */}
                              <td className="py-4 px-6 text-slate-500 font-semibold">
                                {u.phone ? `+91 ${u.phone}` : "N/A"}
                              </td>
                              {/* Role badge */}
                              <td className="py-4 px-6">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                                  u.role === "ADMIN" 
                                    ? "bg-indigo-50 text-indigo-700 border-indigo-200" 
                                    : u.role === "PROVIDER"
                                    ? "bg-teal-50 text-teal-700 border-teal-200"
                                    : "bg-blue-50 text-blue-700 border-blue-200"
                                }`}>
                                  {u.role}
                                </span>
                              </td>
                              {/* Created At */}
                              <td className="py-4 px-6 text-slate-400 font-semibold">
                                {new Date(u.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric"
                                })}
                              </td>
                              {/* View action */}
                              <td className="py-4 px-6">
                                <button
                                  onClick={() => { setSelectedUser(u); setIsUserModalOpen(true); }}
                                  className="w-8 h-8 rounded-xl border border-slate-200 text-slate-550 hover:bg-slate-100 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-sm mx-auto"
                                  title="View User Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile stacked card list */}
                    <div className="sm:hidden divide-y divide-slate-100">
                      {filteredUsers.map(u => (
                        <div key={u._id} className="p-4 space-y-3">
                          <div className="flex gap-3">
                            {u.profileImage ? (
                              <img src={u.profileImage} className="w-12 h-12 rounded-full object-cover border border-slate-100 shadow-sm flex-shrink-0" alt="" loading="lazy" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-650 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-extrabold text-slate-900 truncate text-xs">{u.name}</h4>
                                <span className={`inline-flex shrink-0 px-1.5 py-0.2 rounded-full text-[8px] font-bold border uppercase tracking-wider ${
                                  u.role === "ADMIN" 
                                    ? "bg-indigo-50 text-indigo-700 border-indigo-200" 
                                    : u.role === "PROVIDER"
                                    ? "bg-teal-50 text-teal-700 border-teal-200"
                                    : "bg-blue-50 text-blue-700 border-blue-200"
                                }`}>
                                  {u.role}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-550 font-semibold mt-0.5 truncate">{u.email}</p>
                              <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Phone: {u.phone ? `+91 ${u.phone}` : "N/A"}</p>
                            </div>
                          </div>
                          
                          {/* Card Action Buttons (min-h-[44px] touch targets) */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setSelectedUser(u); setIsUserModalOpen(true); }}
                              className="flex-1 flex items-center justify-center gap-1.5 border border-slate-200 text-slate-655 hover:bg-slate-50 rounded-xl text-xs font-bold min-h-[44px] transition-all"
                            >
                              <Eye className="w-4 h-4" />
                              <span>View Details</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })()}
        </div>
      </main>

      {/* ── CHEF DETAILS CENTERED MODAL ── */}
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity duration-300 flex items-center justify-center p-0 sm:p-6 lg:p-8 ${
          isDrawerOpen && selectedProvider ? "opacity-100 animate-fadeIn" : "opacity-0 pointer-events-none"
        }`} 
        onClick={handleCloseModal}
      >
        {/* Modal Window */}
        <div 
          className={`bg-[#F8FAFC] shadow-2xl flex flex-col transition-all duration-300 ease-out transform overflow-hidden
            /* Mobile: Full-screen bottom sheet/page */
            w-full h-full rounded-none
            /* Tablet/Desktop: Centered card */
            sm:max-w-3xl lg:max-w-5xl sm:h-auto sm:max-h-[90vh] sm:rounded-[24px]
            ${isDrawerOpen && selectedProvider ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 sm:translate-y-0"}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {selectedProvider && (
            <>
              {/* Sticky Header */}
              <div className="flex-shrink-0 bg-white border-b border-slate-100 p-4 sm:p-6 flex items-center justify-between z-15">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="relative flex-shrink-0">
                    {selectedProvider.avatar ? (
                      <img 
                        src={selectedProvider.avatar} 
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border border-slate-150 shadow-sm" 
                        alt={selectedProvider.kitchenName} 
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-50 border border-indigo-150 text-indigo-650 flex items-center justify-center font-bold text-xl sm:text-2xl shadow-sm">
                        👩‍🍳
                      </div>
                    )}
                    {selectedProvider.isVerified && (
                      <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border border-white shadow-sm flex items-center justify-center" title="Verified Chef">
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">
                        {selectedProvider.kitchenName}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${
                        selectedProvider.verificationStatus === "APPROVED" 
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : selectedProvider.verificationStatus === "REJECTED"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : selectedProvider.verificationStatus === "SUSPENDED"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                      }`}>
                        {selectedProvider.verificationStatus}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-500 mt-0.5 truncate">{selectedProvider.user?.name || "Unknown Chef"}</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5 flex items-center gap-1.5 truncate">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Registered: {formatDateTime(selectedProvider.createdAt)}</span>
                    </p>
                  </div>
                </div>
                {/* Close Button */}
                <button 
                  onClick={handleCloseModal}
                  className="w-10 h-10 flex-shrink-0 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl flex items-center justify-center transition-all cursor-pointer touch-target ml-2"
                  title="Close Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Modal Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column (Main Info - Span 2 on Desktop) */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* SECTION 1 — PERSONAL INFORMATION */}
                    <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <User className="w-4 h-4 text-indigo-500" />
                        <span className="font-black text-xs text-slate-700 uppercase tracking-wider">Personal Information</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Full Name</span>
                          <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedProvider.user?.name || "Unknown"}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Kitchen Name</span>
                          <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedProvider.kitchenName || "Unknown"}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Email Address</span>
                          <p className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5 truncate">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{selectedProvider.user?.email || "Unknown"}</span>
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Phone Number</span>
                          <p className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{selectedProvider.user?.phone ? `+91 ${selectedProvider.user.phone}` : "N/A"}</span>
                          </p>
                        </div>
                      </div>
                      {selectedProvider.tagline && (
                        <div className="pt-2 border-t border-slate-50">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Tagline</span>
                          <p className="text-xs italic text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            "{selectedProvider.tagline}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* SECTION 3 — CHEF DETAILS */}
                    <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Award className="w-4 h-4 text-indigo-500" />
                        <span className="font-black text-xs text-slate-700 uppercase tracking-wider">Chef Profile & Offerings</span>
                      </div>
                      
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Biography</span>
                        <p className="text-xs text-slate-650 leading-relaxed mt-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100/70 whitespace-pre-line">
                          {selectedProvider.bio || "No biography provided."}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Experience</span>
                          <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedProvider.experience || 0} Years</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Starting Price</span>
                          <p className="text-sm font-bold text-emerald-600 mt-0.5">₹{selectedProvider.startingPrice || 0}</p>
                        </div>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-slate-50">
                        {/* Specialities */}
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Specialities</span>
                          <div className="flex flex-wrap gap-1">
                            {selectedProvider.specialities && selectedProvider.specialities.length > 0 ? (
                              selectedProvider.specialities.map(s => (
                                <span key={s} className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-indigo-100">
                                  {s}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400 italic">None listed</span>
                            )}
                          </div>
                        </div>

                        {/* Dietary Types */}
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Dietary Types</span>
                          <div className="flex flex-wrap gap-1">
                            {selectedProvider.dietaryType && selectedProvider.dietaryType.length > 0 ? (
                              selectedProvider.dietaryType.map(d => (
                                <span key={d} className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                  d === 'Veg' 
                                    ? 'bg-green-50 text-green-700 border-green-100' 
                                    : d === 'Non-Veg' 
                                    ? 'bg-rose-50 text-rose-700 border-rose-100' 
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                }`}>
                                  {d}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400 italic">None listed</span>
                            )}
                          </div>
                        </div>

                        {/* Service Types */}
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Service Types</span>
                          <div className="flex flex-wrap gap-1">
                            {selectedProvider.serviceTypes && selectedProvider.serviceTypes.length > 0 ? (
                              selectedProvider.serviceTypes.map(s => (
                                <span key={s} className="bg-teal-50 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-teal-100">
                                  {s}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400 italic">None listed</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 4 — ADDRESS */}
                    <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <MapPin className="w-4 h-4 text-indigo-500" />
                        <span className="font-black text-xs text-slate-700 uppercase tracking-wider">Kitchen Location / Address</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">City</span>
                          <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedProvider.city || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Area</span>
                          <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedProvider.area || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Pincode</span>
                          <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedProvider.pincode || "N/A"}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Full Kitchen Address</span>
                        <p className="text-xs text-slate-700 font-semibold leading-relaxed mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          {selectedProvider.fullAddress || "No full address provided."}
                        </p>
                      </div>
                      {(() => {
                        const coords = selectedProvider.location?.coordinates;
                        const hasValidCoords = Array.isArray(coords) &&
                          coords.length === 2 &&
                          typeof coords[0] === 'number' &&
                          typeof coords[1] === 'number' &&
                          !(Math.abs(coords[0] - 73.7898) < 0.0001 && Math.abs(coords[1] - 18.5597) < 0.0001) &&
                          !(coords[0] === 0 && coords[1] === 0);

                        if (!hasValidCoords) return null;

                        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords[1]},${coords[0]}`;

                        return (
                          <div className="pt-2 border-t border-slate-50">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Geospatial Coordinates</span>
                              <a
                                href={googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-650 hover:text-indigo-750 transition-colors"
                              >
                                <span>View on Google Maps</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center justify-between text-xs font-bold text-slate-655">
                              <span>Longitude: {coords[0]}</span>
                              <div className="w-px h-4 bg-slate-200" />
                              <span>Latitude: {coords[1]}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* SECTION 6 — VERIFICATION (OPTIMIZED) */}
                    {(() => {
                      const url = selectedProvider.aadharUrl;
                      const hasAadhar = !!url;
                      
                      return (
                        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
                          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <Shield className="w-4 h-4 text-indigo-500" />
                            <span className="font-black text-xs text-slate-700 uppercase tracking-wider">Aadhaar Verification</span>
                          </div>
                          
                          {!hasAadhar ? (
                            <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                              <p className="text-xs font-semibold text-slate-400">No Aadhaar document uploaded.</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-505 flex items-center justify-center">
                                  <FileText className="w-6 h-6 text-indigo-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-slate-800 truncate">📄 Aadhaar Document Uploaded</p>
                                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Verification Document</p>
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                                <a 
                                  href={url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md shadow-indigo-600/10 cursor-pointer min-h-[44px]"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span>View Aadhaar Document</span>
                                </a>
                                
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(url);
                                    showToast("success", "Aadhaar link copied to clipboard");
                                  }}
                                  className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3 px-4 rounded-xl transition-all cursor-pointer min-h-[44px]"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy Link</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                  </div>

                  {/* Right Column (Meta Info - Span 1 on Desktop) */}
                  <div className="space-y-6">
                    
                    {/* SECTION 2 — REGISTRATION INFORMATION */}
                    {(() => {
                      const regParts = formatDateParts(selectedProvider.createdAt);
                      const updatedParts = formatDateParts(selectedProvider.updatedAt);
                      return (
                        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
                          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <Calendar className="w-4 h-4 text-indigo-500" />
                            <span className="font-black text-xs text-slate-700 uppercase tracking-wider">Registration Details</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Reg. Date</span>
                              <p className="text-xs font-bold text-slate-900 mt-0.5">{regParts.date}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Reg. Time</span>
                              <p className="text-xs font-bold text-slate-900 mt-0.5">{regParts.time}</p>
                            </div>
                            <div className="col-span-2">
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Last Updated</span>
                              <p className="text-xs font-bold text-slate-900 mt-0.5">{updatedParts.date} • {updatedParts.time}</p>
                            </div>
                            <div className="col-span-2">
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Account Status</span>
                              <div className="mt-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${
                                  selectedProvider.verificationStatus === "APPROVED" 
                                    ? "bg-green-50 text-green-700 border-green-200" 
                                    : selectedProvider.verificationStatus === "REJECTED"
                                    ? "bg-rose-50 text-rose-700 border-rose-200"
                                    : selectedProvider.verificationStatus === "SUSPENDED"
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                                }`}>
                                  {selectedProvider.verificationStatus}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* SECTION 5 — COOKING PREFERENCES */}
                    <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Utensils className="w-4 h-4 text-indigo-500" />
                        <span className="font-black text-xs text-slate-700 uppercase tracking-wider">Cooking & Operations</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Oil Customization</span>
                          <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedProvider.oilLevel || "Normal"}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Spice Customization</span>
                          <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedProvider.spiceLevel || "Medium"}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Delivery</span>
                          <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedProvider.deliveryOption || "Both"}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Availability</span>
                          <div className="mt-1">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              selectedProvider.isAvailable 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${selectedProvider.isAvailable ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                              {selectedProvider.isAvailable ? "Available" : "Offline"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 7 — PERFORMANCE */}
                    <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Star className="w-4 h-4 text-indigo-500" />
                        <span className="font-black text-xs text-slate-700 uppercase tracking-wider">Performance Metrics</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-slate-50/50 rounded-xl p-2.5 border border-slate-100">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Rating</span>
                          <p className="text-xs font-black text-slate-900 flex items-center justify-center gap-0.5">
                            <span className="text-amber-500">★</span>
                            <span>{selectedProvider.rating || "5.0"}</span>
                          </p>
                        </div>
                        <div className="bg-slate-50/50 rounded-xl p-2.5 border border-slate-100">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Reviews</span>
                          <p className="text-xs font-black text-slate-900">{selectedProvider.totalReviews || 0}</p>
                        </div>
                        <div className="bg-slate-50/50 rounded-xl p-2.5 border border-slate-100">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Repeat</span>
                          <p className="text-xs font-black text-emerald-600">{selectedProvider.repeatRate || "100%"}</p>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 8 — TIMELINE */}
                    <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        <span className="font-black text-xs text-slate-700 uppercase tracking-wider">Activity Timeline</span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">Chef profile registered</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">{formatDateTime(selectedProvider.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">Profile information updated</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">{formatDateTime(selectedProvider.updatedAt)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 9 — ADMIN COMMUNICATION CHAT */}
                    <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm flex flex-col h-[400px] overflow-hidden">
                      {/* Chat Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-50/50">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">💬</span>
                            <span className="font-black text-xs text-slate-700 uppercase tracking-wider">Admin Communication</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            Internal conversation with this provider
                          </p>
                        </div>
                        <button
                          onClick={handleClearChat}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
                          title="Clear Chat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Chat Scroll Area */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                        {(providerChats[selectedProvider._id] !== undefined ? providerChats[selectedProvider._id] : defaultMessages).length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-center p-4">
                            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-350 mb-2 border border-slate-100">
                              <MessageSquare className="w-6 h-6 text-slate-300" />
                            </div>
                            <h4 className="text-xs font-bold text-slate-700">No Messages Yet</h4>
                            <p className="text-[10px] text-slate-400 max-w-[180px] mt-1 leading-normal">
                              Start the conversation by typing a message below.
                            </p>
                          </div>
                        ) : (
                          (providerChats[selectedProvider._id] !== undefined ? providerChats[selectedProvider._id] : defaultMessages).map((msg) => {
                            const isAdmin = msg.sender === "Admin";
                            return (
                              <div
                                key={msg.id}
                                className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                              >
                                <div className="flex items-center gap-1 mb-0.5">
                                  <span className="text-[9px] font-black text-slate-400 uppercase">
                                    {msg.sender}
                                  </span>
                                  <span className="text-[9px] text-slate-350">•</span>
                                  <span className="text-[9px] text-slate-400">
                                    {msg.timestamp}
                                  </span>
                                </div>
                                <div
                                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs font-medium leading-relaxed shadow-sm transition-all break-words ${
                                    isAdmin
                                      ? "bg-indigo-650 text-white rounded-tr-none"
                                      : "bg-slate-100 text-slate-800 rounded-tl-none"
                                  }`}
                                >
                                  {msg.text}
                                </div>
                              </div>
                            );
                          })
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Chat Input Area */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSendMessage();
                        }}
                        className="p-3 border-t border-slate-100 bg-slate-50/50 flex gap-2 items-center"
                      >
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Type a message to the provider..."
                          className="flex-1 min-w-0 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs font-semibold rounded-full px-4 py-2.5 outline-none transition-all placeholder:text-slate-400"
                        />
                        <button
                          type="submit"
                          disabled={!chatInput.trim()}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0 cursor-pointer shadow-sm ${
                            chatInput.trim()
                              ? "bg-indigo-650 hover:bg-indigo-750 text-white shadow-indigo-600/10"
                              : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200"
                          }`}
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    </div>

                  </div>
                </div>
              </div>

              {/* Sticky Action Footer */}
              <div className="flex-shrink-0 bg-white border-t border-slate-200/80 p-4 flex flex-wrap gap-2.5 z-15 shadow-lg justify-between items-center pb-safe">
                <div className="flex gap-2">
                  {selectedProvider.verificationStatus !== "APPROVED" && (
                    <button
                      onClick={() => handleApproveProvider(selectedProvider._id, "APPROVED")}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 px-5 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-600/10 min-h-[44px]"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                  )}
                  {selectedProvider.verificationStatus !== "REJECTED" && selectedProvider.verificationStatus !== "SUSPENDED" && (
                    <button
                      onClick={() => handleApproveProvider(selectedProvider._id, "REJECTED")}
                      className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-3 px-5 rounded-xl transition-all cursor-pointer shadow-md shadow-rose-600/10 min-h-[44px]"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  )}
                  {selectedProvider.verificationStatus === "APPROVED" && (
                    <button
                      onClick={() => handleApproveProvider(selectedProvider._id, "SUSPENDED")}
                      className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-3 px-5 rounded-xl transition-all cursor-pointer shadow-md shadow-red-600/10 min-h-[44px]"
                    >
                      <Ban className="w-4 h-4" />
                      <span>Suspend</span>
                    </button>
                  )}
                </div>
                
                <button
                  onClick={handleCloseModal}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3 px-5 rounded-xl transition-all cursor-pointer min-h-[44px]"
                >
                  <span>Close</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── FOOD DETAILS CENTERED MODAL ── */}
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity duration-300 flex items-center justify-center p-0 sm:p-6 lg:p-8 ${
          isFoodModalOpen && selectedFood ? "opacity-100 animate-fadeIn" : "opacity-0 pointer-events-none"
        }`} 
        onClick={handleCloseFoodModal}
      >
        {/* Modal Window */}
        <div 
          className={`bg-[#F8FAFC] shadow-2xl flex flex-col transition-all duration-300 ease-out transform overflow-hidden
            /* Mobile: Full-screen bottom sheet/page */
            w-full h-full rounded-none
            /* Tablet/Desktop: Centered card */
            sm:max-w-2xl sm:h-auto sm:max-h-[90vh] sm:rounded-[24px]
            ${isFoodModalOpen && selectedFood ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 sm:translate-y-0"}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {selectedFood && (
            <>
              {/* Sticky Header */}
              <div className="flex-shrink-0 bg-white border-b border-slate-100 p-4 sm:p-6 flex items-center justify-between z-15">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {selectedFood.images?.[0] ? (
                    <img 
                      src={selectedFood.images[0]} 
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border border-slate-150 shadow-sm" 
                      alt={selectedFood.name} 
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-50 border border-indigo-150 text-indigo-650 flex items-center justify-center font-bold text-xl sm:text-2xl shadow-sm">
                      🍛
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">
                        {selectedFood.name}
                      </h3>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold border uppercase ${
                        selectedFood.isVeg 
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${selectedFood.isVeg ? "bg-emerald-500" : "bg-rose-500"}`} />
                        {selectedFood.isVeg ? "Veg" : "Non-Veg"}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-500 mt-0.5 truncate">{selectedFood.category} · ₹{selectedFood.price} /{selectedFood.pricePer || "meal"}</p>
                  </div>
                </div>
                {/* Close Button */}
                <button 
                  onClick={handleCloseFoodModal}
                  className="w-10 h-10 flex-shrink-0 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl flex items-center justify-center transition-all cursor-pointer touch-target ml-2"
                  title="Close Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50">
                
                {/* Description */}
                <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Description</span>
                  <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-line">
                    {selectedFood.description || "No description provided."}
                  </p>
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Left panel - Specifications */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <Sliders className="w-4 h-4 text-indigo-500" />
                      <span className="font-black text-xs text-slate-700 uppercase tracking-wider">Specifications</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Category</span>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedFood.category || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Meal Type</span>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedFood.mealType || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Prep Time</span>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedFood.prepTime || 30} mins</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Bring Container</span>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedFood.bringContainer ? "Required" : "Not Required"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right panel - Chef & Stock */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <User className="w-4 h-4 text-indigo-500" />
                      <span className="font-black text-xs text-slate-700 uppercase tracking-wider">Chef & Inventory</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Kitchen Name</span>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedFood.provider?.kitchenName || "N/A"}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Chef Name</span>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedFood.provider?.user?.name || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Available Qty</span>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedFood.quantity || 0} / {selectedFood.totalQuantity || 10} servings</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Status</span>
                        <p className="text-xs font-bold mt-0.5">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${
                            selectedFood.status === "available"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}>
                            {selectedFood.status}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4 sm:col-span-2">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      <span className="font-black text-xs text-slate-700 uppercase tracking-wider">Timeline</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Created At</span>
                        <p className="text-xs font-semibold text-slate-700 mt-0.5">{formatDateTime(selectedFood.createdAt)}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Last Updated</span>
                        <p className="text-xs font-semibold text-slate-700 mt-0.5">{formatDateTime(selectedFood.updatedAt)}</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Action Footer */}
              <div className="flex-shrink-0 bg-white border-t border-slate-200/80 p-4 flex justify-between items-center pb-safe">
                <button
                  onClick={() => {
                    handleCloseFoodModal();
                    setFoodToDelete(selectedFood);
                    setIsDeleteConfirmOpen(true);
                  }}
                  className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-3 px-5 rounded-xl transition-all cursor-pointer shadow-md shadow-rose-600/10 min-h-[44px]"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                  <span>Delete Food Item</span>
                </button>
                <button
                  onClick={handleCloseFoodModal}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3 px-5 rounded-xl transition-all cursor-pointer min-h-[44px]"
                >
                  <span>Close</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {isDeleteConfirmOpen && foodToDelete && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => { setIsDeleteConfirmOpen(false); setFoodToDelete(null); }}
        >
          <div 
            className="bg-white rounded-[24px] max-w-sm w-full p-6 shadow-2xl space-y-6 text-center transform scale-100 transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Trash2 className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-black text-slate-900">Delete Food Item?</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Are you sure you want to permanently remove <span className="font-extrabold text-slate-800">"{foodToDelete.name}"</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={() => { setIsDeleteConfirmOpen(false); setFoodToDelete(null); }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3 px-4 rounded-xl cursor-pointer min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteFood(foodToDelete._id)}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-3 px-4 rounded-xl cursor-pointer min-h-[44px] shadow-md shadow-rose-600/10"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── USER DETAILS CENTERED MODAL ── */}
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-45 transition-opacity duration-300 flex items-center justify-center p-0 sm:p-6 lg:p-8 ${
          isUserModalOpen && selectedUser ? "opacity-100 animate-fadeIn" : "opacity-0 pointer-events-none"
        }`} 
        onClick={handleCloseUserModal}
      >
        {/* Modal Window */}
        <div 
          className={`bg-[#F8FAFC] shadow-2xl flex flex-col transition-all duration-300 ease-out transform overflow-hidden
            /* Mobile: Full-screen bottom sheet/page */
            w-full h-full rounded-none
            /* Tablet/Desktop: Centered card */
            sm:max-w-2xl sm:h-auto sm:max-h-[90vh] sm:rounded-[24px]
            ${isUserModalOpen && selectedUser ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 sm:translate-y-0"}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {selectedUser && (() => {
            const providerProfile = selectedUser.role === "PROVIDER" 
              ? providers.find(p => p.user?._id === selectedUser._id || p.user === selectedUser._id)
              : null;
              
            return (
              <>
                {/* Sticky Header */}
                <div className="flex-shrink-0 bg-white border-b border-slate-100 p-4 sm:p-6 flex items-center justify-between z-15">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="relative flex-shrink-0">
                      {selectedUser.profileImage ? (
                        <img 
                          src={selectedUser.profileImage} 
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border border-slate-150 shadow-sm" 
                          alt={selectedUser.name} 
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-650 flex items-center justify-center font-bold text-xl sm:text-2xl shadow-sm">
                          {(selectedUser.name || "U").charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">
                          {selectedUser.name}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                          selectedUser.role === "ADMIN" 
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200" 
                            : selectedUser.role === "PROVIDER"
                            ? "bg-teal-50 text-teal-700 border-teal-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}>
                          {selectedUser.role}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-500 mt-0.5 truncate">{selectedUser.email}</p>
                    </div>
                  </div>
                  {/* Close Button */}
                  <button 
                    onClick={handleCloseUserModal}
                    className="w-10 h-10 flex-shrink-0 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl flex items-center justify-center transition-all cursor-pointer touch-target ml-2"
                    title="Close Modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    
                    {/* Account Info */}
                    <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <User className="w-4 h-4 text-indigo-500" />
                        <span className="font-black text-xs text-slate-700 uppercase tracking-wider">Account Details</span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Full Name</span>
                          <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedUser.name}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Email Address</span>
                          <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedUser.email}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Phone Number</span>
                          <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedUser.phone ? `+91 ${selectedUser.phone}` : "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Role</span>
                          <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedUser.role}</p>
                        </div>
                      </div>
                    </div>

                    {/* Metadata (Joined / Updated) */}
                    <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        <span className="font-black text-xs text-slate-700 uppercase tracking-wider">Activity & Status</span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Joined On</span>
                          <p className="text-xs font-bold text-slate-900 mt-0.5">{formatDateTime(selectedUser.createdAt)}</p>
                        </div>
                        {selectedUser.updatedAt && (
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Last Updated</span>
                            <p className="text-xs font-bold text-slate-900 mt-0.5">{formatDateTime(selectedUser.updatedAt)}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Conditional Kitchen/Cook details */}
                    {selectedUser.role === "PROVIDER" && (
                      <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4 sm:col-span-2">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                          <Utensils className="w-4 h-4 text-indigo-500" />
                          <span className="font-black text-xs text-slate-700 uppercase tracking-wider">Kitchen / Cook Profile</span>
                        </div>
                        {providerProfile ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Kitchen Name</span>
                              <p className="text-xs font-extrabold text-indigo-650 mt-0.5">{providerProfile.kitchenName || "N/A"}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Verification Status</span>
                              <div className="mt-0.5">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${
                                  providerProfile.verificationStatus === "APPROVED" 
                                    ? "bg-green-50 text-green-700 border-green-200" 
                                    : providerProfile.verificationStatus === "REJECTED"
                                    ? "bg-rose-50 text-rose-700 border-rose-200"
                                    : providerProfile.verificationStatus === "SUSPENDED"
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                                }`}>
                                  {providerProfile.verificationStatus || "PENDING"}
                                </span>
                              </div>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">City</span>
                              <p className="text-xs font-bold text-slate-900 mt-0.5">{providerProfile.city || "N/A"}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Area</span>
                              <p className="text-xs font-bold text-slate-900 mt-0.5">{providerProfile.area || "N/A"}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                            <p className="text-xs text-slate-500 font-semibold">Kitchen profile has not been fully initialized or linked yet.</p>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>

                {/* Action Footer */}
                <div className="flex-shrink-0 bg-white border-t border-slate-200/80 p-4 flex justify-end items-center pb-safe">
                  <button
                    onClick={handleCloseUserModal}
                    className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3 px-5 rounded-xl transition-all cursor-pointer min-h-[44px]"
                  >
                    <span>Close</span>
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      </div>

    </div>
  );
}
