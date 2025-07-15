
export function calculateTable(eventsAfterRegular, leagueTableAfterRegular, config) {
    if (!Array.isArray(eventsAfterRegular) || !Array.isArray(leagueTableAfterRegular)) {
      throw new Error("Both events and league table must be arrays");
    }
  
    const sorted = [...leagueTableAfterRegular].sort((a, b) =>
      b.points - a.points ||
      (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst) ||
      b.goalsFor - a.goalsFor
    );
  
    const topTeams = sorted.slice(0, config.topPlayoffSize).map(team => team.team);
    const bottomTeams = sorted.slice(config.topPlayoffSize).map(team => team.team);
  
    const buildTable = (teams) => {
      const table = {};
  
      // Initialize from regular season
      teams.forEach((teamName) => {
        const base = leagueTableAfterRegular.find(t => t.team === teamName);
        table[teamName] = {
          team: teamName,
          played: base?.played || 0,
          win: base?.win || 0,
          draw: base?.draw || 0,
          loss: base?.loss || 0,
          goalsFor: base?.goalsFor || 0,
          goalsAgainst: base?.goalsAgainst || 0,
          points: base?.points || 0,
        };
      });
  
      // Update from playoff
      eventsAfterRegular.forEach(game => {
        const { strHomeTeam, strAwayTeam, intHomeScore, intAwayScore } = game;
        if (
          !teams.includes(strHomeTeam) ||
          !teams.includes(strAwayTeam) ||
          intHomeScore == null ||
          intAwayScore == null
        ) return;
  
        const home = table[strHomeTeam];
        const away = table[strAwayTeam];
        const homeGoals = parseInt(intHomeScore);
        const awayGoals = parseInt(intAwayScore);
  
        home.played++;
        away.played++;
        home.goalsFor += homeGoals;
        home.goalsAgainst += awayGoals;
        away.goalsFor += awayGoals;
        away.goalsAgainst += homeGoals;
  
        if (homeGoals > awayGoals) {
          home.win++; home.points += 3;
          away.loss++;
        } else if (awayGoals > homeGoals) {
          away.win++; away.points += 3;
          home.loss++;
        } else {
          home.draw++; away.draw++;
          home.points += 1;
          away.points += 1;
        }
      });
  
      return Object.values(table).sort((a, b) =>
        b.points - a.points ||
        (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst) ||
        b.win - a.win 
      );
    };
  
    return {
      topPlayoffTable: buildTable(topTeams),
      bottomPlayoffTable: buildTable(bottomTeams),
    };
  }
