// models/Review.js

const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
{
    food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FoodItem",
    required: true,
},

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },

    comment: {
        type: String,
        trim: true,
    },
},
{
    timestamps: true,
}
);

reviewSchema.index(
  {
    user: 1,
    food: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Review", reviewSchema);