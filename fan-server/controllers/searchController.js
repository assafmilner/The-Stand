// fan-server/controllers/searchController.js
const User = require("../models/User");
const Post = require("../models/Post");
const TicketListing = require("../models/TicketListing");
const Friend = require("../models/Friend");

// חיפוש משתמשים (רק מאותה קבוצה)
const searchUsers = async (query, currentUser, limit = null, filters = {}) => {
  try {
    let searchQuery = {
      favoriteTeam: currentUser.favoriteTeam
    };

    // חיפוש כללי או ספציפי בשם
    if (query || filters.userName) {
      const searchName = filters.userName || query;
      searchQuery.name = { $regex: searchName, $options: 'i' };
    } else if (query) {
      searchQuery.name = { $regex: query, $options: 'i' };
    }

    // הוספת פילטרים נוספים
    if (filters.gender) {
      searchQuery.gender = filters.gender;
    }
    if (filters.location) {
      searchQuery.location = { $regex: filters.location, $options: 'i' };
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

    // בניית OR conditions לחיפוש
    let orConditions = [];

    // חיפוש בתוכן - כללי או ספציפי
    const contentSearchText = filters.contentText || query;
    if (contentSearchText) {
      orConditions.push({ content: { $regex: contentSearchText, $options: 'i' } });
    }

    // חיפוש לפי שם מחבר
    if (filters.authorName) {
      const usersByName = await User.find({ 
        name: { $regex: filters.authorName, $options: 'i' },
        favoriteTeam: currentUser.favoriteTeam 
      }).select('_id');
      
      if (usersByName.length > 0) {
        orConditions.push({ authorId: { $in: usersByName.map(u => u._id) } });
      }
    } else if (query && !filters.contentText) {
      // אם זה חיפוש כללי בלי פילטר ספציפי, חפש גם בשמות
      const usersByName = await User.find({ 
        name: { $regex: query, $options: 'i' },
        favoriteTeam: currentUser.favoriteTeam 
      }).select('_id');
      
      if (usersByName.length > 0) {
        orConditions.push({ authorId: { $in: usersByName.map(u => u._id) } });
      }
    }

    let searchQuery = {
      // רק פוסטים של אוהדים מאותה קבוצה
      authorId: { $in: usersFromSameTeam.map(u => u._id) }
    };

    // הוספת OR conditions אם יש
    if (orConditions.length > 0) {
      searchQuery.$or = orConditions;
    }

    // הוספת פילטרי תאריך
    if (filters.postDateFrom || filters.dateFrom) {
      const dateFrom = filters.postDateFrom || filters.dateFrom;
      searchQuery.createdAt = { ...searchQuery.createdAt, $gte: new Date(dateFrom) };
    }
    if (filters.postDateTo || filters.dateTo) {
      const dateTo = filters.postDateTo || filters.dateTo;
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      searchQuery.createdAt = { ...searchQuery.createdAt, $lte: endDate };
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
const searchTickets = async (query, currentUser, limit = null, filters = {}) => {
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

    const teamSearchQueries = query ? createTeamSearchQueries(query) : [];

    let searchQuery = {
      isSoldOut: false, // רק כרטיסים זמינים
      // רק כרטיסים של מוכרים מאותה קבוצה
      sellerId: { $in: sellersFromSameTeam.map(s => s._id) }
    };

    // בניית OR conditions
    let orConditions = [];
    
    if (query) {
      orConditions.push(
        { notes: { $regex: query, $options: 'i' } },
        { sellerId: { $in: sellersByName.map(s => s._id) } },
        ...teamSearchQueries
      );
    }

    if (orConditions.length > 0) {
      searchQuery.$or = orConditions;
    }

    // פילטרי מחיר
    if (filters.priceMin) {
      searchQuery.price = { ...searchQuery.price, $gte: parseFloat(filters.priceMin) };
    }
    if (filters.priceMax) {
      searchQuery.price = { ...searchQuery.price, $lte: parseFloat(filters.priceMax) };
    }

    // פילטרי תאריך לכרטיסים
    if (filters.ticketDateFrom) {
      searchQuery.date = { ...searchQuery.date, $gte: new Date(filters.ticketDateFrom) };
    }
    if (filters.ticketDateTo) {
      const endDate = new Date(filters.ticketDateTo);
      endDate.setHours(23, 59, 59, 999);
      searchQuery.date = { ...searchQuery.date, $lte: endDate };
    }

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

// חיפוש מלא עם פילטרים מתקדמים
const fullSearch = async (req, res) => {
  try {
    const { 
      q, 
      type = 'all',
      // פילטרים לפוסטים
      contentText,
      authorName,
      postDateFrom,
      postDateTo,
      // פילטרים למשתמשים  
      userName,
      gender,
      location,
      // פילטרים לכרטיסים
      priceMin,
      priceMax,
      ticketDateFrom,
      ticketDateTo,
      // פילטרים ישנים (לתמיכה לאחור)
      dateFrom,
      dateTo
    } = req.query;
    
    const currentUser = await User.findById(req.user.id);
    
    if (!q || q.length < 2) {
      return res.json({ 
        success: true, 
        results: { users: [], posts: [], tickets: [] }
      });
    }

    // ארגון הפילטרים
    const filters = {
      // פוסטים
      contentText,
      authorName,
      postDateFrom: postDateFrom || dateFrom,
      postDateTo: postDateTo || dateTo,
      // משתמשים
      userName,
      gender,
      location,
      // כרטיסים
      priceMin,
      priceMax,
      ticketDateFrom,
      ticketDateTo
    };

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
      const allTickets = await searchTickets(q, currentUser, null, filters);
      results.tickets = allTickets;
    }

    res.json({
      success: true,
      results,
      query: q,
      filters,
      stats: {
        totalUsers: results.users?.length || 0,
        totalPosts: results.posts?.length || 0,
        totalTickets: results.tickets?.length || 0,
        totalResults: (results.users?.length || 0) + (results.posts?.length || 0) + (results.tickets?.length || 0)
      }
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