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
TicketListingSchema.index({ notes: "text", homeTeam: "text", awayTeam: "text" });
TicketListingSchema.index({ date: 1, isSoldOut: 1 });
TicketListingSchema.index({ sellerId: 1 });



module.exports = mongoose.model("TicketListing", TicketListingSchema);