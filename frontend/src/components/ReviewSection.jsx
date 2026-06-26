import React, { useState } from "react";
import api from "../services/api";

const ReviewSection = ({ foodId, onReviewAdded }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!foodId) return alert("Food ID missing");
    if (rating === 0) return alert("Please select rating");

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      await api.post(
        `/foods/${foodId}/review`,
        { rating, comment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRating(0);
      setComment("");

      if (onReviewAdded) {
        onReviewAdded();
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white border rounded-2xl shadow-sm">

        <h3 className="font-bold text-slate-900 mb-3">

          Rate this Dish

        </h3>



        {/* STARS INPUT */}

        <div className="flex gap-2 mb-3">

          {[1, 2, 3, 4, 5].map((n) => (

            <button

              key={n}

              type="button"

              onClick={() => setRating(n)}

              className={

                n <= rating

                  ? "text-amber-400 text-2xl"

                  : "text-gray-300 text-2xl"

              }

            >

              ★

            </button>

          ))}

        </div>



        {/* COMMENT INPUT */}

        <textarea

          value={comment}

          onChange={(e) => setComment(e.target.value)}

          placeholder="Write your review..."

          className="w-full border p-2 rounded-lg"

          rows={3}

        />



        {/* SUBMIT BUTTON */}

        <button

          onClick={handleSubmit}

          disabled={loading}

          className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg"

        >

          {loading ? "Submitting..." : "Submit Review"}

        </button>

      </div>
  );
};

export default ReviewSection;