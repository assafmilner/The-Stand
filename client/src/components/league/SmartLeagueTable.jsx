import React from "react";
import { useUser } from "../../context/UserContext";
import { useLeague } from "../../hooks/useLeague";
import LeagueTable from "./LeagueTable";

/**
 * SmartLeagueTable
 *
 * This component automatically loads the correct league table
 * for the user's favorite team, based on context.
 *
 * Behavior:
 * - Shows loading message while data is being fetched
 * - Shows error if no matching league or type was found
 * - Otherwise renders the full LeagueTable component
 */

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
