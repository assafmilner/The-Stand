import teamNameMap from "./teams-hebrew";
import { fetchFromApi } from "./fetchFromApi";

export async function detectLeague(favoriteTeamHebrew) {
  if (!favoriteTeamHebrew) return null;

  const reverseTeamMap = Object.entries(teamNameMap).reduce(
    (acc, [eng, data]) => {
      acc[data.name] = eng;
      return acc;
    },
    {}
  );

  const favoriteTeamEnglish = reverseTeamMap[favoriteTeamHebrew];

  if (!favoriteTeamEnglish) return null;

  try {
    const data = await fetchFromApi(
      "https://www.thesportsdb.com/api/v1/json/3/lookuptable.php?l=4644&s=2024-2025"
    );
    
    
    const ligatHaAlTeams = data.table?.map((team) => team.strTeam) || [];

    const isInLigatHaAl = ligatHaAlTeams.includes(favoriteTeamEnglish);

    return isInLigatHaAl ? 4644 : 4966;
  } catch (error) {
    console.error("Failed to detect league:", error);
    return null;
  }
}
