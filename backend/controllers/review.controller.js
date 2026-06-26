const Review = require("../models/Review");
const FoodItem = require("../models/FoodItem");
const ProviderProfile = require("../models/ProviderProfile");

exports.getProviderReviews = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({
      user: req.user._id,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    const foods = await FoodItem.find({
      provider: profile._id,
    });

    const foodIds = foods.map(food => food._id);

    const reviews = await Review.find({
      food: { $in: foodIds },
    })
      .populate("user", "name")
      .populate("food", "name");

    res.json({
      success: true,
      reviews,
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};