// ### Search Controller
// Handles advanced and quick search across users, posts, and ticket listings.
// Searches are scoped to users from the same favorite team.

const User = require("../models/User");
const Post = require("../models/Post");
const TicketListing = require("../models/TicketListing");
const Friend = require("../models/Friend");

// ### Function: searchUsers
// Searches for users from the same team, with optional filters (name, gender, location).
// Prioritizes friends in results if available.
const searchUsers = async (query, currentUser, limit = null, filters = {}) => {
  try {
    let searchQuery = {
      favoriteTeam: currentUser.favoriteTeam,
    };

    if (query || filters.userName) {
      const searchName = filters.userName || query;
      searchQuery.name = { $regex: searchName, $options: "i" };
    }

    if (filters.gender) {
      searchQuery.gender = filters.gender;
    }
    if (filters.location) {
      searchQuery.location = { $regex: filters.location, $options: "i" };
    }

    let dbQuery = User.find(searchQuery)
      .select("name profilePicture favoriteTeam gender location")
      .sort({ name: 1 });

    if (limit) {
      dbQuery = dbQuery.limit(limit);
    }

    const users = await dbQuery;

    if (users.length > 0) {
      const friendships = await Friend.find({
        $or: [
          { senderId: currentUser._id, status: "accepted" },
          { receiverId: currentUser._id, status: "accepted" },
        ],
      });

      const friendIds = friendships.map((f) =>
        f.senderId.toString() === currentUser._id.toString()
          ? f.receiverId.toString()
          : f.senderId.toString()
      );

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

// ### Function: searchPosts
// Searches posts from users of the same team based on content, author name, and date filters.
const searchPosts = async (query, currentUser, limit = null, filters = {}) => {
  try {
    const usersFromSameTeam = await User.find({
      favoriteTeam: currentUser.favoriteTeam,
    }).select("_id");

    let orConditions = [];

    const contentSearchText = filters.contentText || query;
    if (contentSearchText) {
      orConditions.push({
        content: { $regex: contentSearchText, $options: "i" },
      });
    }

    if (filters.authorName) {
      const usersByName = await User.find({
        name: { $regex: filters.authorName, $options: "i" },
        favoriteTeam: currentUser.favoriteTeam,
      }).select("_id");

      if (usersByName.length > 0) {
        orConditions.push({ authorId: { $in: usersByName.map((u) => u._id) } });
      }
    } else if (query && !filters.contentText) {
      const usersByName = await User.find({
        name: { $regex: query, $options: "i" },
        favoriteTeam: currentUser.favoriteTeam,
      }).select("_id");

      if (usersByName.length > 0) {
        orConditions.push({ authorId: { $in: usersByName.map((u) => u._id) } });
      }
    }

    let searchQuery = {
      authorId: { $in: usersFromSameTeam.map((u) => u._id) },
    };

    if (orConditions.length > 0) {
      searchQuery.$or = orConditions;
    }

    if (filters.postDateFrom || filters.dateFrom) {
      const dateFrom = filters.postDateFrom || filters.dateFrom;
      searchQuery.createdAt = {
        ...searchQuery.createdAt,
        $gte: new Date(dateFrom),
      };
    }
    if (filters.postDateTo || filters.dateTo) {
      const dateTo = new Date(filters.postDateTo || filters.dateTo);
      dateTo.setHours(23, 59, 59, 999);
      searchQuery.createdAt = { ...searchQuery.createdAt, $lte: dateTo };
    }

    let dbQuery = Post.find(searchQuery)
      .populate("authorId", "name profilePicture favoriteTeam")
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

// ### Function: searchTickets
// Searches ticket listings from sellers of the same team.
// Matches on seller name, team names, and notes with date/price filters.
const searchTickets = async (
  query,
  currentUser,
  limit = null,
  filters = {}
) => {
  try {
    const sellersFromSameTeam = await User.find({
      favoriteTeam: currentUser.favoriteTeam,
    }).select("_id");

    const sellersByName = await User.find({
      name: { $regex: query, $options: "i" },
      favoriteTeam: currentUser.favoriteTeam,
    }).select("_id");

    const createTeamSearchQueries = (searchQuery) => {
      const queries = [
        { homeTeam: { $regex: searchQuery, $options: "i" } },
        { awayTeam: { $regex: searchQuery, $options: "i" } },
      ];

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
        "הפועל רעננה": "Hapoel Raanana",
      };

      Object.entries(teamNameMap).forEach(([he, en]) => {
        if (he.includes(searchQuery)) {
          queries.push({ homeTeam: { $regex: en, $options: "i" } });
          queries.push({ awayTeam: { $regex: en, $options: "i" } });
        }
        if (en.toLowerCase().includes(searchQuery.toLowerCase())) {
          queries.push({ homeTeam: { $regex: he, $options: "i" } });
          queries.push({ awayTeam: { $regex: he, $options: "i" } });
        }
      });

      return queries;
    };

    const teamSearchQueries = query ? createTeamSearchQueries(query) : [];

    let searchQuery = {
      isSoldOut: false,
      sellerId: { $in: sellersFromSameTeam.map((s) => s._id) },
    };

    let orConditions = [];

    if (query) {
      orConditions.push(
        { notes: { $regex: query, $options: "i" } },
        { sellerId: { $in: sellersByName.map((s) => s._id) } },
        ...teamSearchQueries
      );
    }

    if (orConditions.length > 0) {
      searchQuery.$or = orConditions;
    }

    if (filters.priceMin) {
      searchQuery.price = {
        ...searchQuery.price,
        $gte: parseFloat(filters.priceMin),
      };
    }
    if (filters.priceMax) {
      searchQuery.price = {
        ...searchQuery.price,
        $lte: parseFloat(filters.priceMax),
      };
    }

    if (filters.ticketDateFrom) {
      searchQuery.date = {
        ...searchQuery.date,
        $gte: new Date(filters.ticketDateFrom),
      };
    }
    if (filters.ticketDateTo) {
      const endDate = new Date(filters.ticketDateTo);
      endDate.setHours(23, 59, 59, 999);
      searchQuery.date = { ...searchQuery.date, $lte: endDate };
    }

    if (!filters.ticketDateFrom && !filters.ticketDateTo) {
      const now = new Date();
      searchQuery.date = { ...searchQuery.date, $gte: now };
    }

    let dbQuery = TicketListing.find(searchQuery)
      .populate("sellerId", "name profilePicture")
      .sort({ date: 1 });

    if (limit) {
      dbQuery = dbQuery.limit(limit);
    }

    return await dbQuery;
  } catch (error) {
    console.error("Error searching tickets:", error);
    return [];
  }
};

// ### Function: quickSearch
// Searches 5 users, 5 posts, and 5 tickets simultaneously for a given query.
const quickSearch = async (req, res) => {
  try {
    const { q } = req.query;
    const currentUser = await User.findById(req.user.id);

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        results: { users: [], posts: [], tickets: [] },
      });
    }

    const [users, posts, tickets] = await Promise.all([
      searchUsers(q, currentUser, 5),
      searchPosts(q, currentUser, 5),
      searchTickets(q, currentUser, 5),
    ]);

    res.json({
      success: true,
      results: { users, posts, tickets },
      query: q,
    });
  } catch (error) {
    console.error("Quick search error:", error);
    res.json({
      success: false,
      results: { users: [], posts: [], tickets: [] },
      error: "Search failed",
    });
  }
};

// ### Function: fullSearch
// Returns all results matching the given query and filter set, across all entity types.
const fullSearch = async (req, res) => {
  try {
    const {
      q,
      type = "all",
      contentText,
      authorName,
      postDateFrom,
      postDateTo,
      userName,
      gender,
      location,
      priceMin,
      priceMax,
      ticketDateFrom,
      ticketDateTo,
      dateFrom,
      dateTo,
    } = req.query;

    const currentUser = await User.findById(req.user.id);

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        results: { users: [], posts: [], tickets: [] },
      });
    }

    const filters = {
      contentText,
      authorName,
      postDateFrom: postDateFrom || dateFrom,
      postDateTo: postDateTo || dateTo,
      userName,
      gender,
      location,
      priceMin,
      priceMax,
      ticketDateFrom,
      ticketDateTo,
    };

    let results = {};

    if (type === "all" || type === "users") {
      results.users = await searchUsers(q, currentUser, null, filters);
    }
    if (type === "all" || type === "posts") {
      results.posts = await searchPosts(q, currentUser, null, filters);
    }
    if (type === "all" || type === "tickets") {
      results.tickets = await searchTickets(q, currentUser, null, filters);
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
        totalResults:
          (results.users?.length || 0) +
          (results.posts?.length || 0) +
          (results.tickets?.length || 0),
      },
    });
  } catch (error) {
    console.error("Full search error:", error);
    res.json({
      success: false,
      results: { users: [], posts: [], tickets: [] },
      error: "Search failed",
    });
  }
};

// ### Export: Search methods
module.exports = {
  quickSearch,
  fullSearch,
  searchUsers,
  searchPosts,
  searchTickets,
};
