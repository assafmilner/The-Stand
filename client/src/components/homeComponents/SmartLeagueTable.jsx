import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import teamNameMap from "../../utils/teams-hebrew";
import LeagueTable from "./LeagueTable";

const SmartLeagueTable = () => {
  const { user } = useUser();
  const [league, setLeague] = useState(null);
  const [loading, setLoading] = useState(true);

  const reverseTeamMap = Object.entries(teamNameMap).reduce(
    (acc, [eng, data]) => {
      acc[data.name] = eng;
      return acc;
    },
    {}
  );

  const favoriteTeamEnglish = reverseTeamMap[user?.favoriteTeam];

  // 💡 כאן מוסיפים את הפונקציות שכתבת
  const checkTeamInLeague = async (leagueId, teamName) => {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/lookuptable.php?l=${leagueId}&s=2024-2025`
    );
    const data = await res.json();
    return data.table?.some((t) => t.strTeam === teamName);
  };

  const checkLeague = async () => {
    const inHaal = await checkTeamInLeague(4644, favoriteTeamEnglish);
    if (inHaal) return "ligat-haal";

    const inLeumit = await checkTeamInLeague(4966, favoriteTeamEnglish);
    if (inLeumit) return "leumit";

    return null;
  };

  useEffect(() => {
    if (!user?.favoriteTeam) return;

    const detectLeague = async () => {
      console.log("👤 favoriteTeam (Hebrew):", user.favoriteTeam);
      console.log("🔄 Converted to English:", favoriteTeamEnglish);

      const inHaal = await checkTeamInLeague(4644, favoriteTeamEnglish);
      console.log("🏆 Found in Ligat Ha'Al?", inHaal);

      if (inHaal) {
        setLeague("ligat-haal");
        setLoading(false);
        return;
      }

      const inLeumit = await checkTeamInLeague(4966, favoriteTeamEnglish);
      console.log("⚽ Found in Liga Leumit?", inLeumit);

      if (inLeumit) {
        setLeague("leumit");
      }

      setLoading(false);
    };

    detectLeague();
  }, [user?.favoriteTeam]);

  if (loading) return <p className="text-center text-gray-500">טוען טבלה...</p>;
  if (!league)
    return (
      <p className="text-center text-red-500">לא נמצאה קבוצה מועדפת בטבלאות</p>
    );

  return <LeagueTable league={league} />;
};

export default SmartLeagueTable;
