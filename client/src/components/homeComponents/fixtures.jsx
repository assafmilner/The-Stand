import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { useUser } from "../../components/context/UserContext";
import { fetchFixtures } from "../../utils/fetchFixtures";
import { detectLeague } from "../../utils/leagueUtils";
import stadiums from "../../utils/stadiums";
import teamNameMap from "../../utils/teams-hebrew";
import teamColors from "../../utils/teamStyles";

// אייקונים
import { Calendar, Clock, Landmark } from "lucide-react";

function Fixtures() {
  const { user } = useUser();
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [league, setLeague] = useState(null); // נוסיף שמירת ליגה (ligat-haal / leumit)

  // מיפוי הפוך: מעברית -> אנגלית
  const reverseTeamMap = Object.entries(teamNameMap).reduce(
    (acc, [eng, data]) => {
      acc[data.name] = eng;
      return acc;
    },
    {}
  );
  const favoriteTeamEnglish = reverseTeamMap[user?.favoriteTeam];
  const colors = teamColors[user?.favoriteTeam || "הפועל תל אביב"];

  useEffect(() => {
    async function loadFixtures() {
      try {
        if (!user?.favoriteTeam) return;

        const seasonId = await detectLeague(user.favoriteTeam);

        if (!seasonId) {
          console.error("לא הצלחנו לזהות את הליגה.");
          return;
        }

        const leagueType = seasonId === 4644 ? "ligat-haal" : "leumit";
        setLeague(leagueType);

        const data = await fetchFixtures(seasonId);

        setFixtures(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("שגיאה בטעינת מחזורים:", error);
      } finally {
        setLoading(false);
      }
    }

    loadFixtures();
  }, [user?.favoriteTeam]);

  if (loading) {
    return (
      <Layout>
        <div>טוען מחזורים...</div>
      </Layout>
    );
  }

  if (!fixtures.length) {
    return (
      <Layout>
        <div>לא נמצאו מחזורים להצגה.</div>
      </Layout>
    );
  }

  // 🛠️ בניית מיפוי לפי מחזור
  const roundsMap = {};

  fixtures.forEach((match) => {
    const round = match.round;
    if (!roundsMap[round]) {
      roundsMap[round] = [];
    }
    roundsMap[round].push(match);
  });

  return (
    <Layout>
      <div className="fixtures-container">
        <h2 className="text-center text-2xl font-bold mb-6">
          כל המשחקים הקרובים
        </h2>

        {Object.keys(roundsMap)
          .sort((a, b) => a - b) // מיון לפי מספר מחזור
          .filter((round) => {
            if (league === "ligat-haal") return round <= 26;
            if (league === "leumit") return round <= 30;
            return true;
          })
          .map((round) => (
            <div key={round} className="mb-12">
              <h3 className="text-xl font-bold mb-4 text-center">
                מחזור {round}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roundsMap[round].map((match) => {
                  const isFavoriteMatch =
                    match.homeTeam === favoriteTeamEnglish ||
                    match.awayTeam === favoriteTeamEnglish;

                  return (
                    <div
                      key={match.id}
                      className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center text-center relative"
                      style={{
                        backgroundColor: "var(--card-bg)",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      {/* פס צבעוני אם זה משחק של הקבוצה המועדפת */}
                      {isFavoriteMatch && (
                        <div
                          style={{
                            height: "5px",
                            width: "100%",
                            backgroundColor: colors.primary,
                            position: "absolute",
                            top: 0,
                            left: 0,
                            borderTopLeftRadius: "0.75rem",
                            borderTopRightRadius: "0.75rem",
                          }}
                        ></div>
                      )}

                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-2 mt-2">
                        <Calendar size={16} />
                        <span>{match.date}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                        <Clock size={16} />
                        <span>{match.time}</span>
                      </div>

                      <div className="flex items-center justify-center gap-2 text-lg font-semibold mb-2">
                        <span>
                          {teamNameMap[match.homeTeam]?.name || match.homeTeam}
                        </span>
                        <span className="text-red-500">VS</span>
                        <span>
                          {teamNameMap[match.awayTeam]?.name || match.awayTeam}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600 text-sm mt-2">
                        <Landmark size={16} />
                        <span>{stadiums[match.venue] || match.venue}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </Layout>
  );
}

export default Fixtures;
