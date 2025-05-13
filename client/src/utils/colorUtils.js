export function getContrastTextColor(bgColor) {
    const color = bgColor.substring(1); // Remove #
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 150 ? '#000' : '#fff';
  }
  
  // שימוש נוסף - פונקציה לקבלת צבעי הקבוצה
  export function getTeamColors(favoriteTeam, teamColors) {
    return teamColors[favoriteTeam] || { primary: "#15803d", secondary: "#22c55e" };
  }