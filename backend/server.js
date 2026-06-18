require("dotenv").config();

const dns = require("dns");

// Force Google DNS
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const http = require("http");
const connectDB = require("./config/db");
const { initSocket } = require("./services/socketService");

const authRoutes = require("./routes/auth.routes.js");
const providerRoutes = require("./routes/provider.routes.js");
const foodRoutes = require("./routes/food.routes.js");
const adminRoutes = require("./routes/admin.routes.js");
const bookingRoutes = require("./routes/booking.routes.js");
const contactRoutes = require("./routes/contact.routes.js");
const chatRoutes = require("./routes/chat.routes.js");
const supportRoutes = require("./routes/support.routes.js");
// Added subscription route import
const subscriptionRoutes = require("./routes/subscription.routes.js");

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

connectDB();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/support", supportRoutes);
// Registered subscription endpoint route handler
app.use("/api/subscription", subscriptionRoutes);

app.get("/", (req, res) => {
  res.send("kp API Running");
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});