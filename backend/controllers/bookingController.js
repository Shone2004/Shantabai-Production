const Order = require("../models/Order");
const FoodItem = require("../models/FoodItem");
const ProviderProfile = require("../models/ProviderProfile");
const mongoose = require("mongoose");

// Create a new reservation/order (Customer)
exports.createOrder = async (req, res) => {
  try {
    const { foodItemId, quantity, customerNote } = req.body;
    const customerId = req.user.id; // from auth middleware

    const food = await FoodItem.findById(foodItemId);
    if (!food) {
      return res.status(400).json({ success: false, message: "Food item not found" });
    }

    if (food.status !== "available" || food.quantity < quantity) {
      return res.status(400).json({ success: false, message: "Not enough quantity available" });
    }

    const provider = await ProviderProfile.findById(food.provider);
    if (!provider) {
      return res.status(400).json({ success: false, message: "Provider not found" });
    }

    const unitPrice = food.price;
    const totalPrice = unitPrice * quantity;

    // Create Order
    const order = new Order({
      customer: customerId,
      provider: provider._id,
      foodItem: food._id,
      quantity,
      unitPrice,
      totalPrice,
      customerNote: customerNote || "",
      pickupAddressSnapshot: provider.fullAddress || "Contact Provider",
      pickupWindowSnapshot: food.timeWindow || "Contact Provider",
      bringContainer: food.bringContainer,
      status: "PENDING",
      paymentMethod: "CASH_ON_PICKUP"
    });

    await order.save();

    // Update Food Quantity
    const newQuantity = food.quantity - quantity;
    const newStatus = newQuantity <= 0 ? "out" : food.status;
    
    await FoodItem.findByIdAndUpdate(food._id, {
      $inc: { quantity: -quantity, ordersToday: 1 },
      $set: { status: newStatus }
    });

    res.status(201).json({
      success: true,
      message: "Reservation created successfully",
      order
    });
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create reservation"
    });
  }
};

// Get Customer Orders
exports.getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.user.id;
    const orders = await Order.find({ customer: customerId })
      .populate("provider", "kitchenName fullAddress phone avatar")
      .populate("foodItem", "name images category bringContainer")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Provider Orders
exports.getProviderOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const provider = await ProviderProfile.findOne({ user: userId });
    
    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider profile not found" });
    }

    const orders = await Order.find({ provider: provider._id })
      .populate("customer", "name phone profileImage")
      .populate("foodItem", "name images category")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update Order Status (Provider)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const provider = await ProviderProfile.findOne({ user: userId });
    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider profile not found" });
    }

    const order = await Order.findOne({ _id: orderId, provider: provider._id });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const validStatuses = ["PENDING", "ACCEPTED", "PREPARING", "READY_FOR_PICKUP", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    // Handle cancellation: restore inventory
    if (status === "CANCELLED" && order.status !== "CANCELLED") {
      const food = await FoodItem.findById(order.foodItem);
      if (food) {
        food.quantity += order.quantity;
        if (food.quantity > 0) {
          food.status = "available";
        }
        await food.save();
      }
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
