import React from 'react';

export default function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-full';
  
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const variantStyles = {
    default: 'bg-gray-100 text-gray-800',
    yellow: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    orange: 'bg-orange-100 text-orange-800 border border-orange-200',
    green: 'bg-green-100 text-green-800 border border-green-200',
    red: 'bg-red-100 text-red-800 border border-red-200',
    blue: 'bg-blue-100 text-blue-800 border border-blue-200',
  };

  const selectedSize = sizeStyles[size] || sizeStyles.md;
  const selectedVariant = variantStyles[variant] || variantStyles.default;

  return (
    <span className={`${baseStyles} ${selectedSize} ${selectedVariant} ${className}`}>
      {children}
    </span>
  );
}
