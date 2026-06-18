import React, { useState } from "react";

import Sidebar from "../components/dashboard/Sidebar";
import DashboardHome from "../components/dashboard/CustomerDash";
import FindServices from "../components/dashboard/FindServices";
import Bookings from "../components/dashboard/Bookings";
import Favorites from "../components/dashboard/Favorites";
import ChatSection from "../chat/ChatSection";
import Subscription from "../components/dashboard/Subscription";
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderPage = () => {
    switch (activeTab) {
      case "find-services":
        return <FindServices />;
         case "subscription":
  return <Subscription />;
      case "bookings":
        return <Bookings />;

      case "favorites":
        return <Favorites />;
      
      // 2. ADD THE CASE FOR CHATS
      case "chats":
        return <ChatSection />

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