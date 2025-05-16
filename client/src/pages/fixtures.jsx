import React, { useEffect, useRef } from "react";
import Layout from "../components/layout/Layout";
import { useUser } from "../context/UserContext";
import { RefreshCw } from "lucide-react";
import { useLeague, useFixtures } from "../hooks/useLeague";
import { FixturesList } from "../components/league";
import teamNameMap from "../utils/teams-hebrew";
import teamColors from "../utils/teamStyles";

function Fixtures() {
  const { user } = useUser();
  const { league, leagueType, loading: leagueLoading, error: leagueError } = useLeague(user?.favoriteTeam);
  const { fixtures, loading, error, refetch, regularSeasonEndDate } = useFixtures(league, leagueType);
  const fixtureRefs = useRef({});

  const colors = teamColors[user?.favoriteTeam || "הפועל תל אביב"];

  // Get English team name for filtering
  const reverseTeamMap = Object.entries(teamNameMap).reduce(
    (acc, [eng, data]) => {
      acc[data.name] = eng;
      return acc;
    },
    {}
  );
  const favoriteTeamEnglish = reverseTeamMap[user?.favoriteTeam];

  // Separate fixtures into regular season and playoff based on season property
  const separateFixtures = () => {
    if (!fixtures.length) return { 
      regularFixtures: [], 
      playoffFixtures: []
    };

    const regularFixtures = fixtures.filter(match => match.season === 'regular');
    const playoffFixtures = fixtures.filter(match => match.season === 'playoff');

    // Sort both by date
    regularFixtures.sort((a, b) => new Date(a.date) - new Date(b.date));
    playoffFixtures.sort((a, b) => new Date(a.date) - new Date(b.date));

    return { regularFixtures, playoffFixtures };
  };

  const { regularFixtures, playoffFixtures } = separateFixtures();

  // Find the closest upcoming game for the favorite team
  const findClosestUpcomingGame = () => {
    if (!fixtures.length || !favoriteTeamEnglish) return null;

    const now = new Date();
    
    // Filter games for the favorite team
    const teamFixtures = fixtures.filter(
      (match) =>
        match.homeTeam === favoriteTeamEnglish ||
        match.awayTeam === favoriteTeamEnglish
    );

    // Find upcoming games
    const upcomingGames = teamFixtures.filter((match) => {
      const [year, month, day] = match.date.split("-");
      let matchDateTime = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day)
      );

      if (match.time) {
        const [hours, minutes] = match.time.split(":");
        matchDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      } else {
        matchDateTime.setHours(23, 59, 59, 999);
      }

      return matchDateTime >= now;
    });

    // Sort by date and return the closest
    const sortedGames = upcomingGames.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });

    return sortedGames.length > 0 ? sortedGames[0] : null;
  };

  // Auto-scroll to closest game
  useEffect(() => {
    if (!fixtures.length || loading) return;

    const closestGame = findClosestUpcomingGame();
    
    if (closestGame && fixtureRefs.current[closestGame.id]) {
      // Add a small delay to ensure the DOM is fully rendered
      const scrollTimeout = setTimeout(() => {
        const element = fixtureRefs.current[closestGame.id];
        if (element) {
          element.scrollIntoView({ 
            behavior: "smooth", 
            block: "center",
            inline: "nearest"
          });
          
          // Add a highlight effect to the closest game
          element.style.transform = "scale(1.05)";
          element.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.1)";
          
          // Remove the highlight after 2 seconds
          setTimeout(() => {
            element.style.transform = "";
            element.style.boxShadow = "";
          }, 2000);
        }
      }, 1000);

      return () => clearTimeout(scrollTimeout);
    }
  }, [fixtures, loading, favoriteTeamEnglish]);

  if (leagueLoading || loading) {
    return (
      <Layout>
        <div className="fixtures-container dashboard-card">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-6">טוען משחקים...</h2>
            <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (leagueError || error) {
    return (
      <Layout>
        <div className="fixtures-container dashboard-card">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-6">שגיאה</h2>
            <p className="text-red-500 mb-4">{leagueError || error}</p>
            <button
              onClick={refetch}
              className="bg-black text-white px-4 py-2 rounded transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw size={20} />
              נסה שוב
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!fixtures.length) {
    return (
      <Layout>
        <div className="fixtures-container dashboard-card">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-6">אין משחקים</h2>
            <p className="text-gray-600 mb-4">לא נמצאו משחקים לקבוצה שלך</p>
            <button
              onClick={refetch}
              className="bg-black text-white px-4 py-2 rounded transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw size={20} />
              רענן
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const nextGame = findClosestUpcomingGame();

  return (
    <Layout>
      <div className="fixtures-container dashboard-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-bold">כל המשחקים של {user?.favoriteTeam}</h2>
          <button
            onClick={refetch}
            className="text-white px-4 py-2 rounded bg-black transition-colors inline-flex items-center gap-2"
            title="רענן משחקים"
          >
            <RefreshCw size={20} />
            רענן
          </button>
        </div>

        {/* Show info about which game will be highlighted */}
        {nextGame && (
          <div className="text-center mb-8 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-800 font-medium">
              🎯 הדף יפתח במיקום המשחק הקרוב ביותר של {user?.favoriteTeam}
            </p>
            <p className="text-green-600 text-sm mt-1">
              {teamNameMap[nextGame.homeTeam]?.name || nextGame.homeTeam} נגד{" "}
              {teamNameMap[nextGame.awayTeam]?.name || nextGame.awayTeam} - {" "}
              {new Date(nextGame.date).toLocaleDateString("he-IL", {
                weekday: "long",
                day: "numeric", 
                month: "long"
              })}
            </p>
          </div>
        )}

        {/* Regular Season */}
        <FixturesList
          fixtures={regularFixtures}
          favoriteTeamEnglish={favoriteTeamEnglish}
          colors={colors}
          title="עונה סדירה"
          groupByRound={true}
          fixtureRefs={fixtureRefs}
          isPlayoff={false}
        />

        {/* Playoff */}
        {playoffFixtures.length > 0 && (
          <FixturesList
            fixtures={playoffFixtures}
            favoriteTeamEnglish={favoriteTeamEnglish}
            colors={colors}
            title="פלייאוף"
            groupByRound={true}
            fixtureRefs={fixtureRefs}
            isPlayoff={true}
          />
        )}

        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm">
            <p>🔍 Debug Info:</p>
            <p>Regular Season: {regularFixtures.length} games</p>
            <p>Playoff: {playoffFixtures.length} games</p>
            {regularSeasonEndDate && (
              <p>Regular Season End Date: {regularSeasonEndDate.toLocaleDateString()}</p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Fixtures;