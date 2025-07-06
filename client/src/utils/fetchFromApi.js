// fetchFromApi.js - גרסה משופרת עם retry logic
export async function fetchFromApi(apiUrl, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      
      
      const proxyUrl = `http://localhost:3001/api/proxy?url=${encodeURIComponent(apiUrl)}`;
     
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 seconds timeout
      });
      
    
      
      if (!response.ok) {
        const errorText = await response.text();
       
        throw new Error(`Failed to fetch from API. Status: ${response.status}, Message: ${errorText}`);
      }
      
      const data = await response.json();
     
      
      // בדיקה שהנתונים תקינים
      if (!data) {
        throw new Error('Received null or undefined data');
      }
      
      return data;
    } catch (error) {
      lastError = error;
    
      
      // אם זו לא הנסיון האחרון, חכה לפני הנסיון הבא
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt - 1) * 1000; // Exponential backoff
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  console.error(`💥 All ${maxRetries} attempts failed. Last error:`, lastError);
  throw lastError;
}

// נוסיף גם פונקציה לבדוק את תקינות השרת
export async function checkProxyHealth() {
  try {
    console.log("🏥 Checking proxy server health...");
    const testUrl = "https://www.thesportsdb.com/api/v1/json/3/all_sports.php";
    const result = await fetchFromApi(testUrl, 1);
    console.log("✅ Proxy server is healthy");
    return true;
  } catch (error) {
    console.error("❌ Proxy server appears to be down:", error);
    return false;
  }
}