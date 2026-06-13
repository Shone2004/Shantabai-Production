require("dotenv").config();

const dns = require("dns");

// Force Google DNS
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const http = require("http");
const connectDB = require("./config/db");
const { initSocket } = require("./services/socketService");

const authRoutes = require("./routes/auth.routes");
const providerRoutes = require("./routes/provider.routes");
const foodRoutes = require("./routes/food.routes");
const adminRoutes = require("./routes/admin.routes");
const bookingRoutes = require("./routes/booking.routes");
const contactRoutes = require("./routes/contact.routes");
const chatRoutes = require("./routes/chat.routes");

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

app.get("/", (req, res) => {
  res.send("kp API Running");
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});