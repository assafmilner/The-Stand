// ### League Controller
// Provides two endpoints:
// 1. detectLeague – Detects a team's league using TheSportsDB API
// 2. getLeagueTable – Returns league table or a placeholder if season hasn't started

const NodeCache = require("node-cache");
const axios = require("axios");

const leagueCache = new NodeCache({ stdTTL: 1800 });
const SEASON = "2025-2026";
const LEAGUES = ["4644", "4966"]; // Israeli Premier League, Liga Leumit

// ### Function: detectLeague
// Checks if a given team name appears in any league's first round.
// Uses in-memory cache to reduce API calls.
// Returns: leagueId if found, otherwise 404.
const detectLeague = async (req, res) => {
  const { teamName } = req.query;

  if (!teamName) {
    return res
      .status(400)
      .json({ success: false, error: "Team name is required" });
  }

  const cached = leagueCache.get(teamName);
  if (cached) {
    return res.json({ success: true, leagueId: cached });
  }

  try {
    for (const leagueId of LEAGUES) {
      const url = `https://www.thesportsdb.com/api/v1/json/3/eventsround.php?id=${leagueId}&r=1&s=${SEASON}`;
      const response = await axios.get(url);
      const matches = response.data.events || [];

      const found = matches.some(
        (match) =>
          match.strHomeTeam === teamName || match.strAwayTeam === teamName
      );

      if (found) {
        leagueCache.set(teamName, leagueId);
        return res.json({ success: true, leagueId });
      }
    }

    res
      .status(404)
      .json({ success: false, error: "Team not found in any league" });
  } catch (err) {
    console.error("❌ League detection failed:", err.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// ### Function: getLeagueTable
// Retrieves the league standings for a given seasonId.
// - If season hasn't started: returns placeholder table with team names.
// - If season has started: fetches table from TheSportsDB.
// Results are cached per season & league.
const getLeagueTable = async (req, res) => {
  const { seasonId, season = SEASON } = req.query;

  if (!seasonId) {
    return res.status(400).json({ success: false, error: "Missing seasonId" });
  }

  const cacheKey = `table_${seasonId}_${season}`;
  const cached = leagueCache.get(cacheKey);
  if (cached) {
    return res.json({ success: true, table: cached });
  }

  try {
    const roundUrl = `https://www.thesportsdb.com/api/v1/json/3/eventsround.php?id=${seasonId}&r=1&s=${season}`;
    const roundRes = await axios.get(roundUrl);
    const roundEvents = roundRes.data.events || [];

    const matchDates = roundEvents
      .map((e) => new Date(`${e.dateEvent}T${e.strTime || "00:00:00"}`))
      .filter(Boolean)
      .sort((a, b) => a - b);

    const firstMatchDate = matchDates[0];
    const now = new Date();

    if (!firstMatchDate) {
      return res
        .status(404)
        .json({ success: false, error: "No match data for round 1" });
    }

    if (now < firstMatchDate) {
      // Season hasn't started yet – return a placeholder table
      const teamSet = new Set();
      roundEvents.forEach((e) => {
        if (e.strHomeTeam) teamSet.add(e.strHomeTeam);
        if (e.strAwayTeam) teamSet.add(e.strAwayTeam);
      });

      const placeholderTable = Array.from(teamSet).map((team) => ({
        team,
        played: 0,
        win: 0,
        draw: 0,
        loss: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
        rank: null,
        badge: null,
        note: "Awaiting season start",
      }));

      leagueCache.set(cacheKey, placeholderTable);
      return res.json({ success: true, table: placeholderTable });
    }

    const tableUrl = `https://www.thesportsdb.com/api/v1/json/3/lookuptable.php?l=${seasonId}&s=${season}`;
    const tableRes = await axios.get(tableUrl);
    const tableData = tableRes.data.table;

    if (!tableData) {
      return res
        .status(404)
        .json({ success: false, error: "No table data found" });
    }

    const parsedTable = tableData.map((team) => ({
      team: team.strTeam,
      rank: parseInt(team.intRank),
      badge: team.strBadge,
      played: parseInt(team.intPlayed),
      win: parseInt(team.intWin),
      draw: parseInt(team.intDraw),
      loss: parseInt(team.intLoss),
      goalsFor: parseInt(team.intGoalsFor),
      goalsAgainst: parseInt(team.intGoalsAgainst),
      points: parseInt(team.intPoints),
    }));

    leagueCache.set(cacheKey, parsedTable);
    return res.json({ success: true, table: parsedTable });
  } catch (err) {
    console.error("❌ Failed to load league table:", err.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// ### Export: League routes
module.exports = {
  detectLeague,
  getLeagueTable,
};
