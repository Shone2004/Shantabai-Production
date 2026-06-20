import React from 'react';
import { Sparkles, HelpCircle } from 'lucide-react';

export default function ChefSection({ onConsultAI }) {
  return (
    <section className="mx-4 sm:mx-6 lg:mx-8 my-10">
      <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-green/10 flex items-center justify-center shrink-0 text-brand-green">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-1.5">
              Looking for tailored meal options?
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm font-semibold mt-1 max-w-xl leading-relaxed">
              Our AI Assistant helps you find local cooks preparing meals matching your specific health needs—less oil, mild spice, low sodium, or diet plans.
            </p>
          </div>
        </div>
        
        <button
          onClick={onConsultAI}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 hover:border-gray-300 font-bold text-xs uppercase tracking-wider px-5 py-3.5 rounded-xl transition-all shadow-sm active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span>Consult AI Assistant</span>
        </button>
      </div>
    </section>
  );
}

export const ALL_CHEFS = [];