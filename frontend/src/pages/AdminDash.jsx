import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api";

import AdminSidebar from "../components/admin/layout/AdminSidebar.jsx";
import AdminTopbar from "../components/admin/layout/AdminTopbar.jsx";
import OverviewPage from "../components/admin/overview/OverviewPage.jsx";
import ProvidersPage from "../components/admin/providers/ProvidersPage.jsx";
import ProviderDetailsModal from "../components/admin/providers/ProviderDetailsModal.jsx";
import FoodListingsPage from "../components/admin/foods/FoodListingsPage.jsx";
import FoodDetailsModal from "../components/admin/foods/FoodDetailsModal.jsx";
import UsersPage from "../components/admin/users/UsersPage.jsx";
import UserDetailsModal from "../components/admin/users/UserDetailsModal.jsx";
import ConfirmDialog from "../components/admin/shared/ConfirmDialog.jsx";
import SupportTicketsPage from "../components/admin/support/SupportTicketsPage.jsx";

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

      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        logout={logout}
        navigate={navigate}
      />

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header */}
        <AdminTopbar
          activeTab={activeTab}
          setSidebarOpen={setSidebarOpen}
          user={user}
        />

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">

          {/* ════ 1. DASHBOARD PAGE ════ */}
          {activeTab === "dashboard" && (
            <OverviewPage
              stats={stats}
              foods={foods}
              providers={providers}
              statsLoading={statsLoading}
              providersLoading={providersLoading}
              foodsLoading={foodsLoading}
              usersLoading={usersLoading}
              fetchStats={fetchStats}
              fetchProviders={fetchProviders}
              fetchFoods={fetchFoods}
              fetchUsers={fetchUsers}
              showToast={showToast}
              setActiveTab={setActiveTab}
              setSelectedProvider={setSelectedProvider}
              setIsDrawerOpen={setIsDrawerOpen}
              setSelectedFood={setSelectedFood}
              setIsFoodModalOpen={setIsFoodModalOpen}
              setFoodToDelete={setFoodToDelete}
              setIsDeleteConfirmOpen={setIsDeleteConfirmOpen}
              formatDateTime={formatDateTime}
            />
          )}

          {/* ════ 2. PROVIDERS LIST PAGE ════ */}
          {activeTab === "providers" && (
            <ProvidersPage
              providers={providers}
              providersLoading={providersLoading}
              formatDateTime={formatDateTime}
              handleApproveProvider={handleApproveProvider}
              setSelectedProvider={setSelectedProvider}
              setIsDrawerOpen={setIsDrawerOpen}
            />
          )}

          {/* ════ 3. FOODS LIST PAGE ════ */}
          {activeTab === "foods" && (
            <FoodListingsPage
              foods={foods}
              foodsLoading={foodsLoading}
              foodSearchQuery={foodSearchQuery}
              setFoodSearchQuery={setFoodSearchQuery}
              setSelectedFood={setSelectedFood}
              setIsFoodModalOpen={setIsFoodModalOpen}
              setFoodToDelete={setFoodToDelete}
              setIsDeleteConfirmOpen={setIsDeleteConfirmOpen}
            />
          )}

          {/* ════ 4. USERS LIST PAGE ════ */}
          {activeTab === "users" && (
            <UsersPage
              users={users}
              usersLoading={usersLoading}
              userRoleFilter={userRoleFilter}
              setUserRoleFilter={setUserRoleFilter}
              userSearchQuery={userSearchQuery}
              setUserSearchQuery={setUserSearchQuery}
              setSelectedUser={setSelectedUser}
              setIsUserModalOpen={setIsUserModalOpen}
            />
          )}

          {/* ════ 5. SUPPORT TICKETS PAGE ════ */}
          {activeTab === "support-tickets" && (
            <SupportTicketsPage
              showToast={showToast}
              formatDateTime={formatDateTime}
            />
          )}

        </div>
      </main>

      {/* ── CHEF DETAILS CENTERED MODAL ── */}
      <ProviderDetailsModal
        isDrawerOpen={isDrawerOpen}
        selectedProvider={selectedProvider}
        handleCloseModal={handleCloseModal}
        handleApproveProvider={handleApproveProvider}
        showToast={showToast}
        formatDateTime={formatDateTime}
        formatDateParts={formatDateParts}
        providerChats={providerChats}
        chatInput={chatInput}
        setChatInput={setChatInput}
        chatEndRef={chatEndRef}
        handleSendMessage={handleSendMessage}
        handleClearChat={handleClearChat}
        defaultMessages={defaultMessages}
      />

      {/* ── FOOD DETAILS CENTERED MODAL ── */}
      <FoodDetailsModal
        isFoodModalOpen={isFoodModalOpen}
        selectedFood={selectedFood}
        handleCloseFoodModal={handleCloseFoodModal}
        setFoodToDelete={setFoodToDelete}
        setIsDeleteConfirmOpen={setIsDeleteConfirmOpen}
        formatDateTime={formatDateTime}
      />

      {/* ── DELETE CONFIRMATION MODAL ── */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => { setIsDeleteConfirmOpen(false); setFoodToDelete(null); }}
        onConfirm={handleDeleteFood}
        foodToDelete={foodToDelete}
      />

      {/* ── USER DETAILS CENTERED MODAL ── */}
      <UserDetailsModal
        isUserModalOpen={isUserModalOpen}
        selectedUser={selectedUser}
        handleCloseUserModal={handleCloseUserModal}
        providers={providers}
        formatDateTime={formatDateTime}
      />

    </div>
  );
}
