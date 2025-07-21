// ### Function: detectLeague
// Maps a team name in Hebrew to its English identifier and fetches the corresponding league ID.
// Uses a local team name mapping and a backend API to detect the league.
//
// Parameters:
// - favoriteTeamHebrew: string – team name in Hebrew
//
// Returns: Promise<number|null> – league ID if found, otherwise null

import teamNameMap from "./teams-hebrew";
import api from "./api";

export async function detectLeague(favoriteTeamHebrew) {
  if (!favoriteTeamHebrew) return null;

  const reverseTeamMap = Object.entries(teamNameMap).reduce(
    (acc, [eng, data]) => {
      acc[data.name] = eng;
      return acc;
    },
    {}
  );

  const teamName = reverseTeamMap[favoriteTeamHebrew];
  if (!teamName) return null;

  try {
    const res = await api.get("/api/league/detect", { params: { teamName } });
    if (res.data.success) return parseInt(res.data.leagueId, 10);
    return null;
  } catch (err) {
    console.error("detectLeague error:", err);
    return null;
  }
}
