import React from 'react';

export default function TwoColumnLayout({ sidebar, children }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="w-full lg:w-2/3 lg:order-1">
          {children}
        </div>
        {/* Sidebar */}
        <div className="w-full lg:w-1/3 lg:order-2 shrink-0">
          {sidebar}
        </div>
      </div>
    </div>
  );
}
