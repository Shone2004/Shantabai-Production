import React, { useState } from 'react';
import api from "../services/api";

const ReviewSection = ({ reviews = [], foodId, onReviewSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return alert("Please select a star rating first.");
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await api.post(`/foods/${foodId}/review`, 
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Reset form and refresh parent data
      setRating(0);
      setComment("");
      if (onReviewSubmit) onReviewSubmit(); 
    } catch (err) {
      console.error("Review submission error:", err);
      alert(err.response?.data?.message || "Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. DISPLAY LIST */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 mb-4">Customer Feedback</h3>
        
        {Array.isArray(reviews) && reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review._id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-sm text-slate-800">{review.userName || "Customer"}</span>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < (review.rating || 0) ? "text-amber-400" : "text-gray-200"}>★</span>
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-600">{review.comment || "No comment provided."}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 italic">No reviews yet. Be the first to rate this!</p>
        )}
      </div>

      {/* 2. INPUT FORM (Only show if foodId is provided) */}
      {foodId && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">Rate this Dish</h3>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <button 
                key={s} 
                type="button"
                onClick={() => setRating(s)} 
                className={`text-2xl transition-colors ${rating >= s ? "text-amber-400" : "text-gray-200"}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            className="w-full p-3 border border-gray-200 rounded-xl mb-3 outline-none focus:border-brand-green"
          />
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-2 bg-brand-green text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;