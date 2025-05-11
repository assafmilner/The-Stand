const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");
const proxyRouter = require('./proxy');
const postRoutes = require("./routes/postRoutes"); // ✨ הוספת ייבוא הפוסטים
const commentRoutes = require("./routes/commentRoutes");




dotenv.config();
const app = express();


// Static files
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Middlewares
app.use(cors({
  origin: "http://localhost:3000",  // רק הדומיין של הפרונטנד
  credentials: true                 // מאפשר שליחה של cookies / headers
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
app.use("/api/friends", require("./routes/friends"));

// Root check
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

module.exports = app;
