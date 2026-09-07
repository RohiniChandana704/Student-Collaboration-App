import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            Connect, Learn <span>and Collaborate</span>
          </h1>

          <p>
            A platform where students can share knowledge, ask questions,
            exchange ideas, and collaborate on exciting projects.
          </p>

          <div className="hero-buttons">
            <Link to="/register" className="primary-btn">
              Get Started
            </Link>

            <Link to="/knowledge" className="secondary-btn">
              Explore Knowledge
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Everything Students Need to Collaborate</h2>

        <div className="feature-container">
          <div className="feature-card">
            <h3>📚 Share Knowledge</h3>
            <p>
              Share useful resources, notes, concepts, and learning
              experiences with other students.
            </p>
          </div>

          <div className="feature-card">
            <h3>❓ Ask Questions</h3>
            <p>
              Ask doubts and get answers from students who have knowledge
              and experience in that topic.
            </p>
          </div>

          <div className="feature-card">
            <h3>🚀 Find Collaborators</h3>
            <p>
              Discover students with similar interests and build projects
              together.
            </p>
          </div>
        </div>
      </section>
      {/* Recent Posts Section */}
<section className="recent-posts">
  <div className="section-header">
    <div>
      <h2>Recent Knowledge Posts</h2>
      <p>Explore what students are sharing and discussing.</p>
    </div>

    <Link to="/knowledge" className="view-all">
      View All →
    </Link>
  </div>

  <div className="posts-container">
    <div className="post-card">
      <div className="post-tag">Web Development</div>

      <h3>How should I start learning React?</h3>

      <p>
        I have completed JavaScript basics and want to start learning
        React. What topics should I learn first?
      </p>

      <div className="post-footer">
        <span>By Rohini</span>
        <span>💬 12</span>
      </div>
    </div>

    <div className="post-card">
      <div className="post-tag">Programming</div>

      <h3>Best way to improve DSA skills?</h3>

      <p>
        Looking for a structured approach to practice data structures
        and algorithms consistently.
      </p>

      <div className="post-footer">
        <span>By Student</span>
        <span>💬 8</span>
      </div>
    </div>

    <div className="post-card">
      <div className="post-tag">Project Idea</div>

      <h3>Looking for teammates for a web project</h3>

      <p>
        I am looking for students interested in React and backend
        development to collaborate on a project.
      </p>

      <div className="post-footer">
        <span>By Alex</span>
        <span>💬 15</span>
      </div>
    </div>
  </div>
</section>
{/* Call To Action Section */}
<section className="cta">
  <div className="cta-content">
    <h2>Have something to share?</h2>

    <p>
      Join the community, share your knowledge, ask questions,
      and collaborate with students.
    </p>

    <Link to="/register" className="cta-btn">
      Join StudentHub
    </Link>
  </div>
</section>
    </div>
  );
}

export default Home;