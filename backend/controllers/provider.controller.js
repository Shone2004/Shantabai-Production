const mongoose = require("mongoose");
const User = require("../models/User");
const ProviderProfile = require("../models/ProviderProfile");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { uploadToCloudinary } = require("../utils/cloudinaryHelper");
const Counter = require("../models/Counter");

const Order = require("../models/Order");
const FoodItem = require("../models/FoodItem");
const { creditWalletForOrder } = require("./Wallet.controller");
const { getIO } = require("../services/socketService"); // ⚡ Import your socket utility

// Generate JWT for immediate login upon registration
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ==========================================
// PROVIDER / CHEF PROFILE CONTROLLERS
// ==========================================

const generateChefId = async (fullName, city) => {
  const names = fullName.trim().split(" ");
  const firstInitial = names[0]?.charAt(0).toUpperCase() || "X";
  const secondInitial = names.length > 1 ? names[names.length - 1].charAt(0).toUpperCase() : "X";

  const counter = await Counter.findOneAndUpdate(
    { name: "chef" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const sequence = String(counter.seq).padStart(5, "0");
  const cityCode = city.substring(0, 3).toUpperCase().replace(/\s/g, "");

  return `CHF-${cityCode}-${firstInitial}${secondInitial}-${sequence}`;
};

const registerProvider = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      kitchenName,
      tagline,
      bio,
      experience,
      specialities,
      city,
      area,
      pincode,
      fullAddress,
      longitude,
      latitude,
      avatar,
      aadharUrl,
      kitchenPhoto,
      dietaryType,
      serviceTypes,
    } = req.body;

    if (!name || !email || !phone || !password || !kitchenName || !bio || experience === undefined || experience === null || experience === "" || !city || !area || !pincode || !fullAddress) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // 1. Upload avatar
    let cloudinaryAvatarUrl = "";
    if (req.files && req.files.avatar) {
      const avatarFile = Array.isArray(req.files.avatar) ? req.files.avatar[0] : req.files.avatar;
      cloudinaryAvatarUrl = await uploadToCloudinary(avatarFile.buffer, "shantabai/avatars");
    } else if (req.file && req.file.fieldname === "avatar") {
      cloudinaryAvatarUrl = await uploadToCloudinary(req.file.buffer, "shantabai/avatars");
    } else if (avatar) {
      cloudinaryAvatarUrl = await uploadToCloudinary(avatar, "shantabai/avatars");
    }

    // 2. Upload aadhar
    let cloudinaryAadharUrl = "";
    if (req.files && req.files.aadhar) {
      const aadharFile = Array.isArray(req.files.aadhar) ? req.files.aadhar[0] : req.files.aadhar;
      cloudinaryAadharUrl = await uploadToCloudinary(aadharFile.buffer, "shantabai/documents");
    } else if (req.file && req.file.fieldname === "aadhar") {
      cloudinaryAadharUrl = await uploadToCloudinary(req.file.buffer, "shantabai/documents");
    } else if (aadharUrl) {
      cloudinaryAadharUrl = await uploadToCloudinary(aadharUrl, "shantabai/documents");
    }

    // 3. Upload kitchen photo
    let cloudinaryKitchenPhotoUrl = "";
    if (req.files && req.files.kitchenPhoto) {
      const kitchenFile = Array.isArray(req.files.kitchenPhoto) ? req.files.kitchenPhoto[0] : req.files.kitchenPhoto;
      cloudinaryKitchenPhotoUrl = await uploadToCloudinary(kitchenFile.buffer, "shantabai/kitchens");
    } else if (kitchenPhoto) {
      cloudinaryKitchenPhotoUrl = await uploadToCloudinary(kitchenPhoto, "shantabai/kitchens");
    }

    // 4. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create User
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "PROVIDER",
      profileImage: cloudinaryAvatarUrl,
    });

    // 6. Create ProviderProfile
    try {
      const chefId = await generateChefId(name, city);
      const providerProfile = await ProviderProfile.create({
        chefId,
        user: user._id,
        kitchenName,
        tagline,
        bio,
        experience,
        specialities: Array.isArray(specialities) ? specialities : JSON.parse(specialities || "[]"),
        dietaryType: Array.isArray(dietaryType) ? dietaryType : JSON.parse(dietaryType || "[]"),
        serviceTypes: Array.isArray(serviceTypes) ? serviceTypes : JSON.parse(serviceTypes || "[]"),
        city,
        area,
        pincode,
        fullAddress,
        ...(longitude !== undefined && latitude !== undefined && longitude !== null && latitude !== null
          ? {
              location: {
                type: "Point",
                coordinates: [Number(longitude), Number(latitude)],
              },
            }
          : {}),
        avatar: cloudinaryAvatarUrl,
        aadharUrl: cloudinaryAadharUrl,
        kitchenPhoto: cloudinaryKitchenPhotoUrl,
        verificationStatus: "PENDING",
      });

      const token = generateToken(user._id, user.role);

      res.status(201).json({
        success: true,
        message: "Provider registered successfully",
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          verificationStatus: providerProfile.verificationStatus,
          isVerified: providerProfile.isVerified,
        },
        profile: providerProfile,
      });
    } catch (profileError) {
      await User.findByIdAndDelete(user._id);
      throw profileError;
    }
  } catch (error) {
    console.error("========== REGISTER PROVIDER ERROR ==========");
    console.error(error);
    console.error("============================================");

    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    });
  }
};

