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

        console.log("All team fixtures:", teamFixtures);

        // 🔥 קוד מתוקן עם טיפול נכון באזור זמן 🔥
        const now = new Date();
        console.log("Current time:", now);

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

          console.log(`Match: ${match.homeTeam} vs ${match.awayTeam}`);
          console.log(`Match date: ${match.date}, time: ${match.time}`);
          console.log(`Match date-time object: ${matchDateTime}`);
          console.log(`Now: ${now}`);
          console.log(`Is future: ${matchDateTime >= now}`);
          console.log("---");

          return matchDateTime >= now;
        });

        console.log("Final upcoming fixtures:", upcomingFixtures);

        // מיון לפי תאריך ושעה
        // upcomingFixtures.sort((a, b) => {
        //   const [yearA, monthA, dayA] = a.date.split("-");
        //   const [yearB, monthB, dayB] = b.date.split("-");

        //   let dateA = new Date(
        //     parseInt(yearA),
        //     parseInt(monthA) - 1,
        //     parseInt(dayA)
        //   );
        //   let dateB = new Date(
        //     parseInt(yearB),
        //     parseInt(monthB) - 1,
        //     parseInt(dayB)
        //   );

        //   if (a.time) {
        //     const [hoursA, minutesA] = a.time.split(":");
        //     dateA.setHours(parseInt(hoursA), parseInt(minutesA));
        //   }

        //   if (b.time) {
        //     const [hoursB, minutesB] = b.time.split(":");
        //     dateB.setHours(parseInt(hoursB), parseInt(minutesB));
        //   }

        //   return dateA - dateB;
        // });

        console.log("Sorted upcoming fixtures:", upcomingFixtures);
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
              console.log("Rendering match:", match);
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
