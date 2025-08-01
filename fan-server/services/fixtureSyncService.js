// ### Service: Fixture Sync Job
// Syncs all fixtures from TheSportsDB API into MongoDB for a given season and league.
// Runs as a scheduled cron job (daily at 04:30). Clears existing data before re-inserting updated fixtures.

const Fixture = require("../models/Fixture");
const FixturesService = require("./fixturesService");
const cron = require("node-cron");

const fixtureApi = new FixturesService();

async function syncAllFixturesToDB(seasonId, season = "2025-2026") {
  try {
    // Remove all existing fixtures for the season before fetching new data
    await Fixture.deleteMany({ seasonId, leagueSeason: season });

    // Fetch fresh fixtures from API
    const fullData = await fixtureApi.fetchAllFixtures(seasonId, season, true);
    const { allFixtures } = fullData;

    // Enrich with metadata before saving
    const enrichedFixtures = allFixtures.map((f) => ({
      ...f,
      seasonId,
      leagueSeason: season,
      updatedAt: new Date(),
    }));

    await Fixture.insertMany(enrichedFixtures);

    console.log(
      `✅ Synced ${enrichedFixtures.length} fixtures to DB (leagueId ${seasonId}, season ${season})`
    );
    return { success: true, savedCount: enrichedFixtures.length };
  } catch (err) {
    console.error("❌ Failed to sync fixtures to DB:", err.message);
    return { success: false, error: err.message };
  }
}

// Schedule daily sync at 04:30 AM server time
cron.schedule("30 4 * * *", async () => {
  const leagues = [4644, 4966];
  for (const seasonId of leagues) {
    await syncAllFixturesToDB(seasonId);
  }
});

module.exports = { syncAllFixturesToDB };
