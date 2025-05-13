const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Import models
const User = require("./models/User");
const Post = require("./models/Post");
const Comment = require("./models/Comment");

// Profile pictures array (using placeholder services)
const profilePictures = [
  "https://randomuser.me/api/portraits/men/1.jpg",
  "https://randomuser.me/api/portraits/men/2.jpg",
  "https://randomuser.me/api/portraits/men/3.jpg",
  "https://randomuser.me/api/portraits/men/4.jpg",
  "https://randomuser.me/api/portraits/men/5.jpg",
  "https://randomuser.me/api/portraits/men/6.jpg",
  "https://randomuser.me/api/portraits/men/7.jpg",
  "https://randomuser.me/api/portraits/men/8.jpg",
  "https://randomuser.me/api/portraits/men/9.jpg",
  "https://randomuser.me/api/portraits/men/10.jpg",
  "https://randomuser.me/api/portraits/women/1.jpg",
  "https://randomuser.me/api/portraits/women/2.jpg",
  "https://randomuser.me/api/portraits/women/3.jpg",
  "https://randomuser.me/api/portraits/women/4.jpg",
  "https://randomuser.me/api/portraits/women/5.jpg",
  "https://randomuser.me/api/portraits/women/6.jpg",
  "https://randomuser.me/api/portraits/women/7.jpg",
  "https://randomuser.me/api/portraits/women/8.jpg",
  "https://randomuser.me/api/portraits/women/9.jpg",
  "https://randomuser.me/api/portraits/women/10.jpg",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
];

// Minimal database connection
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL.replace("<MONGO_PASSWORD>", process.env.MONGO_PASSWORD));
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to database:", error);
    process.exit(1);
  }
}

// Create sample users
async function createSampleUsers() {
  console.log("Creating sample users...");
  
  const teams = [
    "הפועל תל אביב",
    "מכבי תל אביב", 
    "הפועל באר שבע",
    "מכבי חיפה",
    'בית"ר ירושלים',
    "בני יהודה",
    "מכבי נתניה",
    "הפועל חיפה",
    "הפועל ירושלים",
    "עירוני קרית שמונה"
  ];
  
  const locations = ["צפון", "מרכז", "דרום", "ירושלים", "אחר"];
  
  const israeliNames = [
    "יוסי כהן", "מירב לוי", "דוד גולדמן", "נעמה ישראלי", "עמיר מלכה",
    "שרה אברהם", "משה רוזן", "יעל נחמיאס", "רון ביטון", "נועה שמיר",
    "איתי כרמי", "מיכל דניאלס", "אלעד זיו", "תמר יוסף", "גל מור",
    "לינוי כהן", "אייל פרידמן", "רותם יעקב", "נועם שלום", "הדר אדם",
    "שחר בן דוד", "מעיין גבע", "אריאל שפירא", "נגה זהבי", "רומן רוס",
    "ליבי דגן", "עמית ברוך", "שני פנחס", "עידו כץ", "מאיה אמור",
    "אסף זר", "שירלי עמר", "תום גלבוע", "ליאן טל", "איה בועז",
    "אור שגב", "ליאור נצר", "קרן מלמד", "רועי פיין", "דנית בר",
    "ניב אמון", "אופיר טובי", "רוני קפלן", "צופיה שמש", "עופר זוהר",
    "סתיו נור", "איתמר אפק", "שלומית זכאי", "זיו דן", "עלמה גל"
  ];
  
  const users = [];
  let nameIndex = 0;
  
  // Create at least 5 users per team
  for (const team of teams) {
    for (let i = 0; i < 5; i++) {
      const hashedPassword = await bcrypt.hash("123456", 10);
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];
      const randomProfilePic = profilePictures[Math.floor(Math.random() * profilePictures.length)];
      
      const user = new User({
        name: israeliNames[nameIndex % israeliNames.length],
        email: `user${users.length + 1}@example.com`,
        password: hashedPassword,
        favoriteTeam: team,
        location: randomLocation,
        bio: `אוהד נלהב של ${team} מהגיל הצעיר. אוהב לבוא למשחקים ולעודד את הקבוצה!`,
        gender: (nameIndex % 2 === 0) ? "זכר" : "נקבה",
        phone: `050${Math.floor(1000000 + Math.random() * 9000000)}`,
        birthDate: new Date(1980 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        isEmailVerified: true,
        profilePicture: randomProfilePic
      });
      
      users.push(user);
      nameIndex++;
    }
  }
  
  await User.insertMany(users);
  console.log(`Sample users created! Total: ${users.length} users`);
  return users;
}

