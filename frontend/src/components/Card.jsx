import React from 'react';

export default function Card({
  children,
  className = '',
  hoverable = false,
  padding = 'p-6 sm:p-8',
  ...props
}) {
  return (
    <div
      className={`bg-white border border-brand-beige rounded-3xl shadow-sm ${padding} ${
        hoverable ? 'hover:shadow-md hover:border-brand-orange/20 transition-all duration-200 cursor-pointer transform hover:scale-[1.01]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`border-b border-brand-beige pb-4 mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

Card.Body = function CardBody({ children, className = '', ...props }) {
  return (
    <div className={`space-y-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`border-t border-brand-beige pt-4 mt-4 flex items-center justify-end gap-2 ${className}`} {...props}>
      {children}
    </div>
  );
};
