import React, { useEffect, useRef, useState } from "react";
import Layout from "../components/layout/Layout";
import { useUser } from "../context/UserContext";
import { RefreshCw } from "lucide-react";
import { useLeague, useFixtures } from "../hooks/useLeague";
import { FixturesList } from "../components/league";
import teamNameMap from "../utils/teams-hebrew";
import teamColors from "../utils/teamStyles";

function Fixtures() {
  const { user } = useUser();
  const {
    league,
    leagueType,
    loading: leagueLoading,
    error: leagueError,
  } = useLeague(user?.favoriteTeam);
  const {
    fixtures,
    loading,
    error,
    refetch,
  } = useFixtures(league, leagueType);

  const fixtureRefs = useRef({});
  const [refreshing, setRefreshing] = useState(false);

  const colors = teamColors[user?.favoriteTeam || "הפועל תל אביב"];

  const reverseTeamMap = Object.entries(teamNameMap).reduce((acc, [eng, data]) => {
    acc[data.name] = eng;
    return acc;
  }, {});
  const favoriteTeamEnglish = reverseTeamMap[user?.favoriteTeam];

  const separateFixtures = () => {
    if (!fixtures.length) return { regularFixtures: [], playoffFixtures: [] };

    const regularFixtures = fixtures.filter((match) => match.type === "regular");
    const playoffFixtures = fixtures.filter((match) => match.type === "playoff");

    regularFixtures.sort((a, b) => new Date(a.date) - new Date(b.date));
    playoffFixtures.sort((a, b) => new Date(a.date) - new Date(b.date));

    return { regularFixtures, playoffFixtures };
  };

  const { regularFixtures, playoffFixtures } = separateFixtures();

  const parseFixtureDateTime = (fixture) => {
    return new Date(`${fixture.date}T${(fixture.time || "00:00").padStart(5, "0")}:00`);
  };

  const findClosestUpcomingGame = () => {
    if (!fixtures.length || !favoriteTeamEnglish) return null;

    const now = new Date();
    const upcoming = fixtures
      .filter(
        (f) =>
          (f.homeTeam === favoriteTeamEnglish || f.awayTeam === favoriteTeamEnglish) &&
          parseFixtureDateTime(f) >= now
      )
      .sort((a, b) => parseFixtureDateTime(a) - parseFixtureDateTime(b));

    return upcoming[0] || null;
  };

  useEffect(() => {
    if (!fixtures.length || loading) return;

    const closestGame = findClosestUpcomingGame();
    if (!closestGame) return;

    const scrollTimeout = setTimeout(() => {
      requestAnimationFrame(() => {
        const element = fixtureRefs.current[closestGame.id];
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
          element.style.transform = "scale(1.05)";
          element.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.1)";
          setTimeout(() => {
            element.style.transform = "";
            element.style.boxShadow = "";
          }, 2000);
        }
      });
    }, 300);

    return () => clearTimeout(scrollTimeout);
  }, [fixtures, loading, favoriteTeamEnglish]);

  if (leagueLoading || loading) {
    return (
      <Layout>
        <div className="fixtures-container dashboard-card">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-6">טוען משחקים...</h2>
            <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full" />
            <p className="mt-4 text-gray-600">טוען מהשרת...</p>
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

  return (
    <Layout>
      <div className="fixtures-container dashboard-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-bold">כל המשחקים של {user?.favoriteTeam}</h2>
          <button
            onClick={refetch}
            disabled={refreshing}
            className="text-black px-4 py-2 rounded bg-gray-100 transition-colors inline-flex items-center gap-2"
            title="רענן את הדף"
          >
            <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
            רענן
          </button>
        </div>

        <FixturesList
          fixtures={regularFixtures}
          favoriteTeamEnglish={favoriteTeamEnglish}
          colors={colors}
          title="עונה סדירה"
          groupByRound={true}
          fixtureRefs={fixtureRefs}
          isPlayoff={false}
        />

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
      </div>
    </Layout>
  );
}

export default Fixtures;
