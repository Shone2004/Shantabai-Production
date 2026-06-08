import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../services/api";
import {
  LayoutDashboard,
  Utensils,
  PlusCircle,
  User,
  LogOut,
  TrendingUp,
  ShoppingBag,
  CheckCircle2,
  Trash2,
  Edit,
  Plus,
  MapPin,
  Sparkles,
  DollarSign,
  Briefcase,
  Layers,
  ChevronRight,
  Upload,
  AlertTriangle,
  Heart
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

const CUISINE_TYPES = [
  "North Indian", "South Indian", "Maharashtrian", "Gujarati",
  "Bengali", "Punjabi", "Rajasthani", "Mughlai", "Chinese",
  "Continental", "Seafood", "Street Food", "Healthy / Diet", "Baking & Desserts"
];

const MEAL_TYPES = [
  "Breakfast", "Lunch", "Dinner", "Daily Tiffin",
  "Snack", "Festive / Event", "Baked Goods"
];

const SPICY_OPTS = [
  { label: "Mild", emoji: "🌿", color: "text-green-600", bg: "bg-green-50", border: "border-green-300" },
  { label: "Medium", emoji: "🌶️", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-300" },
  { label: "Hot", emoji: "🔥", color: "text-red-600", bg: "bg-red-50", border: "border-red-300" },
  { label: "Extra Hot", emoji: "💥", color: "text-red-900", bg: "bg-red-100", border: "border-red-700" },
];

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activePage, setActivePage] = useState("dashboard"); // 'dashboard' | 'myfoods' | 'addfood' | 'profile'
  
  // Profile Data
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  
  // Foods Data
  const [foods, setFoods] = useState([]);
  const [foodsLoading, setFoodsLoading] = useState(true);
  
  // Dashboard Stats
  const [stats, setStats] = useState({
    totalFoods: 0,
    activeFoods: 0,
    ordersToday: 0,
    earningsToday: 0,
    totalEarnings: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Food Form State (used for both Add and Edit)
  const [editingFoodId, setEditingFoodId] = useState(null);
  const [foodForm, setFoodForm] = useState({
    name: "",
    category: "",
    mealType: "",
    price: "",
    pricePer: "per plate",
    description: "",
    quantity: "10",
    totalQuantity: "10",
    prepTime: "30",
    isVeg: true,
    spicyLevel: 1,
    images: [],
    tags: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [imageInput, setImageInput] = useState("");
  const fileInputRef = useRef(null);

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    kitchenName: "",
    tagline: "",
    bio: "",
    experience: "",
    city: "",
    area: "",
    pincode: "",
    fullAddress: "",
    longitude: null,
    latitude: null,
    oilLevel: "Normal",
    spiceLevel: "Medium",
    deliveryOption: "Both",
    startingPrice: 0
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");

  // Notification Toast
  const [toast, setToast] = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch initial profile, foods, and stats
  const fetchData = async () => {
    try {
      // Get profile
      setProfileLoading(true);
      const profileRes = await api.get("/providers/me");
      if (profileRes.data.success) {
        setProfile(profileRes.data.profile);
        setProfileForm({
          kitchenName: profileRes.data.profile.kitchenName || "",
          tagline: profileRes.data.profile.tagline || "",
          bio: profileRes.data.profile.bio || "",
          experience: profileRes.data.profile.experience || 0,
          city: profileRes.data.profile.city || "",
          area: profileRes.data.profile.area || "",
          pincode: profileRes.data.profile.pincode || "",
          fullAddress: profileRes.data.profile.fullAddress || "",
          longitude: profileRes.data.profile.location?.coordinates?.[0] ?? null,
          latitude: profileRes.data.profile.location?.coordinates?.[1] ?? null,
          oilLevel: profileRes.data.profile.oilLevel || "Normal",
          spiceLevel: profileRes.data.profile.spiceLevel || "Medium",
          deliveryOption: profileRes.data.profile.deliveryOption || "Both",
          startingPrice: profileRes.data.profile.startingPrice || 0
        });
      }
    } catch (err) {
      console.error("Failed to load provider profile:", err);
      setProfileError("Could not load provider profile. Please complete onboarding.");
    } finally {
      setProfileLoading(false);
    }

    try {
      // Get food items
      setFoodsLoading(true);
      const foodsRes = await api.get("/foods/me");
      if (foodsRes.data.success) {
        setFoods(foodsRes.data.foodItems);
      }
    } catch (err) {
      console.error("Failed to load food items:", err);
    } finally {
      setFoodsLoading(false);
    }

    try {
      // Get Stats
      setStatsLoading(true);
      const statsRes = await api.get("/foods/stats");
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Food Status Toggle (Available / Out)
  const toggleFoodStatus = async (id, currentStatus, currentQty) => {
    const nextStatus = currentStatus === "available" ? "out" : "available";
    const nextQty = nextStatus === "available" ? (currentQty === 0 ? 10 : currentQty) : 0;
    try {
      const response = await api.put(`/foods/${id}`, {
        status: nextStatus,
        quantity: nextQty
      });
      if (response.data.success) {
        setFoods(prev =>
          prev.map(food => (food._id === id ? response.data.foodItem : food))
        );
        showToast("success", `Dish set to ${nextStatus}`);
        
        // Refresh stats
        const statsRes = await api.get("/foods/stats");
        if (statsRes.data.success) setStats(statsRes.data.stats);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      showToast("error", "Failed to update item status");
    }
  };

  // Handle Delete Food
  const deleteFoodItem = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this food item?")) return;
    try {
      const response = await api.delete(`/foods/${id}`);
      if (response.data.success) {
        setFoods(prev => prev.filter(food => food._id !== id));
        showToast("success", "Food item deleted successfully");
        
        // Refresh stats
        const statsRes = await api.get("/foods/stats");
        if (statsRes.data.success) setStats(statsRes.data.stats);
      }
    } catch (err) {
      console.error("Failed to delete food item:", err);
      showToast("error", "Could not delete food item");
    }
  };

  // Edit Button Trigger
  const triggerEditMode = (food) => {
    setEditingFoodId(food._id);
    setFoodForm({
      name: food.name,
      category: food.category,
      mealType: food.mealType || "",
      price: food.price.toString(),
      pricePer: food.pricePer || "per plate",
      description: food.description,
      quantity: food.quantity.toString(),
      totalQuantity: (food.totalQuantity || food.quantity).toString(),
      prepTime: food.prepTime.toString(),
      isVeg: food.isVeg,
      spicyLevel: food.spicyLevel,
      images: food.images || [],
      tags: food.tags || []
    });
    setFormErrors({});
    setActivePage("addfood");
  };

  // Handle Food Form Submission (Add or Update)
  const handleFoodSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    const errors = {};
    if (!foodForm.name.trim()) errors.name = "Food name is required";
    if (!foodForm.category) errors.category = "Please select a category";
    if (!foodForm.price || isNaN(foodForm.price) || Number(foodForm.price) <= 0) errors.price = "Enter a valid price";
    if (!foodForm.description.trim() || foodForm.description.length < 20) errors.description = "Description must be at least 20 characters";
    if (!foodForm.prepTime || isNaN(foodForm.prepTime) || Number(foodForm.prepTime) <= 0) errors.prepTime = "Enter preparation time";
    if (!foodForm.quantity || isNaN(foodForm.quantity) || Number(foodForm.quantity) < 0) errors.quantity = "Enter available quantity";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast("error", "Please fix validation errors");
      return;
    }

    setFormSubmitting(true);
    try {
      const payload = {
        ...foodForm,
        price: Number(foodForm.price),
        prepTime: Number(foodForm.prepTime),
        quantity: Number(foodForm.quantity),
        totalQuantity: Number(foodForm.totalQuantity || foodForm.quantity)
      };

      if (editingFoodId) {
        // Update
        const response = await api.put(`/foods/${editingFoodId}`, payload);
        if (response.data.success) {
          showToast("success", "Food item updated successfully!");
          setFoods(prev => prev.map(f => f._id === editingFoodId ? response.data.foodItem : f));
          resetFoodForm();
          setActivePage("myfoods");
        }
      } else {
        // Create
        const response = await api.post("/foods", payload);
        if (response.data.success) {
          showToast("success", "New food item created!");
          setFoods(prev => [response.data.foodItem, ...prev]);
          resetFoodForm();
          setActivePage("myfoods");
        }
      }
      
      // Refresh stats
      const statsRes = await api.get("/foods/stats");
      if (statsRes.data.success) setStats(statsRes.data.stats);

    } catch (err) {
      console.error("Error saving food:", err);
      showToast("error", err.response?.data?.message || "Failed to save food item");
    } finally {
      setFormSubmitting(false);
    }
  };

  const resetFoodForm = () => {
    setEditingFoodId(null);
    setFoodForm({
      name: "",
      category: "",
      mealType: "",
      price: "",
      pricePer: "per plate",
      description: "",
      quantity: "10",
      totalQuantity: "10",
      prepTime: "30",
      isVeg: true,
      spicyLevel: 1,
      images: [],
      tags: []
    });
    setFormErrors({});
  };

  // Image upload handler (Base64 conversion)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoodForm(prev => {
          if (prev.images.length >= 5) return prev;
          return {
            ...prev,
            images: [...prev.images, reader.result]
          };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  // Profile Save
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccessMsg("");
    try {
      const response = await api.put("/providers/me", profileForm);
      if (response.data.success) {
        setProfile(response.data.profile);
        setProfileSuccessMsg("Profile details updated successfully!");
        showToast("success", "Kitchen profile updated!");
        setTimeout(() => setProfileSuccessMsg(""), 4000);
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      showToast("error", err.response?.data?.message || "Could not save profile details");
    } finally {
      setProfileSaving(false);
    }
  };

  // Mock Graph Data for Sales
  const salesData = [
    { name: "Mon", sales: 4, earnings: 4 * 120 },
    { name: "Tue", sales: 8, earnings: 8 * 120 },
    { name: "Wed", sales: 5, earnings: 5 * 120 },
    { name: "Thu", sales: 12, earnings: 12 * 120 },
    { name: "Fri", sales: 15, earnings: 15 * 120 },
    { name: "Sat", sales: 22, earnings: 22 * 120 },
    { name: "Sun", sales: 18, earnings: 18 * 120 }
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans antialiased text-slate-800 overflow-hidden">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl transition-all duration-300 border animate-slideIn ${
          toast.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-950" 
            : "bg-rose-50 border-rose-200 text-rose-950"
        }`}>
          <span className="text-xl">{toast.type === "success" ? "✨" : "⚠️"}</span>
          <p className="text-xs font-bold uppercase tracking-wider">{toast.msg}</p>
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-full flex-shrink-0">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-white leading-tight">
              Shantabai <span className="text-emerald-400">SaaS</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Chef Portal</p>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="p-4 mx-4 my-4 rounded-2xl bg-slate-800/50 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white text-base">
            {(profile?.kitchenName || user?.name || "C").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white truncate">{profile?.kitchenName || "My Kitchen"}</h4>
            <p className="text-[10px] text-slate-500 font-semibold truncate">
              {profile?.isVerified ? "✓ Verified Partner" : "Pending Verification"}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-1">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "myfoods", label: "My Foods", icon: Utensils },
            { id: "addfood", label: editingFoodId ? "Edit Food" : "Add Food", icon: PlusCircle },
            { id: "profile", label: "Profile", icon: User }
          ].map(item => {
            const Icon = item.icon;
            const active = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "addfood" && !editingFoodId) {
                    resetFoodForm();
                  }
                  setActivePage(item.id);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  active 
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/15" 
                    : "hover:bg-slate-800/80 hover:text-slate-100"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-white" : "text-slate-400 group-hover:text-slate-100"}`} />
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
            <LogOut className="w-4 h-4 text-slate-400 hover:text-rose-400" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200/80 bg-white px-8 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-900 capitalize">{activePage}</h2>
            <p className="text-xs text-slate-400 font-medium">Manage your kitchen operations and listings</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
              profile?.verificationStatus === "APPROVED"
                ? "bg-green-50 border border-green-200 text-green-700"
                : profile?.verificationStatus === "REJECTED"
                ? "bg-red-50 border border-red-200 text-red-700"
                : "bg-amber-50 border border-amber-200 text-amber-700 animate-pulse"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                profile?.verificationStatus === "APPROVED" ? "bg-green-500" : profile?.verificationStatus === "REJECTED" ? "bg-red-500" : "bg-amber-500"
              }`} />
              <span>{profile?.verificationStatus || "PENDING"}</span>
            </div>
            
            <div className="w-px h-8 bg-slate-200" />
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm">
                {(user?.name || "C").charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-slate-700">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* PROFILE EXCLUSIVITY VALIDATION WARNING */}
          {profileError && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Onboarding Profile Required</p>
                <p className="text-xs mt-0.5">Please ensure your chef/provider profile details are fully setup in the Profile tab to begin creating dishes.</p>
              </div>
            </div>
          )}

          {/* ════ 1. DASHBOARD PAGE ════ */}
          {activePage === "dashboard" && (
            <div className="space-y-8">
              
              {/* Welcome Banner */}
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-slate-950/10">
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute -left-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">Welcome Back Chef</span>
                    <h3 className="text-2xl font-black tracking-tight mt-1">Hello, {user?.name || "Kitchen Owner"}</h3>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                      {profile?.kitchenName || "Configure your kitchen"} · {profile?.area ? `${profile.area}, ` : ""}{profile?.city || "No location configured"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      resetFoodForm();
                      setActivePage("addfood");
                    }}
                    className="self-start md:self-auto bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-400/15 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Dish</span>
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              {statsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 h-28 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  
                  {/* Total Foods */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Foods</span>
                      <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalFoods}</h3>
                      <p className="text-[10px] text-slate-500 font-semibold mt-1">Dishes Created</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                      <Utensils className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Active Foods */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Foods</span>
                      <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.activeFoods}</h3>
                      <p className="text-[10px] text-slate-500 font-semibold mt-1">Currently Available</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Orders Today */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Orders Today</span>
                      <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.ordersToday}</h3>
                      <p className="text-[10px] text-slate-500 font-semibold mt-1">Delivered today</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Earnings */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Earnings</span>
                      <h3 className="text-2xl font-black text-slate-900 mt-1">₹{stats.totalEarnings.toLocaleString()}</h3>
                      <p className="text-[10px] text-slate-500 font-semibold mt-1">Est. Revenue</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                      <DollarSign className="w-6 h-6" />
                    </div>
                  </div>

                </div>
              )}

              {/* Chart Block */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Sales Chart */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Weekly Revenue Analytics</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Detailed view of earnings over past week</p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                  </div>
                  
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEarnings)" name="Earnings (₹)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Popular Food Items Summary */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-6">Trending Dishes</h4>
                  
                  {foodsLoading ? (
                    <div className="space-y-4 animate-pulse">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-12 bg-slate-100 rounded-xl" />
                      ))}
                    </div>
                  ) : foods.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Utensils className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-xs font-bold text-slate-500">No dishes created yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {foods.slice(0, 4).map(food => (
                        <div key={food._id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                          <div className="flex items-center gap-3 min-w-0">
                            {food.images?.[0] ? (
                              <img src={food.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-sm flex-shrink-0">🍲</div>
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{food.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{food.category}</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs font-bold text-slate-900">₹{food.price}</p>
                            <p className="text-[9px] text-slate-400 font-semibold">{food.ordersToday || 0} orders</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* ════ 2. MY FOODS PAGE ════ */}
          {activePage === "myfoods" && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">All Food Listings</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{foods.length} items configured in total</p>
                </div>
                <button
                  onClick={() => {
                    resetFoodForm();
                    setActivePage("addfood");
                  }}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest px-5 py-3.5 rounded-xl shadow-lg shadow-emerald-500/10 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Dish</span>
                </button>
              </div>

              {foodsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-64 bg-slate-200 border border-slate-100 rounded-3xl" />
                  ))}
                </div>
              ) : foods.length === 0 ? (
                <div className="text-center py-24 bg-white border border-slate-200/60 rounded-3xl">
                  <Utensils className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h4 className="text-base font-bold text-slate-700">No Food Items Configured</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                    Add food dishes to your kitchen menu profile. Customers will be able to order them once they go live.
                  </p>
                  <button
                    onClick={() => {
                      resetFoodForm();
                      setActivePage("addfood");
                    }}
                    className="mt-6 bg-slate-900 hover:opacity-90 text-white font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl cursor-pointer"
                  >
                    Create Your First Dish
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {foods.map(food => {
                    const spicyIdx = Math.min(Number(food.spicyLevel || 0), 3);
                    const isAvailable = food.status === "available" && food.quantity > 0;
                    return (
                      <div key={food._id} className="bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                        
                        {/* Header Image */}
                        <div className="relative h-44 bg-slate-100 overflow-hidden flex-shrink-0">
                          {food.images?.[0] ? (
                            <img src={food.images[0]} alt={food.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-50">🍲</div>
                          )}
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
                          
                          {/* Veg/Non-Veg dot */}
                          <div className="absolute top-3 left-3 bg-white rounded-lg px-2 py-1 flex items-center gap-1.5 shadow-sm border border-slate-100">
                            <span className={`w-2 h-2 rounded-full ${food.isVeg ? "bg-green-500 border border-green-800" : "bg-red-500 border border-red-800"}`} />
                            <span className="text-[9px] font-extrabold text-slate-700">{food.isVeg ? "VEG" : "NON-VEG"}</span>
                          </div>

                          {/* Approval Status Badge */}
                          <div className={`absolute top-3 right-3 rounded-lg px-2.5 py-1 text-[8px] font-black uppercase tracking-wider shadow-sm border ${
                            food.approvalStatus === "APPROVED"
                              ? "bg-emerald-500/90 text-white border-emerald-600/30"
                              : food.approvalStatus === "REJECTED"
                              ? "bg-rose-500/90 text-white border-rose-600/30"
                              : "bg-amber-400/95 text-slate-950 border-amber-500/30"
                          }`}>
                            {food.approvalStatus || "PENDING"}
                          </div>

                          {/* Price */}
                          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-slate-900 font-black text-sm px-3 py-1 rounded-xl shadow-sm border border-white/50">
                            ₹{food.price}
                          </div>
                        </div>

                        {/* Body Details */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-extrabold text-sm text-slate-900 leading-snug truncate">{food.name}</h4>
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{food.description}</p>
                            
                            <div className="flex items-center gap-2 flex-wrap pt-1">
                              <span className="text-[10px] text-slate-400 font-semibold">{food.category}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <span className="text-[10px] text-slate-400 font-semibold">{food.prepTime} mins prep</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <span className="text-[10px] text-slate-400 font-semibold">Qty: {food.quantity}</span>
                            </div>

                            <div className="pt-2 flex items-center gap-2">
                              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${SPICY_OPTS[spicyIdx].bg} ${SPICY_OPTS[spicyIdx].border} ${SPICY_OPTS[spicyIdx].color}`}>
                                {SPICY_OPTS[spicyIdx].emoji} {SPICY_OPTS[spicyIdx].label}
                              </span>
                            </div>
                          </div>

                          {/* Action Bar */}
                          <div className="flex items-center gap-2 mt-5 pt-3 border-t border-slate-100">
                            <button
                              onClick={() => toggleFoodStatus(food._id, food.status, food.quantity)}
                              className={`flex-1 py-2 text-[10px] uppercase tracking-wider font-extrabold rounded-lg border cursor-pointer transition-all ${
                                isAvailable 
                                  ? "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100" 
                                  : "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                              }`}
                            >
                              {isAvailable ? "● Live / Available" : "✕ Out of Stock"}
                            </button>
                            
                            <button
                              onClick={() => triggerEditMode(food)}
                              className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => deleteFoodItem(food._id)}
                              className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* ════ 3. ADD / EDIT FOOD PAGE ════ */}
          {activePage === "addfood" && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">
                    {editingFoodId ? "Edit Food Item" : "Create New Food Item"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Fill out your recipe listing details</p>
                </div>
                {editingFoodId && (
                  <button
                    onClick={resetFoodForm}
                    className="text-xs font-bold text-slate-500 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleFoodSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Form Fields */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Basic Info */}
                  <div className="bg-white border border-slate-200/60 rounded-3xl p-6 space-y-4">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mb-2">Basic Recipe Details</h4>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Dish Name *</label>
                      <input
                        type="text"
                        value={foodForm.name}
                        onChange={e => setFoodForm(p => ({ ...p, name: e.target.value }))}
                        className={`w-full bg-slate-50 border ${formErrors.name ? "border-rose-400" : "border-slate-200 focus:border-emerald-500"} rounded-xl px-4 py-3 text-sm outline-none focus:bg-white transition-all`}
                        placeholder="e.g. Grandma's Spiced Chicken Biryani"
                      />
                      {formErrors.name && <span className="text-[10px] text-rose-500">⚠️ {formErrors.name}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">Cuisine *</label>
                        <select
                          value={foodForm.category}
                          onChange={e => setFoodForm(p => ({ ...p, category: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-emerald-500"
                        >
                          <option value="">Select Cuisine</option>
                          {CUISINE_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {formErrors.category && <span className="text-[10px] text-rose-500">⚠️ {formErrors.category}</span>}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">Meal Type</label>
                        <select
                          value={foodForm.mealType}
                          onChange={e => setFoodForm(p => ({ ...p, mealType: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-emerald-500"
                        >
                          <option value="">Select Meal Type</option>
                          {MEAL_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Description * (minimum 20 chars)</label>
                      <textarea
                        value={foodForm.description}
                        onChange={e => setFoodForm(p => ({ ...p, description: e.target.value }))}
                        className={`w-full bg-slate-50 border ${formErrors.description ? "border-rose-400" : "border-slate-200 focus:border-emerald-500"} rounded-xl px-4 py-3 text-sm outline-none focus:bg-white transition-all h-28 resize-none`}
                        placeholder="Detail the ingredients, taste profile, spice levels, allergen details, etc..."
                      />
                      {formErrors.description && <span className="text-[10px] text-rose-500">⚠️ {formErrors.description}</span>}
                    </div>

                  </div>

                  {/* Operational Settings */}
                  <div className="bg-white border border-slate-200/60 rounded-3xl p-6 space-y-4">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mb-2">Pricing & Logistics</h4>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">Price (₹) *</label>
                        <input
                          type="number"
                          value={foodForm.price}
                          onChange={e => setFoodForm(p => ({ ...p, price: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-emerald-500"
                          placeholder="120"
                        />
                        {formErrors.price && <span className="text-[10px] text-rose-500">⚠️ {formErrors.price}</span>}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">Prep Time (mins) *</label>
                        <input
                          type="number"
                          value={foodForm.prepTime}
                          onChange={e => setFoodForm(p => ({ ...p, prepTime: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-emerald-500"
                          placeholder="30"
                        />
                        {formErrors.prepTime && <span className="text-[10px] text-rose-500">⚠️ {formErrors.prepTime}</span>}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">Daily Quantity *</label>
                        <input
                          type="number"
                          value={foodForm.quantity}
                          onChange={e => setFoodForm(p => ({ ...p, quantity: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-emerald-500"
                          placeholder="10"
                        />
                        {formErrors.quantity && <span className="text-[10px] text-rose-500">⚠️ {formErrors.quantity}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Food Preferences */}
                  <div className="bg-white border border-slate-200/60 rounded-3xl p-6 space-y-4">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mb-2">Dishes Characteristics</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600 font-bold">Dietary *</label>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setFoodForm(p => ({ ...p, isVeg: true }))}
                            className={`flex-1 py-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                              foodForm.isVeg ? "bg-green-50 border-green-500 text-green-700" : "bg-slate-50 border-slate-200 text-slate-500"
                            }`}
                          >
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 border border-green-800" />
                            <span>Veg</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFoodForm(p => ({ ...p, isVeg: false }))}
                            className={`flex-1 py-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                              !foodForm.isVeg ? "bg-red-50 border-red-500 text-red-700" : "bg-slate-50 border-slate-200 text-slate-500"
                            }`}
                          >
                            <span className="w-2.5 h-2.5 rounded-sm bg-red-500 border border-red-800" />
                            <span>Non-Veg</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">Spiciness Level</label>
                        <div className="grid grid-cols-2 gap-2">
                          {SPICY_OPTS.map((opt, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setFoodForm(p => ({ ...p, spicyLevel: i }))}
                              className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                                foodForm.spicyLevel === i 
                                  ? `${opt.bg} ${opt.border} ${opt.color}` 
                                  : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                              }`}
                            >
                              <span>{opt.emoji}</span>
                              <span>{opt.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 justify-end pt-4">
                    <button
                      type="button"
                      onClick={resetFoodForm}
                      className="px-6 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Reset Form
                    </button>
                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-emerald-500/15 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                    >
                      {formSubmitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                      <span>{editingFoodId ? "Save Changes" : "Publish Dish"}</span>
                    </button>
                  </div>

                </div>

                {/* Right Side Media Upload & Live Card Preview */}
                <div className="space-y-6">
                  
                  {/* Media uploads */}
                  <div className="bg-white border border-slate-200/60 rounded-3xl p-6 space-y-4">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">Food Images</h4>
                    
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-emerald-500/[0.02]"
                    >
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">Upload Food Photo</p>
                      <p className="text-[10px] text-slate-400 mt-1">Supports JPG, PNG (Max 5)</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={handleImageUpload}
                      />
                    </div>

                    {/* Image URL Input as fallback */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Or Add Image URL</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={imageInput}
                          onChange={e => setImageInput(e.target.value)}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-emerald-500"
                          placeholder="https://images.unsplash.com/..."
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (imageInput.trim()) {
                              setFoodForm(p => ({
                                ...p,
                                images: [...p.images, imageInput.trim()].slice(0, 5)
                              }));
                              setImageInput("");
                            }
                          }}
                          className="bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Image Previews */}
                    {foodForm.images.length > 0 && (
                      <div className="grid grid-cols-5 gap-2 pt-2">
                        {foodForm.images.map((img, i) => (
                          <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setFoodForm(p => ({
                                ...p,
                                images: p.images.filter((_, idx) => idx !== i)
                              }))}
                              className="absolute inset-0 bg-black/40 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Live Preview */}
                  <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
                    <div className="mb-4">
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live Card Preview</p>
                      <p className="text-xs text-slate-400 mt-0.5">How consumers see your item in listings</p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 flex justify-center">
                      <div className="w-full max-w-sm bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                        <div className="relative h-36 bg-slate-100 overflow-hidden flex-shrink-0">
                          {foodForm.images[0] ? (
                            <img src={foodForm.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">🍲</div>
                          )}
                          <div className="absolute top-2 left-2 bg-white rounded-lg px-2 py-0.5 flex items-center gap-1 border border-slate-100">
                            <span className={`w-1.5 h-1.5 rounded-full ${foodForm.isVeg ? "bg-green-500" : "bg-red-500"}`} />
                            <span className="text-[8px] font-extrabold text-slate-700">{foodForm.isVeg ? "VEG" : "NON-VEG"}</span>
                          </div>
                          <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-slate-900 font-extrabold text-xs px-2 py-0.5 rounded-lg">
                            ₹{foodForm.price || 0}
                          </div>
                        </div>
                        <div className="p-4 space-y-1">
                          <h4 className="font-extrabold text-xs text-slate-900 truncate">{foodForm.name || "Untitled Dish"}</h4>
                          <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{foodForm.description || "Provide description details..."}</p>
                          <div className="flex items-center gap-2 pt-2 text-[9px] text-slate-400">
                            <span>{foodForm.category || "No category"}</span>
                            <span>·</span>
                            <span>{foodForm.prepTime || 30} mins</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </form>

            </div>
          )}

          {/* ════ 4. PROFILE PAGE ════ */}
          {activePage === "profile" && (
            <div className="space-y-6 max-w-4xl">
              
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">Chef Kitchen Details</h3>
                <p className="text-xs text-slate-400 mt-0.5">Manage details regarding your home-chef business</p>
              </div>

              {profileLoading ? (
                <div className="h-96 bg-white border border-slate-100 rounded-3xl animate-pulse" />
              ) : (
                <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  
                  {/* Left Column Profile Edit Fields */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {profileSuccessMsg && (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-2xl text-xs font-bold">
                        {profileSuccessMsg}
                      </div>
                    )}

                    {/* Brand Kitchen Details */}
                    <div className="bg-white border border-slate-200/60 rounded-3xl p-6 space-y-4 shadow-sm">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mb-2">Brand & Kitchen Details</h4>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-600">Kitchen Name *</label>
                          <input
                            type="text"
                            value={profileForm.kitchenName}
                            onChange={e => setProfileForm(p => ({ ...p, kitchenName: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white"
                            required
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-600">Experience (Years) *</label>
                          <input
                            type="number"
                            value={profileForm.experience}
                            onChange={e => setProfileForm(p => ({ ...p, experience: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">Tagline</label>
                        <input
                          type="text"
                          value={profileForm.tagline}
                          onChange={e => setProfileForm(p => ({ ...p, tagline: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white"
                          placeholder="e.g. Traditional Maharashtrian meals with authentic spices"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">Chef Bio * (minimum 20 chars)</label>
                        <textarea
                          value={profileForm.bio}
                          onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white h-24 resize-none"
                          required
                        />
                      </div>
                    </div>

                    {/* Preferences Details */}
                    <div className="bg-white border border-slate-200/60 rounded-3xl p-6 space-y-4 shadow-sm">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mb-2">Customization Options</h4>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-600">Oil Customization</label>
                          <select
                            value={profileForm.oilLevel}
                            onChange={e => setProfileForm(p => ({ ...p, oilLevel: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500"
                          >
                            <option value="Low Oil">Low Oil</option>
                            <option value="Normal">Normal</option>
                            <option value="Extra">Extra</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-600">Spice Customization</label>
                          <select
                            value={profileForm.spiceLevel}
                            onChange={e => setProfileForm(p => ({ ...p, spiceLevel: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500"
                          >
                            <option value="Mild">Mild</option>
                            <option value="Medium">Medium</option>
                            <option value="Spicy">Spicy</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-600">Delivery Options</label>
                          <select
                            value={profileForm.deliveryOption}
                            onChange={e => setProfileForm(p => ({ ...p, deliveryOption: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500"
                          >
                            <option value="Pick Up">Pick Up</option>
                            <option value="Delivery">Delivery</option>
                            <option value="Both">Both</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Location Details */}
                    <div className="bg-white border border-slate-200/60 rounded-3xl p-6 space-y-4 shadow-sm">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mb-2">Location & Address Details</h4>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-600">City *</label>
                          <input
                            type="text"
                            value={profileForm.city}
                            onChange={e => setProfileForm(p => ({ ...p, city: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none"
                            required
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-600">Locality / Area *</label>
                          <input
                            type="text"
                            value={profileForm.area}
                            onChange={e => setProfileForm(p => ({ ...p, area: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none"
                            required
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-600">Pincode *</label>
                          <input
                            type="text"
                            value={profileForm.pincode}
                            onChange={e => setProfileForm(p => ({ ...p, pincode: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">Full Address *</label>
                        <input
                          type="text"
                          value={profileForm.fullAddress}
                          onChange={e => setProfileForm(p => ({ ...p, fullAddress: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-600">Longitude *</label>
                          <input
                            type="number"
                            step="any"
                            value={profileForm.longitude}
                            onChange={e => setProfileForm(p => ({ ...p, longitude: Number(e.target.value) }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-600">Latitude *</label>
                          <input
                            type="number"
                            step="any"
                            value={profileForm.latitude}
                            onChange={e => setProfileForm(p => ({ ...p, latitude: Number(e.target.value) }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={profileSaving}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10"
                      >
                        {profileSaving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        <span>Save Kitchen Details</span>
                      </button>
                    </div>

                  </div>

                  {/* Profile Cards Card Display details */}
                  <div className="space-y-6">
                    <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col relative">
                      <div className="absolute top-0 inset-x-0 h-16 bg-slate-900" />
                      
                      <div className="relative z-10 pt-6 flex flex-col items-center">
                        <div className="w-20 h-20 bg-emerald-600 border-4 border-white shadow-md rounded-2xl flex items-center justify-center text-3xl font-black text-white mb-3">
                          {(profile?.kitchenName || user?.name || "C").charAt(0).toUpperCase()}
                        </div>
                        
                        <h4 className="font-extrabold text-base text-slate-900 text-center">{profile?.kitchenName || "My Kitchen"}</h4>
                        <p className="text-xs text-slate-400 mt-0.5 text-center">by {user?.name}</p>
                        
                        <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 justify-center">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{profile?.area ? `${profile.area}, ` : ""}{profile?.city || "No Location"}</span>
                        </div>
                        
                        {profile?.tagline && (
                          <p className="text-xs text-slate-400 italic text-center mt-3 border-t border-slate-50 pt-3 w-full">
                            "{profile.tagline}"
                          </p>
                        )}
                      </div>

                      <div className="mt-6 border-t border-slate-100 pt-4 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-500 flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                            <span>Experience</span>
                          </span>
                          <span className="font-extrabold text-slate-900">{profile?.experience || 0} Years</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-500 flex items-center gap-1.5">
                            <Heart className="w-3.5 h-3.5 text-slate-400" />
                            <span>Rating</span>
                          </span>
                          <span className="font-extrabold text-slate-900">⭐ {profile?.rating || 5.0}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-500 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-slate-400" />
                            <span>Availability</span>
                          </span>
                          <span className={`font-extrabold px-2 py-0.5 rounded-full text-[10px] ${
                            profile?.isAvailable ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                          }`}>
                            {profile?.isAvailable ? "Online" : "Offline"}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>

                </form>
              )}

            </div>
          )}

        </div>
      </main>

    </div>
  );
}