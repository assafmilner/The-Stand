// fan-server/services/fixturesService.js (Fixed: Better rate limiting and error handling)
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
    this.requestDelay = 250; // 250ms between requests
    this.maxRetries = 3;
    this.batchSize = 5; // Process 5 rounds at a time
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

  // הוספת delay בין קריאות
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchRound(seasonId, round, season, retryCount = 0) {
    const apiUrl = `https://www.thesportsdb.com/api/v1/json/3/eventsround.php?id=${seasonId}&r=${round}&s=${season}`;
    
    try {
      // נסה דרך proxy תחילה
      const proxyUrl = process.env.THESPORTSDB_PROXY_URL || 'http://localhost:3001/api/proxy';
      const url = `${proxyUrl}?url=${encodeURIComponent(apiUrl)}`;
      
      const response = await fetch(url, {
        timeout: 10000 // 10 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
      
    } catch (proxyError) {
     
      
      try {
        // נסה קריאה ישירה
        const response = await fetch(apiUrl, {
          timeout: 10000
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
        
      } catch (directError) {
        // אם שתי הקריאות נכשלו ויש עוד ניסיונות
        if (retryCount < this.maxRetries) {
      
          await this.delay(1000 * (retryCount + 1)); // Exponential backoff
          return this.fetchRound(seasonId, round, season, retryCount + 1);
        }
        
        throw new Error(`Failed to fetch round ${round} after ${this.maxRetries} retries: ${directError.message}`);
      }
    }
  }

  // משיכת מחזורים בבאצ'ים קטנים עם delay
  async fetchMultipleRoundsWithRateLimit(seasonId, season, rounds) {
    const results = [];


    // חלק את המחזורים לבאצ'ים
    for (let i = 0; i < rounds.length; i += this.batchSize) {
      const batch = rounds.slice(i, i + this.batchSize);
  
      // עבד באצ' נוכחי
      const batchPromises = batch.map(async (round, index) => {
        // הוסף delay בין קריאות באותו באצ'
        if (index > 0) {
          await this.delay(this.requestDelay);
        }
        
        try {
          const data = await this.fetchRound(seasonId, round, season);

          return { round, events: data.events || [], success: true };
        } catch (error) {
          console.error(`   ❌ Round ${round} failed:`, error.message);
          return { round, events: [], success: false, error: error.message };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // delay בין באצ'ים
      if (i + this.batchSize < rounds.length) {

        await this.delay(this.requestDelay * 2);
      }
    }

    const successfulRounds = results.filter(r => r.success).length;
    const failedRounds = results.filter(r => !r.success).length;


    return results;
  }

  getLeagueConfig(seasonId) {
    const configs = {
      4644: { name: 'ligat-haal', finalRegularRound: 26, totalRounds: 35 },
      4966: { name: 'leumit', finalRegularRound: 30, totalRounds: 37 }
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

    try {
      // Step 1: Determine regular season end date from final round

      const finalRoundData = await this.fetchRound(seasonId, config.finalRegularRound, season);
      const finalDates = (finalRoundData?.events || []).map(e => new Date(e.dateEvent));
      const regularSeasonEndDate = finalDates.length > 0 ? new Date(Math.max(...finalDates)) : null;


      // Step 2: Smart round range - don't fetch empty rounds
      const smartRounds = Array.from({ length: config.totalRounds }, (_, i) => i + 1);


      // Step 3: Fetch all rounds with rate limiting
      const allResults = await this.fetchMultipleRoundsWithRateLimit(seasonId, season, smartRounds);

      // Step 4: Process fixtures
      const allFixturesRaw = [];
      allResults.forEach(({ round, events, success }) => {
        if (success && events) {
          events.forEach(event => {
            allFixturesRaw.push({ round, event });
          });
        }
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

      const fetchTimeSeconds = Math.round((Date.now() - startTime) / 1000);
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
          fetchTimeSeconds,
          successfulRounds: allResults.filter(r => r.success).length,
          failedRounds: allResults.filter(r => !r.success).length,
          totalRoundsAttempted: allResults.length
        }
      };

      this.setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error(`💥 Fatal error in fetchAllFixtures:`, error);
      throw error;
    }
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