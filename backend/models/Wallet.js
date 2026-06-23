const mongoose = require("mongoose");

// ── Transaction sub-document ──────────────────────────────────────────────────
const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["CREDIT", "DEBIT", "WITHDRAWAL", "REFUND"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"],
    },
    // Amount before platform fee (gross)
    grossAmount: {
      type: Number,
      default: 0,
    },
    platformFee: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    // Reference to the order that triggered this transaction (if any)
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "COMPLETED",
    },
  },
  { timestamps: true }
);

// ── Withdrawal request sub-document ──────────────────────────────────────────
const withdrawalSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: [100, "Minimum withdrawal is ₹100"],
    },
    bankName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    ifscCode: { type: String, required: true, trim: true },
    accountHolderName: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "PAID"],
      default: "PENDING",
    },
    adminNote: { type: String, default: "" },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// ── Wallet document ───────────────────────────────────────────────────────────
const walletSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProviderProfile",
      required: true,
      unique: true,
    },
    // Current available balance (after platform fee, after withdrawals)
    balance: {
      type: Number,
      default: 0,
      min: [0, "Balance cannot go negative"],
    },
    // Lifetime gross earnings (before platform fee)
    totalEarningsGross: {
      type: Number,
      default: 0,
    },
    // Lifetime net earnings (after platform fee)
    totalEarningsNet: {
      type: Number,
      default: 0,
    },
    // Total amount withdrawn successfully
    totalWithdrawn: {
      type: Number,
      default: 0,
    },
    // Platform fee percentage (default 10%)
    platformFeePercent: {
      type: Number,
      default: 10,
    },
    transactions: [transactionSchema],
    withdrawalRequests: [withdrawalSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wallet", walletSchema);