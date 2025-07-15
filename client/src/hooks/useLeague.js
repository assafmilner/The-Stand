import { useState, useEffect } from 'react';
import { detectLeague } from '../utils/leagueUtils';
import api from '../utils/api';
import { calculateTable } from '../utils/leagueTable';

const SEASON = "2025-2026";

// מזהה את הליגה לפי הקבוצה
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

// מביא את לוח המשחקים מהשרת
export const useFixtures = (seasonId, leagueType) => {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [regularSeasonEndDate, setRegularSeasonEndDate] = useState(null);

  const fetchAllFixtures = async (forceRefresh = false) => {
    if (!seasonId || !leagueType) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/api/fixtures/smart', {
        params: {
          seasonId: seasonId.toString(),
          season: SEASON,
          //force: forceRefresh.toString(),
   
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch fixtures');
      }
      
      const fixturesArray = response.data.data || [];
      setFixtures(fixturesArray);
     
      setRegularSeasonEndDate(fixturesArray.regularSeasonEndDate ? new Date(fixturesArray.regularSeasonEndDate) : null);
    } catch (err) {
      console.error('❌ Error fetching fixtures:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllFixtures();
  }, [seasonId, leagueType]);

  return {
    fixtures,
    loading,
    error,
    refetch: () => fetchAllFixtures(true),
    regularSeasonEndDate
  };
};

// טבלת ליגה חכמה מהשרת
export const useLeagueTable = (leagueId) => {
  const [regularTable, setRegularTable] = useState([]);
  const [topPlayoff, setTopPlayoff] = useState([]);
  const [bottomPlayoff, setBottomPlayoff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [playoffLoading, setPlayoffLoading] = useState(false);

  const getLeagueConfig = (id) => {
    if (id === 4644) return { seasonId: 4644, playoffStartRound: 26, topPlayoffSize: 6 };
    if (id === 4966) return { seasonId: 4966, playoffStartRound: 30, topPlayoffSize: 8 };
    return { seasonId: 0, playoffStartRound: 0, topPlayoffSize: 0 };
  };

  const fetchRegularSeason = async () => {
    if (!leagueId) return;
    setLoading(true);
    try {

      const res = await api.get("/api/league/table", {
        params: {
          seasonId: leagueId,
          season: SEASON,
        },
      });

      if (!res.data.success) throw new Error("Failed to fetch league table");

      setRegularTable(res.data.table || []);
    } catch (err) {
      console.error("❌ Failed to load regular season table:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayoffData = async () => {
  try {
    setPlayoffLoading(true);
    const { seasonId, playoffStartRound, topPlayoffSize } = getLeagueConfig(leagueId);

    // שליפת המחזור האחרון בעונה הסדירה
    const roundRes = await api.get("/api/fixtures/round", {
      params: { seasonId, round: playoffStartRound - 1, season: SEASON }
    });

    const lastRoundGames = roundRes.data?.events || [];

    // בדיקת תאריך אחרון
    const lastGameDate = lastRoundGames
      .map((g) => new Date(`${g.dateEvent}T${g.strTime || "00:00:00"}`))
      .sort((a, b) => b - a)[0];

    if (!lastGameDate || new Date() < lastGameDate) {
      console.log("⏳ Waiting for regular season to end before showing playoff table");
      return;
    }

    const res = await api.get("/api/league/playoff", {
      params: { seasonId, season: SEASON },
    });

    if (res.data.success && res.data.games?.length && regularTable.length) {
      const { topPlayoffTable, bottomPlayoffTable } = calculateTable(
        res.data.games,
        regularTable,
        { topPlayoffSize }
      );
      setTopPlayoff(topPlayoffTable);
      setBottomPlayoff(bottomPlayoffTable);
    }
  } catch (err) {
    console.error("❌ Error fetching playoff data:", err);
  } finally {
    setPlayoffLoading(false);
  }
};

  useEffect(() => {
    fetchRegularSeason();
  }, [leagueId]);

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
