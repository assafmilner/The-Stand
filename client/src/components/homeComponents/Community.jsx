import { useUser } from "../context/UserContext";
import teamsMap from "../../utils/teams-hebrew";
import PostList from "../post/PostList";

function Community({ colors }) {
  const { user } = useUser();

  if (!user?.favoriteTeam) {
    return <p>לא הוגדרה קבוצה אהודה.</p>;
  }

  // המרת שם בעברית לשם באנגלית כדי לקבל את ה-communityId
  const englishName = Object.keys(teamsMap).find(
    (key) => teamsMap[key].hebrew === user.favoriteTeam
  );

  const communityId = teamsMap[englishName]?.communityId;

  if (!communityId) {
    return <p>לא נמצאה קבוצה מתאימה.</p>;
  }

  return (
    <section>
      <h2 style={{ color: colors.primary, marginBottom: "1rem" }}>
        פוסטים של אוהדי {user.favoriteTeam}
      </h2>
      <PostList communityId={communityId} colors={colors} />
    </section>
  );
}

export default Community;
