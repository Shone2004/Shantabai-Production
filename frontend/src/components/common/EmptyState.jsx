import React from 'react';

const EmptyState = ({ title, message, icon: Icon, actionButton }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-cream/50 text-brand-orange">
          <Icon className="h-8 w-8" />
        </div>
      )}
      <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>
      <p className="mb-6 text-gray-500 max-w-md">{message}</p>
      {actionButton}
    </div>
  );
};

export default EmptyState;
