// ### Express Router: League Routes
// Provides endpoints for league-related logic, such as detecting a user's league
// based on their favorite team, and retrieving the current league table.

const express = require("express");
const router = express.Router();
const {
  detectLeague,
  getLeagueTable,
} = require("../controllers/leagueController");

router.get("/detect", detectLeague);
router.get("/table", getLeagueTable);

module.exports = router;
