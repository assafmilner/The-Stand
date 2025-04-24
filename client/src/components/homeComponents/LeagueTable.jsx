import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import teamNameMap from "../../utils/teams-hebrew";
import { calculatePlayoffTable } from "./calculatePlayoffTable";

const LeagueTable = ({ league }) => {
  const seasonId = league === "ligat-haal" ? 4644 : 4966;
  const playoffStartRound = league === "ligat-haal" ? 26 : 30;
  const topPlayoffSize = league === "ligat-haal" ? 6 : 8;

  const [mode, setMode] = useState("regular");
  const [loading, setLoading] = useState(true);
  const [playoffLoading, setPlayoffLoading] = useState(false);

  const [regularTable, setRegularTable] = useState([]);
  const [topPlayoff, setTopPlayoff] = useState([]);
  const [bottomPlayoff, setBottomPlayoff] = useState([]);

  // שולף רק את העונה הסדירה
  useEffect(() => {
    const fetchRegularSeason = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://www.thesportsdb.com/api/v1/json/3/lookuptable.php?l=${seasonId}&s=2024-2025`
        );
        const data = await res.json();
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
        console.error("❌ Regular table fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRegularSeason();
  }, [seasonId]);

  // ברגע שמבקשים לראות פלייאוף – נטען אותו
  useEffect(() => {
    const fetchPlayoffData = async () => {
      try {
        setPlayoffLoading(true);

        // שלב 1: שליפת תאריך סיום העונה הסדירה
        const lastRoundRes = await fetch(
          `https://www.thesportsdb.com/api/v1/json/3/eventsround.php?id=${seasonId}&r=${playoffStartRound}&s=2024-2025`
        );
        const lastRoundData = await lastRoundRes.json();
        const lastGames = lastRoundData.events || [];
        const lastDate = lastGames
          .map((e) => new Date(e.dateEvent))
          .sort((a, b) => b - a)[0];

        // שלב 2: שליפת משחקים בפלייאוף
        const rounds = Array.from({ length: 10 }, (_, i) => i + 1);
        const playoffGames = [];

        for (const r of rounds) {
          const res = await fetch(
            `https://www.thesportsdb.com/api/v1/json/3/eventsround.php?id=${seasonId}&r=${r}&s=2024-2025`
          );
          const data = await res.json();
          if (data?.events) {
            playoffGames.push(
              ...data.events.filter((e) => new Date(e.dateEvent) > lastDate)
            );
          }
        }

        const { topPlayoffTable, bottomPlayoffTable } = calculatePlayoffTable(
          playoffGames,
          regularTable,
          {
            topPlayoffSize,
          }
        );

        setTopPlayoff(topPlayoffTable);
        setBottomPlayoff(bottomPlayoffTable);
      } catch (err) {
        console.error("❌ Playoff data error:", err);
      } finally {
        setPlayoffLoading(false);
      }
    };

    if (
      mode === "playoff" &&
      topPlayoff.length === 0 &&
      bottomPlayoff.length === 0
    ) {
      fetchPlayoffData();
    }
  }, [mode]);

  return (
    <div className="max-w-5xl mx-auto px-4 post-card">
      <div className="flex justify-center border-b border-gray-200 mb-6">
        <button
          onClick={() => setMode("regular")}
          className={`mx-4 pb-2 text-sm font-medium transition-all duration-200 bg-transparent ${
            mode === "regular"
              ? "text-red-600 border-b-2 border-red-600"
              : "text-gray-600 border-b-2 border-transparent"
          }`}
        >
          עונה סדירה
        </button>
        <button
          onClick={() => setMode("playoff")}
          className={`mx-4 pb-2 text-sm font-medium transition-all duration-200 bg-transparent  ${
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
                  {isFavorite}
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
