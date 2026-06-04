import React from 'react';
import { Link } from 'react-router-dom';

const SectionHeader = ({ title, subtitle, showSeeAll = true, link = '/food' }) => {
  return (
    <div className="flex justify-between items-end px-4 sm:px-6 lg:px-8 pt-2 mb-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-gray-400 font-medium mt-0.5">{subtitle}</p>
        )}
      </div>

      {showSeeAll && (
        <Link
          to={link}
          className="flex items-center gap-1 text-sm font-bold text-brand-green hover:text-brand-green/80 transition-colors shrink-0 ml-4 group"
        >
          See all
          <svg
            className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  );
};

export default SectionHeader;