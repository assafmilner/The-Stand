import React, { useEffect, useState, useRef } from "react";
import Layout from "../components/Layout";
import { useUser } from "../components/context/UserContext";
import { fetchFixtures } from "../utils/fetchFixtures";
import { detectLeague } from "../utils/leagueUtils";
import stadiums from "../utils/stadiums";
import teamNameMap from "../utils/teams-hebrew";
import teamColors from "../utils/teamStyles";

// אייקונים
import { Calendar, Clock, Landmark } from "lucide-react";

function Fixtures() {
  const { user } = useUser();
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [league, setLeague] = useState(null);
  const matchRefs = useRef({});

  const [regularSeasonEndDate, setRegularSeasonEndDate] = useState(null); // 🆕 תאריך סיום עונה רגילה

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
          console.log("לא ניתן לזהות את הליגה, עדיין יש להמשיך...");
          // לא צריך לעצור כאן - זה יכול להיות מקרה לגיטימי
          setLoading(false);
          return;
        }

        const leagueType = seasonId === 4644 ? "ligat-haal" : "leumit";
        setLeague(leagueType);

        console.log(
          `זוהתה ליגה: ${
            leagueType === "ligat-haal" ? "ליגת העל" : "ליגה לאומית"
          }`
        );

        const data = await fetchFixtures(seasonId);

        if (Array.isArray(data)) {
          setFixtures(data);
          console.log(`נטענו ${data.length} משחקים`);

          // 🆕 חישוב תאריך סיום עונה רגילה
          const maxRound = leagueType === "ligat-haal" ? 26 : 30;
          const lastRegularMatch = data
            .filter((match) => match.round === maxRound)
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

          if (lastRegularMatch) {
            setRegularSeasonEndDate(new Date(lastRegularMatch.date));
          }
        } else {
          setFixtures([]);
        }
      } catch (error) {
        console.error("שגיאה בטעינת מחזורים:", error);
      } finally {
        setLoading(false);
      }
    }

    loadFixtures();
  }, [user?.favoriteTeam]);

  useEffect(() => {
    if (!fixtures.length) return;

    const today = new Date();

    // למצוא את המשחק הכי קרוב לעכשיו בעתיד
    const futureFixtures = fixtures
      .filter((match) => new Date(match.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (futureFixtures.length > 0) {
      const closestMatch = futureFixtures[0];
      const element = matchRefs.current[closestMatch.id];

      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" }); // גלילה חלקה
      }
    }
  }, [fixtures]);

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

  // פילטר למשחקים של הפלייאוף
  const playoffFixtures = fixtures.filter((match) => {
    if (!regularSeasonEndDate) return false;
    return (
      new Date(match.date) > regularSeasonEndDate &&
      match.round >= 1 &&
      match.round <= 10
    );
  });

  // מיפוי של הפלייאוף לפי match.round אמיתי
  const playoffRounds = {};

  playoffFixtures.forEach((match) => {
    const playoffRound = match.round; // שים לב - לא אינדקס! אלא המספר של המחזור
    if (!playoffRounds[playoffRound]) {
      playoffRounds[playoffRound] = [];
    }
    playoffRounds[playoffRound].push(match);
  });

  return (
    <Layout>
      <div className="fixtures-container dashboard-card ">
        <h2 className="text-center text-4xl font-bold mb-6">
          כל המשחקים הקרובים
        </h2>

        {/* עונה רגילה */}
        {Object.keys(roundsMap)
          .sort((a, b) => a - b)
          .filter((round) => {
            const matchesInRound = roundsMap[round];

            // 🆕 לבדוק אם יש לפחות משחק אחד שהתרחש לפני תאריך סיום העונה
            const hasRegularSeasonMatch = matchesInRound.some(
              (match) => new Date(match.date) <= regularSeasonEndDate
            );

            if (!hasRegularSeasonMatch) return false;

            if (league === "ligat-haal") return round <= 26;
            if (league === "leumit") return round <= 30;
            return true;
          })
          .map((round) => (
            <div key={`regular-${round}`} className="mb-12">
              <h3 className="text-2xl font-bold mb-4 text-center">
                מחזור {round}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 🆕 מציגים רק משחקים שלפני תאריך סיום העונה */}
                {roundsMap[round]
                  .filter(
                    (match) => new Date(match.date) <= regularSeasonEndDate
                  )
                  .map((match) => {
                    const isFavoriteMatch =
                      match.homeTeam === favoriteTeamEnglish ||
                      match.awayTeam === favoriteTeamEnglish;

                    return (
                      <div
                        ref={(el) => (matchRefs.current[match.id] = el)}
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
                              height: "10px",
                              width: "100%",
                              backgroundColor: colors.primary,
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              borderBottomLeftRadius: "0.75rem",
                              borderBottomRightRadius: "0.75rem",
                            }}
                          ></div>
                        )}

                        {/* תאריך ושעה */}
                        <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mt-2 mb-4">
                          <Calendar size={16} />
                          <span>
                            {new Date(match.date).toLocaleDateString("he-IL", {
                              weekday: "short",
                              day: "numeric",
                              month: "long",
                            })}
                          </span>
                          <Clock size={16} />
                          <span>{match.time}</span>
                        </div>

                        {/* שמות קבוצות */}
                        <div className="flex items-center justify-center gap-2 text-lg font-semibold mb-2">
                          <span>
                            {teamNameMap[match.homeTeam]?.name ||
                              match.homeTeam}
                          </span>
                          <span className="text-red-500">VS</span>
                          <span>
                            {teamNameMap[match.awayTeam]?.name ||
                              match.awayTeam}
                          </span>
                        </div>

                        {/* תוצאה */}
                        {match.homeScore != null && match.awayScore != null && (
                          <div className="text-xl font-bold text-gray-700 my-2">
                            {match.homeScore} - {match.awayScore}
                          </div>
                        )}

                        {/* אצטדיון */}
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

        {/* פלייאוף */}
        {Object.keys(playoffRounds)
          .sort((a, b) => a - b)
          .map((playoffRound) => (
            <div key={`playoff-${playoffRound}`} className="mb-12">
              <h3 className="text-xl font-bold mb-4 text-center">
                מחזור {playoffRound} פלייאוף
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {playoffRounds[playoffRound].map((match) => {
                  const isFavoriteMatch =
                    match.homeTeam === favoriteTeamEnglish ||
                    match.awayTeam === favoriteTeamEnglish;

                  return (
                    <div
                      key={match.id}
                      ref={(el) => (matchRefs.current[match.id] = el)}
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

                      {/* תאריך ושעה */}
                      <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mt-2 mb-4">
                        <Calendar size={16} />
                        <span>
                          {new Date(match.date).toLocaleDateString("he-IL", {
                            weekday: "short",
                            day: "numeric",
                            month: "long",
                          })}
                        </span>
                        <Clock size={16} />
                        <span>{match.time}</span>
                      </div>

                      {/* שמות קבוצות */}
                      <div className="flex items-center justify-center gap-2 text-lg font-semibold mb-2">
                        <span>
                          {teamNameMap[match.homeTeam]?.name || match.homeTeam}
                        </span>
                        <span className="text-red-500">VS</span>
                        <span>
                          {teamNameMap[match.awayTeam]?.name || match.awayTeam}
                        </span>
                      </div>

                      {/* תוצאה */}
                      {match.homeScore != null && match.awayScore != null && (
                        <div className="text-xl font-bold text-gray-700 my-2">
                          {match.homeScore} - {match.awayScore}
                        </div>
                      )}

                      {/* אצטדיון */}
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
