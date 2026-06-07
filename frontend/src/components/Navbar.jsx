import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Optionally redirect to login page
    window.location.href = '/login';
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-gray-800 dark:text-white">
        Shanta Bai
      </Link>
      <button
        onClick={handleLogout}
        className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
      >
        Logout
      </button>
    </nav>
  );
}
