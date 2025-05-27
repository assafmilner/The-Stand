import { useEffect, useState } from "react";
import CreatePost from "../post/CreatePost";
import PostList from "../post/PostList";
import api from "utils/api";
import { Users, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Feed({ colors, user, feedType = "friends" }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  console.log(
    "🔥 CLIENT DEBUG: Feed component rendered with feedType:",
    feedType
  );

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);

        let endpoint = "/api/posts/friends"; // Default to friends
        if (feedType === "team") {
          endpoint = "/api/posts/team";
        }

        console.log("🔥 CLIENT DEBUG: About to call endpoint:", endpoint);
        console.log(
          "🔥 CLIENT DEBUG: Full URL will be:",
          `${api.defaults.baseURL}${endpoint}`
        );

        const res = await api.get(endpoint);

        console.log("🔥 CLIENT DEBUG: Response received:", {
          success: res.data.success,
          postsCount: res.data.posts?.length,
          endpoint: endpoint,
        });

        if (res.data.success) {
          setPosts(res.data.posts || []);
        } else {
          setError("בעיה בטעינת פוסטים");
        }
      } catch (err) {
        console.error("🔥 CLIENT DEBUG: Error fetching posts:", err);
        console.error("🔥 CLIENT DEBUG: Error details:", {
          status: err.response?.status,
          url: err.config?.url,
          method: err.config?.method,
        });

        if (err.response?.status === 401) {
          setError("נדרשת התחברות");
        } else {
          setError(
            feedType === "team"
              ? "בעיה בטעינת פוסטים מהקהילה"
              : "בעיה בטעינת פוסטים מחברים"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      console.log("🔥 CLIENT DEBUG: User exists, fetching posts...");
      fetchPosts();
    } else {
      console.log("🔥 CLIENT DEBUG: No user, skipping fetch");
    }
  }, [user, feedType]);

  if (loading) {
    return (
      <section className="space-y-6">
        <CreatePost colors={colors} />
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">
            {feedType === "team"
              ? "טוען פוסטים מהקהילה..."
              : "טוען פוסטים מחברים..."}
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-6">
        <CreatePost colors={colors} />
        <div className="text-center py-8 bg-white rounded-xl border">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            נסה שוב
          </button>
        </div>
      </section>
    );
  }

  console.log("🔥 CLIENT DEBUG: Rendering posts:", posts.length);

  if (posts.length === 0) {
    return (
      <section className="space-y-6">
        <CreatePost colors={colors} />

        {/* Empty state */}
        <div className="text-center py-12 bg-white rounded-xl border">
          <Users size={64} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {feedType === "team"
              ? `אין פוסטים מאוהדי ${user?.favoriteTeam}`
              : "אין פוסטים מחברים"}
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {feedType === "team"
              ? `עדיין אין פוסטים מאוהדים אחרים של ${user?.favoriteTeam}`
              : `כדי לראות פוסטים בפיד, תחילה עליך להתחבר עם אוהדים אחרים של ${user?.favoriteTeam}`}
          </p>

          {feedType === "friends" && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate("/friends")}
                className="flex items-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors"
                style={{ backgroundColor: colors.primary }}
              >
                <Users size={20} />
                מצא חברים חדשים
              </button>

              <button
                onClick={() => navigate("/messages")}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <MessageCircle size={20} />
                התחל שיחה
              </button>
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
            <p className="text-sm text-blue-700">
              <strong>טיפ:</strong>
              {feedType === "team"
                ? ` היה הראשון לפרסם פוסט בקהילת ${user?.favoriteTeam}!`
                : ` חפש אוהדים של ${user?.favoriteTeam} ושלח להם בקשות חברות כדי לראות את הפוסטים שלהם בפיד`}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Create Post Component */}
      <CreatePost colors={colors} />

      {/* Feed Header */}
      <div className="bg-white rounded-xl p-4 border">
        <div className="flex items-center gap-3">
          <Users size={24} style={{ color: colors.primary }} />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {feedType === "team"
                ? `פוסטים של אוהדי ${user?.favoriteTeam}`
                : "פוסטים מחברים"}
            </h2>
            <p className="text-sm text-gray-500">
              {feedType === "team"
                ? `כל הפוסטים מאוהדי ${user?.favoriteTeam}`
                : `פוסטים מאוהדי ${user?.favoriteTeam} שאתה מחובר איתם`}
            </p>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <PostList posts={posts} colors={colors} currentUser={user} />
    </section>
  );
}

export default Feed;
