import React from "react";
import { useUser } from "../../context/UserContext";
import { useLeague } from "../../hooks/useLeague";
import LeagueTable from "./LeagueTable";

const SmartLeagueTable = () => {
  const { user } = useUser();
  const { league, leagueType, loading, error } = useLeague(user?.favoriteTeam);

  if (loading) {
    return <p className="text-center text-gray-500">טוען טבלה...</p>;
  }

  if (error || !leagueType) {
    return (
      <p className="text-center text-red-500">לא נמצאה קבוצה מועדפת בטבלאות</p>
    );
  }

  return <LeagueTable league={league} />;
};

export default SmartLeagueTable;
