const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
console.log("🔑 JWT utils export:", require("../utils/jwt"));
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");

async function register(req, res) {
    try {
        const { name, email, password, favoriteTeam, location } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            favoriteTeam,
            location
          });
          res.status(201).json({message: "User registered successfully",
            user: {
              id: newUser._id,
              name: newUser.name,
              email: newUser.email,
              favoriteTeam: newUser.favoriteTeam,
              location: newUser.location,
              profilePicture: newUser.profilePicture,
            }
          });
    } catch (err) {
        if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
            return res.status(400).json({ error: "Email already in use" });
          }
        console.error(err);
        res.status(500).json({ error: "Registration failed" });
    }

}

async function login(req, res) {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
        }

        const payload = { id: user._id, role: user.role };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });

        res.json({
            accessToken,
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              favoriteTeam: user.favoriteTeam,
              location: user.location,
              profilePicture: user.profilePicture,
              role: user.role,
            }
          });




    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Login failed" });
      }
    }

    async function refreshToken(req, res) {
        try {
          const token = req.cookies.refreshToken;
          if (!token) {
            return res.status(401).json({ error: "No token provided" });
          }
          const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
          if (!payload) {
            return res.status(403).json({ error: "Invalid token" });
          }
          
          const newAccessToken = generateAccessToken({
            id: payload.id,
            role: payload.role
          });
          return res.json({ accessToken: newAccessToken });
        
        } catch (err) {
          console.error(err);
          res.status(403).json({ error: "Refresh failed" });
        }
      }
      



module.exports = {   
    register,
    login,
    refreshToken
};