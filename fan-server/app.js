// fan-server/app.js (Updated with Friend routes)
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");
const proxyRouter = require('./proxy');
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const fixturesRoutes = require("./routes/fixtures"); 
const ticketRoutes = require("./routes/ticketRoutes");
const messageRoutes = require("./routes/messageRoutes");
const friendRoutes = require("./routes/friendRoutes"); // New import

dotenv.config();
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // עצור את השרת אם אין DB
  });
const app = express();

// Static files
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Middlewares
app.use(cors({
  origin: "http://localhost:3000",  // Frontend domain
  credentials: true                 // Allow cookies/headers
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/proxy', proxyRouter);
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/fixtures", fixturesRoutes); 
app.use("/api/tickets", ticketRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/friends", friendRoutes); // New route

// Root check
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

module.exports = app;