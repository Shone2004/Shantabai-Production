import React from 'react';
import { Link } from 'react-router-dom';

const SectionHeader = ({ title, showSeeAll = true, link = "/food" }) => {
  return (
    <div className="flex justify-between items-end mb-6 px-4 sm:px-6 lg:px-8 pt-4">
      <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
        {title}
      </h2>
      {showSeeAll && (
        <Link to={link} className="text-sm font-bold text-brand-green hover:underline flex items-center gap-1 shrink-0">
          See all
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </Link>
      )}
    </div>
  );
};

export default SectionHeader;
