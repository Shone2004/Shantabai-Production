import React, { useState } from 'react';
import api from "../services/api"; // Adjust your import path as needed

const ReviewSection = ({ foodId, onReviewSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return alert("Please select a rating");
    setLoading(true);
    try {
      await api.post(`/foods/${foodId}/review`, { rating, comment });
      onReviewSubmit(); // Trigger a callback to refresh the parent data
      setRating(0);
      setComment("");
    } catch (err) {
  console.log("Review Error:", err);
  console.log("Response Data:", err.response?.data);

  alert(
    err.response?.data?.message ||
    err.response?.data?.error ||
    "Failed to submit review"
  );
}
 finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-[0_4px_20px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 transition-all duration-300 mt-6">
      <h3 className="font-bold text-slate-900 tracking-normal mb-4">Rate this Dish</h3>
      
      {/* Star Selection */}
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((s) => (
          <button 
            key={s} 
            onClick={() => setRating(s)}
            className={`text-2xl ${rating >= s ? "text-amber-400" : "text-gray-200"}`}
          >
            ★
          </button>
        ))}
      </div>

      <textarea 
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience..."
        className="w-full p-3 border border-gray-200 rounded-xl mb-3 focus:border-brand-green outline-none"
      />

      <button 
        onClick={handleSubmit}
        disabled={loading}
        className="px-6 py-2 bg-brand-green text-white rounded-xl font-bold text-sm"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );
};

export default ReviewSection;