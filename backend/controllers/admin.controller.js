const User = require("../models/User");
const ProviderProfile = require("../models/ProviderProfile");
const FoodItem = require("../models/FoodItem");

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getAdminStats = async (req, res) => {
  try {
    const totalProviders = await ProviderProfile.countDocuments();
    const pendingProviders = await ProviderProfile.countDocuments({ verificationStatus: "PENDING" });
    
    const totalFoods = await FoodItem.countDocuments();
    const pendingFoods = await FoodItem.countDocuments({ approvalStatus: "PENDING" });
    
    const totalUsers = await User.countDocuments();

    res.status(200).json({
      success: true,
      stats: {
        totalProviders,
        pendingProviders,
        totalFoods,
        pendingFoods,
        totalUsers,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching admin stats",
      error: error.message,
    });
  }
};

// @desc    Get all providers for administration
// @route   GET /api/admin/providers
// @access  Private (Admin only)
const getProviders = async (req, res) => {
  try {
    const providers = await ProviderProfile.find().populate("user", "name email phone profileImage");
    res.status(200).json({
      success: true,
      count: providers.length,
      providers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching providers",
      error: error.message,
    });
  }
};

// @desc    Approve a provider profile
// @route   PUT /api/admin/providers/:id/approve
// @access  Private (Admin only)
const approveProvider = async (req, res) => {
  try {
    const { id } = req.params;

    const provider = await ProviderProfile.findById(id);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    provider.verificationStatus = "APPROVED";
    provider.isVerified = true;
    await provider.save();

    res.status(200).json({
      success: true,
      message: "Provider approved successfully",
      provider,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error approving provider",
      error: error.message,
    });
  }
};

// @desc    Reject a provider profile
// @route   PUT /api/admin/providers/:id/reject
// @access  Private (Admin only)
const rejectProvider = async (req, res) => {
  try {
    const { id } = req.params;

    const provider = await ProviderProfile.findById(id);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    provider.verificationStatus = "REJECTED";
    provider.isVerified = false;
    await provider.save();

    res.status(200).json({
      success: true,
      message: "Provider rejected successfully",
      provider,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error rejecting provider",
      error: error.message,
    });
  }
};

// @desc    Suspend a provider profile
// @route   PUT /api/admin/providers/:id/suspend
// @access  Private (Admin only)
const suspendProvider = async (req, res) => {
  try {
    const { id } = req.params;

    const provider = await ProviderProfile.findById(id);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    provider.verificationStatus = "SUSPENDED";
    provider.isVerified = false;
    await provider.save();

    res.status(200).json({
      success: true,
      message: "Provider suspended successfully",
      provider,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error suspending provider",
      error: error.message,
    });
  }
};

// @desc    Get all food items for administration
// @route   GET /api/admin/foods
// @access  Private (Admin only)
const getFoods = async (req, res) => {
  try {
    const foods = await FoodItem.find().populate({
      path: "provider",
      select: "kitchenName rating city area startingPrice user",
      populate: {
        path: "user",
        select: "name",
      },
    });
    res.status(200).json({
      success: true,
      count: foods.length,
      foods,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching food items",
      error: error.message,
    });
  }
};

// @desc    Approve a food item listing
// @route   PUT /api/admin/foods/:id/approve
// @access  Private (Admin only)
const approveFood = async (req, res) => {
  try {
    const { id } = req.params;

    const food = await FoodItem.findById(id);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    food.approvalStatus = "APPROVED";
    food.isApproved = true;
    await food.save();

    res.status(200).json({
      success: true,
      message: "Food item approved successfully",
      food,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error approving food item",
      error: error.message,
    });
  }
};

// @desc    Reject a food item listing
// @route   PUT /api/admin/foods/:id/reject
// @access  Private (Admin only)
const rejectFood = async (req, res) => {
  try {
    const { id } = req.params;

    const food = await FoodItem.findById(id);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    food.approvalStatus = "REJECTED";
    food.isApproved = false;
    await food.save();

    res.status(200).json({
      success: true,
      message: "Food item rejected successfully",
      food,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error rejecting food item",
      error: error.message,
    });
  }
};

// @desc    Get all registered users
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching users",
      error: error.message,
    });
  }
};

// @desc    Delete a food item listing
// @route   DELETE /api/admin/foods/:id
// @access  Private (Admin only)
const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;

    const food = await FoodItem.findById(id);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
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

module.exports = {
  getAdminStats,
  getProviders,
  approveProvider,
  rejectProvider,
  suspendProvider,
  getFoods,
  approveFood,
  rejectFood,
  getUsers,
  deleteFood,
};
