import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Projects.css";

function Projects() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    category: "",
    technologies: "",
    maxMembers: "",
  });

  const filters = [
    "All",
    "Web Development",
    "AI & ML",
    "Programming",
    "Mobile Development",
  ];

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

  const filteredProjects = groups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(search.toLowerCase()) ||
      (group.description || "").toLowerCase().includes(search.toLowerCase()) ||
      (group.technologies || []).some((tech) =>
        tech.toLowerCase().includes(search.toLowerCase())
      );

    const matchesFilter = activeFilter === "All" || group.category === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please log in to create a project.");
      return;
    }

    if (!newProject.name.trim()) {
      alert("Project name is required");
      return;
    }

    try {
      await api.post("/groups", {
        name: newProject.name,
        description: newProject.description,
        category: newProject.category,
        technologies: newProject.technologies
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        maxMembers: newProject.maxMembers ? Number(newProject.maxMembers) : null,
      });

      setNewProject({ name: "", description: "", category: "", technologies: "", maxMembers: "" });
      setShowCreateForm(false);
      fetchGroups(search);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create project");
    }
  };

  const handleJoin = async (groupId) => {
    if (!user) {
      alert("Please log in to join a project.");
      return;
    }

    try {
      await api.put(`/groups/${groupId}/join`);
      fetchGroups(search);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to join project");
    }
  };

  const isMember = (group) =>
    user && group.members.some((m) => m._id === user.id || m._id === user._id);

  return (
    <div className="projects-page">
      <section className="projects-hero">
        <div className="projects-hero-content">
          <span className="projects-badge">🚀 Student Collaboration</span>

          <h1>
            Build Something
            <span> Amazing Together</span>
          </h1>

          <p>
            Discover exciting student projects, find teammates with similar
            interests, and turn your ideas into reality.
          </p>

          <div className="project-stats">
            <div className="project-stat">
              <strong>{groups.length}</strong>
              <span>Projects</span>
            </div>

            <div className="project-stat">
              <strong>
                {groups.reduce((sum, g) => sum + g.members.length, 0)}
              </strong>
              <span>Students</span>
            </div>
          </div>
        </div>
      </section>

      <main className="projects-content">
        <div className="projects-section-header">
          <div>
            <span className="section-label">DISCOVER</span>
            <h2>Find Your Next Project</h2>
            <p>Explore projects created by students and find opportunities to collaborate.</p>
          </div>

          <button className="create-project-btn" onClick={() => setShowCreateForm((prev) => !prev)}>
            <span>＋</span>
            {showCreateForm ? "Cancel" : "Create Project"}
          </button>
        </div>

        {showCreateForm && (
          <form className="create-group-form" onSubmit={handleCreate} style={{ marginBottom: "25px" }}>
            <input
              type="text"
              placeholder="Project name"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Category (e.g. Web Development, AI & ML)"
              value={newProject.category}
              onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
            />
            <input
              type="text"
              placeholder="Technologies, comma separated (e.g. React, Node.js)"
              value={newProject.technologies}
              onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
            />
            <input
              type="number"
              placeholder="Max team size (optional)"
              value={newProject.maxMembers}
              onChange={(e) => setNewProject({ ...newProject, maxMembers: e.target.value })}
            />
            <textarea
              placeholder="Describe the project..."
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            />
            <button type="submit">Create</button>
          </form>
        )}

        <div className="project-tools">
          <div className="project-search">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search projects, technologies..."
              value={search}
              onChange={handleSearchChange}
            />
            {search && (
              <button onClick={() => setSearch("")} className="clear-search">
                ×
              </button>
            )}
          </div>
        </div>

        <div className="project-filters">
          {filters.map((filter) => (
            <button
              key={filter}
              className={activeFilter === filter ? "filter-btn active" : "filter-btn"}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="results-info">
          <span>
            Showing <strong>{filteredProjects.length}</strong> projects
          </span>

          {(search || activeFilter !== "All") && (
            <button onClick={() => { setSearch(""); setActiveFilter("All"); }}>
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <p style={{ textAlign: "center", color: "#94a3b8" }}>Loading...</p>
        ) : filteredProjects.length > 0 ? (
          <div className="projects-grid">
            {filteredProjects.map((project) => {
              const isFull = project.maxMembers && project.members.length >= project.maxMembers;

              return (
                <article className="project-card" key={project._id}>
                  <div className="project-card-top">
                    <span className={isFull ? "project-status almost-full" : "project-status"}>
                      ● {isFull ? "Full" : "Looking for Members"}
                    </span>
                  </div>

                  {project.category && (
                    <span className="project-category">{project.category}</span>
                  )}

                  <h3>{project.name}</h3>

                  {project.description && (
                    <p className="project-description">{project.description}</p>
                  )}

                  {project.technologies && project.technologies.length > 0 && (
                    <div className="technology-list">
                      {project.technologies.map((tech) => (
                        <span key={tech}>{tech}</span>
                      ))}
                    </div>
                  )}

                  <div className="project-card-footer">
                    <div className="project-owner">
                      <div className="owner-avatar">
                        {project.creator?.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <span>Created by</span>
                        <strong>{project.creator?.name || "Unknown"}</strong>
                      </div>
                    </div>

                    <div className="team-count">
                      <span>👥</span>
                      <strong>
                        {project.members.length}
                        {project.maxMembers ? `/${project.maxMembers}` : ""}
                      </strong>
                    </div>
                  </div>

                  {isMember(project) ? (
                    <button
                      className="join-project-btn"
                      onClick={() => navigate(`/groups/${project._id}/chat`)}
                    >
                      Open Chat <span>→</span>
                    </button>
                  ) : (
                    <button
                      className="join-project-btn"
                      onClick={() => handleJoin(project._id)}
                      disabled={isFull}
                    >
                      {isFull ? "Team Full" : "View & Join Project"} <span>→</span>
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-projects">
            <div className="empty-icon">🔎</div>
            <h3>No projects found</h3>
            <p>Try changing your search, or create the first one.</p>
            <button onClick={() => { setSearch(""); setActiveFilter("All"); }}>
              Show All Projects
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Projects;