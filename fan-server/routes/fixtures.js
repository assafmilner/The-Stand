const express = require("express");
const router = express.Router();
const FixturesService = require("../services/fixturesService");
const { syncAllFixturesToDB } = require("../services/fixtureSyncService");
const {
  getFixturesFromCacheOrApi,
} = require("../services/fixtureQueryService");

// Create a singleton instance of the fixtures service
const fixturesService = new FixturesService();

// GET /api/fixtures - Fetch fixtures for a specific season
router.get("/", async (req, res) => {
  try {
    const {
      seasonId,
      season = "2025-2026",
      force = "false",
      format = "processed", // 'processed' | 'raw' | 'regular' | 'playoff'
    } = req.query;

    // Validate required parameters
    if (!seasonId) {
      return res.status(400).json({
        error: "Missing required parameter: seasonId",
        example: "/api/fixtures?seasonId=4644&season=2025-2026",
      });
    }

    // Validate seasonId
    const validSeasonIds = ["4644", "4966"];
    if (!validSeasonIds.includes(seasonId)) {
      return res.status(400).json({
        error: "Invalid seasonId. Must be 4644 (Ligat HaAl) or 4966 (Leumit)",
        provided: seasonId,
      });
    }

    const forceRefresh = force === "true";

    // Fetch fixtures from service
    const result = await fixturesService.fetchAllFixtures(
      parseInt(seasonId),
      season,
      forceRefresh
    );

    // Format response based on requested format
    let responseData;
    switch (format) {
      case "raw":
        responseData = result.allFixtures;
        break;
      case "regular":
        responseData = result.regularFixtures;
        break;
      case "playoff":
        responseData = result.playoffFixtures;
        break;
      case "processed":
      default:
        responseData = result;
        break;
    }

    // Add request metadata
    const response = {
      success: true,
      data: responseData,
      meta: {
        seasonId: parseInt(seasonId),
        season,
        requestedFormat: format,
        cached: !forceRefresh,
        timestamp: new Date().toISOString(),
        ...(result.metadata || {}),
      },
    };

    res.json(response);
  } catch (error) {
    console.error("❌ Error in fixtures route:", error);

    res.status(500).json({
      success: false,
      error: "Failed to fetch fixtures",
      message: error.message,
      meta: {
        seasonId: req.query.seasonId,
        season: req.query.season,
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// GET /api/fixtures/stats - Get cache statistics
router.get("/stats", (req, res) => {
  try {
    const stats = fixturesService.getCacheStats();

    res.json({
      success: true,
      data: stats,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Error getting cache stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get cache statistics",
      message: error.message,
    });
  }
});

// DELETE /api/fixtures/cache - Clear cache
router.delete("/cache", (req, res) => {
  try {
    const { pattern } = req.query;

    fixturesService.clearCache(pattern);

    res.json({
      success: true,
      message: pattern
        ? `Cache cleared for pattern: ${pattern}`
        : "All fixture cache cleared",
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Error clearing cache:", error);
    res.status(500).json({
      success: false,
      error: "Failed to clear cache",
      message: error.message,
    });
  }
});

// GET /api/fixtures/debug - Enhanced debug endpoint
router.get("/debug/:seasonId", async (req, res) => {
  try {
    const { seasonId } = req.params;
    const { season = "2025-2026", round = null } = req.query;

    // Get cached data
    const cacheKey = `fixtures_${seasonId}_${season}`;
    let fixtures = fixturesService.getCached(cacheKey);

    if (!fixtures) {
      return res.status(404).json({
        success: false,
        error: "No cached data found. Please fetch fixtures first.",
        suggestion: `GET /api/fixtures?seasonId=${seasonId}&season=${season}`,
      });
    }

    // Create detailed debug information
    const debug = {
      seasonId: parseInt(seasonId),
      season,
      totalFixtures: fixtures.allFixtures.length,
      regularSeasonEndDate: fixtures.regularSeasonEndDate,
      metadata: fixtures.metadata,
      breakdown: fixtures.metadata?.roundBreakdown || {},

      // Sample fixtures for verification
      sampleRegularSeasonFixtures: fixtures.regularFixtures
        .slice(0, 5)
        .map((f) => ({
          round: f.round,
          date: f.date,
          teams: `${f.homeTeam} vs ${f.awayTeam}`,
          season: f.season,
        })),

      samplePlayoffFixtures: fixtures.playoffFixtures.slice(0, 5).map((f) => ({
        round: f.round,
        date: f.date,
        teams: `${f.homeTeam} vs ${f.awayTeam}`,
        season: f.season,
      })),
    };

    // If specific round requested, add detailed round info
    if (round) {
      const roundNumber = parseInt(round);
      const roundFixtures = fixtures.allFixtures.filter(
        (f) => f.round === roundNumber
      );

      debug.specificRound = {
        round: roundNumber,
        totalGames: roundFixtures.length,
        regular: roundFixtures.filter((f) => f.season === "regular").length,
        playoff: roundFixtures.filter((f) => f.season === "playoff").length,
        fixtures: roundFixtures.map((f) => ({
          date: f.date,
          teams: `${f.homeTeam} vs ${f.awayTeam}`,
          season: f.season,
          beforeCutoff:
            new Date(f.date) <= new Date(fixtures.regularSeasonEndDate),
        })),
      };
    }

    res.json({
      success: true,
      debug,
      meta: {
        timestamp: new Date().toISOString(),
        cached: true,
        cacheAge: fixtures.metadata?.lastUpdated,
      },
    });
  } catch (error) {
    console.error("❌ Error in debug route:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate debug information",
      message: error.message,
    });
  }
});

// GET /api/fixtures/round
router.get("/round", async (req, res) => {
  try {
    const { seasonId, round, season = "2025-2026" } = req.query;

    if (!seasonId || !round) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters: seasonId and round",
      });
    }

    const data = await fixturesService.fetchRound(
      parseInt(seasonId, 10),
      parseInt(round, 10),
      season
    );

    res.json({
      success: true,
      events: data.events || [],
      meta: {
        seasonId: parseInt(seasonId, 10),
        round: parseInt(round, 10),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Error in /fixtures/round:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch round data",
      message: error.message,
    });
  }
});

router.post("/sync", async (req, res) => {
  try {
    const { seasonId, season = "2025-2026" } = req.body;

    if (!seasonId) {
      return res
        .status(400)
        .json({ success: false, error: "seasonId is required" });
    }

    const result = await syncAllFixturesToDB(seasonId, season);
    res.json({
      success: true,
      message: "Fixtures synced successfully",
      result,
    });
  } catch (error) {
    console.error("❌ Error in manual fixture sync:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/smart", async (req, res) => {
  const { seasonId, season = "2025-2026" } = req.query;
  if (!seasonId) {
    return res.status(400).json({ success: false, error: "Missing seasonId" });
  }

  try {
    const result = await getFixturesFromCacheOrApi(parseInt(seasonId), season);
    res.json({ success: true, source: result.source, data: result.fixtures });
  } catch (err) {
    console.error("❌ Failed to get smart fixtures:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
