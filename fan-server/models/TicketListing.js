// ### Mongoose Schema: TicketListing
// Represents a user's ticket listing for a match, including game details,
// price, quantity, and availability status. Used for listing and searching tickets.

const mongoose = require("mongoose");

const TicketListingSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    matchId: {
      type: String,
      required: true,
    },

    homeTeam: {
      type: String,
      required: true,
    },

    awayTeam: {
      type: String,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    stadium: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    notes: {
      type: String,
      maxlength: 500,
      default: "",
    },

    isSoldOut: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes for search and filtering
TicketListingSchema.index({
  notes: "text", // Enables full-text search on notes and team names
  homeTeam: "text",
  awayTeam: "text",
});
TicketListingSchema.index({ date: 1, isSoldOut: 1 }); // Optimize date-based queries
TicketListingSchema.index({ sellerId: 1 }); // Get tickets by user

module.exports = mongoose.model("TicketListing", TicketListingSchema);
