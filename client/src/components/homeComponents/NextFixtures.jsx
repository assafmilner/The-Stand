import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { fetchFixtures } from "../../utils/fetchFixtures";
import { detectLeague } from "../../utils/leagueUtils"; // נוסיף
import stadiums from "../../utils/stadiums";
import teamNameMap from "../../utils/teams-hebrew";

const NextFixtures = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.favoriteTeam) return;

    const loadFixtures = async () => {
      try {
        const seasonId = await detectLeague(user.favoriteTeam);

        if (!seasonId) {
          console.error("לא הצלחנו לזהות את הליגה.");
          return;
        }

        const allFixtures = await fetchFixtures(seasonId);

        const reverseTeamMap = Object.entries(teamNameMap).reduce(
          (acc, [eng, data]) => {
            acc[data.name] = eng;
            return acc;
          },
          {}
        );

        const favoriteTeamEnglish = reverseTeamMap[user.favoriteTeam];

        if (!favoriteTeamEnglish) {
          console.error("Favorite team mapping failed.");
          return;
        }

        const teamFixtures = allFixtures.filter(
          (match) =>
            match.homeTeam === favoriteTeamEnglish ||
            match.awayTeam === favoriteTeamEnglish
        );

        setFixtures(teamFixtures);
      } catch (error) {
        console.error("Failed to load fixtures:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFixtures();
  }, [user?.favoriteTeam]);

  if (loading) {
    return <div>טוען משחקים...</div>;
  }

  return (
    <div className="next-fixtures-container">
      <h2>המשחקים הקרובים של {user.favoriteTeam}</h2>

      {fixtures.length === 0 ? (
        <div>אין משחקים קרובים לקבוצה.</div>
      ) : (
        <ul>
          {fixtures.slice(0, 5).map((match) => (
            <li key={match.id}>
              {teamNameMap[match.homeTeam]?.name || match.homeTeam} נגד{" "}
              {teamNameMap[match.awayTeam]?.name || match.awayTeam} -{" "}
              {match.date} בשעה {match.time} (
              {stadiums[match.venue] || match.venue})
            </li>
          ))}
        </ul>
      )}

      <div className="text-center mt-4">
        <button
          onClick={() => navigate("/fixtures")}
          style={{
            backgroundColor: "#ef4444",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            border: "none",
            cursor: "pointer",
          }}
        >
          הצג את כל המשחקים
        </button>
      </div>
    </div>
  );
};

export default NextFixtures;
