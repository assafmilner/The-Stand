// fetchFixtures.js - גרסה משופרת עם CacheManager ו-loading states
import { fetchFromApi } from "../utils/fetchFromApi";
import { cacheManager } from "../utils/cacheManager";

function formatToIsraelTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return "";
  const utcDateTime = new Date(`${dateStr}T${timeStr}Z`);
  return utcDateTime.toLocaleTimeString("he-IL", {
    timeZone: "Asia/Jerusalem",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export async function fetchFixtures(seasonId, onProgress) {
  const season = "2024-2025";
  const cacheKey = `fixtures_${seasonId}_${season}`;
  
  try {
    // נשתמש בCache Manager עם מנגנון rate limiting
    const fixtures = await cacheManager.fetchWithCache(
      cacheKey,
      async () => {
        return await fetchFixturesFromAPI(seasonId, onProgress);
      },
      'fixtures' // type עבור rate limiting
    );
    
    return fixtures || [];
  } catch (error) {
    console.error(`❌ Error fetching fixtures for season ${seasonId}:`, error);
    // במקרה של שגיאה, ננסה להחזיר cache ישן אם קיים
    const oldCache = cacheManager.getCache(cacheKey);
    return oldCache || [];
  }
}

// פונקציה פרטית לשליפת הנתונים מהAPI
async function fetchFixturesFromAPI(seasonId, onProgress) {
  const season = "2024-2025";
  let round = 1;
  const allFixtures = [];
  let consecutiveEmptyRounds = 0;
  const maxEmptyRounds = 3;
  
  console.log(`🚀 Starting fixture fetch for season ${season}, league ${seasonId}...`);
  
  // קריאה לcallback של הProgress אם סופק
  if (onProgress) {
    onProgress({ phase: 'starting', round: 0, total: 0, message: 'מתחיל לטעון מחזורים...' });
  }
  
  while (true) {
    try {
      // עדכון progress
      if (onProgress) {
        onProgress({ 
          phase: 'loading', 
          round, 
          total: allFixtures.length, 
          message: `טוען מחזור ${round}...` 
        });
      }
      
      // בקשת נתונים עם timeout
      const url = `https://www.thesportsdb.com/api/v1/json/3/eventsround.php?id=${seasonId}&r=${round}&s=${season}`;
      const data = await fetchFromApi(url);
      
      if (!data.events || data.events.length === 0) {
        consecutiveEmptyRounds++;
        console.log(`📭 Round ${round}: No events found (${consecutiveEmptyRounds}/${maxEmptyRounds} consecutive empty)`);
        
        if (consecutiveEmptyRounds >= maxEmptyRounds) {
          console.log(`✅ Stopping fetch - ${maxEmptyRounds} consecutive empty rounds`);
          break;
        }
        
        round++;
        continue;
      }
      
      // איפוס הספירה של מחזורים ריקים
      consecutiveEmptyRounds = 0;
      
      const fixturesForRound = data.events.map((event) => ({
        id: event.idEvent,
        homeTeam: event.strHomeTeam,
        awayTeam: event.strAwayTeam,
        date: event.dateEvent,
        time: formatToIsraelTime(event.dateEvent, event.strTime),
        venue: event.strVenue,
        round: parseInt(event.intRound, 10),
        homeScore: event.intHomeScore !== null ? parseInt(event.intHomeScore) : null,
        awayScore: event.intAwayScore !== null ? parseInt(event.intAwayScore) : null,
      }));
      
      console.log(`📅 Round ${round}: Found ${fixturesForRound.length} fixtures`);
      allFixtures.push(...fixturesForRound);
      
      // עדכון progress
      if (onProgress) {
        onProgress({ 
          phase: 'loading', 
          round, 
          total: allFixtures.length, 
          message: `נמצאו ${fixturesForRound.length} משחקים במחזור ${round}` 
        });
      }
      
      round++;
      
      // המתנה קצרה כדי לא להציף את השרת
      // זה יעבוד יחד עם ה-rate limiting של הCache Manager
      await new Promise(resolve => setTimeout(resolve, 50));
      
    } catch (error) {
      console.error(`❌ Error fetching round ${round}:`, error);
      
      // אם יש שגיאה, ננסה שוב אחרי המתנה קצרה
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // אם החזרנו פחות משחקים, נמשיך לנסות
      if (allFixtures.length === 0) {
        round++;
        continue;
      } else {
        // אם כבר יש לנו משחקים, נעצור כאן
        console.log('Stopping due to error, but we have some fixtures');
        break;
      }
    }
  }
  
  // עדכון progress סופי
  if (onProgress) {
    onProgress({ 
      phase: 'completed', 
      round: round - 1, 
      total: allFixtures.length, 
      message: `הטעינה הושלמה! נמצאו ${allFixtures.length} משחקים` 
    });
  }
  
  console.log(`✅ Fetch completed! Total fixtures: ${allFixtures.length}`);
  return allFixtures;
}

// פונקציה עזר לקבלת מידע על הcache
export function getFixturesCacheInfo(seasonId) {
  const season = "2024-2025";
  const cacheKey = `fixtures_${seasonId}_${season}`;
  
  return cacheManager.getCacheInfo()[cacheKey] || null;
}

// פונקציה לניקוי cache של מחזורים
export function clearFixturesCache(seasonId = null) {
  if (seasonId) {
    const season = "2024-2025";
    const cacheKey = `fixtures_${seasonId}_${season}`;
    cacheManager.removeCache(cacheKey);
    console.log(`🗑️ Cleared fixtures cache for season ${seasonId}`);
  } else {
    // מחיקת כל הcache של המחזורים
    const allCacheInfo = cacheManager.getCacheInfo();
    Object.keys(allCacheInfo).forEach(key => {
      if (key.startsWith('fixtures_')) {
        cacheManager.removeCache(key);
      }
    });
    console.log('🗑️ Cleared all fixtures cache');
  }
}