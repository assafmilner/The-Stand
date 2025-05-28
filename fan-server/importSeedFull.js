// ⚽ Matchday Full Seeder Script
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { v4: uuid } = require("uuid");

// Models (define inline)
const userSchema = new mongoose.Schema({
  _id: String,
  name: String,
  email: String,
  passwordHash: String,
  gender: String,
  profileImage: String,
  coverImage: String,
  favoriteTeam: String,
  communityId: String,
  friends: [String],
});

const postSchema = new mongoose.Schema({
  _id: String,
  authorId: String,
  communityId: String,
  text: String,
  media: [String],
  createdAt: Date,
});

const commentSchema = new mongoose.Schema({
  _id: String,
  postId: String,
  authorId: String,
  text: String,
  parentCommentId: String,
  createdAt: Date,
});

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);
const Comment = mongoose.model("Comment", commentSchema);

const MONGO_URL = process.env.MONGO_URL;

// ✅ מפת קבוצות: אנגלית → עברית + communityId
const teamMap = new Map([
  ["Maccabi Tel Aviv", { name: "מכבי תל אביב", communityId: "1" }],
  ["Hapoel Beer Sheva", { name: "הפועל באר שבע", communityId: "2" }],
  ["Maccabi Haifa", { name: "מכבי חיפה", communityId: "3" }],
  ["Beitar Jerusalem", { name: 'בית"ר ירושלים', communityId: "4" }],
  ["Hapoel Haifa", { name: "הפועל חיפה", communityId: "5" }],
  ["Maccabi Netanya", { name: "מכבי נתניה", communityId: "6" }],
  ["Hapoel Kiryat Shmona", { name: "הפועל קריית שמונה", communityId: "7" }],
  ["Maccabi Bnei Raina", { name: "מכבי בני ריינה", communityId: "8" }],
  ["Hapoel Jerusalem", { name: "הפועל ירושלים", communityId: "9" }],
  ["Ironi Tiberias", { name: "עירוני טבריה", communityId: "10" }],
  ["Maccabi Petach Tikva", { name: "מכבי פתח תקווה", communityId: "11" }],
  ["Bnei Sakhnin", { name: "בני סכנין", communityId: "12" }],
  ["FC Ashdod", { name: "מ.ס. אשדוד", communityId: "13" }],
  ["Hapoel Hadera", { name: "הפועל חדרה", communityId: "14" }],
  ["Hapoel Tel-Aviv",{name: "הפועל תל אביב", communityId: "25"}]

]);

// 🖼️ תמונות
const maleImages = [...Array(20).keys()].map(i => `https://randomuser.me/api/portraits/men/${10+i}.jpg`);
const femaleImages = [...Array(20).keys()].map(i => `https://randomuser.me/api/portraits/women/${10+i}.jpg`);
const postImages = [

  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
  
  "https://static.football.co.il/wp-content/themes/kingclub-theme/images/social-email.png",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeKeUuOj0qdkubvL9uT8LmFHoW7VV28B6izQ&s",
  "https://static.football.co.il/wp-content/uploads/2025/05/638eef98-ee16-44e5-84d9-35339e08f511.jpg",
  "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&h=600&fit=crop",
  "https://static.football.co.il/wp-content/themes/kingclub-theme/images/whitelogotext.svg",
  "https://static.football.co.il/wp-content/plugins/top-25-social-icons/images/circle/youtube.png",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4FcYWcqR7fEWgrzB1IMEzIyCzd9uTFRzSlA&s",
  "https://static.wixstatic.com/media/ba79ea_c4406527a47c4b49ae7185ed2071768f~mv2.jpg/v1/fill/w_640,h_512,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/ba79ea_c4406527a47c4b49ae7185ed2071768f~mv2.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeAkNo2CrDUytpR5PiV287mqlq1RgtjitpWQ&s"
];
const coverImages = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrXZ3REDB1DGYziuN0ZAxB9k7k-5FPjG42RA&s",
"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuD8LZnoAGgNjVaTwAWonKs0tlXwW1xSy3xA&s",
"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYbivubMsZ6-eDD8BtNwL2Or2vHYqrOVj24g&s",
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop",
  "https://static.football.co.il/wp-content/themes/kingclub-theme/images/social-fb.png",
  "https://static.football.co.il/wp-content/themes/kingclub-theme/images/social-youtube.png",
  "https://static.football.co.il/wp-content/themes/kingclub-theme/images/tiktok2.png",
  "https://images.unsplash.com/photo-1555618099-ee05ebe59862?w=800&h=600&fit=crop"
];
const postTexts = [
  "המשחק אתמול היה מדהים!", "איזה גול!!", "ההגנה שלנו חלשה מאוד לאחרונה",
  "אני מתרגש לקראת הדרבי", "צריך להחליף את המאמן", "מי בא למשחק בשבת?",
  "האצטדיון היה בטירוף", "גאה להיות אוהד", "שיחקנו חלש אבל ניצחנו", "מה אתם חושבים על הרכש החדש?"
];

