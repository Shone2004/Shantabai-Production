require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
console.log("AUTH ROUTES:", authRoutes);
const app = express();
app.get("/hello", (req, res) => {
  res.send("HELLO WORKS");
});
connectDB();

app.use(cors());
app.use(express.json());
app.use("/api/auth", (req, res, next) => {
  console.log("🔥 HIT AUTH:", req.method, req.url);
  next();
});
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("kp API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});