const express = require("express");
const app = express();

console.log("🔥 SERVER LOADING...");

// אל תטען שום router עדיין
// ✅ בדיקה מדורגת של routes — כל פעם תבטל/תפעיל אחד

try {
  const proxyRouter = require('./proxy');
  app.use('/api/proxy', proxyRouter);
  console.log("✅ Loaded /api/proxy");
} catch (err) {
  console.error("❌ Failed loading /api/proxy:", err.message);
}

try {
  const authRoutes = require("./routes/auth");
  app.use("/api/auth", authRoutes);
  console.log("✅ Loaded /api/auth");
} catch (err) {
  console.error("❌ Failed loading /api/auth:", err.message);
}

try {
  const userRoutes = require("./routes/users");
  app.use("/api/users", userRoutes);
  console.log("✅ Loaded /api/users");
} catch (err) {
  console.error("❌ Failed loading /api/users:", err.message);
}

try {
  const postRoutes = require("./routes/postRoutes");
  app.use("/api/posts", postRoutes);
  console.log("✅ Loaded /api/posts");
} catch (err) {
  console.error("❌ Failed loading /api/posts:", err.message);
}

try {
  const commentRoutes = require("./routes/commentRoutes");
  app.use("/api/comments", commentRoutes);
  console.log("✅ Loaded /api/comments");
} catch (err) {
  console.error("❌ Failed loading /api/comments:", err.message);
}

try {
  const fixturesRoutes = require("./routes/fixtures");
  app.use("/api/fixtures", fixturesRoutes);
  console.log("✅ Loaded /api/fixtures");
} catch (err) {
  console.error("❌ Failed loading /api/fixtures:", err.message);
}

try {
  const ticketRoutes = require("./routes/ticketRoutes");
  app.use("/api/tickets", ticketRoutes);
  console.log("✅ Loaded /api/tickets");
} catch (err) {
  console.error("❌ Failed loading /api/tickets:", err.message);
}

try {
  const messageRoutes = require("./routes/messageRoutes");
  app.use("/api/messages", messageRoutes);
  console.log("✅ Loaded /api/messages");
} catch (err) {
  console.error("❌ Failed loading /api/messages:", err.message);
}

try {
  const friendRoutes = require("./routes/friendRoutes");
  app.use("/api/friends", friendRoutes);
  console.log("✅ Loaded /api/friends");
} catch (err) {
  console.error("❌ Failed loading /api/friends:", err.message);
}

try {
  const searchRoutes = require("./routes/search");
  app.use("/api/search", searchRoutes);
  console.log("✅ Loaded /api/search");
} catch (err) {
  console.error("❌ Failed loading /api/search:", err.message);
}

try {
  const leagueRoutes = require("./routes/leagueRoutes");
  app.use("/api/league", leagueRoutes);
  console.log("✅ Loaded /api/league");
} catch (err) {
  console.error("❌ Failed loading /api/league:", err.message);
}


app.get("/", (req, res) => {
  res.send("✅ SERVER STARTED CLEAN");
});

app.listen(3001, () => {
  console.log("✅ Listening on port 3001");
});
