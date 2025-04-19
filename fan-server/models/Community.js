const mongoose = require("mongoose");

const CommunitySchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true,
    unique: true, 
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Community = mongoose.model("Community", CommunitySchema);
module.exports = Community;

  