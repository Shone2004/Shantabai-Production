const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProviderProfile",
      required: true,
    },
    foodItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodItem",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    customerNote: {
      type: String,
      default: "",
    },
    pickupAddressSnapshot: {
      type: String,
      required: true,
    },
    pickupWindowSnapshot: {
      type: String,
      default: "",
    },
    bringContainer: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: [
        "PENDING",
        "ACCEPTED",
        "PREPARING",
        "READY_FOR_PICKUP",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "PENDING",
    },
    paymentMethod: {
      type: String,
      enum: ["CASH_ON_PICKUP"],
      default: "CASH_ON_PICKUP",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster querying
orderSchema.index({ customer: 1 });
orderSchema.index({ provider: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model("Order", orderSchema);
