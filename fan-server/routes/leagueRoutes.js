// routes/leagueRoutes.js
const express = require("express");
const router = express.Router();
const {
  detectLeague,
  getLeagueTable,
} = require("../controllers/leagueController");

router.get("/detect", detectLeague);
router.get("/table", getLeagueTable);

module.exports = router;
