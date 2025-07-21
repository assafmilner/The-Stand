// ### Ticket Controller
// Provides CRUD operations and filtering for ticket listings posted by users.

const TicketListing = require("../models/TicketListing");
const User = require("../models/User");

// ### Function: getAllTickets
// Retrieves all future tickets with optional filters (teams, stadium, date, price).
// Includes pagination and limits results to the same fan group as the current user.
const getAllTickets = async (req, res) => {
  try {
    const {
      homeTeam,
      awayTeam,
      teamName,
      stadium,
      dateFrom,
      dateTo,
      priceMin,
      priceMax,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = { isSoldOut: false };

    const now = new Date();
    filter.date = { $gte: now };

    if (req.user && req.user.id) {
      const currentUser = await User.findById(req.user.id).select(
        "favoriteTeam"
      );
      if (currentUser && currentUser.favoriteTeam) {
        const sameTeamUsers = await User.find({
          favoriteTeam: currentUser.favoriteTeam,
        }).select("_id");
        const sameTeamUserIds = sameTeamUsers.map((user) => user._id);
        filter.sellerId = { $in: sameTeamUserIds };
      }
    }

    if (teamName) {
      filter.$or = [
        { homeTeam: { $regex: teamName, $options: "i" } },
        { awayTeam: { $regex: teamName, $options: "i" } },
      ];
    } else {
      if (homeTeam) filter.homeTeam = { $regex: homeTeam, $options: "i" };
      if (awayTeam) filter.awayTeam = { $regex: awayTeam, $options: "i" };
    }

    if (stadium) {
      filter.stadium = { $regex: stadium, $options: "i" };
    }

    if (dateFrom) filter.date.$gte = new Date(dateFrom);
    if (dateTo) filter.date.$lte = new Date(dateTo);

    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) filter.price.$gte = parseFloat(priceMin);
      if (priceMax) filter.price.$lte = parseFloat(priceMax);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tickets = await TicketListing.find(filter)
      .populate("sellerId", "name profilePicture favoriteTeam")
      .sort({ date: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalTickets = await TicketListing.countDocuments(filter);
    const hasMore = skip + tickets.length < totalTickets;

    res.status(200).json({
      tickets,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalTickets / limit),
        hasMore,
        totalTickets,
      },
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res
      .status(500)
      .json({ message: "Error fetching tickets", error: error.message });
  }
};

// ### Function: createTicket
// Allows a logged-in user to create a new ticket listing.
// Validates required fields and user ownership.
const createTicket = async (req, res) => {
  try {
    const {
      matchId,
      homeTeam,
      awayTeam,
      date,
      time,
      stadium,
      quantity,
      price,
      notes,
    } = req.body;

    const sellerId = req.user.id;

    if (
      !matchId ||
      !homeTeam ||
      !awayTeam ||
      !date ||
      !quantity ||
      price === undefined
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Quantity must be greater than 0" });
    }

    if (price < 0) {
      return res.status(400).json({ message: "Price cannot be negative" });
    }

    const userExists = await User.findById(sellerId);
    if (!userExists) {
      return res.status(400).json({ message: "Invalid user" });
    }

    const newTicket = new TicketListing({
      sellerId,
      matchId,
      homeTeam,
      awayTeam,
      date: new Date(date),
      time,
      stadium,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      notes: notes || "",
    });

    const savedTicket = await newTicket.save();
    const populatedTicket = await TicketListing.findById(
      savedTicket._id
    ).populate("sellerId", "name profilePicture favoriteTeam");

    res.status(201).json(populatedTicket);
  } catch (error) {
    console.error("Error creating ticket:", error);
    res
      .status(500)
      .json({ message: "Error creating ticket", error: error.message });
  }
};

// ### Function: getTicketById
// Fetches a single ticket listing by its ID.
const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await TicketListing.findById(id).populate(
      "sellerId",
      "name profilePicture favoriteTeam location"
    );

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json(ticket);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res
      .status(500)
      .json({ message: "Error fetching ticket", error: error.message });
  }
};

// ### Function: getMyTickets
// Fetches all tickets created by the currently logged-in user.
const getMyTickets = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tickets = await TicketListing.find({ sellerId })
      .populate("sellerId", "name profilePicture favoriteTeam")
      .sort({ date: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalTickets = await TicketListing.countDocuments({ sellerId });
    const hasMore = skip + tickets.length < totalTickets;

    res.status(200).json({
      tickets,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalTickets / limit),
        hasMore,
        totalTickets,
      },
    });
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    res
      .status(500)
      .json({ message: "Error fetching your tickets", error: error.message });
  }
};

// ### Function: deleteTicket
// Deletes a ticket listing, only if it belongs to the logged-in user.
const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const ticket = await TicketListing.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket.sellerId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own tickets" });
    }

    await TicketListing.findByIdAndDelete(id);
    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res
      .status(500)
      .json({ message: "Error deleting ticket", error: error.message });
  }
};

// ### Function: updateTicket
// Updates a ticket listing (sold out status, quantity, price, or notes) if owned by the user.
const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { isSoldOut, quantity, price, notes } = req.body;

    const ticket = await TicketListing.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket.sellerId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only update your own tickets" });
    }

    const updateData = {};
    if (isSoldOut !== undefined) updateData.isSoldOut = isSoldOut;
    if (quantity !== undefined && quantity > 0) updateData.quantity = quantity;
    if (price !== undefined && price >= 0) updateData.price = price;
    if (notes !== undefined) updateData.notes = notes;

    const updatedTicket = await TicketListing.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate("sellerId", "name profilePicture favoriteTeam");

    res.status(200).json(updatedTicket);
  } catch (error) {
    console.error("Error updating ticket:", error);
    res
      .status(500)
      .json({ message: "Error updating ticket", error: error.message });
  }
};

// ### Export: Ticket controller functions
module.exports = {
  getAllTickets,
  createTicket,
  getTicketById,
  getMyTickets,
  deleteTicket,
  updateTicket,
};
