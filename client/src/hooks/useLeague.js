import { useState, useEffect } from 'react';
import { detectLeague } from '../utils/leagueUtils';
import { fetchFromApi } from '../utils/fetchFromApi';
import { calculateTable } from '../utils/leagueTable';
import { cacheManager } from '../utils/cacheManager';

export const useLeague = (favoriteTeam) => {
  const [league, setLeague] = useState(null);
  const [leagueType, setLeagueType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!favoriteTeam) return;

    const loadLeague = async () => {
      setLoading(true);
      try {
        const seasonId = await detectLeague(favoriteTeam);
        setLeague(seasonId);
        setLeagueType(seasonId === 4644 ? 'ligat-haal' : 'leumit');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadLeague();
  }, [favoriteTeam]);

  return { league, leagueType, loading, error };
};

export const useFixtures = (seasonId, leagueType) => {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [regularSeasonEndDate, setRegularSeasonEndDate] = useState(null);

  const formatToIsraelTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return "";
    const utcDateTime = new Date(`${dateStr}T${timeStr}Z`);
    return utcDateTime.toLocaleTimeString("he-IL", {
      timeZone: "Asia/Jerusalem",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const fetchAllFixtures = async (forceRefresh = false) => {
    if (!seasonId || !leagueType) return;
    
    const season = "2024-2025";
    const cacheKey = `fixtures_${seasonId}_${season}`;
    
    // If not forcing refresh, try to get from cache first
    if (!forceRefresh && cacheManager.isValidCache(cacheKey, cacheManager.CACHE_DURATIONS.fixtures)) {
      console.log(`📦 Using cached fixtures for season ${seasonId}`);
      const cachedData = cacheManager.getCache(cacheKey);
      if (cachedData) {
        setFixtures(cachedData.fixtures);
        setRegularSeasonEndDate(cachedData.regularSeasonEndDate ? new Date(cachedData.regularSeasonEndDate) : null);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      // Determine the final round of regular season
      const finalRegularRound = leagueType === 'ligat-haal' ? 26 : 30;
      
      // Step 1: Fetch regular season fixtures (rounds 1 to final round)
      const regularSeasonFixtures = [];
      
      console.log(`🔄 Fetching regular season rounds 1-${finalRegularRound} for season ${seasonId}`);
      
      for (let round = 1; round <= finalRegularRound; round++) {
        try {
          await cacheManager.waitForRateLimit('fixtures');
          
          const url = `https://www.thesportsdb.com/api/v1/json/3/eventsround.php?id=${seasonId}&r=${round}&s=${season}`;
          const data = await fetchFromApi(url);
          
          if (data?.events) {
            const roundFixtures = data.events.map((event) => ({
              id: event.idEvent,
              homeTeam: event.strHomeTeam,
              awayTeam: event.strAwayTeam,
              date: event.dateEvent,
              time: formatToIsraelTime(event.dateEvent, event.strTime),
              venue: event.strVenue,
              round: parseInt(event.intRound, 10),
              homeScore: event.intHomeScore !== null ? parseInt(event.intHomeScore) : null,
              awayScore: event.intAwayScore !== null ? parseInt(event.intAwayScore) : null,
              season: 'regular'
            }));
            regularSeasonFixtures.push(...roundFixtures);
          }
        } catch (err) {
          console.error(`Error fetching round ${round}:`, err);
        }
      }

      // Step 2: Find the latest date from the final round to determine regular season end
      const finalRoundFixtures = regularSeasonFixtures.filter(f => f.round === finalRegularRound);
      let latestRegularDate = null;
      
      if (finalRoundFixtures.length > 0) {
        const dates = finalRoundFixtures.map(f => new Date(f.date));
        latestRegularDate = new Date(Math.max(...dates));
        setRegularSeasonEndDate(latestRegularDate);
      }

      // Step 3: Fetch playoff fixtures (rounds 1-10 that occur after regular season)
      const playoffFixtures = [];
      
      console.log(`🎯 Fetching playoff rounds 1-10 after ${latestRegularDate ? latestRegularDate.toDateString() : 'N/A'}`);
      
      if (latestRegularDate) {
        for (let round = 1; round <= 10; round++) {
          try {
            await cacheManager.waitForRateLimit('fixtures');
            
            const url = `https://www.thesportsdb.com/api/v1/json/3/eventsround.php?id=${seasonId}&r=${round}&s=${season}`;
            const data = await fetchFromApi(url);
            
            if (data?.events) {
              // Filter only matches that occur AFTER the regular season end date
              const playoffRoundFixtures = data.events
                .filter(event => new Date(event.dateEvent) > latestRegularDate)
                .map((event) => ({
                  id: event.idEvent,
                  homeTeam: event.strHomeTeam,
                  awayTeam: event.strAwayTeam,
                  date: event.dateEvent,
                  time: formatToIsraelTime(event.dateEvent, event.strTime),
                  venue: event.strVenue,
                  round: parseInt(event.intRound, 10),
                  homeScore: event.intHomeScore !== null ? parseInt(event.intHomeScore) : null,
                  awayScore: event.intAwayScore !== null ? parseInt(event.intAwayScore) : null,
                  season: 'playoff'
                }));
              
              if (playoffRoundFixtures.length > 0) {
                playoffFixtures.push(...playoffRoundFixtures);
              }
            }
          } catch (err) {
            console.error(`Error fetching playoff round ${round}:`, err);
          }
        }
      }

      // Combine all fixtures
      const allFixtures = [...regularSeasonFixtures, ...playoffFixtures];
      
      // Cache the results
      const cacheData = {
        fixtures: allFixtures,
        regularSeasonEndDate: latestRegularDate ? latestRegularDate.toISOString() : null,
        fetchedAt: new Date().toISOString()
      };
      
      cacheManager.setCache(cacheKey, cacheData);
      
      setFixtures(allFixtures);
      
      console.log(`✅ Loaded ${regularSeasonFixtures.length} regular season + ${playoffFixtures.length} playoff fixtures for season ${seasonId}`);
      console.log(`💾 Cached fixtures for future use`);
      
    } catch (err) {
      setError(err.message);
      console.error('Error fetching fixtures:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    console.log(`🔄 Force refreshing fixtures for season ${seasonId}`);
    fetchAllFixtures(true);
  };

  useEffect(() => {
    fetchAllFixtures();
  }, [seasonId, leagueType]);

  return { 
    fixtures, 
    loading, 
    error, 
    refetch, 
    regularSeasonEndDate 
  };
};

export const useLeagueTable = (league) => {
  const [regularTable, setRegularTable] = useState([]);
  const [topPlayoff, setTopPlayoff] = useState([]);
  const [bottomPlayoff, setBottomPlayoff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [playoffLoading, setPlayoffLoading] = useState(false);

  const getLeagueConfig = (leagueType) => {
    if (leagueType === "ligat-haal") {
      return { seasonId: 4644, playoffStartRound: 26, topPlayoffSize: 6 };
    } else if (leagueType === "leumit") {
      return { seasonId: 4966, playoffStartRound: 30, topPlayoffSize: 8 };
    }
    return { seasonId: 0, playoffStartRound: 0, topPlayoffSize: 0 };
  };

  const fetchRegularSeason = async () => {
    try {
      setLoading(true);
      const { seasonId } = getLeagueConfig(league);
      const cacheKey = `table_${seasonId}_2024-2025`;

      // Try cache first
      const cachedTable = cacheManager.getCache(cacheKey);
      if (cachedTable && cacheManager.isValidCache(cacheKey, cacheManager.CACHE_DURATIONS.table)) {
        console.log(`📦 Using cached table for league ${seasonId}`);
        setRegularTable(cachedTable);
        return;
      }

      console.log(`🔄 Fetching table for league ${seasonId}`);
      const data = await fetchFromApi(
        `https://www.thesportsdb.com/api/v1/json/3/lookuptable.php?l=${seasonId}&s=2024-2025`
      );

      if (!data.table) return;
      
      const regular = data.table.map((team) => ({
        team: team.strTeam,
        rank: team.intRank,
        badge: team.strBadge,
        played: parseInt(team.intPlayed),
        win: parseInt(team.intWin),
        draw: parseInt(team.intDraw),
        loss: parseInt(team.intLoss),
        goalsFor: parseInt(team.intGoalsFor),
        goalsAgainst: parseInt(team.intGoalsAgainst),
        points: parseInt(team.intPoints),
      }));
      
      // Cache the table
      cacheManager.setCache(cacheKey, regular);
      setRegularTable(regular);
      
      console.log(`✅ Loaded and cached table for league ${seasonId}`);
    } catch (err) {
      console.error("Error fetching regular table:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayoffData = async () => {
    try {
      setPlayoffLoading(true);
      const { seasonId, playoffStartRound, topPlayoffSize } = getLeagueConfig(league);

      const lastRoundData = await fetchFromApi(
        `https://www.thesportsdb.com/api/v1/json/3/eventsround.php?id=${seasonId}&r=${playoffStartRound}&s=2024-2025`
      );

      const lastGames = lastRoundData.events || [];
      const lastDate = lastGames
        .map((e) => new Date(e.dateEvent))
        .sort((a, b) => b - a)[0];

      const rounds = Array.from({ length: 10 }, (_, i) => i + 1);
      const playoffGames = [];

      for (const r of rounds) {
        const data = await fetchFromApi(
          `https://www.thesportsdb.com/api/v1/json/3/eventsround.php?id=${seasonId}&r=${r}&s=2024-2025`
        );

        if (data?.events) {
          playoffGames.push(
            ...data.events.filter((e) => new Date(e.dateEvent) > lastDate)
          );
        }
      }

      const { topPlayoffTable, bottomPlayoffTable } = calculateTable(
        playoffGames,
        regularTable,
        { topPlayoffSize }
      );

      setTopPlayoff(topPlayoffTable);
      setBottomPlayoff(bottomPlayoffTable);
    } catch (err) {
      console.error("Error fetching playoff data:", err);
    } finally {
      setPlayoffLoading(false);
    }
  };

  useEffect(() => {
    if (league) {
      fetchRegularSeason();
    }
  }, [league]);

  return {
    regularTable,
    topPlayoff,
    bottomPlayoff,
    loading,
    playoffLoading,
    fetchPlayoffData,
    refetch: fetchRegularSeason
  };
};