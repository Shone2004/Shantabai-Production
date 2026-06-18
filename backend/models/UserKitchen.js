const mongoose = require("mongoose");

const UserKitchenSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  planType: { type: String, enum: ["FREE", "GROWTH", "PREMIUM"], default: "FREE" },
  usedListings: { type: Number, default: 0 },
  totalListings: { type: Number, default: 20 }, // 20 for Free, 999999 for Unlimited
  
  // Razorpay Specifics
  razorpayCustomerId: { type: String },
  razorpaySubscriptionId: { type: String },
  subscriptionStatus: { type: String, default: "active" }, // active, cancelled, past_due
});

module.exports = mongoose.model("UserKitchen", UserKitchenSchema);