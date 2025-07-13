import React from "react";
import { Calendar, Clock, Landmark } from "lucide-react";
import teamNameMap from "../../utils/teams-hebrew";
import stadiums from "../../utils/stadiums";

const FixturesList = ({
  fixtures,
  favoriteTeamEnglish,
  colors,
  title = "",
  groupByRound = false,
  fixtureRefs = null,
  isPlayoff = false,
}) => {
  if (!fixtures.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">אין משחקים להצגה</p>
      </div>
    );
  }

  const renderFixture = (match) => {
    const isFavoriteMatch =
      match.homeTeam === favoriteTeamEnglish ||
      match.awayTeam === favoriteTeamEnglish;

    return (
      <div
        key={match.id}
        ref={(el) => fixtureRefs && (fixtureRefs.current[match.id] = el)}
        className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center text-center relative transition-all hover:shadow-lg"
        style={{
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--border-color)",
          transition: "all 0.3s ease-in-out", // Smooth transition for highlight effect
        }}
      >
        {/* Highlight bar for favorite team matches */}
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
          />
        )}

        {/* Date and time */}
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

        {/* Teams */}
        <div className="flex items-center justify-center gap-2 text-lg font-semibold mb-2">
          <span>{teamNameMap[match.homeTeam]?.name || match.homeTeam}</span>
          <span className="text-red-500">VS</span>
          <span>{teamNameMap[match.awayTeam]?.name || match.awayTeam}</span>
        </div>

        {/* Score (if available) */}
        {match.homeScore != null && match.awayScore != null && (
          <div className="text-xl font-bold text-gray-700 my-2">
            {match.homeScore} - {match.awayScore}
          </div>
        )}

        {/* Venue */}
        <div className="flex items-center gap-2 text-gray-600 text-sm mt-2">
          <Landmark size={16} />
          <span>{stadiums[match.venue] || match.venue}</span>
        </div>
      </div>
    );
  };

  if (groupByRound) {
    const roundsMap = {};
    fixtures.forEach((match) => {
      const round = match.round;
      if (!roundsMap[round]) {
        roundsMap[round] = [];
      }
      roundsMap[round].push(match);
    });

    return (
      <div>
        {title && (
          <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>
        )}
        {Object.keys(roundsMap)
          .sort((a, b) => a - b)
          .map((round) => (
            <div key={round} className="mb-12">
              <h3 className="text-2xl font-bold mb-4 text-center">
                {isPlayoff ? `מחזור ${round} פלייאוף` : `מחזור ${round}`}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roundsMap[round].map(renderFixture)}
              </div>
            </div>
          ))}
      </div>
    );
  }

  return (
    <div>
      {title && (
        <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fixtures.map(renderFixture)}
      </div>
    </div>
  );
};

export default FixturesList;
