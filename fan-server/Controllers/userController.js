const User = require("../models/User");
const bcrypt = require("bcryptjs");

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -refreshToken");
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
      return res.status(400).json({ error: "חובה להזין סיסמה נוכחית וסיסמה חדשה" });
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

const updateLocation = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "משתמש לא נמצא" });

    user.location = req.body.location;
    await user.save();

    res.json({ message: "המיקום עודכן בהצלחה", location: user.location });
  } catch (err) {
    console.error("שגיאה בעדכון מיקום:", err);
    res.status(500).json({ error: "שגיאה בשרת" });
  }
};

module.exports = {
  getCurrentUser,
  changePassword,
  updateLocation,
};
