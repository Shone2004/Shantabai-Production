import {
  Home,
  Search,
  Calendar,
  MessageCircle,
  Heart,
  Bell,
  LogOut,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

const Sidebar = () => {
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
        <button className="flex items-center gap-3 bg-brand-green text-white w-full p-3 rounded-xl shadow-sm hover:opacity-90 transition">
          <Home size={20} />
          Dashboard
        </button>

        <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-brand-light text-gray-700 transition">
          <Search size={20} />
          Find Services
        </button>

        <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-brand-light text-gray-700 transition">
          <Calendar size={20} />
          My Bookings
        </button>

        <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-brand-light text-gray-700 transition">
          <MessageCircle size={20} />
          Messages
        </button>

        <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-brand-light text-gray-700 transition">
          <Heart size={20} />
          Favorites
        </button>

        <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-brand-light text-gray-700 transition">
          <Bell size={20} />
          Notifications
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-50 text-red-500 transition"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;