const router = require("express").Router();
const authMiddleware = require("../middlewares/auth");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// דוגמה ל־route שמחזיר את הפרופיל הנוכחי
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password -refreshToken");
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/register", async (req, res) => {
  const { name, email, password, favoriteTeam, location } = req.body;

  if (!name || !email || !password || !favoriteTeam || !location) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const existingUser = await User.findOne({ email });
  
  if (existingUser) {
    return res.status(409).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    favoriteTeam,
    location,
  });
  await newUser.save();

  const accessToken = jwt.sign(
    { id: newUser._id, role: newUser.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.status(201).json({
    message: "User registered successfully!",
    accessToken,
  });
  

  console.log("📥 REGISTER BODY:", req.body);

  res.status(201).json({ message: "User registered successfully!" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  } 

  const user = await User.findOne({ email });
  if(!user) {
    return res.status(401).json({ message: "Invalid credentials"});
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if(!isMatch) {
    return res.status(401).json({message: "Invalid credentials"});
  }
  
  const accessToken = jwt.sign(
    {id: user._id, role: user.role },
    process.env.JWT_SECRET,
    {expiresIn: "1h"}
  );
  res.status(200).json({
    message: "Login successful",
    accessToken,
  });
  
});


module.exports = router;
