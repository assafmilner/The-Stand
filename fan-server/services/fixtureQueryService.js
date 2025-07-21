// ### Service: Fixture Query Service
// Handles logic for fetching fixtures from DB or API, based on staleness threshold.
// Falls back to cached DB data if API fetch fails.

const Fixture = require("../models/Fixture");
const FixturesService = require("./fixturesService");

const fixtureApi = new FixturesService();

// Define how long data is considered "fresh" (in milliseconds)
const STALE_THRESHOLD_MS = 1000 * 60 * 60 * 24; // 24 hours

async function getFixturesFromCacheOrApi(seasonId, season = "2025-2026") {
  const existing = await Fixture.find({ seasonId, season });

  const now = Date.now();
  const isStale =
    existing.length === 0 ||
    existing.some(
      (f) =>
        !f.updatedAt ||
        now - new Date(f.updatedAt).getTime() > STALE_THRESHOLD_MS
    );

  if (!isStale) {
    return { source: "db", fixtures: existing };
  }

  try {
    // Fetch from API if data is stale or missing
    const { allFixtures } = await fixtureApi.fetchAllFixtures(
      seasonId,
      season,
      true
    );

    // Replace existing DB entries with fresh data
    await Fixture.deleteMany({ seasonId, season });
    await Fixture.insertMany(
      allFixtures.map((f) => ({ ...f, updatedAt: new Date() }))
    );

    return { source: "api", fixtures: allFixtures };
  } catch (error) {
    console.error(
      "❌ Failed to fetch fresh fixtures, falling back to DB:",
      error.message
    );

    // If API call fails, return existing data from DB if available
    if (existing.length > 0) {
      return { source: "fallback-db", fixtures: existing };
    }

    throw new Error("No fixtures available in DB and failed to fetch from API");
  }
}

module.exports = { getFixturesFromCacheOrApi };
