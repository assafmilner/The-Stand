import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { fetchFixtures } from "../../utils/fetchFixtures";
import { detectLeague } from "../../utils/leagueUtils";
import stadiums from "../../utils/stadiums";
import teamNameMap from "../../utils/teams-hebrew";

const NextFixtures = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.favoriteTeam) return;

    // NextFixtures.jsx
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

        // 🔥 קוד מתוקן עם טיפול נכון באזור זמן 🔥
        const now = new Date();

        const upcomingFixtures = teamFixtures.filter((match) => {
          // פרסינג של התאריך במפורש
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
            // אם אין שעה, נחשיב שהמשחק בסוף היום
            matchDateTime.setHours(23, 59, 59, 999);
          }

          return matchDateTime >= now;
        });

        setFixtures(upcomingFixtures);
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
    <div className="side-bar left-0">
      <div className=" dashboard-card upcoming-matches text-center">
        <h2>המשחקים הקרובים </h2>

        {fixtures.length === 0 ? (
          <div>אין משחקים קרובים לקבוצה.</div>
        ) : (
          <ul className="space-y-4 text-right text-gray-700 mt-4">
            {fixtures.slice(0, 3).map((match) => {
              return (
                <li
                  key={match.id}
                  className="p-3 rounded-md shadow-sm bg-white border border-gray-200"
                >
                  <div className="text-md font-semibold mb-1 text-center">
                    {teamNameMap[match.homeTeam]?.name || match.homeTeam} נגד{" "}
                    {teamNameMap[match.awayTeam]?.name || match.awayTeam}
                  </div>

                  {match.venue && (
                    <div className="text-sm text-gray-500 text-center">
                      ({stadiums[match.venue] || match.venue})
                    </div>
                  )}

                  <div className="text-sm text-gray-600">
                    {new Date(match.date).toLocaleDateString("he-IL", {
                      weekday: "short",
                      day: "numeric",
                      month: "long",
                    })}
                    &nbsp;בשעה&nbsp;{match.time}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="text-center mt-4">
          <button
            onClick={() => navigate("/fixtures")}
            className="join-group-button"
          >
            הצג את כל המשחקים
          </button>
        </div>
      </div>
    </div>
  );
};

export default NextFixtures;
