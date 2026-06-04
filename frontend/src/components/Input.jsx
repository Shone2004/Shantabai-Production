import React from 'react';

export default function Input({
  label,
  error,
  helperText,
  icon,
  className = '',
  id,
  ...props
}) {
  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
          {label}
        </label>
      )}
      <div className="relative rounded-xl shadow-sm">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          id={id}
          className={`w-full px-4 py-3 bg-white border border-brand-beige rounded-xl text-sm text-brand-brown placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all duration-200 ${
            icon ? 'pl-10' : ''
          } ${
            error ? 'border-red-400 focus:ring-red-200 focus:border-red-500' : ''
          }`}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-xs text-red-500 font-semibold">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-gray-400">{helperText}</p>
      ) : null}
    </div>
  );
}
