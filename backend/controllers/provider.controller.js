const User = require("../models/User");
const ProviderProfile = require("../models/ProviderProfile");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { uploadToCloudinary } = require("../utils/cloudinaryHelper");

// Generate JWT for immediate login upon registration
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// @desc    Register a new provider (User + ProviderProfile)
// @route   POST /api/providers/register
// @access  Public
const registerProvider = async (req, res) => {
  try {
    const {
      // User fields
      name,
      email,
      phone,
      password,
      // Provider profile fields
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
      dietaryType,
      serviceTypes,
    } = req.body;

    // 1. Basic validation — coordinates are optional (null until geocoding is implemented)
    if (!name || !email || !phone || !password || !kitchenName || !bio || experience === undefined || experience === null || experience === '' || !city || !area || !pincode || !fullAddress) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // 2. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Handle Image Uploads to Cloudinary (Base64 from body or Buffers from Multer files)
    let cloudinaryAvatarUrl = "";
    let cloudinaryAadharUrl = "";

    // 1. Check if avatar is uploaded via req.files (Multer)
    if (req.files && req.files.avatar) {
      const avatarFile = Array.isArray(req.files.avatar) ? req.files.avatar[0] : req.files.avatar;
      cloudinaryAvatarUrl = await uploadToCloudinary(avatarFile.buffer, "shantabai/avatars");
    } else if (req.file && req.file.fieldname === "avatar") {
      cloudinaryAvatarUrl = await uploadToCloudinary(req.file.buffer, "shantabai/avatars");
    } else if (avatar) {
      // Fallback: Check if sent as base64 string
      cloudinaryAvatarUrl = await uploadToCloudinary(avatar, "shantabai/avatars");
    }

    // 2. Check if aadhar document is uploaded
    if (req.files && req.files.aadhar) {
      const aadharFile = Array.isArray(req.files.aadhar) ? req.files.aadhar[0] : req.files.aadhar;
      cloudinaryAadharUrl = await uploadToCloudinary(aadharFile.buffer, "shantabai/documents");
    } else if (req.file && req.file.fieldname === "aadhar") {
      cloudinaryAadharUrl = await uploadToCloudinary(req.file.buffer, "shantabai/documents");
    } else if (aadharUrl) {
      cloudinaryAadharUrl = await uploadToCloudinary(aadharUrl, "shantabai/documents");
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create User
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "PROVIDER",
      profileImage: cloudinaryAvatarUrl,
    });

    // 5. Create ProviderProfile
    try {
      const providerProfile = await ProviderProfile.create({
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
        // Only set location if valid coordinates are provided
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
        verificationStatus: "PENDING",
      });

      // 6. Generate Token
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
      // Rollback user creation if profile creation fails
      await User.findByIdAndDelete(user._id);
      throw profileError;
    }
  } catch (error) {
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

    // Handle Image Uploads to Cloudinary (Base64 from body or Buffers from Multer files)
    let cloudinaryAvatarUrl = "";
    let cloudinaryCoverUrl = "";

    // 1. Process avatar upload if sent
    if (req.files && req.files.avatar) {
      const avatarFile = Array.isArray(req.files.avatar) ? req.files.avatar[0] : req.files.avatar;
      cloudinaryAvatarUrl = await uploadToCloudinary(avatarFile.buffer, "shantabai/avatars");
    } else if (avatar) {
      cloudinaryAvatarUrl = await uploadToCloudinary(avatar, "shantabai/avatars");
    }

    // 2. Process coverImage upload if sent
    if (req.files && req.files.coverImage) {
      const coverFile = Array.isArray(req.files.coverImage) ? req.files.coverImage[0] : req.files.coverImage;
      cloudinaryCoverUrl = await uploadToCloudinary(coverFile.buffer, "shantabai/covers");
    } else if (coverImage) {
      cloudinaryCoverUrl = await uploadToCloudinary(coverImage, "shantabai/covers");
    }

    // Update fields if provided
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
      // Keep User profileImage synced!
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

module.exports = {
  registerProvider,
  getMyProviderProfile,
  updateMyProviderProfile,
  getAllApprovedProviders,
  getProviderById,
};
