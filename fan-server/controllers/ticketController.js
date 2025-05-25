// fan-server/controllers/ticketController.js
const TicketListing = require("../models/TicketListing");
const User = require("../models/User");

// Get all available tickets with filters
const getAllTickets = async (req, res) => {
  try {
    const {
      homeTeam,
      awayTeam,
      teamName, // New parameter for filtering by either home or away team
      stadium,
      dateFrom,
      dateTo,
      priceMin,
      priceMax,
      page = 1,
      limit = 20,
    } = req.query;

    // Build filter object
    const filter = { isSoldOut: false };

    // Handle team filtering - if teamName is provided, show games where the team is either home or away
    if (teamName) {
      filter.$or = [
        { homeTeam: { $regex: teamName, $options: "i" } },
        { awayTeam: { $regex: teamName, $options: "i" } }
      ];
    } else {
      // Legacy individual team filtering
      if (homeTeam) filter.homeTeam = { $regex: homeTeam, $options: "i" };
      if (awayTeam) filter.awayTeam = { $regex: awayTeam, $options: "i" };
    }

    if (stadium) filter.stadium = { $regex: stadium, $options: "i" };

    // Date range filter
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    // Price range filter
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
    res.status(500).json({ message: "Error fetching tickets", error: error.message });
  }
};

// Create a new ticket listing
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

    // Validation
    if (!matchId || !homeTeam || !awayTeam || !date || !quantity || price === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate quantity and price
    if (quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than 0" });
    }

    if (price < 0) {
      return res.status(400).json({ message: "Price cannot be negative" });
    }

    // Check if user exists
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
    const populatedTicket = await TicketListing.findById(savedTicket._id)
      .populate("sellerId", "name profilePicture favoriteTeam");

    res.status(201).json(populatedTicket);
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ message: "Error creating ticket", error: error.message });
  }
};

// Get single ticket by ID
const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await TicketListing.findById(id)
      .populate("sellerId", "name profilePicture favoriteTeam location");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json(ticket);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({ message: "Error fetching ticket", error: error.message });
  }
};

// Get tickets by current user
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
    res.status(500).json({ message: "Error fetching your tickets", error: error.message });
  }
};

// Delete ticket (only by seller)
const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const ticket = await TicketListing.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Check if user is the seller
    if (ticket.sellerId.toString() !== userId) {
      return res.status(403).json({ message: "You can only delete your own tickets" });
    }

    await TicketListing.findByIdAndDelete(id);
    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({ message: "Error deleting ticket", error: error.message });
  }
};

// Update ticket (mark as sold out)
const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { isSoldOut, quantity, price, notes } = req.body;

    const ticket = await TicketListing.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Check if user is the seller
    if (ticket.sellerId.toString() !== userId) {
      return res.status(403).json({ message: "You can only update your own tickets" });
    }

    // Update allowed fields
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
    res.status(500).json({ message: "Error updating ticket", error: error.message });
  }
};

module.exports = {
  getAllTickets,
  createTicket,
  getTicketById,
  getMyTickets,
  deleteTicket,
  updateTicket,
};