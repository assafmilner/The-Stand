// client/src/components/homeComponents/Community.jsx
import { useUser } from "../../context/UserContext";
import Feed from "./Feed";

function Community({ colors }) {
  const { user } = useUser();

  console.log("🔥 CLIENT DEBUG: Community component rendered", {
    user: user?.name,
    favoriteTeam: user?.favoriteTeam
  });

  if (!user?.favoriteTeam) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border">
        <p className="text-red-500 text-lg font-medium">לא הוגדרה קבוצה אהודה</p>
        <p className="text-gray-500 mt-2">עדכן את פרטי הפרופיל שלך כדי לראות את קהילת הקבוצה</p>
      </div>
    );
  }

  return (
    <section>
      {/* ✅ Explicitly pass feedType="team" */}
      <Feed
        colors={colors}
        user={user}
        feedType="team" // This should show community posts (same team)
      />
    </section>
  );
}

export default Community;