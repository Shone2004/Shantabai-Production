import React from 'react';

export default function Button({
  children,
  variant = 'primary', // primary, secondary, outline, ghost, danger
  size = 'md', // sm, md, lg
  className = '',
  loading = false,
  disabled = false,
  icon,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]';

  const variants = {
    primary: 'bg-brand-orange text-white hover:bg-brand-orange/95 focus:ring-brand-orange shadow-lg shadow-brand-orange/15',
    secondary: 'bg-brand-brown text-white hover:bg-brand-brown/95 focus:ring-brand-brown shadow-lg shadow-brand-brown/10',
    outline: 'border-2 border-brand-orange/20 text-brand-orange bg-transparent hover:bg-brand-orange/5 focus:ring-brand-orange',
    ghost: 'text-brand-brown hover:bg-brand-beige/50 focus:ring-brand-beige',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-lg shadow-red-500/15',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base rounded-2xl',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : icon ? (
        <span className="mr-2 inline-flex">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
