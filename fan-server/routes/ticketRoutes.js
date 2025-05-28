// fan-server/routes/ticketRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const {
  getAllTickets,
  createTicket,
  getTicketById,
  getMyTickets,
  deleteTicket,
  updateTicket,
} = require("../controllers/ticketController");

// Public routes
router.get("/", authMiddleware, getAllTickets);

// Protected routes (require authentication)
router.post("/", authMiddleware, createTicket); // Create new ticket
router.get("/mine", authMiddleware, getMyTickets); // Get user's tickets
router.get("/:id", getTicketById); // Get single ticket (public for viewing)
router.put("/:id", authMiddleware, updateTicket); // Update ticket (seller only)
router.delete("/:id", authMiddleware, deleteTicket); // Delete ticket (seller only)

module.exports = router;