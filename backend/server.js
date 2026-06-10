require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const providerRoutes = require("./routes/provider.routes");
const foodRoutes = require("./routes/food.routes");
const adminRoutes = require("./routes/admin.routes");
const bookingRoutes = require("./routes/booking.routes");

console.log("AUTH ROUTES:", authRoutes);
console.log("PROVIDER ROUTES:", providerRoutes);
console.log("FOOD ROUTES:", foodRoutes);
console.log("ADMIN ROUTES:", adminRoutes);
console.log("BOOKING ROUTES:", bookingRoutes);
const app = express();
app.get("/hello", (req, res) => {
  res.send("HELLO WORKS");
});
connectDB();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/api/auth", (req, res, next) => {
  console.log("🔥 HIT AUTH:", req.method, req.url);
  next();
});
app.use("/api/auth", authRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/", (req, res) => {
  res.send("kp API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});