// Football-related images array
const footballImages = [
  // Football stadiums
  "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1623061420043-b15b56ac7b8b?w=800&h=600&fit=crop",
  
  // Football balls and equipment
  "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1552318728-e179b2cb0d69?w=800&h=600&fit=crop",
  
  // Football action shots
  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1624965247989-bc84b23a7762?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1579952363873-27d3bfac4d8f?w=800&h=600&fit=crop",
  
  // Football celebrations and fans
  "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1552667466-07770ae110d5?w=800&h=600&fit=crop",
  
  // Football goals and nets
  "https://images.unsplash.com/photo-1591568644921-3a5f1e86f845?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1594736797933-d0ccef2b2a3e?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1555618099-ee05ebe59862?w=800&h=600&fit=crop",
  
  // Additional football images
  "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1559033946-de19c0ad1db4?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1584372437945-b4b49dc64a5c?w=800&h=600&fit=crop"
];

// Create sample posts
async function createSamplePosts(users) {
  console.log("Creating sample posts for each user...");
  
  const teamCommunityMap = {
    "הפועל תל אביב": "25",
    "מכבי תל אביב": "1",
    "הפועל באר שבע": "2",
    "מכבי חיפה": "3",
    'בית"ר ירושלים': "4",
    "בני יהודה": "23",
    "מכבי נתניה": "6",
    "הפועל חיפה": "5",
    "הפועל ירושלים": "9",
    "עירוני קרית שמונה": "10"
  };
  
  const postTemplates = [
    "איזה משחק מטורף היה אתמול! ❤️⚽",
    "מחכה למשחק הבא! מי בא איתי לאצטדיון? 🏟️",
    "הקבוצה שלנו מראה השנה כושר מעולה! 💪",
    "מה אתם חושבים על השחקן החדש? 🤔",
    "זוכרים את המשחק הזה מהעונה שעברה? איזה רגש! 📅",
    "עשינו זאת! ניצחון חשוב! 🎉",
    "מי יגיע לחגיגות בכיכר הסיטי? 🎊",
    "הזמנתי כבר כרטיסים למשחק הבא! 🎫",
    "איזה גול מטורף! עדיין לא מאמין 😍",
    "המאמן החדש נראה מבטיח 👨‍💼",
    "דרבי השבוע הזה! מי מוכן? 🔥",
    "היציע היה מדהים היום! 📣",
    "השופט שוב עוול לנו... 😤",
    "אין כמו האווירה באצטדיון הבית! 🏠",
    "מחכה לעונה החדשה! 🌟",
    "מי זוכר את המשחק הקלאסי הזה? 🎥",
    "הצעירים שלנו משחקים נהדר! 👶",
    "איזה אווירה במשחק אמש! 🌙",
    "אין עליהם! הקבוצה הכי טובה! 💚",
    "המהלך הזה של המאמן היה גאוני! 🧠"
  ];
  
  const posts = [];
  
  // Create 5 posts for each user
  for (const user of users) {
    for (let i = 0; i < 5; i++) {
      const communityId = teamCommunityMap[user.favoriteTeam];
      const randomTemplate = postTemplates[Math.floor(Math.random() * postTemplates.length)];
      
      const post = new Post({
        authorId: user._id,
        communityId: communityId,
        content: randomTemplate,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000) // Random time in last 60 days
      });
      
      // 40% chance of having an image
      if (Math.random() < 0.4) {
        const randomImage = footballImages[Math.floor(Math.random() * footballImages.length)];
        post.media = [randomImage];
      }
      
      posts.push(post);
    }
  }
  
  await Post.insertMany(posts);
  console.log(`Sample posts created! Total: ${posts.length} posts (${Math.floor(posts.length * 0.4)} with images)`);
  return posts;
}

