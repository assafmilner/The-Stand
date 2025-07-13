// services/fixtureQueryService.js
const Fixture = require('../models/Fixture');
const FixturesService = require('./fixturesService');

const fixtureApi = new FixturesService();

// כמה זמן נחשב "מעודכן"? (מילישניות)
const STALE_THRESHOLD_MS = 1000 * 60 * 60 * 24; // 24 שעות

async function getFixturesFromCacheOrApi(seasonId, season = '2025-2026') {
  const existing = await Fixture.find({ seasonId, season });

  const now = Date.now();
  const isStale =
    existing.length === 0 ||
    existing.some(f => !f.updatedAt || (now - new Date(f.updatedAt).getTime() > STALE_THRESHOLD_MS));

  if (!isStale) {
    return { source: 'db', fixtures: existing };
  }

  try {
    // אם הנתונים ישנים או חסרים – משוך מה־API
    const { allFixtures } = await fixtureApi.fetchAllFixtures(seasonId, season, true);

    // מחיקה והכנסה מחדש
    await Fixture.deleteMany({ seasonId, season });
    await Fixture.insertMany(allFixtures.map(f => ({ ...f, updatedAt: new Date() })));

    return { source: 'api', fixtures: allFixtures };
  } catch (error) {
    console.error("❌ Failed to fetch fresh fixtures, falling back to DB:", error.message);

    if (existing.length > 0) {
      return { source: 'fallback-db', fixtures: existing };
    }

    throw new Error("No fixtures available in DB and failed to fetch from API");
  }
}

module.exports = { getFixturesFromCacheOrApi };
