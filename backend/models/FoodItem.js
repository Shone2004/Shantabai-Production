const mongoose = require("mongoose");

const foodItemSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProviderProfile",
      required: [true, "Food item must belong to a provider (chef)"],
    },
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
      default: "per plate",
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Cuisine/Category is required"],
      trim: true,
    },
    mealType: {
      type: String,
      enum: ["", "Breakfast", "Lunch", "Dinner", "Daily Tiffin", "Snack", "Festive / Event", "Baked Goods"],
      trim: true,
      default: "",
    },
    quantity: {
      type: Number,
      required: [true, "Available daily quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 10,
    },
    totalQuantity: {
      type: Number,
      default: 10,
      min: [0, "Total quantity cannot be negative"],
    },
    ordersToday: {
      type: Number,
      default: 0,
      min: [0, "Orders count cannot be negative"],
    },
    prepTime: {
      type: Number,
      required: [true, "Preparation time in minutes is required"],
      min: [0, "Preparation time cannot be negative"],
      default: 30,
    },
    serviceDate: {
      type: Date,
      required: [true, "Service date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
    },
    expiryAt: {
      type: Date,
      index: true,
    },
    timeWindow: {
      type: String,
      default: "",
    },
    images: {
      type: [String],
      default: [],
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    bringContainer: {
      type: Boolean,
      default: false,
    },
    spicyLevel: {
      type: Number,
      enum: [0, 1, 2, 3],
      default: 1,
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["available", "out"],
      default: "available",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvalStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        userName: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals
foodItemSchema.virtual("title").get(function () { return this.name; });
foodItemSchema.virtual("title").set(function (val) { this.name = val; });

foodItemSchema.virtual("availabilityDetails").get(function () {
  return {
    isAvailable: this.status === "available" && this.quantity > 0,
    ordersToday: this.ordersToday,
    left: this.quantity,
    total: this.totalQuantity,
  };
});

foodItemSchema.virtual("isSubscribedChef").get(function () {
  if (this.provider && typeof this.provider === "object") {
    return !!(this.provider.isSubscribed || this.provider.subscriptionPlan === "premium");
  }
  return false;
});

// Middleware: Auto-calculate average rating before saving
foodItemSchema.pre("save", async function () {
  if (this.reviews && this.reviews.length > 0) {
    const total = this.reviews.reduce((acc, rev) => acc + rev.rating, 0);
    this.averageRating = Number((total / this.reviews.length).toFixed(1));
  } else {
    this.averageRating = 0;
  }
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
foodItemSchema.index({ provider: 1, status: 1 });
foodItemSchema.index({ category: 1, status: 1, price: 1 });
foodItemSchema.index({ status: 1, approvalStatus: 1, expiryAt: 1 });
foodItemSchema.index({
  name: "text",
  description: "text",
  category: "text",
  tags: "text",
});

module.exports = mongoose.model("FoodItem", foodItemSchema);