const getMyProviderProfile = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({ user: req.user._id })
      .populate("user", "-password"); // Removed the .populate("reviews") chain

    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    res.status(200).json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateMyProviderProfile = async (req, res) => {
  try {
    const {
      kitchenName,
      tagline,
      bio,
      experience,
      specialities,
      whyBook,
      isAvailable,
      startingPrice,
      oilLevel,
      spiceLevel,
      deliveryOption,
      city,
      area,
      pincode,
      fullAddress,
      longitude,
      latitude,
      avatar,
      coverImage,
    } = req.body;

    let profile = await ProviderProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    let cloudinaryAvatarUrl = "";
    let cloudinaryCoverUrl = "";

    if (req.files && req.files.avatar) {
      const avatarFile = Array.isArray(req.files.avatar) ? req.files.avatar[0] : req.files.avatar;
      cloudinaryAvatarUrl = await uploadToCloudinary(avatarFile.buffer, "shantabai/avatars");
    } else if (avatar) {
      cloudinaryAvatarUrl = await uploadToCloudinary(avatar, "shantabai/avatars");
    }

    if (req.files && req.files.coverImage) {
      const coverFile = Array.isArray(req.files.coverImage) ? req.files.coverImage[0] : req.files.coverImage;
      cloudinaryCoverUrl = await uploadToCloudinary(coverFile.buffer, "shantabai/covers");
    } else if (coverImage) {
      cloudinaryCoverUrl = await uploadToCloudinary(coverImage, "shantabai/covers");
    }

    if (kitchenName !== undefined) profile.kitchenName = kitchenName;
    if (tagline !== undefined) profile.tagline = tagline;
    if (bio !== undefined) profile.bio = bio;
    if (experience !== undefined) profile.experience = Number(experience);
    if (specialities !== undefined) profile.specialities = Array.isArray(specialities) ? specialities : JSON.parse(specialities || "[]");
    if (whyBook !== undefined) profile.whyBook = Array.isArray(whyBook) ? whyBook : JSON.parse(whyBook || "[]");
    if (isAvailable !== undefined) profile.isAvailable = isAvailable === "true" || isAvailable === true;
    if (startingPrice !== undefined) profile.startingPrice = Number(startingPrice);
    if (oilLevel !== undefined) profile.oilLevel = oilLevel;
    if (spiceLevel !== undefined) profile.spiceLevel = spiceLevel;
    if (deliveryOption !== undefined) profile.deliveryOption = deliveryOption;
    if (city !== undefined) profile.city = city;
    if (area !== undefined) profile.area = area;
    if (pincode !== undefined) profile.pincode = pincode;
    if (fullAddress !== undefined) profile.fullAddress = fullAddress;

    if (cloudinaryAvatarUrl) {
      profile.avatar = cloudinaryAvatarUrl;
      await User.findByIdAndUpdate(req.user._id, { profileImage: cloudinaryAvatarUrl });
    }

    if (cloudinaryCoverUrl) {
      profile.coverImage = cloudinaryCoverUrl;
    }

    if (longitude !== undefined && latitude !== undefined) {
      profile.location = {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
      };
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error updating profile",
      error: error.message,
    });
  }
};

