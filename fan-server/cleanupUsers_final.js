
require("dotenv").config();
const mongoose = require("mongoose");

const User = require("./models/User");
const Post = require("./models/Post");
const Comment = require("./models/Comment");
const Friend = require("./models/Friend");
const Message = require("./models/Message");

async function cleanupUsers() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("Connected to DB");

  // המשתמשים שרוצים להשאיר (ObjectId או string, בהתאם למבנה שלכם)
  // 🛑 רשום כאן את ה־_id של המשתמשים שאתה רוצה להשאיר (לא להימחק)
  const keepIds = [
    "6836160294a0b3559e9695ff",
    "683616bd94a0b3559e969612",

  ];

  const usersToDelete = await User.find({ _id: { $nin: keepIds } });
  const userIdsToDelete = usersToDelete.map(u => u._id);

  // מחיקת תגובות של אותם משתמשים
  const deletedComments = await Comment.deleteMany({ authorId: { $in: userIdsToDelete } });
  console.log(`🗑️ Deleted ${deletedComments.deletedCount} comments`);

  // מחיקת תגובות על פוסטים של המשתמשים שנמחקים
  const postsToDelete = await Post.find({ authorId: { $in: userIdsToDelete } });
  const postIdsToDelete = postsToDelete.map(p => p._id);

  const deletedCommentsOnPosts = await Comment.deleteMany({ postId: { $in: postIdsToDelete } });
  console.log(`🗑️ Deleted ${deletedCommentsOnPosts.deletedCount} comments on deleted posts`);

  // מחיקת הפוסטים
  const deletedPosts = await Post.deleteMany({ _id: { $in: postIdsToDelete } });
  console.log(`🗑️ Deleted ${deletedPosts.deletedCount} posts`);

  // מחיקת חברויות שכוללות את המשתמשים
  const deletedFriendships = await Friend.deleteMany({
    $or: [
      { senderId: { $in: userIdsToDelete } },
      { receiverId: { $in: userIdsToDelete } }
    ]
  });
  console.log(`🗑️ Deleted ${deletedFriendships.deletedCount} friendships`);

  // מחיקת הודעות בצ׳אט שנשלחו או התקבלו
  const deletedMessages = await Message.deleteMany({
    $or: [
      { sender: { $in: userIdsToDelete } },
      { receiver: { $in: userIdsToDelete } }
    ]
  });
  console.log(`🗑️ Deleted ${deletedMessages.deletedCount} chat messages`);

  // מחיקת המשתמשים עצמם
  const deletedUsers = await User.deleteMany({ _id: { $in: userIdsToDelete } });
  console.log(`🗑️ Deleted ${deletedUsers.deletedCount} users`);

  await mongoose.disconnect();
  console.log("✅ Cleanup complete!");
}

cleanupUsers().catch(err => {
  console.error("❌ Error during cleanup:", err);
  mongoose.disconnect();
});
