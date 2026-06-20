const Razorpay = require("razorpay");
const crypto = require("crypto");
const UserKitchen = require("../models/UserKitchen");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PLAN_IDS = {
  GROWTH: process.env.RAZORPAY_GROWTH_PLAN_ID, 
  PREMIUM: process.env.RAZORPAY_PREMIUM_PLAN_ID,
};

// @desc    Get subscription status
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user.id; // Pulled securely from Auth Middleware
    let kitchen = await UserKitchen.findOne({ userId });
    
    if (!kitchen) {
      kitchen = await UserKitchen.create({ 
        userId, 
        email: req.user.email,
        usedListings: 0 
      });
    }
    res.json(kitchen);
  } catch (err) {
    res.status(500).json({ error: "Server Error fetching status" });
  }
};

// @desc    Initiate Razorpay checkout session
exports.createSubscription = async (req, res) => {
  const { planType } = req.body;

  if (!PLAN_IDS[planType]) {
    return res.status(400).json({ error: "Invalid plan type requested" });
  }

  try {
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
};

/// @desc    Verify incoming Razorpay webhook / token payload
exports.verifyPayment = async (req, res) => {
  const { planType, razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;
  const userId = req.user.id;

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_payment_id + "|" + razorpay_subscription_id)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, message: "Payment manipulation detected." });
  }

  try {
    // 999999 acts as 'Unlimited' listings allocation
    const totalListings = 999999; 

    // 1. Update subscription ledger record
    await UserKitchen.findOneAndUpdate(
      { userId },
      {
        planType,
        totalListings,
        razorpaySubscriptionId: razorpay_subscription_id,
        subscriptionStatus: "active"
      }
    );

    // 2. ─── CRITICAL BRIDGE SYNCHRONIZATION ───
    // Update the Profile that the Food Items populate on the frontend feed
    const ProviderProfile = require("../models/ProviderProfile");
    await ProviderProfile.findOneAndUpdate(
      { user: userId },
      {
        isSubscribed: true,
        subscriptionPlan: planType // Stores "GROWTH" or "PREMIUM"
      }
    );

    res.json({ success: true, message: "Subscription upgraded successfully!" });
  } catch (err) {
    console.error("Payment sync database error:", err);
    res.status(500).json({ error: "Internal database update error" });
  }
};