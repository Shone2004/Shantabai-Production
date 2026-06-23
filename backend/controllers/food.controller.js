const FoodItem = require("../models/FoodItem");
const ProviderProfile = require("../models/ProviderProfile");
const { uploadToCloudinary } = require("../utils/cloudinaryHelper");
const { getIO } = require("../services/socketService"); // ⚡ Import your socket utility

// 🔧 FIX: Added missing helper function to calculate average ratings safely
const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return totalRating / reviews.length;
};

// Helper to parse Date and Time String into a combined Date object
const parseDateTime = (dateVal, timeStr) => {
  if (!dateVal || !timeStr) return null;
  const baseDate = new Date(dateVal);
  if (isNaN(baseDate.getTime())) return null;

  const match = timeStr.trim().match(/^(\d+):(\d+)\s*(AM|PM)?$/i);
  if (!match) return baseDate;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3];

  if (ampm) {
    const upperAmpm = ampm.toUpperCase();
    if (upperAmpm === "PM" && hours < 12) {
      hours += 12;
    } else if (upperAmpm === "AM" && hours === 12) {
      hours = 0;
    }
  }

  const combined = new Date(baseDate);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
};

// Helper to format 24h or arbitrary time input into standard 12-hour AM/PM format
const formatTime12h = (timeStr) => {
  if (!timeStr) return "";
  const match = timeStr.trim().match(/^(\d+):(\d+)\s*(AM|PM)?$/i);
  if (!match) return timeStr;

  let hours = parseInt(match[1], 10);
  const minutes = String(match[2]).padStart(2, "0");
  const ampm = match[3];

  if (ampm) {
    return `${hours}:${minutes} ${ampm.toUpperCase()}`;
  }

  const suffix = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${suffix}`;
};

// @desc    Create a new food item
// @route   POST /api/foods
// @access  Private (Provider only)
const createFoodItem = async (req, res) => {
  console.log("=== CREATE FOOD HIT ===");
  try {
    const {
      name,
      description,
      price,
      pricePer,
      category,
      mealType,
      quantity,
      totalQuantity,
      prepTime,
      images,
      isVeg,
      bringContainer,
      spicyLevel,
      tags,
      serviceDate,
      startTime,
      endTime,
    } = req.body;

    const providerProfile = await ProviderProfile.findOne({ user: req.user._id });
    if (!providerProfile) {
      return res.status(403).json({
        success: false,
        message: "You must have a provider profile to create food items",
      });
    }

    if (!name || !description || !price || !category || quantity === undefined || !serviceDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (name, description, price, category, quantity, serviceDate, startTime, endTime)",
      });
    }

    const computedExpiryAt = parseDateTime(serviceDate, endTime);
    const computedTimeWindow = `${formatTime12h(startTime)} - ${formatTime12h(endTime)}`;

    let uploadedImages = [];

    if (images && Array.isArray(images)) {
      for (const img of images) {
        try {
          const url = await uploadToCloudinary(img, "shantabai/foods");
          if (url) uploadedImages.push(url);
        } catch (uploadError) {
          console.error("Cloudinary upload failed for an image:", uploadError.message);
        }
      }
    }

    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        try {
          const url = await uploadToCloudinary(file.buffer, "shantabai/foods");
          if (url) uploadedImages.push(url);
        } catch (uploadError) {
          console.error("Cloudinary upload failed for standard file:", uploadError.message);
        }
      }
    }

    if (req.file) {
      try {
        const url = await uploadToCloudinary(req.file.buffer, "shantabai/foods");
        if (url) uploadedImages.push(url);
      } catch (uploadError) {
        console.error("Cloudinary upload failed for req.file:", uploadError.message);
      }
    }

    let foodItem = await FoodItem.create({
      provider: providerProfile._id,
      name,
      description,
      price,
      pricePer: pricePer || "per plate",
      category,
      mealType: mealType || "",
      quantity,
      totalQuantity: totalQuantity !== undefined ? totalQuantity : quantity,
      prepTime: prepTime || 30,
      serviceDate,
      startTime,
      endTime,
      expiryAt: computedExpiryAt,
      timeWindow: computedTimeWindow,
      images: uploadedImages,
      isVeg: isVeg !== undefined ? isVeg : true,
      bringContainer: bringContainer !== undefined ? bringContainer : false,
      spicyLevel: spicyLevel !== undefined ? spicyLevel : 1,
      tags: tags || [],
      status: quantity > 0 ? "available" : "out",
      approvalStatus: "APPROVED",
      isApproved: true,
    });

    foodItem = await foodItem.populate({
      path: "provider",
      select: "kitchenName tagline city area startingPrice rating isAvailable isSubscribed subscriptionPlan planType subscriptionStatus avatar verificationStatus",
    });

    // 📡 Real-time broadcast: Create event
    const io = getIO();
    if (io) {
      io.emit("food_listing_updated", {
        action: "CREATE",
        foodItem,
      });
    }

    res.status(201).json({
      success: true,
      message: "Food item created successfully.",
      foodItem,
    });
  } catch (error) {
    console.error("=== CREATE FOOD ERROR ===", error);
    res.status(500).json({
      success: false,
      message: "Server error creating food item",
      error: error.message,
    });
  }
};

// @desc    Get all food items (Public)
// @route   GET /api/foods
// @access  Public
const getAllFoods = async (req, res) => {
  try {
    const { category, mealType, isVeg, providerId, search } = req.query;
    const query = {};
    const now = new Date();

    query.expiryAt = { $gt: now };

    if (category) query.category = category;
    if (mealType) query.mealType = mealType;
    if (isVeg !== undefined) query.isVeg = isVeg === "true";
    if (providerId) query.provider = providerId;
    if (search) query.$text = { $search: search };

    const foodItems = await FoodItem.find(query).populate({
      path: "provider",
      select: "kitchenName tagline city area startingPrice rating isAvailable isSubscribed subscriptionPlan planType subscriptionStatus",
    });

    res.status(200).json({
      success: true,
      count: foodItems.length,
      foodItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching food items",
      error: error.message,
    });
  }
};

// @desc    Get reviews of a food item
// @route   GET /api/foods/:id/reviews
// @access  Public
const getFoodReviews = async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id)
      .select("reviews averageRating");

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    res.status(200).json({
      success: true,
      averageRating: foodItem.averageRating,
      totalReviews: foodItem.reviews.length,
      reviews: foodItem.reviews.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};

// @desc    Delete own review
// @route   DELETE /api/foods/:foodId/review/:reviewId
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const { foodId, reviewId } = req.params;

    const foodItem = await FoodItem.findById(foodId);

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    const review = foodItem.reviews.id(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    foodItem.reviews.pull(reviewId);

    const totalRating = foodItem.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );

    foodItem.averageRating =
      foodItem.reviews.length > 0
        ? totalRating / foodItem.reviews.length
        : 0;

    await foodItem.save();

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Add a review to a provider
// @route   POST /api/providers/:id/review
// @access  Private (Registered users)
const addReviewToProvider = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { id } = req.params;

    const profile = await ProviderProfile.findById(id);
    if (!profile) return res.status(404).json({ success: false, message: "Provider not found" });

    const newReview = {
      user: req.user._id,
      userName: req.user.name,
      rating: Number(rating),
      comment,
      date: new Date(),
    };

    profile.reviews.push(newReview);
    profile.rating = calculateAverageRating(profile.reviews);
    await profile.save();

    res.status(200).json({
      success: true,
      message: "Review added successfully",
      rating: profile.rating,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding review", error: error.message });
  }
};

// @desc    Get single food item details
// @route   GET /api/foods/:id
// @access  Public
const getFoodById = async (req, res) => {
  try {
    const { id } = req.params;

    const foodItem = await FoodItem.findById(id).populate({
      path: "provider",
      select: "kitchenName tagline bio experience rating startingPrice city area fullAddress isSubscribed subscriptionPlan avatar verificationStatus",
    });

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    const now = new Date();
    if (foodItem.expiryAt && foodItem.expiryAt <= now) {
      return res.status(400).json({
        success: false,
        message: "This food item listing has expired",
      });
    }

    res.status(200).json({
      success: true,
      foodItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching food item details",
      error: error.message,
    });
  }
};

// @desc    Get all food items for logged-in provider
// @route   GET /api/foods/me
// @access  Private (Provider only)
const getMyFoodItems = async (req, res) => {
  try {
    const providerProfile = await ProviderProfile.findOne({ user: req.user._id });
    if (!providerProfile) {
      return res.status(403).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    const foodItems = await FoodItem.find({ provider: providerProfile._id });

    res.status(200).json({
      success: true,
      count: foodItems.length,
      foodItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching food items",
      error: error.message,
    });
  }
};

// @desc    Update a food item
// @route   PUT /api/foods/:id
// @access  Private (Provider only)
const updateFoodItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const providerProfile = await ProviderProfile.findOne({ user: req.user._id });
    if (!providerProfile) {
      return res.status(403).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    let foodItem = await FoodItem.findById(id);
    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    if (foodItem.provider.toString() !== providerProfile._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this food item",
      });
    }

    const now = new Date();
    if (foodItem.expiryAt && foodItem.expiryAt <= now) {
      return res.status(400).json({
        success: false,
        message: "This listing has expired and cannot be modified or reactivated. Please create a new listing.",
      });
    }

    if (updateData.serviceDate || updateData.startTime || updateData.endTime) {
      const serviceDate = updateData.serviceDate || foodItem.serviceDate;
      const startTime = updateData.startTime || foodItem.startTime;
      const endTime = updateData.endTime || foodItem.endTime;

      updateData.expiryAt = parseDateTime(serviceDate, endTime);
      updateData.timeWindow = `${formatTime12h(startTime)} - ${formatTime12h(endTime)}`;
    }

    delete updateData.isApproved;
    delete updateData.approvalStatus;

    if (updateData.images && Array.isArray(updateData.images)) {
      let updatedImages = [];
      for (const img of updateData.images) {
        try {
          const url = await uploadToCloudinary(img, "shantabai/foods");
          if (url) updatedImages.push(url);
        } catch (uploadError) {
          console.error("Cloudinary upload failed during update:", uploadError.message);
        }
      }
      updateData.images = updatedImages;
    }

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      let uploadedFiles = [];
      for (const file of req.files) {
        try {
          const url = await uploadToCloudinary(file.buffer, "shantabai/foods");
          if (url) uploadedFiles.push(url);
        } catch (uploadError) {
          console.error("Cloudinary upload failed for file during update:", uploadError.message);
        }
      }
      updateData.images = [...(updateData.images || foodItem.images), ...uploadedFiles];
    }

    if (updateData.quantity !== undefined && updateData.status === undefined) {
      updateData.status = updateData.quantity > 0 ? "available" : "out";
    }

    foodItem = await FoodItem.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate({
      path: "provider",
      select: "kitchenName tagline city area startingPrice rating isAvailable isSubscribed subscriptionPlan planType subscriptionStatus",
    });

    // 📡 Real-time broadcast: Update event
    const io = getIO();
    if (io) {
      io.emit("food_listing_updated", {
        action: foodItem.status === "out" || foodItem.quantity <= 0 ? "DELETE" : "UPDATE",
        foodItem,
      });
    }

    res.status(200).json({
      success: true,
      message: "Food item updated successfully.",
      foodItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error updating food item",
      error: error.message,
    });
  }
};

// @desc Get food history of logged-in chef
// @route GET /api/foods/provider/history
// @access Private (Provider)
const getFoodHistory = async (req, res) => {
  try {
    const providerProfile = await ProviderProfile.findOne({
      user: req.user._id,
    });

    if (!providerProfile) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    const foods = await FoodItem.find({
      provider: providerProfile._id,
    })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: foods.length,
      foods,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete a food item
// @route   DELETE /api/foods/:id
// @access  Private (Provider only)
const deleteFoodItem = async (req, res) => {
  try {
    const { id } = req.params;

    const providerProfile = await ProviderProfile.findOne({ user: req.user._id });
    if (!providerProfile) {
      return res.status(403).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    const foodItem = await FoodItem.findById(id);
    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    if (foodItem.provider.toString() !== providerProfile._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this food item",
      });
    }

    await FoodItem.findByIdAndDelete(id);

    // 📡 Real-time broadcast: Delete event
    const io = getIO();
    if (io) {
      io.emit("food_listing_updated", {
        action: "DELETE",
        foodItem: { _id: id },
      });
    }

    res.status(200).json({
      success: true,
      message: "Food item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error deleting food item",
      error: error.message,
    });
  }
};

// @desc    Add a review to a specific food item
// @route   POST /api/foods/:id/review
// @access  Private (Registered users)
const addReviewToFood = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const foodItem = await FoodItem.findById(req.params.id).populate("provider");

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: "Food not found",
      });
    }

    if (foodItem.provider?.user?.toString() === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Providers cannot review their own food items.",
      });
    }

    const alreadyReviewed = foodItem.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      alreadyReviewed.rating = Number(rating);
      alreadyReviewed.comment = comment;
      alreadyReviewed.createdAt = new Date();
    } else {
      foodItem.reviews.push({
        user: req.user._id,
        userName: req.user.name,
        rating: Number(rating),
        comment,
        createdAt: new Date(),
      });
    }

    const totalRating = foodItem.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );

    foodItem.averageRating = totalRating / foodItem.reviews.length;

    await foodItem.save();

    res.status(200).json({
      success: true,
      message: alreadyReviewed ? "Review updated successfully" : "Review added successfully",
      averageRating: foodItem.averageRating,
      reviews: foodItem.reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get dashboard statistics for a provider
// @route   GET /api/foods/stats
// @access  Private (Provider only)
const getProviderStats = async (req, res) => {
  try {
    const providerProfile = await ProviderProfile.findOne({ user: req.user._id });
    if (!providerProfile) {
      return res.status(403).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    const foodItems = await FoodItem.find({ provider: providerProfile._id });

    const totalFoods = foodItems.length;
    const activeFoods = foodItems.filter(item => item.status === "available" && item.quantity > 0).length;
    const ordersToday = foodItems.reduce((acc, item) => acc + (item.ordersToday || 0), 0);
    const earningsToday = foodItems.reduce((acc, item) => acc + ((item.ordersToday || 0) * item.price), 0);
    const historicalEarnings = foodItems.reduce((acc, item) => acc + (15 * item.price), 0);

    res.status(200).json({
      success: true,
      stats: {
        totalFoods,
        activeFoods,
        ordersToday,
        earningsToday,
        totalEarnings: earningsToday > 0 ? earningsToday : historicalEarnings,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching stats",
      error: error.message,
    });
  }
};

// @desc    Get similar food items
// @route   GET /api/foods/similar/:id
// @access  Public
const getSimilarFoods = async (req, res) => {
  try {
    const { id } = req.params;
    
    const currentFood = await FoodItem.findById(id);
    if (!currentFood) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    const now = new Date();
    const query = {
      _id: { $ne: id },
      expiryAt: { $gt: now }
    };

    const similarItems = await FoodItem.find(query).populate({
      path: "provider",
      select: "kitchenName tagline city area startingPrice rating avatar verificationStatus",
    });

    similarItems.sort((a, b) => {
      const aSameProvider = a.provider && a.provider._id.toString() === currentFood.provider.toString();
      const bSameProvider = b.provider && b.provider._id.toString() === currentFood.provider.toString();
      
      if (aSameProvider && !bSameProvider) return -1;
      if (!aSameProvider && bSameProvider) return 1;

      const aSameCategory = a.category === currentFood.category;
      const bSameCategory = b.category === currentFood.category;
      
      if (aSameCategory && !bSameCategory) return -1;
      if (!aSameCategory && bSameCategory) return 1;

      return 0;
    });

    const limitedItems = similarItems.slice(0, 6);

    res.status(200).json({
      success: true,
      foodItems: limitedItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching similar food items",
      error: error.message,
    });
  }
};

module.exports = {
  createFoodItem,
  getAllFoods,
  getFoodById,
  getMyFoodItems,
  updateFoodItem,
  deleteFoodItem,
  getProviderStats,
  addReviewToProvider,
  addReviewToFood,
  getFoodReviews,
  deleteReview,
  getFoodHistory,
  getSimilarFoods,
};