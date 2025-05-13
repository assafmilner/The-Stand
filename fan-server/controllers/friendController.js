const Friend = require("../models/Friend");

// שליחת בקשת חברות
const sendRequest = async (req, res) => {
  console.log("📨 בקשת חברות מ:", req.user?.id, "אל:", req.params?.recipientId);

  const requesterId = req.user.id;
  const { recipientId } = req.params;

  try {
    const existing = await Friend.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId }
      ]
    });

    if (existing) {
      return res.status(400).json({ error: "כבר קיימת בקשה או שאתם חברים" });
    }

    const friendship = new Friend({
      requester: requesterId,
      recipient: recipientId,
      status: "pending",
    });

    await friendship.save();
    res.status(201).json({ message: "בקשת חברות נשלחה" });
  } catch (err) {
    console.error("שגיאה בשליחת בקשה:", err);
    res.status(500).json({ error: "שגיאה בשרת" });
  }
};

// ביטול בקשה או הסרת חבר
const cancelRequest = async (req, res) => {
  const requesterId = req.user.id;
  const { recipientId } = req.params;

  try {
    const friendship = await Friend.findOneAndDelete({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId }
      ]
    });

    if (!friendship) {
      return res.status(404).json({ error: "לא נמצאה בקשת חברות" });
    }

    res.json({ message: "קשר החברות בוטל" });
  } catch (err) {
    console.error("שגיאה בביטול בקשה:", err);
    res.status(500).json({ error: "שגיאה בשרת" });
  }
};

// אישור או סירוב לבקשה נכנסת
const respondToRequest = async (req, res) => {
  const recipientId = req.user.id;
  const { requesterId } = req.params;
  const { action } = req.body;

  if (!["accept", "decline"].includes(action)) {
    return res.status(400).json({ error: "פעולה לא חוקית" });
  }

  try {
    const friendship = await Friend.findOne({
      requester: requesterId,
      recipient: recipientId,
      status: "pending"
    });

    if (!friendship) {
      return res.status(404).json({ error: "לא נמצאה בקשה ממתינה" });
    }

    friendship.status = action === "accept" ? "accepted" : "declined";
    await friendship.save();

    res.json({ message: `הבקשה ${action === "accept" ? "אושרה" : "סורבה"}` });
  } catch (err) {
    console.error("שגיאה בטיפול בבקשה:", err);
    res.status(500).json({ error: "שגיאה בשרת" });
  }
};

// בדיקת סטטוס חברות בין משתמשים
const getFriendshipStatus = async (req, res) => {
  const userId = req.user.id;
  const { userId: otherUserId } = req.params;

  try {
    const friendship = await Friend.findOne({
      $or: [
        { requester: userId, recipient: otherUserId },
        { requester: otherUserId, recipient: userId }
      ]
    });

    if (!friendship) {
      return res.json({ status: "none" });
    }

    if (friendship.status === "pending") {
      if (friendship.requester.toString() === userId) {
        return res.json({ status: "outgoing" });
      } else {
        return res.json({ status: "incoming" });
      }
    }

    if (friendship.status === "accepted") {
      return res.json({ status: "friends" });
    }

    return res.json({ status: friendship.status });
  } catch (err) {
    console.error("שגיאה בבדיקת סטטוס חברות:", err);
    res.status(500).json({ error: "שגיאה בשרת" });
  }
};

// ייצוא כל הפונקציות
module.exports = {
  sendRequest,
  cancelRequest,
  respondToRequest,
  getFriendshipStatus,
};
