import React from "react";

function Feed({ colors }) {
  const posts = [
    {
      id: 1,
      author: "איתי כהן",
      content:
        "איזה שחקן סתיו טוריאללללל הקבוצה הזאת בדם!! תראו את הנתונים של המשחק האחרון שלו 👇",
      likes: 124,
      comments: 32,
    },
    // אפשר להוסיף עוד פוסטים...
  ];

  return (
    <section>
      {/* תיבת כתיבת פוסט */}
      <div
        className="dashboard-card post-box"
        style={{
          marginBottom: "1.5rem",
          borderTop: `4px solid ${colors.primary}`,
        }}
      >
        <textarea
          className="post-input"
          placeholder="מה קורה בקבוצת האוהדים שלך?"
        />
      </div>

      {/* הצגת כל הפוסטים */}
      {posts.map((post) => (
        <div
          key={post.id}
          className="post-card"
          style={{
            marginBottom: "1.5rem",
            borderTop: `4px solid ${colors.primary}`,
          }}
        >
          <div className="post-header">{post.author}</div>
          <p>{post.content}</p>
          <div className="post-footer">
            <span>{post.likes} לייקים</span>
            <span>{post.comments} תגובות</span>
          </div>
        </div>
      ))}
    </section>
  );
}

export default Feed;
