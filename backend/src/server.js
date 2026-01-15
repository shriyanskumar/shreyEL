const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

const app = express();

// CORS Configuration - Allow frontend origins
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "https://document-tracker-el.vercel.app",
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGIN,
  ].filter(Boolean),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

// Middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Database Connection with MongoDB Atlas support
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("Using existing MongoDB connection");
    return;
  }

  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/document-tracker";

    await mongoose.connect(mongoUri, {
      // These options are recommended for MongoDB Atlas
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log("✓ MongoDB connected successfully");
  } catch (err) {
    console.error("✗ MongoDB connection error:", err);
    throw err;
  }
};

// Connect to database
connectDB();

// Routes (to be added)
app.use("/api/auth", require("./routes/auth"));
app.use("/api/documents", require("./routes/documents"));
app.use("/api/users", require("./routes/users"));
app.use("/api/reminders", require("./routes/reminders"));
app.use("/api/summaries", require("./routes/summaries"));
app.use("/api/categories", require("./routes/categories"));

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "Document Tracker API",
    ai_service_url:
      process.env.AI_SERVICE_URL || "NOT SET - using localhost:5001",
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    status: err.status || 500,
  });
});

// Start Server (only in non-serverless environment)
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  const server = app.listen(PORT, () => {
    console.log(`\n🚀 Document Tracker API running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health\n`);
  });
}

// Export for Vercel serverless functions
module.exports = app;

module.exports = app;
