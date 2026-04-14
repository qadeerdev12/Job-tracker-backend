require('dns').setDefaultResultOrder('ipv4first');
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const jobRoutes = require("./routes/jobRoutes");
const app = express();

//Middleware
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use("/api/jobs", jobRoutes);
app.use("/api/test", testRoutes);
app.use("/api/auth", authRoutes);

// 🔌 Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected ✅");
  } catch (error) {
    console.error("Mongo Error:", error.message);
    process.exit(1);
  }
};

// Test route
app.get("/", (req, res) => {
  res.status(200).json({ message: "API is working" });
});

// Port
const PORT = process.env.PORT || 5001;

// 🚀 Start server ONLY after DB connects
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});