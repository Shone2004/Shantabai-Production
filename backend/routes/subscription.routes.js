const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const UserKitchen = require("../models/UserKitchen");

// Import your authentication middleware safely
const { authenticateUser } = require("../middleware/authMiddleware");

// Helper function to lazily initialize Razorpay safely once environment variables are injected
const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error(
      "CRITICAL CONFIG ERROR: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing from your .env file."
    );
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// Map your front-end plans to your Razorpay Dashboard Plan IDs
const PLAN_IDS = {
  GROWTH: process.env.RAZORPAY_GROWTH_PLAN_ID || "plan_GROWTH_PLAN_ID_FROM_DASHBOARD", 
  PREMIUM: process.env.RAZORPAY_PREMIUM_PLAN_ID || "plan_PREMIUM_PLAN_ID_FROM_DASHBOARD",
};

// 1. Get current subscription state for the logged-in user
router.get("/status", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    let kitchen = await UserKitchen.findOne({ userId });
    if (!kitchen) {
      kitchen = await UserKitchen.create({ 
        userId, 
        email: req.user.email || "chef@example.com",
        usedListings: 5 
      });
    }
    res.json(kitchen);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Initiate a recurring subscription request
router.post("/create-subscription", authenticateUser, async (req, res) => {
  const { planType } = req.body;
  const userId = req.user.id;

  if (planType === "FREE") {
    return res.status(400).json({ error: "Cannot buy a free plan directly." });
  }

  if (!PLAN_IDS[planType]) {
    return res.status(400).json({ error: "Invalid plan type specified." });
  }

  try {
    const razorpay = getRazorpayInstance();
    const subscription = await razorpay.subscriptions.create({
      plan_id: PLAN_IDS[planType],
      total_count: 12,
      quantity: 1,
      customer_notify: 1,
    });

    res.json({
      subscriptionId: subscription.id,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Verify Payment Signature securely on server (With temporary Local Mock support)
router.post("/verify-payment", authenticateUser, async (req, res) => {
  const { planType, razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;
  const userId = req.user.id;

  // --- START TEMPORARY MOCK BYPASS (Bypasses Razorpay initialization for fast UI popup testing) ---
  if (razorpay_signature === "mock_signature_passed") {
    const totalListings = planType === "PREMIUM" ? 999999 : 999999;
    
    await UserKitchen.findOneAndUpdate(
      { userId },
      {
        planType: planType,
        totalListings: totalListings,
        razorpaySubscriptionId: razorpay_subscription_id,
        subscriptionStatus: "active"
      },
      { new: true, upsert: true } // Ensures it creates/updates the record smoothly
    );
    return res.json({ success: true, message: "Mock subscription simulation successful!" });
  }
  // --- END TEMPORARY MOCK BYPASS ---

  // Standard Razorpay cryptographic verification fall-through loop
  try {
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "temp_fallback")
      .update(razorpay_payment_id + "|" + razorpay_subscription_id)
      .digest("hex");

    if (generatedSignature === razorpay_signature) {
      const totalListings = planType === "PREMIUM" ? 999999 : 999999;

      await UserKitchen.findOneAndUpdate(
        { userId },
        {
          planType: planType,
          totalListings: totalListings,
          razorpaySubscriptionId: razorpay_subscription_id,
          subscriptionStatus: "active"
        }
      );

      res.json({ success: true, message: "Subscription activated successfully!" });
    } else {
      res.status(400).json({ success: false, message: "Payment verification failed." });
    }
  } catch (cryptoErr) {
    res.status(500).json({ error: cryptoErr.message });
  }
});

module.exports = router;