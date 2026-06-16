const mongoose = require("mongoose");

const connectDB = async () => {
try {
console.log("==================================");
console.log("Attempting MongoDB Connection...");
console.log("URI:", process.env.MONGO_URI);
console.log("==================================");


await mongoose.connect(process.env.MONGO_URI);

console.log("✅ MongoDB Connected");


} catch (error) {
console.error("❌ MongoDB Error:", error.message);

console.error("\n========== DEBUG INFO ==========");
console.error("Name:", error.name);
console.error("Code:", error.code);
console.error("Cause:", error.cause);

console.error("\n========== FULL ERROR ==========");
console.error(error);

process.exit(1);


}
};

module.exports = connectDB;
