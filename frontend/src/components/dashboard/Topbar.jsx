import { Bell } from "lucide-react";

const Topbar = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
      <input
        type="text"
        placeholder="Search cooks, chefs, tiffin..."
        className="w-full md:w-[400px] lg:w-[500px] border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green"
      />

      <div className="flex items-center gap-5">
        <button className="relative">
          <Bell size={24} className="text-gray-600" />

          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full"></span>
        </button>

        <img
          src="https://i.pravatar.cc/100"
          alt="profile"
          className="w-11 h-11 rounded-full border-2 border-brand-green"
        />
      </div>
    </div>
  );
};

export default Topbar;