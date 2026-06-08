import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
      <Link
        to="/"
        className="text-xl font-bold text-gray-800 dark:text-white"
      >
        Shanta Bai
      </Link>

      <div className="flex items-center gap-6">
        <Link
          to="/customer/dashboard"
          className="text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500"
        >
          Customer Dashboard
        </Link>

        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}