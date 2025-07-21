// ### Auth Controller
// Contains authentication-related handlers: register, login, refresh, logout, email verification.

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");
const {
  generateVerificationToken,
  sendVerificationEmail,
} = require("../utils/email");

// ### Function: register
// Handles new user registration, including:
// - Email uniqueness check
// - Password hashing
// - Verification token generation
// - Sending verification email
async function register(req, res) {
  try {
    const {
      name,
      email,
      password,
      favoriteTeam,
      location,
      bio,
      gender,
      phone,
      birthDate,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const emailVerificationToken = generateVerificationToken();
    const emailVerificationTokenExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ); // 24 hours

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      favoriteTeam,
      location,
      bio,
      gender,
      phone,
      birthDate,
      isEmailVerified: false,
      emailVerificationToken,
      emailVerificationTokenExpires,
    });

    const emailSent = await sendVerificationEmail(
      email,
      emailVerificationToken,
      name
    );

    if (!emailSent) {
      console.error("Failed to send verification email");
    }

    res.status(201).json({
      message:
        "User registered successfully. Please check your email to verify your account.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        favoriteTeam: newUser.favoriteTeam,
        location: newUser.location,
        profilePicture: newUser.profilePicture,
        bio: newUser.bio,
        gender: newUser.gender,
        phone: newUser.phone,
        birthDate: newUser.birthDate,
        isEmailVerified: newUser.isEmailVerified,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
}

// ### Function: login
// Authenticates a user based on email and password.
// Requires email verification before proceeding.
// Issues access and refresh tokens, and sets a secure cookie.
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

    if (!user.isEmailVerified) {
      return res.status(401).json({
        error: "Please verify your email before logging in",
        emailVerificationRequired: true,
      });
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
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
}

// ### Function: refreshToken
// Verifies a valid refresh token cookie and issues a new access token.
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
      role: payload.role,
    });
    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error(err);
    res.status(403).json({ error: "Refresh failed" });
  }
}

// ### Function: logout
// Clears the refresh token cookie and ends the session.
async function logout(req, res) {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    });
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Logout failed" });
  }
}

// ### Function: verifyEmail
// Verifies the user's email using a token from the URL.
// Handles expiration, double-verification attempts, and malformed tokens.
async function verifyEmail(req, res) {
  try {
    const { token } = req.params;

    const userWithToken = await User.findOne({ emailVerificationToken: token });

    if (!userWithToken) {
      const userEmail = token.split("-")[0];
      const possiblyVerifiedUser = await User.findOne({
        email: { $regex: new RegExp(userEmail, "i") },
        isEmailVerified: true,
      });

      if (possiblyVerifiedUser) {
        return res.status(400).json({ error: "Email already verified" });
      }

      return res.status(400).json({ error: "Invalid verification token" });
    }

    if (
      userWithToken.emailVerificationTokenExpires &&
      userWithToken.emailVerificationTokenExpires < new Date()
    ) {
      return res.status(400).json({ error: "Verification token expired" });
    }

    if (userWithToken.isEmailVerified) {
      return res.status(400).json({ error: "Email already verified" });
    }

    userWithToken.isEmailVerified = true;
    userWithToken.emailVerificationToken = undefined;
    userWithToken.emailVerificationTokenExpires = undefined;
    await userWithToken.save();

    return res
      .status(200)
      .json({ message: "Email verified successfully! You can now log in." });
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ error: "Email verification failed" });
  }
}

// ### Function: resendVerificationEmail
// Sends a new verification email to users who have not yet verified their account.
async function resendVerificationEmail(req, res) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    const emailVerificationToken = generateVerificationToken();
    const emailVerificationTokenExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationTokenExpires = emailVerificationTokenExpires;
    await user.save();

    const emailSent = await sendVerificationEmail(
      email,
      emailVerificationToken,
      user.name
    );

    if (!emailSent) {
      return res
        .status(500)
        .json({ error: "Failed to send verification email" });
    }

    res.json({ message: "Verification email has been sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to resend verification email" });
  }
}

// ### Export: Auth controller methods
module.exports = {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  resendVerificationEmail,
};
