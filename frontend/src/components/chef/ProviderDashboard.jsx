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
  Heart,
  Bell,
  Star,
  CalendarDays,
  LifeBuoy,
  ToggleLeft,
  X,
  Clock,
  Package,
  ArrowUpRight,
  Wallet,
  Award,
  ChevronDown,
  BarChart2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ChefBookings from "./ChefBookings";

// ─── Constants (unchanged) ──────────────────────────────────────────────────
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

// ─── Navigation Configuration ───────────────────────────────────────────────
const SIDEBAR_NAV = [
  { id: "dashboard",    label: "Dashboard",    icon: LayoutDashboard, comingSoon: false },
  { id: "bookings",     label: "Bookings",     icon: CalendarDays,    comingSoon: false  },
  { id: "myfoods",      label: "My Foods",     icon: Utensils,        comingSoon: false },
  { id: "addfood",      label: "Add Food",     icon: PlusCircle,      comingSoon: false },
  { id: "earnings",     label: "Earnings",     icon: TrendingUp,      comingSoon: true  },
  { id: "reviews",      label: "Reviews",      icon: Star,            comingSoon: true  },
  { id: "availability", label: "Availability", icon: ToggleLeft,      comingSoon: true  },
  { id: "profile",      label: "Profile",      icon: User,            comingSoon: false },
  { id: "support",      label: "Support",      icon: LifeBuoy,        comingSoon: true  },
];

const BOTTOM_NAV = [
  { id: "dashboard", label: "Home",     icon: LayoutDashboard, isCenter: false },
  { id: "bookings",  label: "Bookings", icon: CalendarDays,    isCenter: false },
  { id: "addfood",   label: "Add",      icon: PlusCircle,      isCenter: true  },
  { id: "myfoods",   label: "Foods",    icon: Utensils,        isCenter: false },
  { id: "profile",   label: "Profile",  icon: User,            isCenter: false },
];

const COMING_SOON_PAGES = ["earnings", "reviews", "availability", "support"];

// ─── Page Title Helper ───────────────────────────────────────────────────────
function getPageTitle(activePage, editingFoodId) {
  const map = {
    dashboard: "Dashboard",
    myfoods: "My Foods",
    addfood: editingFoodId ? "Edit Food" : "Add Food",
    profile: "Profile",
    bookings: "Bookings",
    earnings: "Earnings",
    reviews: "Reviews",
    availability: "Availability",
    support: "Support",
  };
  return map[activePage] || activePage;
}

