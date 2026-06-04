import React from 'react';

const QuantitySelector = ({ quantity, setQuantity, max = 10 }) => {
  const handleDecrement = () => setQuantity(prev => Math.max(1, prev - 1));
  const handleIncrement = () => setQuantity(prev => Math.min(max, prev + 1));

  return (
    <div className="flex items-center border border-gray-200 rounded-xl bg-white w-fit overflow-hidden h-11">
      <button 
        onClick={handleDecrement}
        disabled={quantity <= 1}
        className="px-4 h-full text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors flex items-center justify-center"
        aria-label="Decrease quantity"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
      </button>
      <div className="w-10 text-center font-bold text-gray-900 border-x border-gray-200 py-2 h-full flex items-center justify-center">
        {quantity}
      </div>
      <button 
        onClick={handleIncrement}
        disabled={quantity >= max}
        className="px-4 h-full text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors flex items-center justify-center"
        aria-label="Increase quantity"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
      </button>
    </div>
  );
};

export default QuantitySelector;
