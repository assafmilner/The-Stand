import React, { useState } from "react";
import { useUser } from "../../context/UserContext";
import teamNameMap from "../../utils/teams-hebrew";
import { useLeagueTable } from "../../hooks/useLeague";

/**
 * LeagueTable component displays the current league standings.
 * Supports toggling between regular season and playoff tables.
 *
 * Props:
 * - league: the league identifier (used by useLeagueTable to fetch data)
 *
 * Behavior:
 * - Regular/playoff toggle buttons
 * - Lazy loads playoff data if requested
 * - Highlights favorite team from user context
 */

const LeagueTable = ({ league }) => {
  const [mode, setMode] = useState("regular");
  const {
    regularTable,
    topPlayoff,
    bottomPlayoff,
    loading,
    playoffLoading,
    fetchPlayoffData
  } = useLeagueTable(league);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === "playoff" && topPlayoff.length === 0 && bottomPlayoff.length === 0) {
      fetchPlayoffData();
    }
  };

  return (
    <div className="dashboard-card">
      <div className="flex justify-center border-b border-gray-200 mb-6">
        <button
          onClick={() => handleModeChange("regular")}
          className={`mx-4 pb-2 text-sm font-medium transition-all duration-200 bg-transparent ${
            mode === "regular"
              ? "text-red-600 border-b-2 border-red-600"
              : "text-gray-600 border-b-2 border-transparent"
          }`}
        >
          עונה סדירה
        </button>
        <button
          onClick={() => handleModeChange("playoff")}
          className={`mx-4 pb-2 text-sm font-medium transition-all duration-200 bg-transparent ${
            mode === "playoff"
              ? "text-red-600 border-b-2 border-red-600"
              : "text-gray-600 border-b-2 border-transparent"
          }`}
        >
          פלייאוף
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">טוען טבלה...</p>
      ) : mode === "regular" ? (
        <LeagueTableSection teams={regularTable} type="regular" />
      ) : playoffLoading ? (
        <p className="text-center text-gray-500">טוען טבלת פלייאוף...</p>
      ) : (
        <div className="space-y-12">
          <div>
            <h3 className="text-lg bg-secondary font-bold mb-2 text-center">
              פלייאוף עליון
            </h3>
            <LeagueTableSection teams={topPlayoff} type="top" />
          </div>
          <div>
            <h3 className="text-lg bg-secondary font-bold mb-2 text-center">
              פלייאוף תחתון
            </h3>
            <LeagueTableSection teams={bottomPlayoff} type="bottom" />
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * LeagueTableSection renders the HTML table of teams.
 *
 * Props:
 * - teams: array of team standings (must include fields like win, draw, points, etc.)
 * - showRank: if true, display rank column
 * - badge: if true, show team logo
 * - type: one of "regular" | "top" | "bottom" (used for special row highlights)
 *
 * Design Notes:
 * - Favorite team is highlighted with yellow
 * - First in top playoff gets green highlight
 * - Last 2 in bottom playoff are marked in red (relegation warning)
 */

const LeagueTableSection = ({ teams, showRank = true, badge = true, type }) => {
  const { user } = useUser();
  const favorite = user?.favoriteTeam;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 text-right text-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            {showRank && <th className="p-2 border">#</th>}
            {badge && <th className="p-2 border">לוגו</th>}
            <th className="p-2 border">קבוצה</th>
            <th className="p-2 border">משחקים</th>
            <th className="p-2 border">נצחונות</th>
            <th className="p-2 border">תיקו</th>
            <th className="p-2 border">הפסדים</th>
            <th className="p-2 border">שערים</th>
            <th className="p-2 border">נקודות</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, i) => {
            const isFavorite = teamNameMap[team.team]?.name === favorite;
            const isFirstInTopPlayoff = type === "top" && i === 0;
            const isLastTwoInBottomPlayoff =
              type === "bottom" &&
              teams.length >= 2 &&
              (i === teams.length - 1 || i === teams.length - 2);

            const rowClass = `
              hover:bg-gray-50
              ${isFavorite ? "bg-yellow-100 font-bold" : ""}
              ${isFirstInTopPlayoff ? "bg-green-100" : ""}
              ${isLastTwoInBottomPlayoff ? "bg-red-100 text-red-900" : ""}
            `;

            return (
              <tr key={i} className={rowClass}>
                {showRank && (
                  <td className="p-2 border">{team.rank || i + 1}</td>
                )}
                {badge && (
                  <td className="p-2 border">
                    <img
                      src={teamNameMap[team.team]?.badge || ""}
                      alt={team.team}
                      className="w-6 h-6 inline-block"
                    />
                  </td>
                )}
                <td className="p-2 border">
                  {teamNameMap[team.team]?.name || team.team}
                </td>
                <td className="p-2 border">{team.played}</td>
                <td className="p-2 border">{team.win}</td>
                <td className="p-2 border">{team.draw}</td>
                <td className="p-2 border">{team.loss}</td>
                <td className="p-2 border">
                  {team.goalsAgainst}:{team.goalsFor}
                </td>
                <td className="p-2 border font-bold">{team.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LeagueTable;