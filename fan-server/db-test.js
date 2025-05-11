const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://assafmilner:Q6qQndxCDqiVu7TO@cluster0.r6ihawe.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ Connection failed:", err));