const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ProviderProfile = require("../models/ProviderProfile");

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find User
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate Token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    let userObj = user.toObject();
    if (user.role === "PROVIDER") {
      const profile = await ProviderProfile.findOne({ user: user._id });
      if (profile) {
        userObj.verificationStatus = profile.verificationStatus;
        userObj.isVerified = profile.isVerified;
        userObj.kitchenName = profile.kitchenName;
      } else {
        userObj.verificationStatus = "PENDING";
        userObj.isVerified = false;
      }
    }

    res.status(200).json({
      success: true,
      token,
      user: userObj,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    // req.user is set in authenticateUser middleware
    let userObj = req.user.toObject();

    if (req.user.role === "PROVIDER") {
      const profile = await ProviderProfile.findOne({ user: req.user._id });
      if (profile) {
        userObj.verificationStatus = profile.verificationStatus;
        userObj.isVerified = profile.isVerified;
        userObj.kitchenName = profile.kitchenName;
      } else {
        userObj.verificationStatus = "PENDING";
        userObj.isVerified = false;
      }
    }

    res.status(200).json({
      success: true,
      user: userObj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};