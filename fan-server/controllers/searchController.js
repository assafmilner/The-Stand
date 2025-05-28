// fan-server/controllers/searchController.js
const User = require("../models/User");
const Post = require("../models/Post");
const TicketListing = require("../models/TicketListing");
const Friend = require("../models/Friend");

// חיפוש משתמשים (רק מאותה קבוצה)
const searchUsers = async (query, currentUser, limit = null, filters = {}) => {
  try {
    let searchQuery = {
      favoriteTeam: currentUser.favoriteTeam,
      name: { $regex: query, $options: 'i' }
    };

    // הוספת פילטרים נוספים
    if (filters.gender) {
      searchQuery.gender = filters.gender;
    }
    if (filters.location) {
      searchQuery.location = filters.location;
    }

    let dbQuery = User.find(searchQuery)
      .select('name profilePicture favoriteTeam gender location')
      .sort({ name: 1 });

    if (limit) {
      dbQuery = dbQuery.limit(limit);
    }

    const users = await dbQuery;

    // אם צריך לתת עדיפות לחברים
    if (users.length > 0) {
      const friendships = await Friend.find({
        $or: [
          { senderId: currentUser._id, status: 'accepted' },
          { receiverId: currentUser._id, status: 'accepted' }
        ]
      });

      const friendIds = friendships.map(friendship => {
        return friendship.senderId.toString() === currentUser._id.toString() 
          ? friendship.receiverId.toString()
          : friendship.senderId.toString();
      });

      // מיון: חברים ראשונים
      users.sort((a, b) => {
        const aIsFriend = friendIds.includes(a._id.toString());
        const bIsFriend = friendIds.includes(b._id.toString());
        
        if (aIsFriend && !bIsFriend) return -1;
        if (!aIsFriend && bIsFriend) return 1;
        return a.name.localeCompare(b.name);
      });
    }

    return users;
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
};

// חיפוש פוסטים (בתוכן + בשם הכותב) - רק מאותה קבוצה!
const searchPosts = async (query, currentUser, limit = null, filters = {}) => {
  try {
    // חיפוש משתמשים מאותה קבוצה שיש להם את השם הזה
    const usersFromSameTeam = await User.find({ 
      favoriteTeam: currentUser.favoriteTeam 
    }).select('_id');

    const usersByName = await User.find({ 
      name: { $regex: query, $options: 'i' },
      favoriteTeam: currentUser.favoriteTeam 
    }).select('_id');

    let searchQuery = {
      // רק פוסטים של אוהדים מאותה קבוצה
      authorId: { $in: usersFromSameTeam.map(u => u._id) },
      $or: [
        { content: { $regex: query, $options: 'i' } },
        { authorId: { $in: usersByName.map(u => u._id) } }
      ]
    };

    // הוספת פילטרי תאריך
    if (filters.dateFrom) {
      searchQuery.createdAt = { ...searchQuery.createdAt, $gte: new Date(filters.dateFrom) };
    }
    if (filters.dateTo) {
      searchQuery.createdAt = { ...searchQuery.createdAt, $lte: new Date(filters.dateTo) };
    }

    let dbQuery = Post.find(searchQuery)
      .populate('authorId', 'name profilePicture favoriteTeam')
      .sort({ createdAt: -1 });

    if (limit) {
      dbQuery = dbQuery.limit(limit);
    }

    return await dbQuery;
  } catch (error) {
    console.error("Error searching posts:", error);
    return [];
  }
};

// חיפוש כרטיסים (בהערות + קבוצות + שם המוכר) - רק של מוכרים מאותה קבוצה!
const searchTickets = async (query, currentUser, limit = null) => {
  try {
    // חיפוש מוכרים מאותה קבוצה לפי שם
    const sellersFromSameTeam = await User.find({ 
      favoriteTeam: currentUser.favoriteTeam 
    }).select('_id');

    const sellersByName = await User.find({ 
      name: { $regex: query, $options: 'i' },
      favoriteTeam: currentUser.favoriteTeam 
    }).select('_id');

    // יצירת חיפוש מתקדם לקבוצות (עברית + אנגלית)
    const createTeamSearchQueries = (searchQuery) => {
      const queries = [
        // חיפוש ישיר (אנגלית)
        { homeTeam: { $regex: searchQuery, $options: 'i' } },
        { awayTeam: { $regex: searchQuery, $options: 'i' } }
      ];

      // חיפוש בעברית - מצא שמות אנגליים מתאימים
      const teamNameMap = {
        "מכבי תל אביב": "Maccabi Tel Aviv",
        "הפועל באר שבע": "Hapoel Beer Sheva", 
        "מכבי חיפה": "Maccabi Haifa",
        'בית"ר ירושלים': "Beitar Jerusalem",
        "הפועל חיפה": "Hapoel Haifa",
        "מכבי נתניה": "Maccabi Netanya",
        "עירוני קריית שמונה": "Hapoel Kiryat Shmona",
        "מכבי בני ריינה": "Maccabi Bnei Raina",
        "הפועל ירושלים": "Hapoel Jerusalem",
        "עירוני טבריה": "Ironi Tiberias",
        "מכבי פתח תקווה": "Maccabi Petach Tikva",
        "בני סכנין": "Bnei Sakhnin",
        "מ.ס. אשדוד": "FC Ashdod",
        "הפועל חדרה": "Hapoel Hadera Eran",
        "מכבי הרצליה": "Maccabi Herzliya",
        "הפועל ניר רמת השרון": "Hapoel Ramat HaSharon",
        "הפועל פתח תקווה": "Hapoel Petah Tikva",
        "הפועל אום אל פחם": "Hapoel Umm al-Fahm",
        "הפועל רמת גן": "Hapoel Ramat Gan",
        "הפועל כפר סבא": "Hapoel Kfar Saba",
        "הפועל עפולה": "Hapoel Afula",
        "הפועל נוף הגליל": "Hapoel Nof HaGalil",
        "בני יהודה": "Bnei Yehuda",
        "הפועל עכו": "Hapoel Ironi Akko",
        "הפועל תל אביב": "Hapoel Tel-Aviv",
        "מכבי יפו": "Maccabi Kabilio Jaffa",
        "הפועל ראשון לציון": "Hapoel Rishon LeZion",
        "הפועל כפר שלם": "Hapoel Kfar Shalem",
        "מ.ס. כפר קאסם": "Kafr Qasim",
        "הפועל רעננה": "Hapoel Raanana"
      };

      // חיפוש קבוצות שמתחילות עם השאילתא בעברית
      Object.entries(teamNameMap).forEach(([hebrew, english]) => {
        if (hebrew.includes(searchQuery)) {
          queries.push(
            { homeTeam: { $regex: english, $options: 'i' } },
            { awayTeam: { $regex: english, $options: 'i' } }
          );
        }
      });

      // חיפוש גם בכיוון הפוך - אם מחפשים באנגלית
      Object.entries(teamNameMap).forEach(([hebrew, english]) => {
        if (english.toLowerCase().includes(searchQuery.toLowerCase())) {
          queries.push(
            { homeTeam: { $regex: hebrew, $options: 'i' } },
            { awayTeam: { $regex: hebrew, $options: 'i' } }
          );
        }
      });

      return queries;
    };

    const teamSearchQueries = createTeamSearchQueries(query);

    const searchQuery = {
      isSoldOut: false, // רק כרטיסים זמינים
      // רק כרטיסים של מוכרים מאותה קבוצה
      sellerId: { $in: sellersFromSameTeam.map(s => s._id) },
      $or: [
        { notes: { $regex: query, $options: 'i' } },
        { sellerId: { $in: sellersByName.map(s => s._id) } },
        ...teamSearchQueries // הוספת כל חיפושי הקבוצות
      ]
    };

    let dbQuery = TicketListing.find(searchQuery)
      .populate('sellerId', 'name profilePicture')
      .sort({ date: 1 }); // לפי תאריך המשחק

    if (limit) {
      dbQuery = dbQuery.limit(limit);
    }

    return await dbQuery;
  } catch (error) {
    console.error("Error searching tickets:", error);
    return [];
  }
};

// חיפוש מהיר לדרופדאון (5 מכל סוג)
const quickSearch = async (req, res) => {
  try {
    const { q } = req.query;
    const currentUser = await User.findById(req.user.id);
    
    if (!q || q.length < 2) {
      return res.json({ 
        success: true, 
        results: { users: [], posts: [], tickets: [] } 
      });
    }

    // חיפוש במקביל
    const [users, posts, tickets] = await Promise.all([
      searchUsers(q, currentUser, 5),
      searchPosts(q, currentUser, 5),
      searchTickets(q, currentUser, 5)
    ]);

    res.json({
      success: true,
      results: { users, posts, tickets },
      query: q
    });

  } catch (error) {
    console.error("Quick search error:", error);
    res.json({ 
      success: false, 
      results: { users: [], posts: [], tickets: [] },
      error: "Search failed"
    });
  }
};

// חיפוש מלא עם pagination
const fullSearch = async (req, res) => {
  try {
    const { q, type = 'all', ...filters } = req.query;
    const currentUser = await User.findById(req.user.id);
    
    if (!q || q.length < 2) {
      return res.json({ 
        success: true, 
        results: { users: [], posts: [], tickets: [] }
      });
    }

    let results = {};

    // חזיר את כל התוצאות בלי pagination
    if (type === 'all' || type === 'users') {
      const allUsers = await searchUsers(q, currentUser, null, filters);
      results.users = allUsers;
    }

    if (type === 'all' || type === 'posts') {
      const allPosts = await searchPosts(q, currentUser, null, filters);
      results.posts = allPosts;
    }

    if (type === 'all' || type === 'tickets') {
      const allTickets = await searchTickets(q, currentUser, null);
      results.tickets = allTickets;
    }

    res.json({
      success: true,
      results,
      query: q,
      filters
    });

  } catch (error) {
    console.error("Full search error:", error);
    res.json({ 
      success: false, 
      results: { users: [], posts: [], tickets: [] },
      error: "Search failed"
    });
  }
};

module.exports = {
  quickSearch,
  fullSearch,
  searchUsers,
  searchPosts,
  searchTickets
};