import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import StatsCards from "../components/dashboard/StatsCards";

const CustomerDash = () => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-brand-cream">
      <Sidebar />

      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <Topbar />

        <div className="mt-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Welcome Back 👋
          </h1>

          <p className="text-gray-500 mt-2">
            Manage your bookings, discover cooks, and track your orders.
          </p>
        </div>

        <StatsCards />

        <div className="mt-10 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Recent Activity
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <span>Booked Home Cook Service</span>
              <span className="text-brand-green font-medium">
                Confirmed
              </span>
            </div>

            <div className="flex justify-between items-center border-b pb-3">
              <span>Tiffin Subscription Renewed</span>
              <span className="text-brand-green font-medium">
                Active
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span>Added New Favorite Chef</span>
              <span className="text-brand-green font-medium">
                Saved
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDash;