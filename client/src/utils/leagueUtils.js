import teamNameMap from "./teams-hebrew";
import { fetchFromApi } from "./fetchFromApi";

export async function detectLeague(favoriteTeamHebrew) {
  if (!favoriteTeamHebrew) {
    console.log("⚠️ No favorite team provided");
    return null;
  }

  const reverseTeamMap = Object.entries(teamNameMap).reduce(
    (acc, [eng, data]) => {
      acc[data.name] = eng;
      return acc;
    },
    {}
  );

  const favoriteTeamEnglish = reverseTeamMap[favoriteTeamHebrew];

  if (!favoriteTeamEnglish) {
    console.log(`⚠️ No English mapping found for team: ${favoriteTeamHebrew}`);
    return null;
  }

  

  // בדיקה עם אחסון cache לזיהוי ליגה
  const cacheKey = `league_detection_${favoriteTeamEnglish}`;
  const cachedLeague = localStorage.getItem(cacheKey);
  
  if (cachedLeague) {

    return parseInt(cachedLeague);
  }

  try {
   

    const ligatHaAlData = await fetchFromApi(
      "https://www.thesportsdb.com/api/v1/json/3/lookuptable.php?l=4644&s=2024-2025"
    );
    
    const ligatHaAlTeams = ligatHaAlData.table?.map((team) => team.strTeam) || [];

    
    const isInLigatHaAl = ligatHaAlTeams.includes(favoriteTeamEnglish);
    
    if (isInLigatHaAl) {
 
      localStorage.setItem(cacheKey, "4644");
      return 4644;
    }
    
    // אם לא נמצא בליגת העל, נבדק בליגה הלאומית

    const leumitData = await fetchFromApi(
      "https://www.thesportsdb.com/api/v1/json/3/lookuptable.php?l=4966&s=2024-2025"
    );
    
    const leumitTeams = leumitData.table?.map((team) => team.strTeam) || [];

    
    const isInLeumit = leumitTeams.includes(favoriteTeamEnglish);
    
    if (isInLeumit) {

      localStorage.setItem(cacheKey, "4966");
      return 4966;
    }
    


    localStorage.setItem(cacheKey, "4644");
    return 4644;
    
  } catch (error) {
    console.error("Failed to detect league:", error);
    // במקרה של שגיאה, נחזיר ליגת העל כברירת מחדל
    return 4644;
  }
}