const getAllApprovedProviders = async (req, res) => {
  try {
    const providers = await ProviderProfile.find({ verificationStatus: "APPROVED" }).populate("user", "name email phone profileImage");
    res.status(200).json({
      success: true,
      count: providers.length,
      providers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching approved providers",
      error: error.message,
    });
  }
};

const getAllVerifiedProviders = async (req, res) => {
  try {
    const providers = await ProviderProfile.find({
      verificationStatus: "APPROVED",
      isAvailable: true,
    }).populate("user", "name email phone profileImage");

    res.status(200).json({
      success: true,
      count: providers.length,
      providers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching verified providers",
      error: error.message,
    });
  }
};

const getProviderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid provider ID format",
      });
    }

    const provider = await ProviderProfile.findById(id).populate("user", "name email phone profileImage");

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    res.status(200).json({
      success: true,
      provider,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching provider details",
      error: error.message,
    });
  }
};

const getUniqueLocations = async (req, res) => {
  try {
    const locations = await ProviderProfile.aggregate([
      {
        $match: {
          verificationStatus: "APPROVED",
          city: { $exists: true, $ne: "" },
          area: { $exists: true, $ne: "" }
        }
      },
      {
        $group: {
          _id: { city: "$city", area: "$area" }
        }
      },
      {
        $project: {
          _id: 0,
          city: "$_id.city",
          area: "$_id.area"
        }
      },
      {
        $sort: { city: 1, area: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      locations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching unique locations",
      error: error.message,
    });
  }
};

const reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'Shantabai-SaaS-Backend'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim returned status ${response.status}`);
    }

    const data = await response.json();
    const addr = data.address || {};
    const city = addr.city || addr.town || addr.village || addr.municipality || '';
    const area = addr.suburb || addr.neighbourhood || addr.residential || addr.city_district || '';

    res.status(200).json({
      success: true,
      city,
      area
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during reverse geocoding",
      error: error.message,
    });
  }
};


// ==========================================
// RESERVATION / ORDER MANAGEMENT CONTROLLERS
// ==========================================

const createOrder = async (req, res) => {
  try {
    const { foodItemId, quantity, customerNote } = req.body;
    const customerId = req.user.id;

    const food = await FoodItem.findById(foodItemId);
    if (!food) {
      return res.status(400).json({ success: false, message: "Food item not found" });
    }

    const now = new Date();
    if (food.expiryAt && food.expiryAt <= now) {
      return res.status(400).json({ success: false, message: "This listing has expired and cannot be reserved." });
    }

    const provider = await ProviderProfile.findById(food.provider);
    if (!provider) {
      return res.status(400).json({ success: false, message: "Provider not found" });
    }

    const unitPrice = food.price;
    const totalPrice = unitPrice * quantity;

    // 1. Atomically decrement stock quantity
    const updatedFood = await FoodItem.findOneAndUpdate(
      { _id: foodItemId, quantity: { $gte: quantity }, status: "available" },
      { $inc: { quantity: -quantity, ordersToday: 1 } },
      { new: true }
    );

    if (!updatedFood) {
      const currentStock = await FoodItem.findById(foodItemId);
      const stockMsg = currentStock && currentStock.quantity > 0 
        ? `Only ${currentStock.quantity} portions remaining.` 
        : "This dish is sold out.";
      return res.status(400).json({ success: false, message: stockMsg });
    }

    // 2. Mark item out of stock if quantity drops to 0
    if (updatedFood.quantity <= 0) {
      await FoodItem.findByIdAndUpdate(foodItemId, { $set: { status: "out" } });
    }

    // 3. Save reservation order record
    try {
      const order = new Order({
        customer: customerId,
        provider: provider._id,
        foodItem: food._id,
        quantity,
        unitPrice,
        totalPrice,
        customerNote: customerNote || "",
        pickupAddressSnapshot: provider.fullAddress || "Contact Provider",
        pickupWindowSnapshot: food.timeWindow || "Contact Provider",
        bringContainer: food.bringContainer,
        status: "PENDING",
        paymentMethod: "CASH_ON_PICKUP"
      });

      await order.save();

      // Fetch freshly structured provider metadata for live update broadcasts
      const fullyPopulatedFood = await FoodItem.findById(foodItemId).populate({
        path: "provider",
        select: "kitchenName tagline city area startingPrice rating isAvailable isSubscribed subscriptionPlan planType subscriptionStatus",
      });

      // 📡 Real-time Updates
      const io = getIO();
      if (io) {
        // Broadcast marketplace variations
        io.emit("food_listing_updated", {
          action: fullyPopulatedFood.quantity <= 0 || fullyPopulatedFood.status === "out" ? "DELETE" : "UPDATE",
          foodItem: fullyPopulatedFood,
        });

        // Notify specific provider screen
        io.emit(`order_update_provider_${provider._id}`, {
          action: "NEW_ORDER",
          order,
        });
      }

      res.status(201).json({
        success: true,
        message: "Reservation created successfully",
        order
      });
    } catch (orderError) {
      // Rollback database decrement changes on order errors
      const rollbackQuantity = quantity;
      const originalFood = await FoodItem.findById(foodItemId);
      const originalStatus = (originalFood && originalFood.quantity + rollbackQuantity > 0) ? "available" : "out";
      
      const revertedFood = await FoodItem.findByIdAndUpdate(
        foodItemId,
        {
          $inc: { quantity: rollbackQuantity, ordersToday: -1 },
          $set: { status: originalStatus }
        },
        { new: true }
      ).populate({
        path: "provider",
        select: "kitchenName tagline city area startingPrice rating isAvailable isSubscribed subscriptionPlan planType subscriptionStatus",
      });

      const io = getIO();
      if (io && revertedFood) {
        io.emit("food_listing_updated", {
          action: "UPDATE",
          foodItem: revertedFood,
        });
      }

      throw orderError;
    }
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create reservation"
    });
  }
};

const getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.user.id;
    const orders = await Order.find({ customer: customerId })
      .populate("provider", "kitchenName fullAddress phone avatar user")
      .populate("foodItem", "name images category bringContainer")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getProviderOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const provider = await ProviderProfile.findOne({ user: userId });
    
    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider profile not found" });
    }

    const orders = await Order.find({ provider: provider._id })
      .populate("customer", "name phone profileImage")
      .populate("foodItem", "name images category")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    let isAuthorized = false;

    if (order.customer.toString() === userId) {
      isAuthorized = true;
    } else {
      const provider = await ProviderProfile.findOne({ user: userId });
      if (provider && order.provider.toString() === provider._id.toString()) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: "Not authorized to update this order" });
    }

    const validStatuses = ["PENDING", "ACCEPTED", "PREPARING", "READY_FOR_PICKUP", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    // Re-adjust stock limits dynamically if order status changes to CANCELLED
    if (status === "CANCELLED" && order.status !== "CANCELLED") {
      const food = await FoodItem.findById(order.foodItem);
      if (food) {
        food.quantity += order.quantity;
        if (food.quantity > 0) {
          food.status = "available";
        }
        await food.save();

        const structuralFoodPayload = await FoodItem.findById(order.foodItem).populate({
          path: "provider",
          select: "kitchenName tagline city area startingPrice rating isAvailable isSubscribed subscriptionPlan planType subscriptionStatus",
        });

        const io = getIO();
        if (io && structuralFoodPayload) {
          io.emit("food_listing_updated", {
            action: "UPDATE",
            foodItem: structuralFoodPayload,
          });
        }
      }
    }

    if (status === "COMPLETED" && order.status !== "COMPLETED") {
      try {
        await creditWalletForOrder(order.provider, order);
        console.log(`💰 Wallet credited for order ${order._id}`);
      } catch (walletErr) {
        console.error("⚠️ Wallet credit failed for order", order._id, walletErr.message);
      }
    }

    order.status = status;
    await order.save();

    // 📡 Live-broadcast status variations explicitly to active listening dashboards
    const io = getIO();
    if (io) {
      const messagePayload = { action: "STATUS_UPDATE", order };
      io.emit(`order_update_customer_${order.customer}`, messagePayload);
      io.emit(`order_update_provider_${order.provider}`, messagePayload);
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  registerProvider,
  getMyProviderProfile,
  updateMyProviderProfile,
  getAllApprovedProviders,
  getAllVerifiedProviders,
  getProviderById,
  getUniqueLocations,
  reverseGeocode,
  createOrder,
  getCustomerOrders,
  getProviderOrders,
  updateOrderStatus
};