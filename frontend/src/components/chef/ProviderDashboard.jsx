import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

// ─── Mock food listings (replace with real data / API later) ─────────────────
const MOCK_FOODS = [
  {
    id: 1,
    name: "Aai's Special Dal Bati",
    category: "North Indian",
    price: 120,
    description: "Slow-cooked dal with crispy bati, served with ghee and churma.",
    prepTime: 40,
    quantity: 15,
    isVeg: true,
    spicyLevel: 1,
    status: "available",
    images: ["https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400"],
    ordersToday: 8,
    totalOrders: 142,
  },
  {
    id: 2,
    name: "Maharashtrian Misal Pav",
    category: "Maharashtrian",
    price: 60,
    description: "Spicy sprouted moth beans curry topped with farsan, onion and lemon.",
    prepTime: 25,
    quantity: 0,
    isVeg: true,
    spicyLevel: 2,
    status: "out",
    images: ["https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400"],
    ordersToday: 0,
    totalOrders: 89,
  },
  {
    id: 3,
    name: "Sabudana Khichdi",
    category: "Fasting Food",
    price: 50,
    description: "Soft tapioca pearls with peanuts, potatoes and cumin. Perfect for fasting.",
    prepTime: 20,
    quantity: 10,
    isVeg: true,
    spicyLevel: 0,
    status: "available",
    images: ["https://images.unsplash.com/photo-1626074964464-f6df4149dc8c?w=400"],
    ordersToday: 5,
    totalOrders: 67,
  },
];

const SPICY_LABELS = ["Mild 🌿", "Medium 🌶️", "Hot 🔥", "Extra Hot 💥"];
const SPICY_COLORS = ["text-green-600", "text-amber-600", "text-red-500", "text-red-900"];
const SPICY_BG     = ["bg-green-50", "bg-amber-50", "bg-red-50", "bg-red-100"];

