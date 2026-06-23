import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import PublicNavbar from '../components/common/PublicNavbar.jsx';
import MobileNav from '../components/common/MobileNav.jsx';

export default function PublicLayout() {
  const location = useLocation();
  const isFoodDetailPage = location.pathname.startsWith('/food/') && location.pathname !== '/food';

  return (
    <div className="flex flex-col min-h-screen bg-brand-cream overflow-x-hidden">
      <PublicNavbar />
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
}
