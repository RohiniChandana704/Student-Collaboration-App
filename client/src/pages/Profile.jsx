import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({ name: "", bio: "", skills: "" });

  const [stats, setStats] = useState({
    postsCount: 0,
    groupsCount: 0,
    commentsCount: 0,
    likesGiven: 0,
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    const load = async () => {
      try {
        const profileRes = await api.get("/users/me");
        setProfile(profileRes.data);
        setForm({
          name: profileRes.data.name || "",
          bio: profileRes.data.bio || "",
          skills: (profileRes.data.skills || []).join(", "),
        });

        // Compute activity stats from existing endpoints
        const [postsRes, groupsRes] = await Promise.all([
          api.get("/posts"),
          api.get("/groups"),
        ]);

        const myPosts = postsRes.data.filter(
          (p) => p.author?._id === profileRes.data._id
        );

        const myGroups = groupsRes.data.filter((g) =>
          g.members.some((m) => m._id === profileRes.data._id)
        );

        const myComments = postsRes.data.reduce((count, post) => {
          return (
            count +
            (post.comments?.filter(
              (c) => c.author?._id === profileRes.data._id
            ).length || 0)
          );
        }, 0);

        const myLikes = postsRes.data.filter((p) =>
          p.likes?.includes(profileRes.data._id)
        ).length;

        setStats({
          postsCount: myPosts.length,
          groupsCount: myGroups.length,
          commentsCount: myComments,
          likesGiven: myLikes,
        });
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, authLoading, navigate]);

  const handleLogout = () => {
    logout();
    alert("You have been logged out successfully.");
    navigate("/login");
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const res = await api.put("/users/me", {
        name: form.name,
        bio: form.bio,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });

      setProfile(res.data);
      setEditing(false);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update profile");
    }
  };

  if (authLoading || loading || !profile) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  const firstLetter = profile.name ? profile.name.charAt(0).toUpperCase() : "S";
  const memberSince = new Date(profile.createdAt).getFullYear();

  return (
    <div className="profile-page">
      <section className="profile-hero">
        <div className="profile-hero-content">
          <div className="profile-avatar-large">{firstLetter}</div>

          <div>
            <span className="profile-welcome">Welcome back 👋</span>
            <h1>{profile.name}</h1>
            <p>{profile.email}</p>
          </div>
        </div>
      </section>

      <main className="profile-content">
        <div className="profile-grid">
          <section className="profile-card">
            <div className="profile-card-header">
              <div>
                <span className="profile-icon">👤</span>
                <div>
                  <h2>Personal Information</h2>
                  <p>Your StudentHub account details</p>
                </div>
              </div>

              <button className="edit-btn" onClick={() => setEditing((prev) => !prev)}>
                {editing ? "Cancel" : "Edit"}
              </button>
            </div>

            {editing ? (
              <form className="profile-edit-form" onSubmit={handleSave}>
                <label>
                  Full Name
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </label>

                <label>
                  Bio
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="Tell others about yourself..."
                  />
                </label>

                <label>
                  Skills (comma separated)
                  <input
                    type="text"
                    value={form.skills}
                    onChange={(e) => setForm({ ...form, skills: e.target.value })}
                    placeholder="React, Node.js, Python"
                  />
                </label>

                <button type="submit" className="save-btn">
                  Save Changes
                </button>
              </form>
            ) : (
              <div className="profile-details">
                <div className="detail-item">
                  <span className="detail-label">Full Name</span>
                  <strong>{profile.name}</strong>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Email Address</span>
                  <strong>{profile.email}</strong>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Bio</span>
                  <strong>{profile.bio || "No bio yet"}</strong>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Member Since</span>
                  <strong>{memberSince}</strong>
                </div>

                <div className="detail-item" style={{ gridColumn: "1 / -1" }}>
                  <span className="detail-label">Skills</span>
                  {profile.skills && profile.skills.length > 0 ? (
                    <div className="skills-tags">
                      {profile.skills.map((skill) => (
                        <span key={skill}>{skill}</span>
                      ))}
                    </div>
                  ) : (
                    <strong>No skills added yet</strong>
                  )}
                </div>
              </div>
            )}
          </section>

          <section className="profile-card">
            <div className="profile-card-title">
              <span className="profile-icon">📊</span>
              <div>
                <h2>Your Activity</h2>
                <p>Your StudentHub journey</p>
              </div>
            </div>

            <div className="activity-grid">
              <div className="activity-item">
                <span>📚</span>
                <strong>{stats.postsCount}</strong>
                <p>Knowledge Posts</p>
              </div>

              <div className="activity-item">
                <span>🤝</span>
                <strong>{stats.groupsCount}</strong>
                <p>Groups Joined</p>
              </div>

              <div className="activity-item">
                <span>💬</span>
                <strong>{stats.commentsCount}</strong>
                <p>Comments Made</p>
              </div>

              <div className="activity-item">
                <span>❤️</span>
                <strong>{stats.likesGiven}</strong>
                <p>Likes Given</p>
              </div>
            </div>
          </section>
        </div>

        <section className="profile-card quick-actions">
          <div className="profile-card-title">
            <span className="profile-icon">⚡</span>
            <div>
              <h2>Quick Actions</h2>
              <p>Continue exploring StudentHub</p>
            </div>
          </div>

          <div className="action-grid">
            <Link to="/knowledge" className="profile-action">
              <span>📚</span>
              <div>
                <strong>Explore Knowledge</strong>
                <p>Discover useful resources</p>
              </div>
              <span className="action-arrow">→</span>
            </Link>

            <Link to="/groups" className="profile-action">
              <span>🤝</span>
              <div>
                <strong>Browse Groups</strong>
                <p>Find your team</p>
              </div>
              <span className="action-arrow">→</span>
            </Link>

            <Link to="/questions" className="profile-action">
              <span>💬</span>
              <div>
                <strong>Ask Questions</strong>
                <p>Get help from peers</p>
              </div>
              <span className="action-arrow">→</span>
            </Link>
          </div>
        </section>

        <div className="profile-logout-section">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </main>
    </div>
  );
}

export default Profile;