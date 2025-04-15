const app = require("./app");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 3001;
const MONGO_URL = process.env.MONGO_URL;

// התחברות למסד הנתונים
mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB", err);
  });