// ─── Skeleton Card ───────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="h-44 skeleton" />
      <div className="p-4 space-y-2.5">
        <div className="skeleton-text w-3/4" />
        <div className="skeleton-text w-1/2" style={{ height: "0.75rem" }} />
        <div className="h-9 skeleton rounded-xl mt-3" />
      </div>
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, badge, accent, loading }) {
  if (loading) return <div className="bg-white rounded-2xl p-5 h-28 skeleton" />;
  const isEarnings = accent === "earnings";
  return (
    <div className={`rounded-2xl p-4 md:p-5 border shadow-sm hover:shadow-md transition-all duration-200 food-card ${
      isEarnings
        ? "stat-card-earnings border-emerald-400"
        : "bg-white border-slate-100"
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          isEarnings ? "bg-white/20" :
          accent === "blue" ? "bg-blue-50" :
          accent === "green" ? "bg-emerald-50" : "bg-amber-50"
        }`}>
          <Icon className={`w-5 h-5 ${
            isEarnings ? "text-white" :
            accent === "blue" ? "text-blue-500" :
            accent === "green" ? "text-emerald-500" : "text-amber-500"
          }`} />
        </div>
        {badge && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isEarnings ? "bg-white/20 text-white" :
            accent === "blue" ? "bg-blue-50 text-blue-600" :
            accent === "green" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
          }`}>{badge}</span>
        )}
        {isEarnings && <ArrowUpRight className="w-4 h-4 text-emerald-100" />}
      </div>
      <p className={`text-2xl font-black ${isEarnings ? "text-white" : "text-slate-900"}`}>{value}</p>
      <p className={`text-xs mt-0.5 font-medium ${isEarnings ? "text-emerald-100" : "text-slate-400"}`}>{label}</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activePage, setActivePage] = useState("dashboard");

  // ── Profile Data (unchanged) ──
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  // ── Foods Data (unchanged) ──
  const [foods, setFoods] = useState([]);
  const [foodsLoading, setFoodsLoading] = useState(true);

  // ── Dashboard Stats (unchanged) ──
  const [stats, setStats] = useState({
    totalFoods: 0,
    activeFoods: 0,
    ordersToday: 0,
    earningsToday: 0,
    totalEarnings: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // ── Food Form State (unchanged) ──
  const [editingFoodId, setEditingFoodId] = useState(null);
  const [foodForm, setFoodForm] = useState({
    name: "",
    category: "",
    mealType: "",
    price: "",
    pricePer: "per box",
    description: "",
    quantity: "10",
    totalQuantity: "10",
    pickupTime: "12:00",
    orderOpenTill: "10:00",
    isVeg: true,
    bringContainer: false,
    spicyLevel: 1,
    images: [],
    tags: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [imageInput, setImageInput] = useState("");
  const fileInputRef = useRef(null);

  // ── Profile Edit State (unchanged) ──
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

  // ── Toast (unchanged) ──
  const [toast, setToast] = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Data Fetching (unchanged) ──
  const fetchData = async () => {
    try {
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

  // ── Scroll to top on page change ──
  useEffect(() => {
    const main = document.getElementById("chef-main-content");
    if (main) main.scrollTop = 0;
  }, [activePage]);

  // ── Toggle Food Status (unchanged) ──
  const toggleFoodStatus = async (id, currentStatus, currentQty) => {
    const nextStatus = currentStatus === "available" ? "out" : "available";
    const nextQty = nextStatus === "available" ? (currentQty === 0 ? 10 : currentQty) : 0;
    try {
      const response = await api.put(`/foods/${id}`, {
        status: nextStatus,
        quantity: nextQty
      });
      if (response.data.success) {
        setFoods(prev => prev.map(food => (food._id === id ? response.data.foodItem : food)));
        showToast("success", `Dish set to ${nextStatus}`);
        const statsRes = await api.get("/foods/stats");
        if (statsRes.data.success) setStats(statsRes.data.stats);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      showToast("error", "Failed to update item status");
    }
  };

  // ── Delete Food (unchanged) ──
  const deleteFoodItem = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this food item?")) return;
    try {
      const response = await api.delete(`/foods/${id}`);
      if (response.data.success) {
        setFoods(prev => prev.filter(food => food._id !== id));
        showToast("success", "Food item deleted successfully");
        const statsRes = await api.get("/foods/stats");
        if (statsRes.data.success) setStats(statsRes.data.stats);
      }
    } catch (err) {
      console.error("Failed to delete food item:", err);
      showToast("error", "Could not delete food item");
    }
  };

  // ── Edit Mode (unchanged) ──
  const triggerEditMode = (food) => {
    setEditingFoodId(food._id);
    setFoodForm({
      name: food.name,
      category: food.category,
      mealType: food.mealType || "",
      price: food.price.toString(),
      pricePer: food.pricePer || "per box",
      description: food.description,
      quantity: food.quantity.toString(),
      totalQuantity: (food.totalQuantity || food.quantity).toString(),
      pickupTime: food.pickupTime || "12:00",
      orderOpenTill: food.orderOpenTill || "10:00",
      isVeg: food.isVeg,
      bringContainer: food.bringContainer ?? false,
      spicyLevel: food.spicyLevel,
      images: food.images || [],
      tags: food.tags || []
    });
    setFormErrors({});
    setActivePage("addfood");
  };

  // ── Food Form Submit (unchanged) ──
  const handleFoodSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!foodForm.name.trim()) errors.name = "Food name is required";
    if (!foodForm.category) errors.category = "Please select a category";
    if (!foodForm.price || isNaN(foodForm.price) || Number(foodForm.price) <= 0) errors.price = "Enter a valid price";
    if (!foodForm.description.trim() || foodForm.description.length < 20) errors.description = "Description must be at least 20 characters";
    if (!foodForm.pickupTime) errors.pickupTime = "Enter pickup time";
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
        pickupTime: foodForm.pickupTime,
        orderOpenTill: foodForm.orderOpenTill,
        quantity: Number(foodForm.quantity),
        totalQuantity: Number(foodForm.totalQuantity || foodForm.quantity)
      };

      if (editingFoodId) {
        const response = await api.put(`/foods/${editingFoodId}`, payload);
        if (response.data.success) {
          showToast("success", "Food item updated successfully!");
          setFoods(prev => prev.map(f => f._id === editingFoodId ? response.data.foodItem : f));
          resetFoodForm();
          setActivePage("myfoods");
        }
      } else {
        const response = await api.post("/foods", payload);
        if (response.data.success) {
          showToast("success", "New food item created!");
          setFoods(prev => [response.data.foodItem, ...prev]);
          resetFoodForm();
          setActivePage("myfoods");
        }
      }
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
      pricePer: "per box",
      description: "",
      quantity: "10",
      totalQuantity: "10",
      pickupTime: "12:00",
      orderOpenTill: "10:00",
      isVeg: true,
      bringContainer: false,
      spicyLevel: 1,
      images: [],
      tags: []
    });
    setFormErrors({});
  };

  // ── Image Upload (unchanged) ──
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoodForm(prev => {
          if (prev.images.length >= 5) return prev;
          return { ...prev, images: [...prev.images, reader.result] };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  // ── Profile Submit (unchanged) ──
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

  // ── Mock Chart Data (unchanged) ──
  const salesData = [
    { name: "Mon", sales: 4,  earnings: 4  * 120 },
    { name: "Tue", sales: 8,  earnings: 8  * 120 },
    { name: "Wed", sales: 5,  earnings: 5  * 120 },
    { name: "Thu", sales: 12, earnings: 12 * 120 },
    { name: "Fri", sales: 15, earnings: 15 * 120 },
    { name: "Sat", sales: 22, earnings: 22 * 120 },
    { name: "Sun", sales: 18, earnings: 18 * 120 },
  ];

  // ── Navigate to page helper ──
  const goTo = (pageId) => {
    if (pageId === "addfood" && !editingFoodId) resetFoodForm();
    setActivePage(pageId);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased">

      {/* ── Toast Notification ── */}
      {toast && (
        <div
          role="alert"
          aria-live="polite"
          className={`fixed top-4 right-4 md:top-6 md:right-6 z-[200] flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-2xl border max-w-xs md:max-w-sm animate-slide-in-right ${
            toast.type === "success"
              ? "bg-white border-emerald-100 text-slate-900"
              : "bg-white border-rose-100 text-slate-900"
          }`}
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
            toast.type === "success" ? "bg-emerald-100" : "bg-rose-100"
          }`}>
            {toast.type === "success"
              ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              : <AlertTriangle className="w-4 h-4 text-rose-500" />
            }
          </div>
          <p className="text-sm font-semibold flex-1">{toast.msg}</p>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer ml-1"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── App Shell ── */}
      <div className="flex h-screen overflow-hidden">

        {/* ════════════════════════════════════════════
            SIDEBAR — Desktop Only (hidden on mobile)
        ════════════════════════════════════════════ */}
        <aside
          className="hidden md:flex flex-col w-64 bg-[#0D1117] text-slate-300 flex-shrink-0 h-full overflow-y-auto hide-scrollbar"
          aria-label="Chef portal sidebar navigation"
        >
          {/* Logo */}
       
{/* Logo */}
{/* Logo */}
<div className="px-5 py-4 border-b border-white/5 flex-shrink-0">
  <div className="flex items-center gap-3">
    <img
      src="/logonavbar.png"
      alt="Shantabai"
      className="h-14 w-auto object-contain flex-shrink-0"
    />

    <div>
      <h1 className="text-sm font-black text-white leading-none tracking-tight">
        Shantabai <span className="text-[#10D876]"></span>
      </h1>

      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
        AAPKI SEVA, HAMARA VADA
      </p>
    </div>
  </div>
</div>
          {/* Profile Mini-Card */}
          <div className="px-4 py-3 mx-3 mt-4 mb-2 rounded-xl bg-white/[0.04] border border-white/5 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-white text-base flex-shrink-0">
              {(profile?.kitchenName || user?.name || "C").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate leading-none mb-0.5">
                {profile?.kitchenName || user?.name || "My Kitchen"}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {profile?.isVerified
                  ? <span className="text-emerald-400">✓ Verified Partner</span>
                  : "⏳ Pending Review"
                }
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 pb-4 overflow-y-auto hide-scrollbar" aria-label="Main navigation">
            <p className="text-[9px] font-extrabold text-slate-700 uppercase tracking-widest px-3 py-2 mt-2 mb-1">
              Navigation
            </p>
            {SIDEBAR_NAV.map(item => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => goTo(item.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer group mb-0.5 ${
                    isActive
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                  }`} />
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  {item.comingSoon && !isActive && (
                    <span className="text-[9px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">
                      Soon
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="px-3 pb-5 border-t border-white/5 pt-3 flex-shrink-0">
            <button
              onClick={() => { logout(); navigate("/login"); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer group"
              aria-label="Logout from chef portal"
            >
              <LogOut className="w-4 h-4 group-hover:text-rose-400 transition-colors" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* ════════════════════════════════════════════
            MAIN CONTENT COLUMN
        ════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* ── Top Navbar ── */}
          <header
            className="flex-shrink-0 h-14 md:h-16 bg-white border-b border-slate-100 flex items-center px-4 md:px-6 gap-3 md:gap-4"
            role="banner"
          >
            {/* Mobile: Logo */}
           {/* Mobile: Logo */}
<div className="flex items-center gap-2 md:hidden">
  <img
    src="/logonavbar.png"
    alt="Shantabai"
className="h-12 w-auto object-contain"
  />

  <div>
    <h1 className="text-xs font-black text-slate-900 leading-none">
      Shantabai <span className="text-emerald-500"></span>
    </h1>

    <p className="text-[7px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
      AAPKI SEVA, HAMARA VADA
    </p>
  </div>
</div>

            {/* Desktop: Page Title */}
            <div className="hidden md:block flex-1">
              <h2 className="text-base font-black text-slate-900">
                {getPageTitle(activePage, editingFoodId)}
              </h2>
              <p className="text-xs text-slate-400 leading-none mt-0.5">
                Manage your kitchen operations and listings
              </p>
            </div>

            {/* Spacer (mobile) */}
            <div className="flex-1 md:hidden" />

            {/* Verification Badge — desktop */}
            <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border flex-shrink-0 ${
              profile?.verificationStatus === "APPROVED"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : profile?.verificationStatus === "REJECTED"
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-amber-50 border-amber-200 text-amber-700"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                profile?.verificationStatus === "APPROVED" ? "bg-emerald-500" :
                profile?.verificationStatus === "REJECTED" ? "bg-red-500" : "bg-amber-500 animate-pulse"
              }`} />
              {profile?.verificationStatus || "PENDING"}
            </div>

            {/* Notification Bell */}
            <button
              className="relative w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors cursor-pointer flex-shrink-0"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white" aria-hidden="true" />
            </button>

            {/* User Avatar */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center font-black text-emerald-700 text-sm">
                {(user?.name || "C").charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-bold text-slate-800 leading-none">{user?.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">CHEF</p>
              </div>
            </div>
          </header>

          {/* ── Scrollable Content ── */}
          <main
            id="chef-main-content"
            className="flex-1 overflow-y-auto bg-slate-50 pb-24 md:pb-6"
            tabIndex={-1}
          >
            <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">

              {/* Profile Error Banner */}
              {profileError && (
                <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 animate-slide-in-down">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="font-bold text-sm">Onboarding Profile Required</p>
                    <p className="text-xs mt-0.5 text-amber-800">
                      Complete your kitchen profile in the Profile tab to start creating dishes.
                    </p>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════
                  PAGE: DASHBOARD
              ══════════════════════════════ */}
              {activePage === "bookings" && (
                <ChefBookings />
              )}

              {activePage === "dashboard" && (
                <div className="space-y-5 animate-fade-in">

                  {/* Welcome Banner */}
                  <div className="relative overflow-hidden rounded-2xl bg-[#0D1117] p-5 md:p-7 text-white shadow-xl">
                    <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
                    <div className="absolute bottom-0 left-20 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-emerald-400 text-[11px] font-bold uppercase tracking-widest mb-1">
                          Welcome Back, Chef 👨‍🍳
                        </p>
                        <h3 className="text-xl md:text-2xl font-black tracking-tight">
                          {user?.name || "Kitchen Owner"}
                        </h3>
                        <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" aria-hidden="true" />
                          {profile?.kitchenName || "My Kitchen"}
                          {profile?.city ? ` · ${profile.city}` : ""}
                        </p>
                      </div>
                      <button
                        id="create-dish-cta"
                        onClick={() => { resetFoodForm(); setActivePage("addfood"); }}
                        className="self-start sm:self-auto flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-500/30 cursor-pointer flex-shrink-0"
                      >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                        Create New Dish
                      </button>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <StatCard
                      icon={Utensils}
                      label="Total Foods"
                      value={stats.totalFoods}
                      badge="ALL"
                      accent="blue"
                      loading={statsLoading}
                    />
                    <StatCard
                      icon={CheckCircle2}
                      label="Active Foods"
                      value={stats.activeFoods}
                      badge="LIVE"
                      accent="green"
                      loading={statsLoading}
                    />
                    <StatCard
                      icon={ShoppingBag}
                      label="Orders Today"
                      value={stats.ordersToday}
                      badge="TODAY"
                      accent="amber"
                      loading={statsLoading}
                    />
                    <StatCard
                      icon={Wallet}
                      label="Total Earnings"
                      value={`₹${stats.totalEarnings.toLocaleString()}`}
                      accent="earnings"
                      loading={statsLoading}
                    />
                  </div>

                  {/* Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">

                    {/* Revenue Chart */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <h4 className="text-sm font-black text-slate-900">Weekly Revenue</h4>
                          <p className="text-xs text-slate-400 mt-0.5">Earnings over the past 7 days</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-full border border-emerald-100">
                          <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
                          +12%
                        </div>
                      </div>
                      <div className="h-44 md:h-52">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={salesData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                            <defs>
                              <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}    />
                              </linearGradient>
                            </defs>
                            <XAxis
                              dataKey="name"
                              stroke="#94a3b8"
                              fontSize={11}
                              tickLine={false}
                              axisLine={false}
                              tick={{ fill: "#94a3b8", fontWeight: 600 }}
                            />
                            <YAxis
                              stroke="#94a3b8"
                              fontSize={11}
                              tickLine={false}
                              axisLine={false}
                              tick={{ fill: "#94a3b8", fontWeight: 600 }}
                            />
                            <Tooltip
                              contentStyle={{
                                background: "#0D1117",
                                border: "none",
                                borderRadius: "12px",
                                color: "#fff",
                                fontSize: "12px",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
                              }}
                              itemStyle={{ color: "#10b981", fontWeight: 700 }}
                              labelStyle={{ color: "#94a3b8", fontWeight: 600 }}
                            />
                            <Area
                              type="monotone"
                              dataKey="earnings"
                              stroke="#10b981"
                              strokeWidth={2.5}
                              fillOpacity={1}
                              fill="url(#earningsGradient)"
                              name="Earnings (₹)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Trending Dishes */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-black text-slate-900">Trending Dishes</h4>
                        <button
                          onClick={() => setActivePage("myfoods")}
                          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                        >
                          View all
                        </button>
                      </div>

                      {foodsLoading ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="h-12 skeleton rounded-xl" />
                          ))}
                        </div>
                      ) : foods.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <span className="text-4xl mb-3">🍲</span>
                          <p className="text-sm font-bold text-slate-700">No dishes yet</p>
                          <p className="text-xs text-slate-400 mt-1">Add your first dish to start</p>
                          <button
                            onClick={() => { resetFoodForm(); setActivePage("addfood"); }}
                            className="mt-3 text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                          >
                            + Create Dish
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {foods.slice(0, 5).map((food, idx) => (
                            <div key={food._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                              <span className="text-xs font-black text-slate-300 w-4 text-center flex-shrink-0">
                                {idx + 1}
                              </span>
                              {food.images?.[0] ? (
                                <img
                                  src={food.images[0]}
                                  alt={food.name}
                                  className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-base flex-shrink-0">
                                  🍲
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate">{food.name}</p>
                                <p className="text-[10px] text-slate-400 truncate">{food.category}</p>
                              </div>
                              <p className="text-xs font-black text-slate-900 flex-shrink-0">₹{food.price}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upcoming Bookings - Empty State */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-black text-slate-900">Upcoming Bookings</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Customer orders and reservations</p>
                      </div>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">
                        Coming Soon
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-slate-100 rounded-xl">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-3">
                        <CalendarDays className="w-7 h-7 text-slate-200" aria-hidden="true" />
                      </div>
                      <p className="text-sm font-bold text-slate-600">No bookings yet</p>
                      <p className="text-xs text-slate-400 mt-1.5 max-w-xs leading-relaxed">
                        Customer booking management is launching soon. Your dishes are live and visible to customers!
                      </p>
                    </div>
                  </div>

                </div>
              )}

              {/* ══════════════════════════════
                  PAGE: MY FOODS
              ══════════════════════════════ */}
              {activePage === "myfoods" && (
                <div className="space-y-5 animate-fade-in">

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">My Food Listings</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {foods.length} {foods.length === 1 ? "item" : "items"} in your menu
                      </p>
                    </div>
                    <button
                      id="add-new-dish-btn"
                      onClick={() => { resetFoodForm(); setActivePage("addfood"); }}
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" aria-hidden="true" />
                      <span className="hidden sm:inline">Add New Dish</span>
                      <span className="sm:hidden">Add</span>
                    </button>
                  </div>

                  {foodsLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                    </div>
                  ) : foods.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
                      <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <Utensils className="w-10 h-10 text-slate-200" aria-hidden="true" />
                      </div>
                      <h4 className="text-base font-bold text-slate-800">No dishes yet</h4>
                      <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                        Start building your menu by adding your first dish. Customers will be able to find and order from you.
                      </p>
                      <button
                        onClick={() => { resetFoodForm(); setActivePage("addfood"); }}
                        className="mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl cursor-pointer transition-colors"
                      >
                        Create Your First Dish
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {foods.map(food => {
                        const spicyIdx = Math.min(Number(food.spicyLevel || 0), 3);
                        const isAvailable = food.status === "available" && food.quantity > 0;
                        return (
                          <article
                            key={food._id}
                            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
                          >
                            {/* Food Image */}
                            <div className="relative h-44 bg-slate-100 overflow-hidden flex-shrink-0">
                              {food.images?.[0] ? (
                                <img
                                  src={food.images[0]}
                                  alt={food.name}
                                  loading="lazy"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-slate-50 to-slate-100">
                                  🍲
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" aria-hidden="true" />

                              {/* Veg / Non-Veg */}
                              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1.5 shadow-sm border border-white/50">
                                <span className={`w-2 h-2 flex-shrink-0 ${food.isVeg ? "rounded-full bg-green-500" : "rounded-sm bg-red-500"}`} aria-hidden="true" />
                                <span className="text-[9px] font-extrabold text-slate-700">
                                  {food.isVeg ? "VEG" : "NON-VEG"}
                                </span>
                              </div>

                              {/* Approval Badge */}
                              <div className={`absolute top-3 right-3 rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-wide shadow-sm ${
                                food.approvalStatus === "APPROVED"
                                  ? "bg-emerald-500 text-white"
                                  : food.approvalStatus === "REJECTED"
                                  ? "bg-rose-500 text-white"
                                  : "bg-amber-400 text-slate-900"
                              }`}>
                                {food.approvalStatus || "PENDING"}
                              </div>

                              {/* Price */}
                              <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm text-slate-900 font-black text-sm px-3 py-1.5 rounded-xl shadow-sm">
                                ₹{food.price}
                              </div>
                            </div>

                            {/* Card Details */}
                            <div className="p-4 flex-1 flex flex-col">
                              <div className="flex-1">
                                <h4 className="font-bold text-sm text-slate-900 truncate">{food.name}</h4>
                                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                  {food.description}
                                </p>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium mt-2.5 flex-wrap">
                                  <span className="truncate max-w-[80px]">{food.category}</span>
                                  <span aria-hidden="true">·</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" aria-hidden="true" />
                                    {food.pickupTime || "—"}
                                  </span>
                                  <span aria-hidden="true">·</span>
                                  <span className="flex items-center gap-1">
                                    <Package className="w-3 h-3" aria-hidden="true" />
                                    {food.quantity}
                                  </span>
                                </div>

                                {/* Spicy badge */}
                                <div className="mt-2.5 flex flex-wrap gap-1.5">
                                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${SPICY_OPTS[spicyIdx].bg} ${SPICY_OPTS[spicyIdx].border} ${SPICY_OPTS[spicyIdx].color}`}>
                                    {SPICY_OPTS[spicyIdx].emoji} {SPICY_OPTS[spicyIdx].label}
                                  </span>
                                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                                    food.bringContainer
                                      ? 'bg-amber-50 border-amber-200 text-amber-700'
                                      : 'bg-green-50 border-green-200 text-green-700'
                                  }`}>
                                    {food.bringContainer ? '🥡 Bring Container' : '🍱 Container Incl.'}
                                  </span>
                                </div>
                              </div>

                              {/* Action Bar */}
                              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-50">
                                <button
                                  onClick={() => toggleFoodStatus(food._id, food.status, food.quantity)}
                                  className={`flex-1 py-2.5 text-[10px] uppercase tracking-wider font-bold rounded-xl border transition-all cursor-pointer touch-target ${
                                    isAvailable
                                      ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                      : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                                  }`}
                                  aria-label={isAvailable ? "Set to offline" : "Set to live"}
                                >
                                  {isAvailable ? "● Live" : "○ Offline"}
                                </button>

                                <button
                                  onClick={() => triggerEditMode(food)}
                                  className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer touch-target"
                                  aria-label={`Edit ${food.name}`}
                                >
                                  <Edit className="w-3.5 h-3.5" aria-hidden="true" />
                                </button>

                                <button
                                  onClick={() => deleteFoodItem(food._id)}
                                  className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all cursor-pointer touch-target"
                                  aria-label={`Delete ${food.name}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                                </button>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ══════════════════════════════
                  PAGE: ADD / EDIT FOOD
              ══════════════════════════════ */}
              {activePage === "addfood" && (
                <div className="space-y-5 animate-fade-in">

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">
                        {editingFoodId ? "Edit Food Item" : "Create New Food Item"}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Fill out your recipe listing details
                      </p>
                    </div>
                    {editingFoodId && (
                      <button
                        onClick={() => { resetFoodForm(); setActivePage("myfoods"); }}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                        aria-label="Cancel editing"
                      >
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleFoodSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 items-start">

                    {/* ── Left: Form Fields ── */}
                    <div className="lg:col-span-2 space-y-4">

                      {/* Section 1: Basic Details */}
                      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                        <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2 pb-1 border-b border-slate-50">
                          <span className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-[10px] font-black flex-shrink-0" aria-hidden="true">1</span>
                          Basic Recipe Details
                        </h4>

                        {/* Dish Name */}
                        <div>
                          <label htmlFor="food-name" className="text-xs font-bold text-slate-700 block mb-1.5">
                            Dish Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            id="food-name"
                            type="text"
                            value={foodForm.name}
                            onChange={e => setFoodForm(p => ({ ...p, name: e.target.value }))}
                            aria-describedby={formErrors.name ? "name-error" : undefined}
                            aria-invalid={!!formErrors.name}
                            className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                              formErrors.name
                                ? "border-rose-400 bg-rose-50"
                                : "border-slate-200 focus:border-emerald-500 focus:bg-white"
                            }`}
                            placeholder="e.g. Grandma's Spiced Chicken Biryani"
                          />
                          {formErrors.name && (
                            <p id="name-error" role="alert" className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                              {formErrors.name}
                            </p>
                          )}
                        </div>

                        {/* Cuisine + Meal Type */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="food-cuisine" className="text-xs font-bold text-slate-700 block mb-1.5">
                              Cuisine <span className="text-rose-500">*</span>
                            </label>
                            <select
                              id="food-cuisine"
                              value={foodForm.category}
                              onChange={e => setFoodForm(p => ({ ...p, category: e.target.value }))}
                              aria-invalid={!!formErrors.category}
                              className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                                formErrors.category ? "border-rose-400" : "border-slate-200 focus:border-emerald-500 focus:bg-white"
                              }`}
                            >
                              <option value="">Select Cuisine</option>
                              {CUISINE_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {formErrors.category && (
                              <p role="alert" className="text-[11px] text-rose-500 mt-1">{formErrors.category}</p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="food-meal-type" className="text-xs font-bold text-slate-700 block mb-1.5">
                              Meal Type
                            </label>
                            <select
                              id="food-meal-type"
                              value={foodForm.mealType}
                              onChange={e => setFoodForm(p => ({ ...p, mealType: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all"
                            >
                              <option value="">Select Meal Type</option>
                              {MEAL_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label htmlFor="food-description" className="text-xs font-bold text-slate-700 block mb-1.5">
                            Description <span className="text-rose-500">*</span>{" "}
                            <span className="font-normal text-slate-400">(minimum 20 chars)</span>
                          </label>
                          <textarea
                            id="food-description"
                            value={foodForm.description}
                            onChange={e => setFoodForm(p => ({ ...p, description: e.target.value }))}
                            aria-describedby="desc-count"
                            aria-invalid={!!formErrors.description}
                            className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm outline-none transition-all h-28 resize-none ${
                              formErrors.description
                                ? "border-rose-400 bg-rose-50"
                                : "border-slate-200 focus:border-emerald-500 focus:bg-white"
                            }`}
                            placeholder="Detail the ingredients, taste profile, spice levels, allergen details, etc..."
                          />
                          <div className="flex items-center justify-between mt-1">
                            {formErrors.description ? (
                              <p role="alert" className="text-[11px] text-rose-500 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                                {formErrors.description}
                              </p>
                            ) : <span />}
                            <span
                              id="desc-count"
                              className={`text-[10px] font-bold ${foodForm.description.length >= 20 ? "text-emerald-500" : "text-slate-400"}`}
                            >
                              {foodForm.description.length} / 20+
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Pricing & Logistics */}
                      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                        <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2 pb-1 border-b border-slate-50">
                          <span className="w-5 h-5 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 text-[10px] font-black flex-shrink-0" aria-hidden="true">2</span>
                          Pricing & Logistics
                        </h4>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="food-price" className="text-xs font-bold text-slate-700 block mb-1.5">
                              Box Price (₹) <span className="text-rose-500">*</span>
                            </label>
                            <input
                              id="food-price"
                              type="number"
                              value={foodForm.price}
                              onChange={e => setFoodForm(p => ({ ...p, price: e.target.value }))}
                              aria-invalid={!!formErrors.price}
                              className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                                formErrors.price ? "border-rose-400" : "border-slate-200 focus:border-emerald-500 focus:bg-white"
                              }`}
                              placeholder="120"
                              min="0"
                            />
                            {formErrors.price && <p role="alert" className="text-[11px] text-rose-500 mt-1">{formErrors.price}</p>}
                          </div>

                          <div>
                            <label htmlFor="food-pickup-time" className="text-xs font-bold text-slate-700 block mb-1.5">
                              Pickup Time <span className="text-rose-500">*</span>
                            </label>
                            <input
                              id="food-pickup-time"
                              type="time"
                              value={foodForm.pickupTime}
                              onChange={e => setFoodForm(p => ({ ...p, pickupTime: e.target.value }))}
                              aria-invalid={!!formErrors.pickupTime}
                              className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                                formErrors.pickupTime ? "border-rose-400" : "border-slate-200 focus:border-emerald-500 focus:bg-white"
                              }`}
                            />
                            {formErrors.pickupTime && <p role="alert" className="text-[11px] text-rose-500 mt-1">{formErrors.pickupTime}</p>}
                          </div>

                          <div>
                            <label htmlFor="food-order-open-till" className="text-xs font-bold text-slate-700 block mb-1.5">
                              Order Open Till
                            </label>
                            <input
                              id="food-order-open-till"
                              type="time"
                              value={foodForm.orderOpenTill}
                              onChange={e => setFoodForm(p => ({ ...p, orderOpenTill: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all"
                            />
                          </div>

                          <div>
                            <label htmlFor="food-quantity" className="text-xs font-bold text-slate-700 block mb-1.5">
                              Quantity Available <span className="text-rose-500">*</span>
                            </label>
                            <input
                              id="food-quantity"
                              type="number"
                              value={foodForm.quantity}
                              onChange={e => setFoodForm(p => ({ ...p, quantity: e.target.value }))}
                              aria-invalid={!!formErrors.quantity}
                              className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                                formErrors.quantity ? "border-rose-400" : "border-slate-200 focus:border-emerald-500 focus:bg-white"
                              }`}
                              placeholder="10"
                              min="0"
                            />
                            {formErrors.quantity && <p role="alert" className="text-[11px] text-rose-500 mt-1">{formErrors.quantity}</p>}
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Characteristics */}
                      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                        <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2 pb-1 border-b border-slate-50">
                          <span className="w-5 h-5 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 text-[10px] font-black flex-shrink-0" aria-hidden="true">3</span>
                          Dish Characteristics
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          {/* Dietary Toggle */}
                          <div>
                            <p className="text-xs font-bold text-slate-700 mb-2">
                              Dietary Type <span className="text-rose-500">*</span>
                            </p>
                            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Dietary type selection">
                              <button
                                type="button"
                                onClick={() => setFoodForm(p => ({ ...p, isVeg: true }))}
                                aria-pressed={foodForm.isVeg}
                                className={`py-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all touch-target ${
                                  foodForm.isVeg
                                    ? "bg-green-50 border-green-400 text-green-700 shadow-sm"
                                    : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                                }`}
                              >
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500 border border-green-800 flex-shrink-0" aria-hidden="true" />
                                Veg
                              </button>
                              <button
                                type="button"
                                onClick={() => setFoodForm(p => ({ ...p, isVeg: false }))}
                                aria-pressed={!foodForm.isVeg}
                                className={`py-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all touch-target ${
                                  !foodForm.isVeg
                                    ? "bg-red-50 border-red-400 text-red-700 shadow-sm"
                                    : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                                }`}
                              >
                                <span className="w-2.5 h-2.5 rounded-sm bg-red-500 border border-red-800 flex-shrink-0" aria-hidden="true" />
                                Non-Veg
                              </button>
                            </div>
                          </div>

                          {/* Spice Level */}
                          <div>
                            <p className="text-xs font-bold text-slate-700 mb-2">Spiciness Level</p>
                            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Spiciness level selection">
                              {SPICY_OPTS.map((opt, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setFoodForm(p => ({ ...p, spicyLevel: i }))}
                                  aria-pressed={foodForm.spicyLevel === i}
                                  className={`py-2.5 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                                    foodForm.spicyLevel === i
                                      ? `${opt.bg} ${opt.border} ${opt.color} shadow-sm`
                                      : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                                  }`}
                                >
                                  <span aria-hidden="true">{opt.emoji}</span>
                                  <span>{opt.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Bring Container Toggle */}
                          <div className="sm:col-span-2">
                            <p className="text-xs font-bold text-slate-700 mb-1">Bring Container?</p>
                            <p className="text-[11px] text-slate-400 mb-2">Enable if customers must bring their own container for this dish.</p>
                            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Bring container selection">
                              <button
                                type="button"
                                onClick={() => setFoodForm(p => ({ ...p, bringContainer: false }))}
                                aria-pressed={!foodForm.bringContainer}
                                className={`py-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all touch-target ${
                                  !foodForm.bringContainer
                                    ? 'bg-green-50 border-green-400 text-green-700 shadow-sm'
                                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                                }`}
                              >
                                🍱 Container Included
                              </button>
                              <button
                                type="button"
                                onClick={() => setFoodForm(p => ({ ...p, bringContainer: true }))}
                                aria-pressed={foodForm.bringContainer}
                                className={`py-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all touch-target ${
                                  foodForm.bringContainer
                                    ? 'bg-amber-50 border-amber-400 text-amber-700 shadow-sm'
                                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                                }`}
                              >
                                🥡 Bring Container
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Form Actions */}
                      <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-1">
                        <button
                          type="button"
                          onClick={resetFoodForm}
                          className="px-6 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors touch-target"
                        >
                          Reset Form
                        </button>
                        <button
                          type="submit"
                          disabled={formSubmitting}
                          className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 touch-target"
                        >
                          {formSubmitting && (
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" aria-hidden="true" />
                          )}
                          {editingFoodId ? "Save Changes" : "Publish Dish"}
                        </button>
                      </div>
                    </div>

                    {/* ── Right: Images + Live Preview ── */}
                    <div className="space-y-4">

                      {/* Image Upload */}
                      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                        <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                          Food Images
                        </h4>

                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => fileInputRef.current?.click()}
                          onKeyDown={e => e.key === "Enter" && fileInputRef.current?.click()}
                          aria-label="Upload food photo"
                          className="border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-emerald-50/30 group"
                        >
                          <div className="w-10 h-10 bg-slate-100 group-hover:bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-2 transition-colors">
                            <Upload className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" aria-hidden="true" />
                          </div>
                          <p className="text-xs font-bold text-slate-700">Upload Food Photo</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Supports JPG, PNG (Max 5)</p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            hidden
                            onChange={handleImageUpload}
                            aria-label="File upload input"
                          />
                        </div>

                        {/* URL Input */}
                        <div>
                          <label htmlFor="image-url-input" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                            Or Add Image URL
                          </label>
                          <div className="flex gap-2">
                            <input
                              id="image-url-input"
                              type="url"
                              value={imageInput}
                              onChange={e => setImageInput(e.target.value)}
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white transition-colors"
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
                              className="bg-slate-900 hover:bg-slate-700 text-white text-xs font-bold px-3 py-2.5 rounded-xl cursor-pointer transition-colors flex-shrink-0"
                            >
                              Add
                            </button>
                          </div>
                        </div>

                        {/* Image Thumbnails */}
                        {foodForm.images.length > 0 && (
                          <div className="grid grid-cols-5 gap-2">
                            {foodForm.images.map((img, i) => (
                              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                                <img
                                  src={img}
                                  alt={`Food image ${i + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => setFoodForm(p => ({
                                    ...p,
                                    images: p.images.filter((_, idx) => idx !== i)
                                  }))}
                                  aria-label={`Remove image ${i + 1}`}
                                  className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
                                >
                                  <X className="w-4 h-4" aria-hidden="true" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Live Card Preview */}
                      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm lg:sticky lg:top-6">
                        <p className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-widest">
                          Live Card Preview
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 mb-4">
                          How consumers see your item in listings
                        </p>

                        <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                          <div className="relative h-36 bg-gradient-to-br from-slate-100 to-slate-50">
                            {foodForm.images[0] ? (
                              <img
                                src={foodForm.images[0]}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-5xl">
                                🍲
                              </div>
                            )}
                            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-0.5 flex items-center gap-1 border border-white/50 shadow-sm">
                              <span className={`w-1.5 h-1.5 rounded-full ${foodForm.isVeg ? "bg-green-500" : "bg-red-500"} flex-shrink-0`} aria-hidden="true" />
                              <span className="text-[8px] font-extrabold text-slate-700">
                                {foodForm.isVeg ? "VEG" : "NON-VEG"}
                              </span>
                            </div>
                            <div className="absolute bottom-2 right-2 bg-white/95 text-slate-900 font-black text-xs px-2.5 py-1 rounded-lg shadow-sm">
                              ₹{foodForm.price || 0}
                            </div>
                          </div>
                          <div className="p-3 bg-white space-y-1">
                            <h4 className="font-bold text-xs text-slate-900 truncate">
                              {foodForm.name || "Untitled Dish"}
                            </h4>
                            <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                              {foodForm.description || "Add a description above…"}
                            </p>
                            <div className="flex items-center gap-2 pt-1 text-[9px] text-slate-400">
                              <span>{foodForm.category || "No category"}</span>
                              <span aria-hidden="true">·</span>
                              <span>{foodForm.pickupTime || "12:00"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </form>

                </div>
              )}

              {/* ══════════════════════════════
                  PAGE: PROFILE
              ══════════════════════════════ */}
              {activePage === "profile" && (
                <div className="space-y-5 max-w-5xl animate-fade-in">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Kitchen Profile</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Manage your home-chef business details
                    </p>
                  </div>

                  {profileLoading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                      <div className="lg:col-span-2 space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-52 skeleton rounded-2xl" />)}
                      </div>
                      <div className="h-80 skeleton rounded-2xl" />
                    </div>
                  ) : (
                    <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                      {/* ── Left: Edit Fields ── */}
                      <div className="lg:col-span-2 space-y-4">

                        {profileSuccessMsg && (
                          <div role="status" className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-slide-in-down">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" aria-hidden="true" />
                            {profileSuccessMsg}
                          </div>
                        )}

                        {/* Brand & Kitchen */}
                        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                          <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2 pb-1 border-b border-slate-50">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
                            Brand & Kitchen Details
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="kitchen-name" className="text-xs font-bold text-slate-700 block mb-1.5">
                                Kitchen Name <span className="text-rose-500">*</span>
                              </label>
                              <input
                                id="kitchen-name"
                                type="text"
                                value={profileForm.kitchenName}
                                onChange={e => setProfileForm(p => ({ ...p, kitchenName: e.target.value }))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all"
                                required
                              />
                            </div>
                            <div>
                              <label htmlFor="experience" className="text-xs font-bold text-slate-700 block mb-1.5">
                                Experience (Years) <span className="text-rose-500">*</span>
                              </label>
                              <input
                                id="experience"
                                type="number"
                                value={profileForm.experience}
                                onChange={e => setProfileForm(p => ({ ...p, experience: e.target.value }))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all"
                                required
                                min="0"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="tagline" className="text-xs font-bold text-slate-700 block mb-1.5">Tagline</label>
                            <input
                              id="tagline"
                              type="text"
                              value={profileForm.tagline}
                              onChange={e => setProfileForm(p => ({ ...p, tagline: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all"
                              placeholder="e.g. Traditional Maharashtrian meals with authentic spices"
                            />
                          </div>

                          <div>
                            <label htmlFor="chef-bio" className="text-xs font-bold text-slate-700 block mb-1.5">
                              Chef Bio <span className="text-rose-500">*</span>{" "}
                              <span className="font-normal text-slate-400">(minimum 20 chars)</span>
                            </label>
                            <textarea
                              id="chef-bio"
                              value={profileForm.bio}
                              onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all h-24 resize-none"
                              required
                            />
                          </div>
                        </div>

                        {/* Customization Options */}
                        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                          <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2 pb-1 border-b border-slate-50">
                            <Layers className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                            Customization Options
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label htmlFor="oil-level" className="text-xs font-bold text-slate-700 block mb-1.5">Oil Customization</label>
                              <select id="oil-level" value={profileForm.oilLevel} onChange={e => setProfileForm(p => ({ ...p, oilLevel: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white">
                                <option value="Low Oil">Low Oil</option>
                                <option value="Normal">Normal</option>
                                <option value="Extra">Extra</option>
                              </select>
                            </div>
                            <div>
                              <label htmlFor="spice-level" className="text-xs font-bold text-slate-700 block mb-1.5">Spice Customization</label>
                              <select id="spice-level" value={profileForm.spiceLevel} onChange={e => setProfileForm(p => ({ ...p, spiceLevel: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white">
                                <option value="Mild">Mild</option>
                                <option value="Medium">Medium</option>
                                <option value="Spicy">Spicy</option>
                              </select>
                            </div>
                            <div>
                              <label htmlFor="delivery-option" className="text-xs font-bold text-slate-700 block mb-1.5">Delivery Options</label>
                              <select id="delivery-option" value={profileForm.deliveryOption} onChange={e => setProfileForm(p => ({ ...p, deliveryOption: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white">
                                <option value="Pick Up">Pick Up</option>
                                <option value="Delivery">Delivery</option>
                                <option value="Both">Both</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Location & Address */}
                        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                          <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2 pb-1 border-b border-slate-50">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                            Location & Address Details
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label htmlFor="city" className="text-xs font-bold text-slate-700 block mb-1.5">City <span className="text-rose-500">*</span></label>
                              <input id="city" type="text" value={profileForm.city} onChange={e => setProfileForm(p => ({ ...p, city: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all" required />
                            </div>
                            <div>
                              <label htmlFor="area" className="text-xs font-bold text-slate-700 block mb-1.5">Locality / Area <span className="text-rose-500">*</span></label>
                              <input id="area" type="text" value={profileForm.area} onChange={e => setProfileForm(p => ({ ...p, area: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all" required />
                            </div>
                            <div>
                              <label htmlFor="pincode" className="text-xs font-bold text-slate-700 block mb-1.5">Pincode <span className="text-rose-500">*</span></label>
                              <input id="pincode" type="text" value={profileForm.pincode} onChange={e => setProfileForm(p => ({ ...p, pincode: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all" required />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="full-address" className="text-xs font-bold text-slate-700 block mb-1.5">Full Address <span className="text-rose-500">*</span></label>
                            <input id="full-address" type="text" value={profileForm.fullAddress} onChange={e => setProfileForm(p => ({ ...p, fullAddress: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all" required />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="longitude" className="text-xs font-bold text-slate-700 block mb-1.5">Longitude <span className="text-rose-500">*</span></label>
                              <input id="longitude" type="number" step="any" value={profileForm.longitude ?? ""} onChange={e => setProfileForm(p => ({ ...p, longitude: Number(e.target.value) }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all" required />
                            </div>
                            <div>
                              <label htmlFor="latitude" className="text-xs font-bold text-slate-700 block mb-1.5">Latitude <span className="text-rose-500">*</span></label>
                              <input id="latitude" type="number" step="any" value={profileForm.latitude ?? ""} onChange={e => setProfileForm(p => ({ ...p, latitude: Number(e.target.value) }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all" required />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={profileSaving}
                            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-emerald-500/20 transition-all active:scale-95 touch-target"
                          >
                            {profileSaving && (
                              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" aria-hidden="true" />
                            )}
                            Save Kitchen Details
                          </button>
                        </div>
                      </div>

                      {/* ── Right: Profile Summary Card ── */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                          {/* Cover */}
                          <div className="h-20 bg-gradient-to-r from-[#0D1117] to-slate-800" aria-hidden="true" />
                          <div className="px-5 pb-5">
                            {/* Avatar */}
                            <div className="-mt-10 mb-3">
                              <div className="w-20 h-20 rounded-2xl bg-emerald-500 border-4 border-white shadow-lg flex items-center justify-center text-2xl font-black text-white">
                                {(profile?.kitchenName || user?.name || "C").charAt(0).toUpperCase()}
                              </div>
                            </div>

                            <h4 className="font-black text-base text-slate-900 leading-tight">
                              {profile?.kitchenName || "My Kitchen"}
                            </h4>
                            <p className="text-xs text-slate-400 mt-0.5">by {user?.name}</p>

                            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" aria-hidden="true" />
                              <span className="truncate">
                                {profile?.area ? `${profile.area}, ` : ""}
                                {profile?.city || "No location set"}
                              </span>
                            </div>

                            {profile?.tagline && (
                              <p className="text-xs text-slate-400 italic mt-3 pt-3 border-t border-slate-50 leading-relaxed">
                                "{profile.tagline}"
                              </p>
                            )}

                            <div className="mt-4 space-y-3 pt-3 border-t border-slate-50">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500 flex items-center gap-1.5">
                                  <Briefcase className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                                  Experience
                                </span>
                                <span className="font-bold text-slate-900">{profile?.experience || 0} yrs</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500 flex items-center gap-1.5">
                                  <Star className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                                  Rating
                                </span>
                                <span className="font-bold text-slate-900">⭐ {profile?.rating || 5.0}</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500 flex items-center gap-1.5">
                                  <ToggleLeft className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                                  Status
                                </span>
                                <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                                  profile?.isAvailable ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                                }`}>
                                  {profile?.isAvailable ? "Online" : "Offline"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500 flex items-center gap-1.5">
                                  <Award className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                                  Verification
                                </span>
                                <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                                  profile?.verificationStatus === "APPROVED"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-amber-50 text-amber-700"
                                }`}>
                                  {profile?.verificationStatus || "PENDING"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </form>
                  )}
                </div>
              )}

              {/* ══════════════════════════════
                  PAGE: COMING SOON
              ══════════════════════════════ */}
              {COMING_SOON_PAGES.includes(activePage) && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-scale-in px-4">
                  <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center mb-5">
                    {activePage === "bookings"     && <CalendarDays className="w-9 h-9 text-slate-200" aria-hidden="true" />}
                    {activePage === "earnings"     && <TrendingUp   className="w-9 h-9 text-slate-200" aria-hidden="true" />}
                    {activePage === "reviews"      && <Star         className="w-9 h-9 text-slate-200" aria-hidden="true" />}
                    {activePage === "availability" && <ToggleLeft   className="w-9 h-9 text-slate-200" aria-hidden="true" />}
                    {activePage === "support"      && <LifeBuoy     className="w-9 h-9 text-slate-200" aria-hidden="true" />}
                  </div>
                  <h3 className="text-xl font-black text-slate-800 capitalize">{activePage}</h3>
                  <p className="text-sm text-slate-400 mt-2 max-w-sm leading-relaxed">
                    This feature is under active development and will be available very soon.
                    We're building something amazing for you! 🚀
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 px-4 py-2.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" aria-hidden="true" />
                    Coming Soon
                  </span>
                  <button
                    onClick={() => setActivePage("dashboard")}
                    className="mt-5 text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer underline underline-offset-2"
                  >
                    ← Back to Dashboard
                  </button>
                </div>
              )}

            </div>
          </main>
        </div>

      </div>

      {/* ════════════════════════════════════════════
          BOTTOM NAVIGATION — Mobile Only
      ════════════════════════════════════════════ */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 pb-safe"
        aria-label="Mobile bottom navigation"
      >
        <div className="flex items-end justify-around h-16 px-2">
          {BOTTOM_NAV.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            if (item.isCenter) {
              return (
                <button
                  key={item.id}
                  id={`bottom-nav-${item.id}`}
                  onClick={() => { resetFoodForm(); setActivePage(item.id); }}
                  aria-label="Add new food item"
                  className="flex flex-col items-center justify-center -mt-6 cursor-pointer touch-target"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500 shadow-xl shadow-emerald-500/35 flex items-center justify-center border-4 border-white">
                    <Icon className="w-6 h-6 text-white" aria-hidden="true" />
                  </div>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                id={`bottom-nav-${item.id}`}
                onClick={() => goTo(item.id)}
                aria-current={isActive ? "page" : undefined}
                aria-label={item.label}
                className="flex flex-col items-center justify-center gap-1 min-w-[52px] h-full cursor-pointer touch-target pb-1"
              >
                <Icon
                  className={`w-5 h-5 transition-all ${
                    isActive ? "text-emerald-500 scale-110" : "text-slate-400"
                  }`}
                  aria-hidden="true"
                />
                <span className={`text-[9px] font-bold leading-none transition-colors ${
                  isActive ? "text-emerald-500" : "text-slate-400"
                }`}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="bottom-nav-active-dot" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

    </div>
  );
}