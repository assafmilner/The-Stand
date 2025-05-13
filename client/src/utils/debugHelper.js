// Debug utility - הוסף לקובץ utils או ליצור קובץ חדש
export class DebugHelper {
    static async testAPI() {
      console.log("🔬 Starting comprehensive API test...");
      
      // בדיקה 1: בדוק את השרת הפנימי
      console.log("\n1️⃣ Testing proxy server...");
      try {
        const proxyTest = await fetch('http://localhost:3001/api/proxy?url=https://www.google.com');
        console.log(`Proxy server status: ${proxyTest.status}`);
        if (proxyTest.ok) {
          console.log("✅ Proxy server is running");
        } else {
          console.log("❌ Proxy server returned error:", proxyTest.status);
        }
      } catch (error) {
        console.log("❌ Proxy server not accessible:", error.message);
      }
      
      // בדיקה 2: בדוק חיבור לthesportsdb
      console.log("\n2️⃣ Testing direct API connection...");
      const testUrls = [
        "https://www.thesportsdb.com/api/v1/json/3/all_sports.php",
        "https://www.thesportsdb.com/api/v1/json/3/lookuptable.php?l=4644&s=2024-2025",
        "https://www.thesportsdb.com/api/v1/json/3/eventsround.php?id=4644&r=1&s=2024-2025"
      ];
      
      for (const url of testUrls) {
        try {
          console.log(`\nTesting: ${url}`);
          const proxyUrl = `http://localhost:3001/api/proxy?url=${encodeURIComponent(url)}`;
          const response = await fetch(proxyUrl);
          console.log(`Status: ${response.status}`);
          
          if (response.ok) {
            const data = await response.json();
            console.log("✅ Success - Data keys:", Object.keys(data));
          } else {
            const errorText = await response.text();
            console.log("❌ Error:", errorText);
          }
        } catch (error) {
          console.log("❌ Request failed:", error.message);
        }
      }
      
      // בדיקה 3: בדוק מחזור ספציפי
      console.log("\n3️⃣ Testing specific round...");
      const roundUrl = "https://www.thesportsdb.com/api/v1/json/3/eventsround.php?id=4644&r=15&s=2024-2025";
      try {
        const proxyUrl = `http://localhost:3001/api/proxy?url=${encodeURIComponent(roundUrl)}`;
        const response = await fetch(proxyUrl);
        
        if (response.ok) {
          const data = await response.json();
          if (data.events && data.events.length > 0) {
            console.log("✅ Found events:", data.events.length);
            const event = data.events[0];
            console.log("Sample event:", {
              id: event.idEvent,
              home: event.strHomeTeam,
              away: event.strAwayTeam,
              date: event.dateEvent,
              round: event.intRound
            });
          } else {
            console.log("📊 No events in response");
          }
        } else {
          console.log("❌ Failed to fetch round data");
        }
      } catch (error) {
        console.log("❌ Error testing round:", error.message);
      }
    }
    
    static logCacheStatus() {
      console.log("\n💾 Cache Status:");
      const cacheKeys = Object.keys(localStorage).filter(key => key.includes('fixtures_'));
      if (cacheKeys.length === 0) {
        console.log("No fixtures in cache");
      } else {
        cacheKeys.forEach(key => {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            console.log(`${key}: ${data.length} matches`);
          } catch {
            console.log(`${key}: Invalid data`);
          }
        });
      }
    }
    
    static clearAllCache() {
      console.log("\n🗑️ Clearing all fixtures cache...");
      const cacheKeys = Object.keys(localStorage).filter(key => key.includes('fixtures_'));
      cacheKeys.forEach(key => localStorage.removeItem(key));
      console.log(`Cleared ${cacheKeys.length} cache entries`);
    }
  }
  
  // הוסף לגלובל scope לנוחות
  window.DebugHelper = DebugHelper;
  
  console.log(`
  🔬 Debug Helper loaded! 
  Use these commands:
  - DebugHelper.testAPI() - Test API connectivity
  - DebugHelper.logCacheStatus() - Check cache status  
  - DebugHelper.clearAllCache() - Clear all cached fixtures
  `);