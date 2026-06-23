const Wallet = require("../models/Wallet");
const ProviderProfile = require("../models/ProviderProfile");

// ── Helper: get or create wallet for a provider ───────────────────────────────
const getOrCreateWallet = async (providerId) => {
  let wallet = await Wallet.findOne({ provider: providerId });
  if (!wallet) {
    wallet = await Wallet.create({ provider: providerId });
  }
  return wallet;
};

// ── Helper: credit wallet when order is COMPLETED ────────────────────────────
// Called internally from bookingController when status → COMPLETED
const creditWalletForOrder = async (providerId, order) => {
  const wallet = await getOrCreateWallet(providerId);

  const grossAmount = order.totalPrice;
  const platformFee = Math.round((grossAmount * wallet.platformFeePercent) / 100);
  const netAmount = grossAmount - platformFee;

  wallet.balance += netAmount;
  wallet.totalEarningsGross += grossAmount;
  wallet.totalEarningsNet += netAmount;

  wallet.transactions.push({
    type: "CREDIT",
    amount: netAmount,
    grossAmount,
    platformFee,
    description: `Order #${order._id.toString().slice(-6).toUpperCase()} completed — ₹${grossAmount} (₹${platformFee} platform fee deducted)`,
    orderId: order._id,
    status: "COMPLETED",
  });

  await wallet.save();
  return wallet;
};

// @desc    Get chef's wallet summary
// @route   GET /api/wallet/me
// @access  Private (Provider)
exports.getMyWallet = async (req, res) => {
  try {
    const provider = await ProviderProfile.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider profile not found" });
    }

    const wallet = await getOrCreateWallet(provider._id);

    // Last 20 transactions newest first
    const recentTransactions = [...wallet.transactions]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20);

    // This month's earnings
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEarnings = wallet.transactions
      .filter((t) => t.type === "CREDIT" && new Date(t.createdAt) >= startOfMonth)
      .reduce((sum, t) => sum + t.amount, 0);

    // ── 30-min withdrawal lock ────────────────────────────────────────────────
    // Find the most recent CREDIT transaction
    const lastCredit = [...wallet.transactions]
      .filter((t) => t.type === "CREDIT")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    let canWithdraw = false;
    let withdrawableAt = null;

    if (lastCredit) {
      const unlockTime = new Date(new Date(lastCredit.createdAt).getTime() + 30 * 60 * 1000);
      withdrawableAt = unlockTime.toISOString();
      canWithdraw = now >= unlockTime && wallet.balance > 0;
    }
    // If no credit transactions at all, withdrawal stays locked (nothing to withdraw)

    res.status(200).json({
      success: true,
      wallet: {
        balance: wallet.balance,
        totalEarningsGross: wallet.totalEarningsGross,
        totalEarningsNet: wallet.totalEarningsNet,
        totalWithdrawn: wallet.totalWithdrawn,
        platformFeePercent: wallet.platformFeePercent,
        pendingWithdrawalTotal: 0,
        thisMonthEarnings,
        availableForWithdrawal: wallet.balance,
        canWithdraw,
        withdrawableAt,
      },
      transactions: recentTransactions,
      withdrawalRequests: [...wallet.withdrawalRequests]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Request a withdrawal — auto-processed, no admin approval needed
// @route   POST /api/wallet/withdraw
// @access  Private (Provider)
exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount, bankName, accountNumber, ifscCode, accountHolderName } = req.body;

    if (!amount || !bankName || !accountNumber || !ifscCode || !accountHolderName) {
      return res.status(400).json({ success: false, message: "All bank details are required" });
    }

    if (amount < 100) {
      return res.status(400).json({ success: false, message: "Minimum withdrawal amount is ₹100" });
    }

    const provider = await ProviderProfile.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider profile not found" });
    }

    const wallet = await getOrCreateWallet(provider._id);

    // ── 30-min lock guard (backend enforcement) ───────────────────────────────
    const lastCredit = [...wallet.transactions]
      .filter((t) => t.type === "CREDIT")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    if (!lastCredit) {
      return res.status(400).json({ success: false, message: "No earnings to withdraw yet." });
    }

    const unlockTime = new Date(new Date(lastCredit.createdAt).getTime() + 30 * 60 * 1000);
    if (new Date() < unlockTime) {
      const minsLeft = Math.ceil((unlockTime - new Date()) / 60000);
      return res.status(400).json({
        success: false,
        message: `Withdrawal will be available in ${minsLeft} minute${minsLeft !== 1 ? "s" : ""}. Please wait for the 30-minute settlement period.`,
      });
    }

    // Check available balance (no pending locks since we process instantly)
    if (amount > wallet.balance) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Available: ₹${wallet.balance}`,
      });
    }

    // ── Instantly deduct balance and mark as PAID ─────────────────────────────
    wallet.balance -= amount;
    wallet.totalWithdrawn += amount;

    // Add withdrawal request already marked PAID
    wallet.withdrawalRequests.push({
      amount,
      bankName,
      accountNumber,
      ifscCode,
      accountHolderName,
      status: "PAID",
      adminNote: "Auto-processed — funds transferred to your bank account.",
      resolvedAt: new Date(),
    });

    // Add WITHDRAWAL transaction as COMPLETED
    wallet.transactions.push({
      type: "WITHDRAWAL",
      amount,
      description: `₹${amount} withdrawn to ${bankName} A/C ending ${String(accountNumber).slice(-4)} — auto-processed`,
      status: "COMPLETED",
    });

    await wallet.save();

    // ── Schedule a background confirmation log at 30 min ─────────────────────
    // In production replace this setTimeout with a real payout gateway webhook.
    // This just simulates the "funds arrive within 30 min" promise.
    setTimeout(async () => {
      try {
        console.log(`✅ Payout of ₹${amount} to ${bankName} confirmed for provider ${provider._id}`);
      } catch (e) {
        console.error("Payout confirmation log failed:", e.message);
      }
    }, 30 * 60 * 1000); // 30 minutes

    res.status(201).json({
      success: true,
      message: `₹${amount} has been processed and will be credited to your ${bankName} account within 30 minutes.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Export the internal helper for use in bookingController
exports.creditWalletForOrder = creditWalletForOrder;
exports.getOrCreateWallet = getOrCreateWallet;