// client/src/components/homeComponents/Community.jsx - Final version
import { useUser } from "../../context/UserContext";
import TeamFeed from "./TeamFeed"; // Use the fixed TeamFeed component

function Community({ colors }) {
  const { user } = useUser();

  return (
    <section>
      {/* ✅ Use the fixed TeamFeed component that makes direct API calls */}
      <TeamFeed colors={colors} user={user} />
    </section>
  );
}

export default Community;
