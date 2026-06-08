import React, { useState, useEffect } from "react";
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
  Ban
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

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
  const [foodFilter, setFoodFilter] = useState("ALL"); // 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  
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
    if (activeTab === "providers") fetchProviders();
    if (activeTab === "foods") fetchFoods();
    if (activeTab === "users") fetchUsers();
    if (activeTab === "dashboard") fetchStats();
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
        showToast("success", `Provider is now ${status}`);
        fetchStats();
      }
    } catch (err) {
      console.error(`Error setting provider status to ${status}:`, err);
      showToast("error", `Failed to set provider status to ${status}`);
    }
  };

  // Handle Food Approval (Approve / Reject)
  const handleApproveFood = async (id, status) => {
    try {
      const endpoint = status === "APPROVED" 
        ? `/admin/foods/${id}/approve` 
        : `/admin/foods/${id}/reject`;

      const res = await api.put(endpoint);
      if (res.data.success) {
        setFoods(prev =>
          prev.map(f => (f._id === id ? { ...f, approvalStatus: status, isApproved: status === "APPROVED" } : f))
        );
        showToast("success", `Food listing is now ${status}`);
        fetchStats();
      }
    } catch (err) {
      console.error(`Error setting food item status to ${status}:`, err);
      showToast("error", `Failed to set food item status to ${status}`);
    }
  };

  // Chart data formatting
  const chartData = [
    { name: "Users", count: stats.totalUsers },
    { name: "Chefs", count: stats.totalProviders },
    { name: "Dishes", count: stats.totalFoods }
  ];

  const pieData = [
    { name: "Pending Foods", value: stats.pendingFoods, color: "#f59e0b" },
    { name: "Approved Foods", value: Math.max(0, stats.totalFoods - stats.pendingFoods), color: "#10b981" }
  ];

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

      {/* ── SIDEBAR ── */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-full flex-shrink-0">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
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
        <header className="h-16 border-b border-slate-200/80 bg-white px-8 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-900 capitalize">{activeTab}</h2>
            <p className="text-xs text-slate-400 font-medium">Verify partners, dishes, and oversee system users</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 rounded-full py-1.5 px-3 border border-slate-200 text-slate-600 text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Admin Mode Active</span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                {(user?.name || "A").charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-slate-700">{user?.name || "Administrator"}</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-8">

          {/* ════ 1. DASHBOARD PAGE ════ */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Stats Cards */}
              {statsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 h-28 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  
                  {/* Total Cooks */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Cooks</span>
                      <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalProviders}</h3>
                      <p className="text-[10px] text-slate-500 font-semibold mt-1">Home Cook Profiles</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Pending Cooks */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Cooks</span>
                      <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.pendingProviders}</h3>
                      <p className="text-[10px] text-amber-600 font-bold mt-1">Action Required</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                      <Clock className="w-5 h-5 animate-pulse" />
                    </div>
                  </div>

                  {/* Total Foods */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Foods</span>
                      <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalFoods}</h3>
                      <p className="text-[10px] text-slate-500 font-semibold mt-1">Dishes Submitted</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                      <Utensils className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Pending Foods */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Foods</span>
                      <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.pendingFoods}</h3>
                      <p className="text-[10px] text-amber-600 font-bold mt-1">Requires Review</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                      <Clock className="w-5 h-5 animate-pulse" />
                    </div>
                  </div>

                  {/* Total Users */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
                      <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalUsers}</h3>
                      <p className="text-[10px] text-slate-500 font-semibold mt-1">Registered Accounts</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                      <Shield className="w-5 h-5" />
                    </div>
                  </div>

                </div>
              )}

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Metrics Bar Chart */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm lg:col-span-2">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-6">System Totals</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#4f46e5" radius={[10, 10, 0, 0]} maxBarSize={50} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-6">Food Compliance</h4>
                  <div className="h-44 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-black text-slate-800">{stats.totalFoods}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
                    </div>
                  </div>
                  <div className="space-y-2 pt-4 border-t border-slate-100">
                    {pieData.map(d => (
                      <div key={d.name} className="flex items-center justify-between text-xs font-bold text-slate-600">
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                          <span>{d.name}</span>
                        </span>
                        <span className="text-slate-900">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

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
                        <th className="py-4 px-6">Chef Details</th>
                        <th className="py-4 px-6">Location</th>
                        <th className="py-4 px-6">Exp.</th>
                        <th className="py-4 px-6">Specialities</th>
                        <th className="py-4 px-6 text-center">Status</th>
                        <th className="py-4 px-6 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {providers.map(p => (
                        <tr key={p._id} className="text-xs hover:bg-slate-50/50">
                          {/* Chef Info */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              {p.avatar ? (
                                <img src={p.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold">👩‍🍳</div>
                              )}
                              <div>
                                <h4 className="font-extrabold text-slate-900">{p.kitchenName}</h4>
                                <p className="text-[10px] text-slate-400 mt-0.5">{p.user?.name || "Unknown"} · {p.user?.email}</p>
                              </div>
                            </div>
                          </td>
                          {/* Location */}
                          <td className="py-4 px-6 text-slate-500 font-semibold">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[120px]">{p.area}, {p.city}</span>
                            </div>
                          </td>
                          {/* Experience */}
                          <td className="py-4 px-6 text-slate-900 font-bold">{p.experience || 0} yrs</td>
                          {/* Specialities */}
                          <td className="py-4 px-6">
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
                          {/* Status */}
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase ${
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
                          {/* Actions */}
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-center gap-2">
                              {p.verificationStatus !== "APPROVED" && (
                                <button
                                  onClick={() => handleApproveProvider(p._id, "APPROVED")}
                                  className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                                  title="Approve Partner"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              {p.verificationStatus !== "REJECTED" && p.verificationStatus !== "SUSPENDED" && (
                                <button
                                  onClick={() => handleApproveProvider(p._id, "REJECTED")}
                                  className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                                  title="Reject Partner"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                              {p.verificationStatus === "APPROVED" && (
                                <button
                                  onClick={() => handleApproveProvider(p._id, "SUSPENDED")}
                                  className="w-7 h-7 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                                  title="Suspend Partner"
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                              )}
                              {p.aadharUrl && (
                                <a
                                  href={p.aadharUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-7 h-7 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-all"
                                  title="View Aadhar Document"
                                >
                                  <Eye className="w-4 h-4" />
                                </a>
                              )}
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
              if (foodFilter === "ALL") return true;
              return f.approvalStatus === foodFilter;
            });

            return (
              <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm animate-fadeIn">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Dish Listings Review</h3>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-3 py-1 rounded-full">
                    {filteredFoods.length} of {foods.length} Menu Items
                  </span>
                </div>

                {/* Filter tabs */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center gap-2">
                  {[
                    { id: "ALL", label: "All Items", count: foods.length },
                    { id: "PENDING", label: "Pending Review", count: foods.filter(f => f.approvalStatus === "PENDING").length, color: "text-amber-600 bg-amber-50" },
                    { id: "APPROVED", label: "Approved", count: foods.filter(f => f.approvalStatus === "APPROVED").length, color: "text-emerald-600 bg-emerald-50" },
                    { id: "REJECTED", label: "Rejected", count: foods.filter(f => f.approvalStatus === "REJECTED").length, color: "text-rose-600 bg-rose-50" }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setFoodFilter(tab.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        foodFilter === tab.id
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                          : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                        foodFilter === tab.id
                          ? "bg-indigo-850/45 text-white"
                          : tab.color || "bg-slate-100 text-slate-600"
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
                
                {foodsLoading ? (
                  <div className="p-12 text-center text-slate-400">Loading dishes...</div>
                ) : filteredFoods.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">No dishes match this status filter.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                          <th className="py-4 px-6">Dish Name</th>
                          <th className="py-4 px-6">Kitchen / Cook</th>
                          <th className="py-4 px-6">Category</th>
                          <th className="py-4 px-6">Price</th>
                          <th className="py-4 px-6 text-center">Status</th>
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
                                  <img src={f.images[0]} className="w-10 h-10 rounded-xl object-cover" alt="" />
                                ) : (
                                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">🍛</div>
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
                              {f.provider?.kitchenName || "Unknown Kitchen"}
                            </td>
                            {/* Category */}
                            <td className="py-4 px-6 text-slate-400 font-semibold">
                              {f.category}
                            </td>
                            {/* Price */}
                            <td className="py-4 px-6 text-slate-900 font-bold">
                              ₹{f.price} <span className="text-[9px] text-slate-400 font-medium">/{f.pricePer || "meal"}</span>
                            </td>
                            {/* Status */}
                            <td className="py-4 px-6 text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase ${
                                f.approvalStatus === "APPROVED" 
                                  ? "bg-green-50 text-green-700 border-green-200" 
                                  : f.approvalStatus === "REJECTED"
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                              }`}>
                                {f.approvalStatus || "PENDING"}
                              </span>
                            </td>
                            {/* Actions */}
                            <td className="py-4 px-6">
                              <div className="flex items-center justify-center gap-2">
                                {f.approvalStatus !== "APPROVED" && (
                                  <button
                                    onClick={() => handleApproveFood(f._id, "APPROVED")}
                                    className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                                    title="Approve Listing"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                )}
                                {f.approvalStatus !== "REJECTED" && (
                                  <button
                                    onClick={() => handleApproveFood(f._id, "REJECTED")}
                                    className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                                    title="Reject Listing"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ════ 4. USERS LIST PAGE ════ */}
          {activeTab === "users" && (
            <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm animate-fadeIn">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">User Account Management</h3>
                <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-3 py-1 rounded-full">
                  {users.length} Users Total
                </span>
              </div>
              
              {usersLoading ? (
                <div className="p-12 text-center text-slate-400">Loading user accounts...</div>
              ) : users.length === 0 ? (
                <div className="p-12 text-center text-slate-400">No users found in database.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-4 px-6">Name</th>
                        <th className="py-4 px-6">Contact details</th>
                        <th className="py-4 px-6">Role</th>
                        <th className="py-4 px-6">Created Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map(u => (
                        <tr key={u._id} className="text-xs hover:bg-slate-50/50">
                          {/* Name / Avatar */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              {u.profileImage ? (
                                <img src={u.profileImage} className="w-9 h-9 rounded-full object-cover" alt="" />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="font-extrabold text-slate-900">{u.name}</span>
                            </div>
                          </td>
                          {/* Contact */}
                          <td className="py-4 px-6 space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <span>{u.email}</span>
                            </div>
                            {u.phone && (
                              <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                <span>+91 {u.phone}</span>
                              </div>
                            )}
                          </td>
                          {/* Role */}
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${
                              u.role === "ADMIN" 
                                ? "bg-indigo-50 text-indigo-700 border-indigo-200" 
                                : u.role === "PROVIDER"
                                ? "bg-teal-50 text-teal-700 border-teal-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
