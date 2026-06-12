import React from "react";
import { Trash2 } from "lucide-react";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  foodToDelete
}) {
  if (!isOpen || !foodToDelete) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-[24px] max-w-sm w-full p-6 shadow-2xl space-y-6 text-center transform scale-100 transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <Trash2 className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h3 className="text-base font-black text-slate-900">Delete Food Item?</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Are you sure you want to permanently remove <span className="font-extrabold text-slate-800">"{foodToDelete.name}"</span>? This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3 px-4 rounded-xl cursor-pointer min-h-[44px]"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(foodToDelete._id)}
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-3 px-4 rounded-xl cursor-pointer min-h-[44px] shadow-md shadow-rose-600/10"
          >
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}