const commentTexts = [
  "מסכים מאוד", "לא חושב ככה", "לדעתי זה היה ברור", "האווירה הייתה מושלמת", "מאמן טוב זה הכול",
  "ניצחון חשוב מאוד", "לא היינו טובים היום", "השופט אכזב", "השחקנים נתנו הכול", "כל הכבוד!"
];

const replyTexts = [
  "בדיוק!!", "צודק מאוד", "ממש לא מסכים", "הלוואי ונמשיך ככה", "נחכה ונראה"
];

const teams = Array.from(teamMap.keys());

const maleNames = ["יוסי", "רועי", "איתי", "מתן", "אדם", "ליאור", "עומר", "שחר", "נדב", "אלעד"];
const femaleNames = ["נועה", "שירה", "תמר", "מיכל", "מאיה", "דנה", "אור", "רוני", "טל", "איילת"];
const lastNames = ["כהן", "לוי", "פרץ", "ישראלי", "מלכה", "רוזן", "אביטל", "נחום", "זיו", "ברק"];

function randomName(gender) {
  const first = gender === "male" ? maleNames[Math.floor(Math.random()*maleNames.length)] :
                                     femaleNames[Math.floor(Math.random()*femaleNames.length)];
  const last = lastNames[Math.floor(Math.random()*lastNames.length)];
  return `${first} ${last}`;
}

function randomDate(daysBack = 14) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date;
}

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected!");

  await User.deleteMany({});
  await Post.deleteMany({});
  await Comment.deleteMany({});

  const users = [];
  const posts = [];
  const comments = [];
  const friendsMap = {};

  for (const team of teams) {
    const { name: favoriteTeam, communityId } = teamMap.get(team);
    const teamUsers = [];

    for (let i = 0; i < 20; i++) {
      const gender = i % 2 === 0 ? "male" : "female";
      const name = randomName(gender);
      const email = `user${team.replace(/ /g,'')}${i}@example.com`;
      const passwordHash = await bcrypt.hash("123456", 10);
   const user = new User({
  _id: uuid(),
  name,
  email,
  passwordHash,
  gender,
  profileImage: gender === "male"
    ? maleImages[Math.floor(Math.random() * maleImages.length)]
    : femaleImages[Math.floor(Math.random() * femaleImages.length)],
  coverImage: coverImages[Math.floor(Math.random() * coverImages.length)],
  favoriteTeam, // ← זה עכשיו בעברית
  communityId,
  friends: []
});

      users.push(user);
      teamUsers.push(user);
    }

    for (const user of teamUsers) {
      const otherIds = teamUsers.filter(u => u._id !== user._id).map(u => u._id);
      const friendIds = otherIds.sort(() => 0.5 - Math.random()).slice(0, 10 + Math.floor(Math.random()*5));
      user.friends = friendIds;
    }
  }

  await User.insertMany(users);
  console.log("Users inserted:", users.length);

  for (const user of users) {
    const numPosts = 3 + Math.floor(Math.random() * 5);
    for (let i = 0; i < numPosts; i++) {
      const post = new Post({
        _id: uuid(),
        authorId: user._id,
        communityId: user.communityId,
        text: postTexts[Math.floor(Math.random() * postTexts.length)],
        media: Math.random() < 0.3 ? [postImages[Math.floor(Math.random() * postImages.length)]] : [],
        createdAt: randomDate()
      });
      posts.push(post);
    }
  }

  await Post.insertMany(posts);
  console.log("Posts inserted:", posts.length);

  for (const post of posts) {
    const numComments = 4 + Math.floor(Math.random() * 5);
    const communityUsers = users.filter(u => u.communityId === post.communityId);
    const commenters = communityUsers.filter(u => u._id !== post.authorId);

    for (let i = 0; i < numComments && i < commenters.length; i++) {
      const cUser = commenters[i];
      const commentId = uuid();
      const comment = new Comment({
        _id: commentId,
        postId: post._id,
        authorId: cUser._id,
        text: commentTexts[Math.floor(Math.random()*commentTexts.length)],
        parentCommentId: null,
        createdAt: randomDate()
      });
      comments.push(comment);

      if (Math.random() < 0.4) {
        const replier = commenters[(i+1)%commenters.length];
        const reply = new Comment({
          _id: uuid(),
          postId: post._id,
          authorId: replier._id,
          text: replyTexts[Math.floor(Math.random()*replyTexts.length)],
          parentCommentId: commentId,
          createdAt: randomDate()
        });
        comments.push(reply);
      }
    }
  }

  await Comment.insertMany(comments);
  console.log("Comments inserted:", comments.length);

  mongoose.disconnect();
  console.log("✅ Done seeding!");
}

main().catch(err => console.error(err));
