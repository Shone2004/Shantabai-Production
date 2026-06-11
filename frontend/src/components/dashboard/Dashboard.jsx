import { useState } from "react";

import Sidebar from "../components/dashboard/Sidebar";
import DashboardHome from "../components/dashboard/CustomerDash";
import FindServices from "../components/dashboard/FindServices";
import Bookings from "../components/dashboard/Bookings";
import Favorites from "../components/dashboard/Favorites";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderPage = () => {
    switch (activeTab) {
      case "find-services":
        return <FindServices />;

      case "bookings":
        return <Bookings />;

      case "favorites":
        return <Favorites />;

      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="flex">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1">
        {renderPage()}
      </div>
    </div>
  );
}