const NAV_ITEMS = [
  { id: 'overview',  label: 'Overview',    emoji: '📊' },
  { id: 'myfoods',   label: 'My Foods',    emoji: '🍱' },
  { id: 'orders',    label: 'Orders',      emoji: '📦' },
  { id: 'earnings',  label: 'Earnings',    emoji: '💰' },
  { id: 'profile',   label: 'My Profile',  emoji: '👤' },
];

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [foods, setFoods] = useState(MOCK_FOODS);

  const toggleStatus = (id) => {
    setFoods(prev => prev.map(f =>
      f.id === id ? { ...f, status: f.status === 'available' ? 'out' : 'available' } : f
    ));
  };

  const deleteFood = (id) => {
    if (window.confirm('Remove this food item?')) {
      setFoods(prev => prev.filter(f => f.id !== id));
    }
  };

  const totalOrders   = foods.reduce((s, f) => s + f.totalOrders, 0);
  const todayOrders   = foods.reduce((s, f) => s + f.ordersToday, 0);
  const totalEarnings = foods.reduce((s, f) => s + f.totalOrders * f.price, 0);
  const availableCount = foods.filter(f => f.status === 'available').length;

  return (
    <div className="min-h-screen bg-[#F7FAF8] flex flex-col">

      {/* ── Top Header ── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">

          {/* Logo + back */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-green-50 hover:text-brand-green flex items-center justify-center text-gray-600 transition-colors text-sm font-bold"
            >
              ←
            </button>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-green leading-none">Chef Dashboard</p>
              <p className="text-base font-extrabold text-gray-900 leading-tight">
                {user?.kitchenName || 'My Kitchen'}
              </p>
            </div>
          </div>

          {/* Status pill */}
          <div className="hidden sm:flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-brand-green">
              {user?.status === 'approved' ? 'Active' : 'Pending Approval'}
            </span>
          </div>

          {/* Add Food CTA */}
          <button
            onClick={() => navigate('/chef/add-food')}
            className="flex items-center gap-2 bg-brand-green text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-green-900 transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <span className="text-base leading-none">+</span>
            <span className="hidden sm:inline">Add Food Item</span>
            <span className="sm:hidden">Add</span>
          </button>

          {/* Avatar + logout */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-brand-green flex items-center justify-center text-white font-black text-sm flex-shrink-0">
              {(user?.fullName || user?.name || 'C').charAt(0).toUpperCase()}
            </div>
            <button
              onClick={logout}
              className="hidden sm:block text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* ── Nav Tabs ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto scrollbar-hide">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all
                ${activeTab === item.id
                  ? 'border-brand-green text-brand-green'
                  : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              <span>{item.emoji}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">

        {/* ════ OVERVIEW TAB ════ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* Welcome */}
            <div className="bg-brand-green rounded-2xl px-6 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-white/70 text-sm">Welcome back 👋</p>
                <h2 className="text-xl font-extrabold">{user?.fullName || 'Chef'}</h2>
                <p className="text-white/60 text-xs mt-0.5">{user?.kitchenName} · {user?.area}, {user?.city}</p>
              </div>
              <button
                onClick={() => navigate('/chef/add-food')}
                className="self-start sm:self-auto bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold text-sm px-5 py-2.5 rounded-xl transition-all active:scale-95"
              >
                + Add New Food Item
              </button>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { emoji: '🍱', label: "Food Items",    value: foods.length,                  sub: `${availableCount} available`   },
                { emoji: '📦', label: "Today's Orders", value: todayOrders,                  sub: 'orders received'               },
                { emoji: '📊', label: "Total Orders",  value: totalOrders,                   sub: 'all time'                      },
                { emoji: '💰', label: "Est. Earnings", value: `₹${totalEarnings.toLocaleString()}`, sub: 'total revenue'           },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <p className="text-2xl mb-2">{s.emoji}</p>
                  <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500 font-semibold">{s.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Quick food list */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold text-gray-900">Your Food Items</h3>
                <button onClick={() => setActiveTab('myfoods')} className="text-xs font-bold text-brand-green hover:underline">
                  View all →
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {foods.slice(0, 3).map(food => (
                  <MinifoodCard key={food.id} food={food} onToggle={toggleStatus} onDelete={deleteFood} onEdit={() => navigate('/chef/add-food')} />
                ))}
                {/* Add new card */}
                <button
                  onClick={() => navigate('/chef/add-food')}
                  className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-brand-green hover:text-brand-green transition-all group min-h-[140px]"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">+</span>
                  <span className="text-xs font-bold">Add New Food Item</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════ MY FOODS TAB ════ */}
        {activeTab === 'myfoods' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">My Food Items</h2>
                <p className="text-xs text-gray-500">{foods.length} items · {availableCount} available</p>
              </div>
              <button
                onClick={() => navigate('/chef/add-food')}
                className="flex items-center gap-2 bg-brand-green text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-green-900 transition-all shadow-sm active:scale-95"
              >
                + Add Food Item
              </button>
            </div>

            {foods.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-5xl mb-3">🍽️</p>
                <p className="font-bold text-gray-700 text-lg">No food items yet</p>
                <p className="text-sm mt-1 mb-4">Add your first dish to start receiving orders</p>
                <button
                  onClick={() => navigate('/chef/add-food')}
                  className="bg-brand-green text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-green-900 transition-all"
                >
                  + Add Your First Dish
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {foods.map(food => (
                  <MinifoodCard key={food.id} food={food} onToggle={toggleStatus} onDelete={deleteFood} onEdit={() => navigate('/chef/add-food')} />
                ))}
                <button
                  onClick={() => navigate('/chef/add-food')}
                  className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-brand-green hover:text-brand-green transition-all group min-h-[200px]"
                >
                  <span className="text-4xl group-hover:scale-110 transition-transform">+</span>
                  <span className="text-sm font-bold">Add New Item</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ════ ORDERS TAB ════ */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-gray-900">Orders</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
              <p className="text-4xl mb-3">📦</p>
              <p className="font-bold text-gray-700">Order management coming soon</p>
              <p className="text-sm mt-1">You'll see incoming orders here once customers start ordering</p>
            </div>
          </div>
        )}

        {/* ════ EARNINGS TAB ════ */}
        {activeTab === 'earnings' && (
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-gray-900">Earnings</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { emoji: '💰', label: 'Total Earnings',    value: `₹${totalEarnings.toLocaleString()}` },
                { emoji: '📅', label: "This Month",        value: `₹${Math.round(totalEarnings * 0.3).toLocaleString()}` },
                { emoji: '🏦', label: 'Pending Payout',    value: `₹${Math.round(totalEarnings * 0.1).toLocaleString()}` },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <p className="text-3xl mb-2">{s.emoji}</p>
                  <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500 font-semibold mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
              <p className="text-4xl mb-3">📈</p>
              <p className="font-bold text-gray-700">Detailed earnings analytics coming soon</p>
            </div>
          </div>
        )}

        {/* ════ PROFILE TAB ════ */}
        {activeTab === 'profile' && (
          <div className="space-y-4 max-w-lg">
            <h2 className="text-lg font-extrabold text-gray-900">My Profile</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-16 bg-brand-green" />
              <div className="px-5 pb-5">
                <div className="w-16 h-16 rounded-2xl bg-white border-4 border-white shadow-md -mt-8 flex items-center justify-center text-2xl font-black text-brand-green mb-3">
                  {(user?.fullName || 'C').charAt(0).toUpperCase()}
                </div>
                <h3 className="font-extrabold text-gray-900 text-lg">{user?.kitchenName || '—'}</h3>
                <p className="text-sm text-gray-500">by {user?.fullName} · {user?.area}, {user?.city}</p>
                {user?.bio && <p className="text-xs text-gray-500 mt-2 leading-relaxed">{user.bio}</p>}

                <div className="mt-4 space-y-2.5">
                  {[
                    ['📞', 'Phone',    user?.phone],
                    ['📧', 'Email',    user?.email],
                    ['🍽️', 'Cuisines', user?.cuisines?.join(', ')],
                    ['🫙', 'Oil',      user?.oilLevel],
                    ['🌶️', 'Spice',   user?.spiceLevel],
                    ['🚚', 'Delivery', user?.deliveryOption],
                    ['💰', 'Price',    user?.pricePerMeal ? `₹${user.pricePerMeal} / meal` : null],
                  ].filter(([,,v]) => v).map(([icon, label, value]) => (
                    <div key={label} className="flex items-start gap-3 text-sm">
                      <span className="w-5 text-center flex-shrink-0">{icon}</span>
                      <span className="font-bold text-gray-700 w-20 flex-shrink-0">{label}</span>
                      <span className="text-gray-500 text-xs">{value}</span>
                    </div>
                  ))}
                </div>

                <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                  user?.status === 'approved'
                    ? 'bg-green-50 text-brand-green border border-green-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {user?.status === 'approved' ? '✅ Verified Chef' : '⏳ Pending Approval'}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// ─── Mini Food Card ───────────────────────────────────────────────────────────
function MinifoodCard({ food, onToggle, onDelete, onEdit }) {
  const spicyIdx = Math.min(Number(food.spicyLevel), 3);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">

      {/* Image */}
      <div className="relative h-32 bg-gray-100 overflow-hidden">
        {food.images?.[0] ? (
          <img src={food.images[0]} alt={food.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Veg dot */}
        <div className="absolute top-2 left-2 bg-white rounded-md px-1.5 py-1 flex items-center gap-1 shadow-sm">
          <span className={`w-2.5 h-2.5 ${food.isVeg ? 'rounded-full bg-green-500 border border-green-800' : 'rounded-sm bg-red-500 border border-red-800'}`} />
          <span className="text-[9px] font-extrabold text-gray-700">{food.isVeg ? 'VEG' : 'NON-VEG'}</span>
        </div>

        {/* Orders today badge */}
        {food.ordersToday > 0 && (
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-lg">
            🍱 {food.ordersToday} today
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-gray-900 text-sm truncate">{food.name}</p>
            <p className="text-[10px] text-gray-400">{food.category}</p>
          </div>
          <span className="bg-amber-400 text-white text-xs font-extrabold px-2 py-0.5 rounded-lg flex-shrink-0">
            ₹{food.price}
          </span>
        </div>

        <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">{food.description}</p>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${SPICY_BG[spicyIdx]} ${SPICY_COLORS[spicyIdx]}`}>
            {SPICY_LABELS[spicyIdx]}
          </span>
          <span className="text-[10px] text-gray-400">⏱ {food.prepTime}m · 📦 {food.quantity} left</span>
        </div>

        {/* Status toggle + actions */}
        <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-100">
          <button
            onClick={() => onToggle(food.id)}
            className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
              food.status === 'available'
                ? 'bg-green-50 border-brand-green text-brand-green hover:bg-green-100'
                : 'bg-red-50 border-red-400 text-red-600 hover:bg-red-100'
            }`}
          >
            {food.status === 'available' ? '● Available' : '✕ Out of Stock'}
          </button>
          <button
            onClick={() => onEdit(food.id)}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center text-gray-500 text-sm transition-colors"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(food.id)}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-gray-500 text-sm transition-colors"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}