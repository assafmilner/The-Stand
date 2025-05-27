// client/src/components/homeComponents/Community.jsx
import { useUser } from "../../context/UserContext";
import Feed from "./Feed"; // Import the updated Feed component

function Community({ colors }) {
  const { user } = useUser();

  if (!user?.favoriteTeam) {
    return <p>לא הוגדרה קבוצה אהודה.</p>;
  }

  return (
    <section>
      <Feed
        colors={colors}
        user={user}
        feedType="team" // Pass team type to show community posts
      />
    </section>
  );
}

export default Community;
