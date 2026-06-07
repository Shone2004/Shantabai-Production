import React from 'react';

const ReserveButton = ({ onClick, price, quantity, disabled }) => {
  const total = price * quantity;

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-between bg-brand-green hover:bg-brand-green/90 text-white rounded-xl px-6 py-4 font-bold text-lg shadow-lg shadow-brand-green/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
    >
      <span>Reserve Now</span>
      <span className="bg-black/20 px-3 py-1 rounded-lg text-sm">${total.toFixed(2)}</span>
    </button>
  );
};

export default ReserveButton;