// Add random likes to posts
async function addLikesToPosts(users, posts) {
  console.log("Adding random likes to posts...");
  
  for (const post of posts) {
    // Each post will get 0-15 random likes
    const likesCount = Math.floor(Math.random() * 16);
    const likedUsers = new Set();
    
    for (let i = 0; i < likesCount; i++) {
      const randomLiker = users[Math.floor(Math.random() * users.length)];
      likedUsers.add(randomLiker._id);
    }
    
    post.likes = Array.from(likedUsers);
    await post.save();
  }
  
  console.log("Likes added to posts!");
}

// Create sample comments
async function createSampleComments(users, posts) {
  console.log("Creating sample comments...");
  
  const commentTemplates = [
    "אני מסכים לחלוטין!",
    "איזה משחק! כל הכבוד",
    "תותחים! ממש גאה בהם",
    "מחכה לעוד! בואו עוד",
    "הקבוצה הכי טובה שיש!",
    "אח שלי יגיע גם! נהיה שם ביחד",
    "אני אהיה שם! מישהו עוד?",
    "😍😍😍",
    "💪💪💪",
    "⚽❤️",
    "לא מאמין שזה קרה!",
    "איזה רגש אמש!",
    "חזק וחזק!",
    "הבטחתי לבן שלי שנבוא",
    "שנה טובה צפויה לנו",
    "כל הכבוד למאמן!",
    "הזמנתי כבר חברים",
    "לא מפסיק לחייך מהמשחק",
    "תחזיק מעמד קבוצה!",
    "אין מילים! פשוט מושלם"
  ];
  
  const comments = [];
  
  // Create 2-8 comments for each post
  for (const post of posts) {
    const commentsCount = Math.floor(Math.random() * 7) + 2; // 2-8 comments
    
    for (let i = 0; i < commentsCount; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomTemplate = commentTemplates[Math.floor(Math.random() * commentTemplates.length)];
      
      const comment = new Comment({
        postId: post._id,
        authorId: randomUser._id,
        content: randomTemplate,
        createdAt: new Date(post.createdAt.getTime() + Math.floor(Math.random() * 24 * 60 * 60 * 1000))
      });
      
      comments.push(comment);
    }
  }
  
  await Comment.insertMany(comments);
  console.log(`Sample comments created! Total: ${comments.length} comments`);
  return comments;
}

// Add random likes to comments
async function addLikesToComments(users, comments) {
  console.log("Adding random likes to comments...");
  
  for (const comment of comments) {
    // Each comment will get 0-5 random likes
    const likesCount = Math.floor(Math.random() * 6);
    const likedUsers = new Set();
    
    for (let i = 0; i < likesCount; i++) {
      const randomLiker = users[Math.floor(Math.random() * users.length)];
      likedUsers.add(randomLiker._id);
    }
    
    comment.likes = Array.from(likedUsers);
    await comment.save();
  }
  
  console.log("Likes added to comments!");
}

// Clear existing data
async function clearDatabase() {
  console.log("Clearing existing data...");
  await User.deleteMany({});
  await Post.deleteMany({});
  await Comment.deleteMany({});
  console.log("Database cleared!");
}

// Main function
async function seedDatabase() {
  await connectDB();
  
  // Clear existing data (optional)
  const clearFirst = process.argv.includes('--clear');
  if (clearFirst) {
    await clearDatabase();
  }
  
  try {
    console.log("Starting database seeding process...\n");
    
    // Step 1: Create users (5 per team, 10 teams = 50 users)
    const users = await createSampleUsers();
    
    // Step 2: Create posts (5 per user = 250 posts)
    const posts = await createSamplePosts(users);
    
    // Step 3: Add likes to posts
    await addLikesToPosts(users, posts);
    
    // Step 4: Create comments (2-8 per post = ~1000-2000 comments)
    const comments = await createSampleComments(users, posts);
    
    // Step 5: Add likes to comments
    await addLikesToComments(users, comments);
    
    console.log("\n✅ Database seeded successfully!");
    console.log(`📊 Summary:`);
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   📝 Posts: ${posts.length}`);
    console.log(`   💬 Comments: ${comments.length}`);
    console.log(`   ❤️ Likes on posts and comments added randomly`);
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;