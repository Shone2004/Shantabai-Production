const mongoose = require("mongoose");

const providerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // 1-to-1 relationship with User
    },

    // Kitchen & Brand Details
    kitchenName: {
      type: String,
      required: [true, "Kitchen name is required"],
      trim: true,
    },

    tagline: {
      type: String,
      trim: true,
      default: "",
    },

    bio: {
      type: String,
      required: [true, "Chef bio is required"],
      minlength: [20, "Bio must be at least 20 characters"],
      trim: true,
    },

    experience: {
      type: Number,
      required: [true, "Years of experience is required"],
      min: [0, "Experience cannot be negative"],
    },

    specialities: {
      type: [String],
      default: [],
    },

    whyBook: {
      type: [String],
      default: [
        "FSSAI Registered Kitchen",
        "Oil-controlled, low-spice options",
        "Fresh ingredients sourced daily",
      ],
    },

    // Media
    avatar: {
      type: String,
      default: "",
    },

    coverImage: {
      type: String,
      default: "",
    },

    // Verification Status
    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"],
      default: "PENDING",
    },

    aadharUrl: {
      type: String, // Path to stored Aadhar PDF/Image
      default: "",
    },

    // Operational Status
    isAvailable: {
      type: Boolean,
      default: true,
    },

    // Ratings & Performance Metrics
    rating: {
      type: Number,
      default: 5.0,
      min: [1.0, "Rating cannot be below 1.0"],
      max: [5.0, "Rating cannot be above 5.0"],
      set: (val) => Math.round(val * 10) / 10, // Round to 1 decimal place
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    repeatRate: {
      type: String,
      default: "100%",
    },

    startingPrice: {
      type: Number,
      default: 0,
      min: [0, "Starting price cannot be negative"],
    },

    // Customer customization options
    oilLevel: {
      type: String,
      enum: ["Low Oil", "Normal", "Extra"],
      default: "Normal",
    },

    spiceLevel: {
      type: String,
      enum: ["Mild", "Medium", "Spicy"],
      default: "Medium",
    },

    deliveryOption: {
      type: String,
      enum: ["Pick Up", "Delivery", "Both"],
      default: "Both",
    },

    // Location details
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },

    area: {
      type: String,
      required: [true, "Area/Locality is required"],
      trim: true,
    },

    pincode: {
      type: String,
      required: [true, "Pincode is required"],
      trim: true,
    },

    fullAddress: {
      type: String,
      required: [true, "Full kitchen address is required"],
      trim: true,
    },

    // Dietary types this provider caters to
    dietaryType: {
      type: [String],
      enum: ["Veg", "Non-Veg", "Vegan"],
      default: [],
    },

    // Service types this provider offers
    serviceTypes: {
      type: [String],
      enum: ["Home Delivery", "Pickup", "Event Catering", "Daily Tiffin Service"],
      default: [],
    },

    // Geospatial Coordinates for proximity searching (near customer)
    // Optional until geocoding is implemented
   // Geospatial Coordinates for proximity searching (optional)
location: {
  type: {
    type: String,
    enum: ["Point"],
    required: false,
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: false,
    validate: {
      validator: function (coords) {
        // Allow missing coordinates
        if (!coords || coords.length === 0) return true;

        if (coords.length !== 2) return false;

        const [lng, lat] = coords;

        return (
          lng >= -180 &&
          lng <= 180 &&
          lat >= -90 &&
          lat <= 90
        );
      },
      message:
        "Coordinates must be a valid [longitude, latitude] pair.",
    },
  },
},

  },
  {
    timestamps: true,
  }
);
// Indexes
// Unique index for the 1-to-1 relationship is handled implicitly by user: { unique: true }
// Single field indexes for filters
providerProfileSchema.index({ city: 1 });
providerProfileSchema.index({ area: 1 });
providerProfileSchema.index({ pincode: 1 });
providerProfileSchema.index({ verificationStatus: 1 });
providerProfileSchema.index({ isAvailable: 1 });

// Geospatial index for nearby chef discovery searches
providerProfileSchema.index({ location: "2dsphere" });

// Text Index for full text search by name, cuisines, or specialities
providerProfileSchema.index({
  kitchenName: "text",
  tagline: "text",
  bio: "text",
  specialities: "text",
});

module.exports = mongoose.model("ProviderProfile", providerProfileSchema);
