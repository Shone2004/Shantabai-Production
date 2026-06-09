const mongoose = require("mongoose");

const foodItemSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProviderProfile",
      required: [true, "Food item must belong to a provider (chef)"],
    },

    // Title of the food item (named "name" for frontend compatibility)
    name: {
      type: String,
      required: [true, "Food item title/name is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Food description is required"],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    pricePer: {
      type: String,
      default: "per plate", // e.g. "per plate", "per container", "per tiffin"
      trim: true,
    },

    category: {
      type: String,
      required: [true, "Cuisine/Category is required"],
      trim: true, // e.g. "North Indian", "South Indian", "Maharashtrian", "Healthy/Diet"
    },

    // Meal type: when this dish is served
    mealType: {
      type: String,
      enum: ["Breakfast", "Lunch", "Dinner", "Daily Tiffin", "Snack", "Festive / Event", "Baked Goods"],
      trim: true,
      default: "",
    },

    // Daily inventory constraints
    quantity: {
      type: Number,
      required: [true, "Available daily quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 10, // servings remaining today
    },

    totalQuantity: {
      type: Number,
      default: 10, // total servings prepared/offered today
      min: [0, "Total quantity cannot be negative"],
    },

    ordersToday: {
      type: Number,
      default: 0,
      min: [0, "Orders count cannot be negative"],
    },

    // Prep time and scheduling details
    prepTime: {
      type: Number, // in minutes
      required: [true, "Preparation time in minutes is required"],
      min: [0, "Preparation time cannot be negative"],
      default: 30,
    },

    timeWindow: {
      type: String, // e.g., "12:00 - 2:00 PM", "8:00 - 10:00 AM"
      default: "",
    },

    // Media
    images: {
      type: [String],
      default: [],
    },

    // Food properties
    isVeg: {
      type: Boolean,
      default: true,
    },

    bringContainer: {
      type: Boolean,
      default: false, // If true, customers must bring their own container
    },

    spicyLevel: {
      type: Number,
      enum: [0, 1, 2, 3], // 0: Mild, 1: Medium, 2: Hot, 3: Extra Hot
      default: 1,
    },

    tags: {
      type: [String],
      default: [], // e.g., ["Veg", "Healthy", "Homemade", "Authentic"]
    },

    // Availability status
    status: {
      type: String,
      enum: ["available", "out"],
      default: "available",
    },

    // Compliance & Admin Approval Status
    isApproved: {
      type: Boolean,
      default: false, // Set to false by default; needs admin approval
    },

    approvalStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property "title" as an alias to "name" for strict requirement compliance
foodItemSchema.virtual("title").get(function () {
  return this.name;
});
foodItemSchema.virtual("title").set(function (val) {
  this.name = val;
});

// Virtual schema to output details format matching frontend `availabilityDetails`
foodItemSchema.virtual("availabilityDetails").get(function () {
  return {
    isAvailable: this.status === "available" && this.quantity > 0,
    ordersToday: this.ordersToday,
    left: this.quantity,
    total: this.totalQuantity,
  };
});

// Indexes
foodItemSchema.index({ provider: 1 });
foodItemSchema.index({ category: 1 });
foodItemSchema.index({ mealType: 1 });
foodItemSchema.index({ status: 1 });
foodItemSchema.index({ price: 1 });
foodItemSchema.index({ isVeg: 1 });
foodItemSchema.index({ isApproved: 1 });
foodItemSchema.index({ approvalStatus: 1 });

// Compound indexes for optimization
foodItemSchema.index({ provider: 1, status: 1 }); // Finding a chef's available items quickly
foodItemSchema.index({ category: 1, status: 1, price: 1 }); // Filter/Sort menus

// Text index for searches matching food name/description
foodItemSchema.index({
  name: "text",
  description: "text",
  category: "text",
  tags: "text",
});

module.exports = mongoose.model("FoodItem", foodItemSchema);
