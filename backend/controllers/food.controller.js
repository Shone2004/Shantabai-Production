const FoodItem = require("../models/FoodItem");
const ProviderProfile = require("../models/ProviderProfile");
const { uploadToCloudinary } = require("../utils/cloudinaryHelper");

// @desc    Create a new food item
// @route   POST /api/foods
// @access  Private (Provider only)
const createFoodItem = async (req, res) => {
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
      timeWindow,
      images,
      isVeg,
      spicyLevel,
      tags,
    } = req.body;

    // Find the provider profile for the logged-in user
    const providerProfile = await ProviderProfile.findOne({ user: req.user._id });
    if (!providerProfile) {
      return res.status(403).json({
        success: false,
        message: "You must have a provider profile to create food items",
      });
    }

    if (!name || !description || !price || !category || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (name, description, price, category, quantity)",
      });
    }

    // Handle Image Uploads to Cloudinary (Base64 from body or Buffers from Multer)
    let uploadedImages = [];
    
    // 1. Process base64 images from request body
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

    // 2. Process binary files if uploaded via Multer
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
    
    // If a single file was uploaded via req.file
    if (req.file) {
      try {
        const url = await uploadToCloudinary(req.file.buffer, "shantabai/foods");
        if (url) uploadedImages.push(url);
      } catch (uploadError) {
        console.error("Cloudinary upload failed for req.file:", uploadError.message);
      }
    }

    const foodItem = await FoodItem.create({
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
      timeWindow: timeWindow || "",
      images: uploadedImages,
      isVeg: isVeg !== undefined ? isVeg : true,
      spicyLevel: spicyLevel !== undefined ? spicyLevel : 1,
      tags: tags || [],
      status: quantity > 0 ? "available" : "out",
      approvalStatus: "PENDING",
      isApproved: false,
    });

    res.status(201).json({
      success: true,
      message: "Food item created successfully. Pending admin approval.",
      foodItem,
    });
  } catch (error) {
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

    query.approvalStatus = "APPROVED";
    query.isApproved = true;

    if (category) {
      query.category = category;
    }

    if (mealType) {
      query.mealType = mealType;
    }

    if (isVeg !== undefined) {
      query.isVeg = isVeg === "true";
    }

    if (providerId) {
      query.provider = providerId;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const foodItems = await FoodItem.find(query).populate({
      path: "provider",
      select: "kitchenName tagline city area startingPrice rating isAvailable",
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

// @desc    Get single food item details
// @route   GET /api/foods/:id
// @access  Public
const getFoodById = async (req, res) => {
  try {
    const { id } = req.params;

    const foodItem = await FoodItem.findById(id).populate({
      path: "provider",
      select: "kitchenName tagline bio experience rating startingPrice city area fullAddress",
    });

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
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

    // Prevent direct overrides of administrative status flags
    delete updateData.isApproved;
    delete updateData.approvalStatus;

    // Handle Image Updates if sent
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

    // Process file uploads if sent via Multer multipart form
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
      // If the request also had text images URLs, append them
      updateData.images = [...(updateData.images || foodItem.images), ...uploadedFiles];
    }

    // Reset approval flags if major fields were modified
    if (updateData.name || updateData.description || updateData.price || updateData.images) {
      updateData.approvalStatus = "PENDING";
      updateData.isApproved = false;
    }

    if (updateData.quantity !== undefined && updateData.status === undefined) {
      updateData.status = updateData.quantity > 0 ? "available" : "out";
    }

    foodItem = await FoodItem.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Food item updated successfully. Pending admin approval.",
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

module.exports = {
  createFoodItem,
  getAllFoods,
  getFoodById,
  getMyFoodItems,
  updateFoodItem,
  deleteFoodItem,
  getProviderStats,
};
