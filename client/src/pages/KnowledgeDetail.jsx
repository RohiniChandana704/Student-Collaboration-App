import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./KnowledgeDetail.css";

function KnowledgeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");

  const fetchedIdRef = useRef(null);

  const fetchPost = async (isInitial = false) => {
  if (isInitial) setLoading(true);
  try {
    const res = await api.get(`/posts/${id}`);
    setPost(res.data);
  } catch (error) {
    console.error("Failed to fetch post:", error);
  } finally {
    if (isInitial) setLoading(false);
  }
};

useEffect(() => {
  if (fetchedIdRef.current === id) return;
  fetchedIdRef.current = id;
  fetchPost(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [id]);

  const handleLike = async () => {
  if (!user) {
    alert("Please log in to like posts.");
    return;
  }
  try {
    await api.put(`/posts/${id}/like`);
    fetchPost();
  } catch (error) {
    alert(error.response?.data?.message || "Failed to like post");
  }
};
  const fetchQuestion = async (isInitial = false) => {
  if (isInitial) setLoading(true);
  try {
    const res = await api.get(`/questions/${id}`);
    setQuestion(res.data);
  } catch (error) {
    console.error("Failed to fetch question:", error);
  } finally {
    if (isInitial) setLoading(false);
  }
};

useEffect(() => {
  if (fetchedIdRef.current === id) return;
  fetchedIdRef.current = id;
  fetchQuestion(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [id]);

  const handleComment = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please log in to comment.");
      return;
    }

    if (!commentText.trim()) return;

    try {
      await api.post(`/posts/${id}/comments`, { text: commentText });
      setCommentText("");
      fetchPost();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add comment");
    }
  };

  const isLiked =
    user &&
    post?.likes?.some(
      (likeId) => likeId === user.id || likeId === user._id
    );

  const handleDelete = async () => {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;

    try {
      await api.delete(`/posts/${id}`);
      navigate("/knowledge");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete post");
    }
  };

  const isAuthor =
    user && (post?.author?._id === user.id || post?.author?._id === user._id);

  if (loading) {
    return <p style={{ textAlign: "center", padding: "60px" }}>Loading...</p>;
  }

  if (!post) {
    return <p style={{ textAlign: "center", padding: "60px" }}>Post not found.</p>;
  }

  return (
    <div className="knowledge-detail-page">
      <div className="knowledge-detail-container">
        <button className="back-btn" onClick={() => navigate("/knowledge")}>
          ← Back to Knowledge Hub
        </button>

        <span className="knowledge-tag">{post.category}</span>

        <h1>{post.title}</h1>

        <div className="detail-meta">
          <div className="author">
            <div className="author-avatar">
              {post.author?.name?.charAt(0) || "?"}
            </div>
            <span>By {post.author?.name || "Unknown"}</span>
          </div>

          <div className="post-stats">
            <span>👁 {post.views || 0} views</span>
            <span>💬 {post.comments?.length || 0} comments</span>
          </div>
        </div>

        <p className="detail-content">{post.content}</p>

        {post.tags && post.tags.length > 0 && (
          <div className="detail-tags">
            {post.tags.map((tag) => (
              <span className="topic-tag" key={tag}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        <button
          className={isLiked ? "like-btn liked" : "like-btn"}
          onClick={handleLike}
        >
          {isLiked ? "❤️ Liked" : "🤍 Like"} ({post.likes?.length || 0})
        </button>

        {isAuthor && (
          <button className="delete-post-btn" onClick={handleDelete}>
            🗑️ Delete Post
          </button>
        )}

        <div className="comments-section">
          <h3>Comments ({post.comments?.length || 0})</h3>

          <form className="comment-form" onSubmit={handleComment}>
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button type="submit">Post</button>
          </form>

          <div className="comments-list">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div className="comment-item" key={comment._id}>
                  <div className="author-avatar small">
                    {comment.author?.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <strong>{comment.author?.name || "Unknown"}</strong>
                    <p>{comment.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-comments">No comments yet. Be the first!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default KnowledgeDetail;

