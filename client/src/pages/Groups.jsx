import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Groups.css";

function Groups() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    category: "",
  });

  const fetchGroups = async (searchTerm = "") => {
    setLoading(true);
    try {
      const res = await api.get("/groups", {
        params: searchTerm ? { search: searchTerm } : {},
      });
      setGroups(res.data);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchGroups(search);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();

    if (!newGroup.name.trim()) {
      alert("Group name is required");
      return;
    }

    try {
      await api.post("/groups", newGroup);
      setNewGroup({ name: "", description: "", category: "" });
      setShowCreateForm(false);
      fetchGroups(search);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create group");
    }
  };

  const handleJoin = async (groupId) => {
    try {
      await api.put(`/groups/${groupId}/join`);
      fetchGroups(search);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to join group");
    }
  };

  const handleLeave = async (groupId) => {
    try {
      await api.put(`/groups/${groupId}/leave`);
      fetchGroups(search);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to leave group");
    }
  };

  const handleDelete = async (groupId) => {
    if (!window.confirm("Delete this group? This cannot be undone.")) return;

    try {
      await api.delete(`/groups/${groupId}`);
      fetchGroups(search);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete group");
    }
  };

  const isMember = (group) =>
    user && group.members.some((m) => m._id === user.id || m._id === user._id);

  const isCreator = (group) =>
    user && group.creator._id === (user.id || user._id);

  return (
    <div className="groups-page">
      <section className="groups-hero">
        <div className="groups-hero-content">
          <span className="groups-badge">🤝 Student Collaboration</span>
          <h1>
            Find Your <span>Team</span>
          </h1>
          <p>
            Create or join groups to collaborate with other students on
            projects, hackathons, and study goals.
          </p>
        </div>
      </section>

      <main className="groups-content">
        <div className="groups-section-header">
          <div>
            <span className="section-label">DISCOVER</span>
            <h2>Browse Groups</h2>
            <p>Join a group or start your own.</p>
          </div>

          <button
            className="create-group-btn"
            onClick={() => setShowCreateForm((prev) => !prev)}
          >
            <span>＋</span>
            {showCreateForm ? "Cancel" : "Create Group"}
          </button>
        </div>

        {showCreateForm && (
          <form className="create-group-form" onSubmit={handleCreateGroup}>
            <input
              type="text"
              placeholder="Group name"
              value={newGroup.name}
              onChange={(e) =>
                setNewGroup({ ...newGroup, name: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Category (e.g. hackathon, study group)"
              value={newGroup.category}
              onChange={(e) =>
                setNewGroup({ ...newGroup, category: e.target.value })
              }
            />

            <textarea
              placeholder="Description"
              value={newGroup.description}
              onChange={(e) =>
                setNewGroup({ ...newGroup, description: e.target.value })
              }
            />

            <button type="submit">Create</button>
          </form>
        )}

        <form className="group-search" onSubmit={handleSearchSubmit}>
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="clear-search"
              onClick={() => {
                setSearch("");
                fetchGroups("");
              }}
            >
              ×
            </button>
          )}
        </form>

        {loading ? (
          <p className="groups-loading">Loading groups...</p>
        ) : groups.length > 0 ? (
          <div className="groups-grid">
            {groups.map((group) => (
              <article className="group-card" key={group._id}>
                {group.category && (
                  <span className="group-category">{group.category}</span>
                )}

                <h3>{group.name}</h3>

                {group.description && (
                  <p className="group-description">{group.description}</p>
                )}

                <div className="group-card-footer">
                  <div className="group-owner">
                    <span>Created by</span>
                    <strong>{group.creator?.name || "Unknown"}</strong>
                  </div>

                  <div className="member-count">
                    <span>👥</span>
                    <strong>{group.members.length}</strong>
                  </div>
                </div>

                {isCreator(group) ? (
                  <button
                    className="delete-group-btn"
                    onClick={() => handleDelete(group._id)}
                  >
                    Delete Group
                  </button>
                ) : isMember(group) ? (
                  <button
                    className="leave-group-btn"
                    onClick={() => handleLeave(group._id)}
                  >
                    Leave Group
                  </button>
                ) : (
                  <button
                    className="join-group-btn"
                    onClick={() => handleJoin(group._id)}
                  >
                    Join Group <span>→</span>
                  </button>
                )}
                {isMember(group) && (
                  <button
                    className="chat-group-btn"
                    onClick={() => navigate(`/groups/${group._id}/chat`)}
                  >
                    💬 Open Chat
                  </button>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-groups">
            <div className="empty-icon">🔎</div>
            <h3>No groups found</h3>
            <p>Try a different search, or create the first one.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Groups;
