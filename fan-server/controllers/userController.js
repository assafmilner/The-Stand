const User = require("../models/User");
const bcrypt = require("bcryptjs");

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -refreshToken"
    );
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "חובה להזין סיסמה נוכחית וסיסמה חדשה" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "משתמש לא נמצא" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "הסיסמה הנוכחית שגויה" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "הסיסמה עודכנה בהצלחה" });
  } catch (err) {
    console.error("שגיאה בעדכון סיסמה:", err);
    res.status(500).json({ error: "שגיאה בשרת" });
  }
};

const updateProfileInfo = async (req, res) => {
  try {
    const { location, bio, phone } = req.body;

    const updateData = {};
    if (typeof location === "string") updateData.location = location;
    if (typeof bio === "string") updateData.bio = bio;
    if (typeof phone === "string") updateData.phone = phone;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
    });

    res.json({
      success: true,
      message: "הפרופיל עודכן בהצלחה",
      user: updatedUser,
    });
  } catch (err) {
    console.error("🔥 שגיאה בעדכון פרופיל:", err);
    res.status(500).json({
      success: false,
      error: "שגיאה בעדכון הפרופיל",
    });
  }
};

const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "לא הועלתה תמונה" });
    }

    const uploadResult = {
      secure_url: req.file.path,
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: uploadResult.secure_url },
      { new: true }
    ).select("-password -refreshToken");

    res.json({
      message: "תמונת פרופיל עודכנה בהצלחה",
      profilePicture: updatedUser.profilePicture,
    });
  } catch (err) {
    console.error("שגיאה בהעלאת תמונת פרופיל:", err);
    res.status(500).json({ error: "שגיאה בשרת" });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userID = req.user.id;
    await User.findByIdAndDelete(userID);
    res.json({ message: "החשבון נמחק בהצלחה" });
  } catch (err) {
    console.error("שגיאה במחיקת החשבון", err);
    res.status(500).json({ error: "שגיאה בשרת בעת מחיקת החשבון" });
  }
};

const uploadCoverImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "לא הועלתה תמונה" });
    }

    const uploadResult = {
      secure_url: req.file.path,
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { coverImage: uploadResult.secure_url },
      { new: true }
    ).select("-password -refreshToken");

    res.json({
      message: "תמונת קאבר עודכנה בהצלחה",
      coverImage: updatedUser.coverImage,
    });
  } catch (err) {
    console.error("שגיאה בהעלאת תמונת קאבר:", err);
    res.status(500).json({ error: "שגיאה בשרת" });
  }
};

const getPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select(
        "name profilePicture coverImage favoriteTeam location bio createdAt"
      )
      .lean();

    if (!user) {
      return res.status(404).json({ error: "משתמש לא נמצא" });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "שגיאה בשרת" });
  }
};

// עדכון module.exports להוסיף את הפונקציה החדשה
module.exports = {
  getCurrentUser,
  changePassword,
  updateProfileInfo,
  uploadProfilePicture,
  uploadCoverImage,
  deleteAccount,
  getPublicProfile,
};
