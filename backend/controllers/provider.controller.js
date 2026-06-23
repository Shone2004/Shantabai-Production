const User = require("../models/User");
const ProviderProfile = require("../models/ProviderProfile");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { uploadToCloudinary } = require("../utils/cloudinaryHelper");
const Counter = require("../models/Counter");
// Generate JWT for immediate login upon registration
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// @desc    Register a new provider (User + ProviderProfile)
// @route   POST /api/providers/register
// @access  Public
const generateChefId = async (fullName, city) => {
  const names = fullName.trim().split(" ");

  const firstInitial = names[0]?.charAt(0).toUpperCase() || "X";

  const secondInitial =
    names.length > 1
      ? names[names.length - 1].charAt(0).toUpperCase()
      : "X";

  const counter = await Counter.findOneAndUpdate(
    { name: "chef" },
    { $inc: { seq: 1 } },
    {
      new: true,
      upsert: true,
    }
  );

  const sequence = String(counter.seq).padStart(5, "0");

  const cityCode = city
    .substring(0, 3)
    .toUpperCase()
    .replace(/\s/g, "");

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

// @desc    Get current provider's profile
// @route   GET /api/providers/me
// @access  Private (Provider only)
const getMyProviderProfile = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({ user: req.user._id }).populate("user", "-password");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching profile",
      error: error.message,
    });
  }
};

// @desc    Update current provider's profile
// @route   PUT /api/providers/me
// @access  Private (Provider only)
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

// @desc    Get all approved providers
// @route   GET /api/providers
// @access  Public
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

// @desc    Get single provider profile by ID
// @route   GET /api/providers/:id
// @access  Public
const getProviderById = async (req, res) => {
  try {
    const { id } = req.params;
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

// @desc    Get unique locations of approved providers
// @route   GET /api/providers/locations
// @access  Public
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

// @desc    Reverse geocode coordinates using OpenStreetMap Nominatim
// @route   GET /api/providers/reverse-geocode
// @access  Public
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

module.exports = {
  registerProvider,
  getMyProviderProfile,
  updateMyProviderProfile,
  getAllApprovedProviders,
  getProviderById,
  getUniqueLocations,
  reverseGeocode,
};