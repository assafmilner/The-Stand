import { useUser } from "../../context/UserContext";
import TeamFeed from "./TeamFeed";

/**
 * Community component renders the feed for the current user's favorite team.
 * Passes the user and team colors as props to the TeamFeed component.
 */
function Community({ colors }) {
  const { user } = useUser();

  return (
    <section>
      <TeamFeed colors={colors} user={user} />
    </section>
  );
}

export default Community;
