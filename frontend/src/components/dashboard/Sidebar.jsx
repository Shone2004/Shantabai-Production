import {
  Home,
  Search,
  Calendar,
  Heart,
  LogOut,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <div className="w-full lg:w-64 bg-white shadow-lg border-r border-gray-100 lg:min-h-screen p-5">
      <div className="flex justify-center mb-8">
        <img
          src="/logonavbar.png"
          alt="ShantaBai Logo"
          className="h-16 w-auto object-contain"
        />
      </div>

      <div className="space-y-3">
        {/* Dashboard */}
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${
            activeTab === "dashboard"
              ? "bg-brand-green text-white shadow-sm"
              : "hover:bg-brand-light text-gray-700"
          }`}
        >
          <Home size={20} />
          Dashboard
        </button>

        {/* Find Services */}
        <button
          onClick={() => setActiveTab("find-services")}
          className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${
            activeTab === "find-services"
              ? "bg-brand-green text-white shadow-sm"
              : "hover:bg-brand-light text-gray-700"
          }`}
        >
          <Search size={20} />
          Find Services
        </button>

        {/* Bookings */}
        <button
          onClick={() => setActiveTab("bookings")}
          className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${
            activeTab === "bookings"
              ? "bg-brand-green text-white shadow-sm"
              : "hover:bg-brand-light text-gray-700"
          }`}
        >
          <Calendar size={20} />
          My Bookings
        </button>

        {/* Favorites */}
        <button
          onClick={() => setActiveTab("favorites")}
          className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${
            activeTab === "favorites"
              ? "bg-brand-green text-white shadow-sm"
              : "hover:bg-brand-light text-gray-700"
          }`}
        >
          <Heart size={20} />
          Favorites
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-50 text-red-500 transition mt-6"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;