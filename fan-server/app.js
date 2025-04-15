const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const path = require("path");
app.use("/assets", express.static(path.join(__dirname, "assets")));
// Middlewares
app.use(cors());
app.use(express.json()); // כדי לעבוד עם JSON



// בדיקה ראשונית
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

module.exports = app;
