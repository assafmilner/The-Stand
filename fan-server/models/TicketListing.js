// fan-server/models/TicketListing.js
const mongoose = require("mongoose");

const TicketListingSchema = new mongoose.Schema({
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

// Index for better query performance
TicketListingSchema.index({ date: 1, homeTeam: 1, awayTeam: 1 });
TicketListingSchema.index({ sellerId: 1 });
TicketListingSchema.index({ isSoldOut: 1 });

module.exports = mongoose.model("TicketListing", TicketListingSchema);