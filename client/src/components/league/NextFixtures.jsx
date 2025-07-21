import React from "react";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { useLeague, useFixtures } from "../../hooks/useLeague";
import stadiums from "../../utils/stadiums";
import teamNameMap from "../../utils/teams-hebrew";

/**
 * NextFixtures component
 *
 * Displays the next 3 upcoming fixtures for the user's favorite team.
 * Fetches fixtures using `useFixtures` and filters future matches only.
 *
 * UI includes:
 * - A list of upcoming matches (max 3)
 * - Stadium name, date and time
 * - Link to view all fixtures
 *
 * Design notes:
 * - Card-like layout using right sidebar
 * - Matches are styled in a compact list with border and shadow
 */

const NextFixtures = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { league } = useLeague(user?.favoriteTeam);
  const { fixtures, loading } = useFixtures(league, user?.favoriteTeam);

  /**
   * getUpcomingFixtures
   *
   * Filters and returns the next 3 upcoming matches for the user's favorite team.
   *
   * Steps:
   * - Map Hebrew team name back to English
   * - Filter all fixtures for the team
   * - Compare match datetime to current time
   * - Return top 3 sorted by date
   */

  const getUpcomingFixtures = () => {
    if (!fixtures.length || !user?.favoriteTeam) return [];

    const reverseTeamMap = Object.entries(teamNameMap).reduce(
      (acc, [eng, data]) => {
        acc[data.name] = eng;
        return acc;
      },
      {}
    );

    const favoriteTeamEnglish = reverseTeamMap[user.favoriteTeam];
    if (!favoriteTeamEnglish) return [];

    const teamFixtures = fixtures.filter(
      (match) =>
        match.homeTeam === favoriteTeamEnglish ||
        match.awayTeam === favoriteTeamEnglish
    );

    const now = new Date();
    const upcomingFixtures = teamFixtures.filter((match) => {
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

    return upcomingFixtures.slice(0, 3);
  };

  const upcomingFixtures = getUpcomingFixtures();

  if (loading) {
    return (
      <div className="side-bar left-0">
        <div className="dashboard-card">
          <div>טוען משחקים...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="side-bar left-0">
      <div className="dashboard-card upcoming-matches text-center">
        <h2>המשחקים הקרובים</h2>

        {upcomingFixtures.length === 0 ? (
          <div>אין משחקים קרובים לקבוצה.</div>
        ) : (
          <ul className="space-y-4 text-right text-gray-700 mt-4">
            {upcomingFixtures.map((match) => (
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

                <div className="text-sm text-center text-gray-600">
                  {new Date(match.date).toLocaleDateString("he-IL", {
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                  })}
                  &nbsp;בשעה&nbsp;{match.time}
                </div>
              </li>
            ))}
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
