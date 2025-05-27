// client/src/hooks/useLeague.js (Updated to use server-side API)
import { useState, useEffect } from 'react';
import { detectLeague } from '../utils/leagueUtils';
import { fetchFromApi } from '../utils/fetchFromApi';
import { calculateTable } from '../utils/leagueTable';
import api from '../utils/api'; // Use existing API utility

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

// Updated useFixtures hook to use server-side API
export const useFixtures = (seasonId, leagueType) => {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [regularSeasonEndDate, setRegularSeasonEndDate] = useState(null);

  const fetchAllFixtures = async (forceRefresh = false) => {
    if (!seasonId || !leagueType) return;
    
    setLoading(true);
    setError(null);
    
    const season = "2024-2025";
    
    try {

      
      // Call the server-side API instead of fetching directly
      const response = await api.get('/api/fixtures', {
        params: {
          seasonId: seasonId.toString(),
          season,
          force: forceRefresh.toString(),
          format: 'processed' // Get the full processed result
        }
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch fixtures');
      }
      
      const data = response.data.data;
      
      // Extract data from the server response
      const allFixtures = data.allFixtures || [];
      const regularSeasonEnd = data.regularSeasonEndDate 
        ? new Date(data.regularSeasonEndDate) 
        : null;
      
      setFixtures(allFixtures);
      setRegularSeasonEndDate(regularSeasonEnd);
      

      
    } catch (err) {
      console.error('❌ Error fetching fixtures:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {

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

// The useLeagueTable hook remains mostly the same, but can be optimized later
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
      
      setRegularTable(regular);
 
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