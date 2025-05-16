// utils/cacheManager.js - Enhanced cache manager for league data
class CacheManager {
  constructor() {
    this.CACHE_DURATIONS = {
      fixtures: 2 * 60 * 60 * 1000, // 2 hours for fixtures
      table: 30 * 60 * 1000, // 30 minutes for tables
      leagueDetection: 24 * 60 * 60 * 1000, // 24 hours for league detection
      default: 60 * 60 * 1000 // 1 hour default
    };
    
    this.RATE_LIMITS = {
      fixtures: { window: 1000, max: 1 }, // 1 request per second
      table: { window: 2000, max: 1 }, // 1 request per 2 seconds
      default: { window: 1000, max: 2 }
    };
    
    this.rateLimitTracker = new Map();
  }

  // Check if cache exists and is valid
  isValidCache(key, duration = this.CACHE_DURATIONS.default) {
    const data = localStorage.getItem(key);
    const lastUpdate = localStorage.getItem(`${key}_lastUpdate`);
    
    if (!data || !lastUpdate) return false;
    
    const timeDiff = Date.now() - parseInt(lastUpdate);
    return timeDiff < duration;
  }

  // Get data from cache
  getCache(key) {
    const data = localStorage.getItem(key);
    if (!data) return null;
    
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Error parsing cached data:', error);
      this.removeCache(key);
      return null;
    }
  }

  // Save data to cache
  setCache(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      localStorage.setItem(`${key}_lastUpdate`, Date.now().toString());
      console.log(`💾 Cache updated for key: ${key}`);
    } catch (error) {
      console.error('Error setting cache:', error);
      // If storage is full, try to clean old cache
      this.cleanOldCache();
      // Try again after cleaning
      try {
        localStorage.setItem(key, JSON.stringify(data));
        localStorage.setItem(`${key}_lastUpdate`, Date.now().toString());
        console.log(`💾 Cache updated for key: ${key} (after cleanup)`);
      } catch (retryError) {
        console.error('Cache still full after cleanup:', retryError);
      }
    }
  }

  // Remove data from cache
  removeCache(key) {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_lastUpdate`);
    localStorage.removeItem(`${key}_loading`);
  }

  // Rate limiting check
  checkRateLimit(type = 'default') {
    const limit = this.RATE_LIMITS[type] || this.RATE_LIMITS.default;
    const now = Date.now();
    const key = `rateLimit_${type}`;
    
    const tracker = this.rateLimitTracker.get(key) || { requests: [], window: limit.window };
    
    // Remove old requests outside the time window
    tracker.requests = tracker.requests.filter(time => now - time < tracker.window);
    
    // Check if we've exceeded the limit
    if (tracker.requests.length >= limit.max) {
      const oldestRequest = Math.min(...tracker.requests);
      const waitTime = tracker.window - (now - oldestRequest);
      console.log(`⏳ Rate limited for ${type}. Wait ${waitTime}ms`);
      return { allowed: false, waitTime };
    }
    
    // Add current request
    tracker.requests.push(now);
    this.rateLimitTracker.set(key, tracker);
    
    return { allowed: true, waitTime: 0 };
  }

  // Wait for rate limit
  async waitForRateLimit(type = 'default') {
    const rateCheck = this.checkRateLimit(type);
    
    if (!rateCheck.allowed) {
      await new Promise(resolve => setTimeout(resolve, rateCheck.waitTime));
      return this.waitForRateLimit(type); // Recursive check
    }
    
    return true;
  }

  // Clean old cache entries
  cleanOldCache() {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    keys.forEach(key => {
      if (key.endsWith('_lastUpdate')) {
        const timestamp = parseInt(localStorage.getItem(key));
        const dataKey = key.replace('_lastUpdate', '');
        
        // If cache is older than 24 hours, remove it
        if (now - timestamp > maxAge) {
          this.removeCache(dataKey);
          console.log(`🗑️ Cleaned old cache: ${dataKey}`);
        }
      }
    });
  }

  // Advanced cache method with loading prevention
  async fetchWithCache(key, fetcher, type = 'default', duration) {
    const cacheDuration = duration || this.CACHE_DURATIONS[type] || this.CACHE_DURATIONS.default;
    
    // Check existing cache
    if (this.isValidCache(key, cacheDuration)) {
      const cachedAge = Date.now() - parseInt(localStorage.getItem(`${key}_lastUpdate`));
      console.log(`✅ Using cached data for ${key} (${Math.round(cachedAge / (1000 * 60))} minutes old)`);
      return this.getCache(key);
    }

    // Check if already loading
    const loadingKey = `${key}_loading`;
    if (localStorage.getItem(loadingKey)) {
      console.log(`⏳ Data already loading for ${key}...`);
      
      // Wait for loading to complete
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!localStorage.getItem(loadingKey)) {
            clearInterval(checkInterval);
            resolve(this.getCache(key) || null);
          }
        }, 500);
        
        // Timeout after 30 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          localStorage.removeItem(loadingKey);
          resolve(null);
        }, 30000);
      });
    }

    // Apply rate limiting
    await this.waitForRateLimit(type);

    try {
      localStorage.setItem(loadingKey, 'true');
      console.log(`🚀 Fetching new data for ${key}...`);
      
      const data = await fetcher();
      
      if (data) {
        this.setCache(key, data);
      }
      
      return data;
    } catch (error) {
      console.error(`❌ Error fetching ${key}:`, error);
      
      // Return old cache if available
      const oldCache = this.getCache(key);
      if (oldCache) {
        console.log(`🔄 Returning old cached data for ${key}`);
        return oldCache;
      }
      
      throw error;
    } finally {
      localStorage.removeItem(loadingKey);
    }
  }

  // League-specific methods
  
  // Get fixtures cache key
  getFixturesCacheKey(seasonId, season = '2024-2025') {
    return `fixtures_${seasonId}_${season}`;
  }

  // Get table cache key
  getTableCacheKey(seasonId, season = '2024-2025') {
    return `table_${seasonId}_${season}`;
  }

  // Get league detection cache key
  getLeagueDetectionCacheKey(teamName) {
    return `league_detection_${teamName}`;
  }

  // Clear all league-related cache
  clearLeagueCache(seasonId = null) {
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      const isLeagueKey = key.startsWith('fixtures_') || 
                         key.startsWith('table_') || 
                         key.startsWith('league_detection_') ||
                         key.endsWith('_lastUpdate') ||
                         key.endsWith('_loading');
      
      if (seasonId) {
        // Clear specific season
        if (key.includes(`_${seasonId}_`) && isLeagueKey) {
          localStorage.removeItem(key);
        }
      } else {
        // Clear all league cache
        if (isLeagueKey) {
          localStorage.removeItem(key);
        }
      }
    });
    
    console.log(seasonId ? `🗑️ Cleared cache for season ${seasonId}` : '🗑️ Cleared all league cache');
  }

  // Clear all cache (including non-league)
  clearAllCache() {
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith('fixtures_') || 
          key.startsWith('table_') || 
          key.startsWith('league_detection_') ||
          key.endsWith('_lastUpdate') ||
          key.endsWith('_loading')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('🗑️ All cache cleared');
  }

  // Get comprehensive cache info
  getCacheInfo() {
    const keys = Object.keys(localStorage);
    const cacheInfo = {};
    
    keys.forEach(key => {
      if (key.endsWith('_lastUpdate')) {
        const dataKey = key.replace('_lastUpdate', '');
        const timestamp = parseInt(localStorage.getItem(key));
        const age = Date.now() - timestamp;
        const data = localStorage.getItem(dataKey);
        
        cacheInfo[dataKey] = {
          lastUpdate: new Date(timestamp),
          ageMinutes: Math.round(age / (1000 * 60)),
          ageHours: Math.round(age / (1000 * 60 * 60)),
          size: data ? data.length : 0,
          sizeKB: data ? Math.round(data.length / 1024) : 0,
          isValid: this.isValidCache(dataKey),
          type: this.detectCacheType(dataKey)
        };
      }
    });
    
    return cacheInfo;
  }

  // Detect cache type for better organization
  detectCacheType(key) {
    if (key.startsWith('fixtures_')) return 'fixtures';
    if (key.startsWith('table_')) return 'table';
    if (key.startsWith('league_detection_')) return 'league-detection';
    return 'other';
  }

  // Get cache statistics
  getCacheStats() {
    const info = this.getCacheInfo();
    const stats = {
      total: Object.keys(info).length,
      fixtures: 0,
      tables: 0,
      leagueDetection: 0,
      totalSizeKB: 0,
      valid: 0,
      expired: 0
    };

    Object.values(info).forEach(item => {
      stats.totalSizeKB += item.sizeKB;
      stats[item.type.replace('-', '')]++;
      
      if (item.isValid) {
        stats.valid++;
      } else {
        stats.expired++;
      }
    });

    return stats;
  }

  // Check if league data is cached
  hasLeagueData(seasonId, season = '2024-2025') {
    const fixturesKey = this.getFixturesCacheKey(seasonId, season);
    const tableKey = this.getTableCacheKey(seasonId, season);
    
    return {
      hasFixtures: this.isValidCache(fixturesKey, this.CACHE_DURATIONS.fixtures),
      hasTable: this.isValidCache(tableKey, this.CACHE_DURATIONS.table),
      fixturesAge: this.getCacheAge(fixturesKey),
      tableAge: this.getCacheAge(tableKey)
    };
  }

  // Get cache age in minutes
  getCacheAge(key) {
    const lastUpdate = localStorage.getItem(`${key}_lastUpdate`);
    if (!lastUpdate) return null;
    
    const age = Date.now() - parseInt(lastUpdate);
    return Math.round(age / (1000 * 60));
  }

  // Preload league data (for performance optimization)
  async preloadLeagueData(seasonId, leagueType) {
    const season = '2024-2025';
    const fixturesKey = this.getFixturesCacheKey(seasonId, season);
    const tableKey = this.getTableCacheKey(seasonId, season);
    
    const promises = [];
    
    // Preload fixtures if not cached
    if (!this.isValidCache(fixturesKey)) {
      console.log(`📦 Preloading fixtures for season ${seasonId}`);
      // This would be called with the actual fetcher function
      // promises.push(this.fetchWithCache(fixturesKey, fixturesFetcher, 'fixtures'));
    }
    
    // Preload table if not cached
    if (!this.isValidCache(tableKey)) {
      console.log(`📦 Preloading table for season ${seasonId}`);
      // This would be called with the actual fetcher function
      // promises.push(this.fetchWithCache(tableKey, tableFetcher, 'table'));
    }
    
    if (promises.length > 0) {
      await Promise.allSettled(promises);
      console.log(`✅ Preload completed for season ${seasonId}`);
    } else {
      console.log(`📋 All data already cached for season ${seasonId}`);
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();
export default cacheManager;