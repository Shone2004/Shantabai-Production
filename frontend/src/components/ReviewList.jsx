import React, { useEffect, useState } from "react";
import api from "../services/api";

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/reviews/my-reviews", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Provider Reviews:", res.data);

      if (Array.isArray(res.data.reviews)) {
        setReviews(res.data.reviews);
      } else if (Array.isArray(res.data)) {
        setReviews(res.data);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-slate-500">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-slate-900">
        Customer Reviews
      </h3>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-xl p-6 border text-center">
          <p className="text-gray-500 italic">
            No reviews yet.
          </p>
        </div>
      ) : (
        reviews.map((review) => (
          <div
            key={review._id}
            className="bg-white rounded-xl border shadow-sm p-5"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-slate-900">
                  {review.user?.name || "Customer"}
                </h4>

                <p className="text-sm text-gray-500">
                  {review.food?.name ||
                    review.foodName ||
                    "Unknown Dish"}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  {review.createdAt
                    ? new Date(review.createdAt).toLocaleDateString()
                    : ""}
                </p>
              </div>

              <div className="flex text-yellow-500 text-lg">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star}>
                    {star <= review.rating ? "★" : "☆"}
                  </span>
                ))}
              </div>
            </div>

            <p className="mt-4 text-gray-700">
              {review.comment}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default ReviewList;