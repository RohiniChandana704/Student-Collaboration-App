import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Knowledge.css";
import { useNavigate } from "react-router-dom";

function Knowledge() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "",
    tags: "",
  });

  const categories = [
    "All",
    "Programming",
    "Web Development",
    "AI & ML",
    "DSA",
    "Cloud",
    "Development",
  ];

  const fetchPosts = async (searchTerm = "") => {
    setLoading(true);
    try {
      const res = await api.get("/posts", {
        params: searchTerm ? { search: searchTerm } : {},
      });
      setPosts(res.data);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = category === "All" || post.category === category;
    return matchesCategory;
  });

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    fetchPosts(e.target.value);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please log in to share knowledge.");
      return;
    }

    if (!newPost.title.trim() || !newPost.content.trim() || !newPost.category.trim()) {
      alert("Please fill in title, content and category.");
      return;
    }

    try {
      await api.post("/posts", {
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        tags: newPost.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });

      setNewPost({ title: "", content: "", category: "", tags: "" });
      setShowForm(false);
      fetchPosts(search);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to share knowledge");
    }
  };

  return (
    <div className="knowledge-page">
      <section className="knowledge-hero">
        <div className="knowledge-hero-content">
          <span className="knowledge-badge">📚 Student Knowledge Hub</span>

          <h1>
            Learn. <span>Share.</span> Grow.
          </h1>

          <p>
            Discover useful resources, learning experiences, concepts,
            tutorials, and ideas shared by students.
          </p>

          <div className="knowledge-search">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search knowledge, topics, or tags..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </section>

      <main className="knowledge-content">
        <div className="knowledge-heading">
          <div>
            <h2>Explore Knowledge</h2>
            <p>Find something useful for your learning journey.</p>
          </div>

          <button className="share-btn" onClick={() => setShowForm((prev) => !prev)}>
            {showForm ? "Cancel" : "+ Share Knowledge"}
          </button>
        </div>

        {showForm && (
          <form className="knowledge-create-form" onSubmit={handleCreatePost}>
            <input
              type="text"
              placeholder="Title"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            />

            <input
              type="text"
              placeholder="Category (e.g. Web Development, DSA)"
              value={newPost.category}
              onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
            />

            <input
              type="text"
              placeholder="Tags, comma separated (e.g. React, Hooks)"
              value={newPost.tags}
              onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
            />

            <textarea
              placeholder="Share what you know..."
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            />

            <button type="submit">Post</button>
          </form>
        )}

        <div className="knowledge-categories">
          {categories.map((item) => (
            <button
              key={item}
              className={category === item ? "active" : ""}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ textAlign: "center", color: "#94a3b8" }}>Loading...</p>
        ) : (
          <div className="knowledge-grid">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
               <article
                className="knowledge-card"
                key={post._id}
                onClick={() => navigate(`/knowledge/${post._id}`)}
                style={{ cursor: "pointer" }}
>
                  <div className="knowledge-card-top">
                    <span className="knowledge-tag">{post.category}</span>
                    <span className="knowledge-bookmark">🔖</span>
                  </div>

                  <h3>{post.title}</h3>
                  <p>{post.content}</p>

                  {post.tags && post.tags.length > 0 && (
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", margin: "8px 0" }}>
                      {post.tags.map((tag) => (
                        <span className="topic-tag" key={tag}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="knowledge-card-footer">
                    <div className="author">
                      <div className="author-avatar">
                        {post.author?.name?.charAt(0) || "?"}
                      </div>
                      <span>By {post.author?.name || "Unknown"}</span>
                    </div>

                    <div className="post-stats">
                      <span>👁 {post.views || 0}</span>
                      <span>💬 {post.comments?.length || 0}</span>
                      <span>❤️ {post.likes?.length || 0}</span>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="no-results">
                <div>🔎</div>
                <h3>No knowledge found</h3>
                <p>Try searching for another topic, or be the first to share.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Knowledge;