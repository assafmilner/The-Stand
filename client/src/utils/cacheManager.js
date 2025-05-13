// utils/cacheManager.js - מנגנון ניהול cache מתקדם
class CacheManager {
    constructor() {
      this.CACHE_DURATIONS = {
        fixtures: 2 * 60 * 60 * 1000, // 2 שעות למחזורים
        table: 30 * 60 * 1000, // 30 דקות לטבלה
        default: 60 * 60 * 1000 // שעה כברירת מחדל
      };
      
      this.RATE_LIMITS = {
        fixtures: { window: 1000, max: 1 }, // בקשה אחת לשנייה
        table: { window: 2000, max: 1 }, // בקשה אחת ל-2 שניות
        default: { window: 1000, max: 2 }
      };
      
      this.rateLimitTracker = new Map();
    }
  
    // בדיקה אם המידע קיים בcache ולא פג תוקף
    isValidCache(key, duration = this.CACHE_DURATIONS.default) {
      const data = localStorage.getItem(key);
      const lastUpdate = localStorage.getItem(`${key}_lastUpdate`);
      
      if (!data || !lastUpdate) return false;
      
      const timeDiff = Date.now() - parseInt(lastUpdate);
      return timeDiff < duration;
    }
  
    // שליפת נתונים מcache
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
  
    // שמירת נתונים בcache
    setCache(key, data) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        localStorage.setItem(`${key}_lastUpdate`, Date.now().toString());
        console.log(`💾 Cache updated for key: ${key}`);
      } catch (error) {
        console.error('Error setting cache:', error);
        // במקרה של מחסור במקום, ננסה לנקות cache ישן
        this.cleanOldCache();
      }
    }
  
    // הסרת נתונים מcache
    removeCache(key) {
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}_lastUpdate`);
    }
  
    // בדיקת rate limiting
    checkRateLimit(type = 'default') {
      const limit = this.RATE_LIMITS[type] || this.RATE_LIMITS.default;
      const now = Date.now();
      const key = `rateLimit_${type}`;
      
      const tracker = this.rateLimitTracker.get(key) || { requests: [], window: limit.window };
      
      // הסרת בקשות ישנות מחוץ לחלון הזמן
      tracker.requests = tracker.requests.filter(time => now - time < tracker.window);
      
      // בדיקה אם עברנו את המגבלה
      if (tracker.requests.length >= limit.max) {
        const oldestRequest = Math.min(...tracker.requests);
        const waitTime = tracker.window - (now - oldestRequest);
        console.log(`⏳ Rate limited for ${type}. Wait ${waitTime}ms`);
        return { allowed: false, waitTime };
      }
      
      // הוספת הבקשה הנוכחית
      tracker.requests.push(now);
      this.rateLimitTracker.set(key, tracker);
      
      return { allowed: true, waitTime: 0 };
    }
  
    // המתנה לrate limit
    async waitForRateLimit(type = 'default') {
      const rateCheck = this.checkRateLimit(type);
      
      if (!rateCheck.allowed) {
        await new Promise(resolve => setTimeout(resolve, rateCheck.waitTime));
        return this.waitForRateLimit(type); // בדיקה חוזרת
      }
      
      return true;
    }
  
    // ניקוי cache ישן
    cleanOldCache() {
      const keys = Object.keys(localStorage);
      const now = Date.now();
      
      keys.forEach(key => {
        if (key.endsWith('_lastUpdate')) {
          const timestamp = parseInt(localStorage.getItem(key));
          const dataKey = key.replace('_lastUpdate', '');
          
          // אם הCache ישן יותר מ-24 שעות - נמחק אותו
          if (now - timestamp > 24 * 60 * 60 * 1000) {
            this.removeCache(dataKey);
            console.log(`🗑️ Cleaned old cache: ${dataKey}`);
          }
        }
      });
    }
  
    // שליפת נתונים עם cache ודילוג על duplicates
    async fetchWithCache(key, fetcher, type = 'default', duration) {
      const cacheDuration = duration || this.CACHE_DURATIONS[type] || this.CACHE_DURATIONS.default;
      
      // בדיקת cache קיים
      if (this.isValidCache(key, cacheDuration)) {
        const cachedAge = Date.now() - parseInt(localStorage.getItem(`${key}_lastUpdate`));
        console.log(`✅ Using cached data for ${key} (${Math.round(cachedAge / (1000 * 60))} minutes old)`);
        return this.getCache(key);
      }
  
      // בדיקה אם כבר טוען
      const loadingKey = `${key}_loading`;
      if (localStorage.getItem(loadingKey)) {
        console.log(`⏳ Data already loading for ${key}...`);
        
        // המתנה לסיום הטעינה
        return new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            if (!localStorage.getItem(loadingKey)) {
              clearInterval(checkInterval);
              resolve(this.getCache(key) || null);
            }
          }, 500);
        });
      }
  
      // בדיקת rate limiting
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
        
        // החזרת cache ישן במקרה של שגיאה
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
  
    // מחיקת כל הcache
    clearAllCache() {
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith('fixtures_') || 
            key.startsWith('table_') || 
            key.endsWith('_lastUpdate') ||
            key.endsWith('_loading')) {
          localStorage.removeItem(key);
        }
      });
      
      console.log('🗑️ All cache cleared');
    }
  
    // קבלת מידע על הcache הנוכחי
    getCacheInfo() {
      const keys = Object.keys(localStorage);
      const cacheInfo = {};
      
      keys.forEach(key => {
        if (key.endsWith('_lastUpdate')) {
          const dataKey = key.replace('_lastUpdate', '');
          const timestamp = parseInt(localStorage.getItem(key));
          const age = Date.now() - timestamp;
          
          cacheInfo[dataKey] = {
            lastUpdate: new Date(timestamp),
            ageMinutes: Math.round(age / (1000 * 60)),
            size: localStorage.getItem(dataKey)?.length || 0
          };
        }
      });
      
      return cacheInfo;
    }
  }
  
  // יצוא instance יחיד
  export const cacheManager = new CacheManager();
  export default cacheManager;