import React, { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { detectLeague } from "../../utils/leagueUtils"; // ⚡ במקום לכתוב מחדש
import LeagueTable from "./LeagueTable";

const SmartLeagueTable = () => {
  const { user } = useUser();
  const [league, setLeague] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.favoriteTeam) return;

    const detectFavoriteTeamLeague = async () => {
      console.log("👤 favoriteTeam (Hebrew):", user.favoriteTeam);

      const leagueId = await detectLeague(user.favoriteTeam);
      console.log("🏆 Detected league ID:", leagueId);

      if (leagueId === 4644) {
        setLeague("ligat-haal");
      } else if (leagueId === 4966) {
        setLeague("leumit");
      } else {
        setLeague(null);
      }

      setLoading(false);
    };

    detectFavoriteTeamLeague();
  }, [user?.favoriteTeam]);

  if (loading) {
    return <p className="text-center text-gray-500">טוען טבלה...</p>;
  }

  if (!league) {
    return (
      <p className="text-center text-red-500">לא נמצאה קבוצה מועדפת בטבלאות</p>
    );
  }

  return <LeagueTable league={league} />;
};

export default SmartLeagueTable;
