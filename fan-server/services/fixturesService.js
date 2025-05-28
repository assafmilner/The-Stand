// fan-server/services/fixturesService.js (Improved: use final regular round for cutoff)
let fetch;
try {
  fetch = globalThis.fetch;
  if (!fetch) {
    fetch = require('node-fetch');
  }
} catch (error) {
  try {
    fetch = require('node-fetch');
  } catch (fetchError) {
    console.error('❌ Neither built-in fetch nor node-fetch is available. Please install node-fetch: npm install node-fetch');
    throw new Error('fetch is not available. Please install node-fetch or upgrade to Node.js 18+');
  }
}

class FixturesService {
  constructor() {
    this.cache = new Map();
    this.CACHE_DURATION = {
      fixtures: 2 * 60 * 60 * 1000,
      default: 60 * 60 * 1000,
    };
  }

  isCacheValid(key, duration = this.CACHE_DURATION.default) {
    const cached = this.cache.get(key);
    return cached && (Date.now() - cached.timestamp < duration);
  }

  getCached(key) {
    const cached = this.cache.get(key);
    return cached ? cached.data : null;
  }

  setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
    if (this.cache.size > 100) this.cleanupCache();
  }

  cleanupCache() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000;
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > maxAge) this.cache.delete(key);
    }
  }

  formatToIsraelTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) return "";
    try {
      const utcDateTime = new Date(`${dateStr}T${timeStr}Z`);
      return utcDateTime.toLocaleTimeString("he-IL", {
        timeZone: "Asia/Jerusalem",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeStr;
    }
  }

  // async fetchRound(seasonId, round, season) {
  //   const proxyUrl = process.env.THESPORTSDB_PROXY_URL || 'http://localhost:3001/api/proxy';
  //   const apiUrl = `https://www.thesportsdb.com/api/v1/json/3/eventsround.php?id=${seasonId}&r=${round}&s=${season}`;
  //   const url = `${proxyUrl}?url=${encodeURIComponent(apiUrl)}`;
  //   const response = await fetch(url);
  //   if (!response.ok) throw new Error(`Failed to fetch round ${round}: ${response.statusText}`);
  //   return response.json();
  // }
  // בקובץ fixturesService.js - הוסף בתחילת fetchRound:
async fetchRound(seasonId, round, season) {
  // Try direct API call first if proxy fails
  const apiUrl = `https://www.thesportsdb.com/api/v1/json/3/eventsround.php?id=${seasonId}&r=${round}&s=${season}`;
  
  try {
    const proxyUrl = process.env.THESPORTSDB_PROXY_URL || 'http://localhost:3001/api/proxy';
    const url = `${proxyUrl}?url=${encodeURIComponent(apiUrl)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch round ${round}: ${response.statusText}`);
    return response.json();
  } catch (proxyError) {
    console.log(`   Proxy failed for round ${round}, trying direct API...`);
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`Direct API failed for round ${round}: ${response.statusText}`);
      return response.json();
    } catch (directError) {
      throw proxyError; // Return original proxy error
    }
  }
}

  async fetchMultipleRounds(seasonId, season, rounds) {
    const promises = rounds.map(async (round) => {
      try {
        const data = await this.fetchRound(seasonId, round, season);
        return { round, events: data.events || [] };
      } catch (error) {
        console.error(`❌ Error fetching round ${round}:`, error.message);
        return { round, events: [] };
      }
    });
    return Promise.all(promises);
  }

  getLeagueConfig(seasonId) {
    const configs = {
      4644: { name: 'ligat-haal', finalRegularRound: 26 },
      4966: { name: 'leumit', finalRegularRound: 30 }
    };
    return configs[seasonId] || configs[4644];
  }

  async fetchAllFixtures(seasonId, season = '2024-2025', forceRefresh = false) {
    const cacheKey = `fixtures_${seasonId}_${season}`;
    if (!forceRefresh && this.isCacheValid(cacheKey, this.CACHE_DURATION.fixtures)) {
      return this.getCached(cacheKey);
    }

    const startTime = Date.now();
    const config = this.getLeagueConfig(seasonId);

    // Step 1: Determine regular season end date from final round
    const finalRoundData = await this.fetchRound(seasonId, config.finalRegularRound, season);
    const finalDates = (finalRoundData?.events || []).map(e => new Date(e.dateEvent));
    const regularSeasonEndDate = finalDates.length > 0 ? new Date(Math.max(...finalDates)) : null;

    // Step 2: Fetch all possible rounds
    const allRounds = Array.from({ length: 40 }, (_, i) => i + 1);
    const allResults = await this.fetchMultipleRounds(seasonId, season, allRounds);

    const allFixturesRaw = [];
    allResults.forEach(({ round, events }) => {
      events.forEach(event => {
        allFixturesRaw.push({ round, event });
      });
    });

    const regularFixtures = [], playoffFixtures = [];
    allFixturesRaw.forEach(({ round, event }) => {
      const gameDate = new Date(event.dateEvent);
      const isRegular = regularSeasonEndDate && gameDate <= regularSeasonEndDate;
      const targetList = isRegular ? regularFixtures : playoffFixtures;

      targetList.push({
        id: event.idEvent,
        homeTeam: event.strHomeTeam,
        awayTeam: event.strAwayTeam,
        date: event.dateEvent,
        time: this.formatToIsraelTime(event.dateEvent, event.strTime),
        venue: event.strVenue,
        round: parseInt(event.intRound, 10),
        homeScore: event.intHomeScore !== null ? parseInt(event.intHomeScore) : null,
        awayScore: event.intAwayScore !== null ? parseInt(event.intAwayScore) : null,
        season: isRegular ? 'regular' : 'playoff'
      });
    });

    regularFixtures.sort((a, b) => new Date(a.date) - new Date(b.date));
    playoffFixtures.sort((a, b) => new Date(a.date) - new Date(b.date));
    const allFixtures = [...regularFixtures, ...playoffFixtures];

    const result = {
      regularFixtures,
      playoffFixtures,
      allFixtures,
      regularSeasonEndDate: regularSeasonEndDate?.toISOString() || null,
      metadata: {
        totalFixtures: allFixtures.length,
        regularSeasonFixtures: regularFixtures.length,
        playoffFixtures: playoffFixtures.length,
        regularSeasonEndDate: regularSeasonEndDate?.toISOString(),
        lastUpdated: new Date().toISOString(),
        fetchTimeMs: Date.now() - startTime,
        fetchTimeSeconds: Math.round((Date.now() - startTime) / 1000)
      }
    };

    this.setCache(cacheKey, result);
    return result;
  }

  getCacheStats() {
    const stats = {
      totalEntries: this.cache.size,
      entries: []
    };
    for (const [key, value] of this.cache.entries()) {
      const age = Date.now() - value.timestamp;
      stats.entries.push({
        key,
        ageMinutes: Math.round(age / 60000),
        size: JSON.stringify(value.data).length,
        isValid: this.isCacheValid(key)
      });
    }
    return stats;
  }

  clearCache(pattern = null) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
}

module.exports = FixturesService;
