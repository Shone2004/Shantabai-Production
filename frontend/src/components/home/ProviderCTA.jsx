import React from 'react';

const ProviderCTA = () => {
  return (
    <div className="mx-4 sm:mx-6 lg:mx-8 my-12 bg-[#F2F7F2] rounded-[2rem] overflow-hidden flex flex-col lg:flex-row relative shadow-sm border border-[#E0EBE2]">
      {/* Left Text */}
      <div className="p-8 lg:p-12 lg:w-[35%] z-20 flex flex-col justify-center bg-[#F2F7F2]">
        <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4 leading-tight tracking-tight">
          Earn from your <br/>cooking skills.
        </h2>
        <p className="text-gray-700 font-medium mb-8 max-w-sm text-sm lg:text-base">
          Join hundreds of home cooks earning with Shantabai.
        </p>
        <button className="bg-brand-green text-white px-6 py-3 rounded-xl font-bold w-fit hover:bg-brand-green/90 transition-all flex items-center gap-2 shadow-lg shadow-brand-green/30">
          Start Selling
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </div>

      {/* Middle Image */}
      <div className="hidden lg:block lg:w-[40%] relative z-10" style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0% 100%)' }}>
        <img 
          src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=1000" 
          alt="Happy Home Cook" 
          className="absolute inset-0 w-[120%] h-full object-cover -ml-[10%]"
        />
      </div>

      {/* Mobile Image */}
      <div className="lg:hidden w-full h-64 relative z-10">
        <img 
          src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800" 
          alt="Happy Home Cook" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Benefits */}
      <div className="lg:w-[25%] p-8 flex flex-col justify-center gap-6 bg-[#F2F7F2] z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border border-green-200/60 bg-white flex items-center justify-center text-brand-green shrink-0 shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <span className="text-sm font-bold text-gray-800">Flexible Hours</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border border-green-200/60 bg-white flex items-center justify-center text-brand-green shrink-0 shadow-sm">
            <span className="font-bold text-lg">%</span>
          </div>
          <span className="text-sm font-bold text-gray-800">No Commission</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border border-green-200/60 bg-white flex items-center justify-center text-brand-green shrink-0 shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <span className="text-sm font-bold text-gray-800">Grow Your Community</span>
        </div>
      </div>
    </div>
  );
};

export default ProviderCTA;
