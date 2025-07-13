// models/Fixture.js
const mongoose = require('mongoose');

const fixtureSchema = new mongoose.Schema({
  seasonId: {
    type: Number,
    required: true
  },
  season: {
    type: String,
    required: true
  },
  round: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  homeTeam: {
    type: String,
    required: true
  },
  awayTeam: {
    type: String,
    required: true
  },
  homeScore: {
    type: Number,
    default: null
  },
  awayScore: {
    type: Number,
    default: null
  },
  venue: {
    type: String,
    default: ''
  },
  time: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['regular', 'playoff'],
    required: true
  }
}, { timestamps: true });

fixtureSchema.index({ seasonId: 1, season: 1, round: 1, homeTeam: 1, awayTeam: 1 }, { unique: true });

module.exports = mongoose.model('Fixture', fixtureSchema);
