// fetchFixtures.js
import { fetchFromApi } from "../utils/fetchFromApi";

export async function fetchFixtures(seasonId) {
  const season = "2024-2025";
  const cacheKey = `fixtures_${seasonId}_${season}`;

  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData) {
    console.log("Using cached fixtures ✅");
    return JSON.parse(cachedData);
  }

  try {
    let round = 1;
    const allFixtures = [];

    while (true) {
      const url = `https://www.thesportsdb.com/api/v1/json/3/eventsround.php?id=${seasonId}&r=${round}&s=${season}`;
      const data = await fetchFromApi(url);

      if (!data.events || data.events.length === 0) {
        console.log(`✅ Finished loading fixtures at round ${round - 1}`);
        break;
      }
  
      const fixturesForRound = data.events.map((event) => ({
    
        id: event.idEvent,
        homeTeam: event.strHomeTeam,
        awayTeam: event.strAwayTeam,
        date: event.dateEvent,
        time: event.strTime ? event.strTime.slice(0, 5) : '',
        venue: event.strVenue,
        round: parseInt(event.intRound, 10),
        homeScore: event.intHomeScore !== null ? parseInt(event.intHomeScore) : null,
        awayScore: event.intAwayScore !== null ? parseInt(event.intAwayScore) : null,
        
      }));

      

      allFixtures.push(...fixturesForRound);

      round++;
    }

    localStorage.setItem(cacheKey, JSON.stringify(allFixtures));
    return allFixtures;
  } catch (error) {
    console.error("Failed to fetch fixtures:", error);
    return [];
  }
}
