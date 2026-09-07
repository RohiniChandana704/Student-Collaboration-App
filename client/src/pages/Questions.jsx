import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Questions.css";

function Questions() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: "",
    description: "",
    category: "",
  });

  const categories = ["All", "DSA", "React", "Java", "Backend", "AI & ML", "Git"];

  const fetchQuestions = async (searchTerm = "") => {
    setLoading(true);
    try {
      const res = await api.get("/questions", {
        params: searchTerm ? { search: searchTerm } : {},
      });
      setQuestions(res.data);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const filteredQuestions = questions.filter(
    (q) => category === "All" || q.category === category
  );

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    fetchQuestions(e.target.value);
  };

  const handleAsk = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please log in to ask a question.");
      return;
    }

    if (
      !newQuestion.title.trim() ||
      !newQuestion.description.trim() ||
      !newQuestion.category.trim()
    ) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      await api.post("/questions", newQuestion);
      setNewQuestion({ title: "", description: "", category: "" });
      setShowForm(false);
      fetchQuestions(search);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to post question");
    }
  };

  const handleVote = async (questionId) => {
    if (!user) {
      alert("Please log in to vote.");
      return;
    }

    try {
      await api.put(`/questions/${questionId}/vote`);
      fetchQuestions(search);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to vote");
    }
  };

  const hasVoted = (question) =>
    user && question.votes?.some((v) => v === user.id || v === user._id);

  // DELETE QUESTION
  const handleDelete = async (questionId) => {
    if (!window.confirm("Delete this question? This cannot be undone.")) {
      return;
    }

    try {
      await api.delete(`/questions/${questionId}`);
      fetchQuestions(search);
    } catch (error) {
      alert(
        error.response?.data?.message || "Failed to delete question"
      );
    }
  };

  return (
    <div className="questions-page">
      <section className="questions-hero">
        <div className="questions-hero-content">
          <span className="questions-badge">
            💡 Student Discussion Community
          </span>

          <h1>
            Ask. <span>Learn.</span> Solve.
          </h1>

          <p>
            Have a doubt? Ask the community and learn from students who have
            already solved similar problems.
          </p>

          <div className="questions-search">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </section>

      <main className="questions-content">
        <div className="questions-heading">
          <div>
            <h2>Community Questions</h2>
            <p>Explore doubts, discussions, and helpful answers.</p>
          </div>

          <button
            className="ask-btn"
            onClick={() => setShowForm((prev) => !prev)}
          >
            {showForm ? "Cancel" : "+ Ask Question"}
          </button>
        </div>

        {showForm && (
          <form className="ask-question-form" onSubmit={handleAsk}>
            <input
              type="text"
              placeholder="Question title"
              value={newQuestion.title}
              onChange={(e) =>
                setNewQuestion({
                  ...newQuestion,
                  title: e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="Category (e.g. DSA, React, Java)"
              value={newQuestion.category}
              onChange={(e) =>
                setNewQuestion({
                  ...newQuestion,
                  category: e.target.value,
                })
              }
            />

            <textarea
              placeholder="Describe your question in detail..."
              value={newQuestion.description}
              onChange={(e) =>
                setNewQuestion({
                  ...newQuestion,
                  description: e.target.value,
                })
              }
            />

            <button type="submit">Post Question</button>
          </form>
        )}

        <div className="question-filters">
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

        <div className="questions-list">
          {loading ? (
            <p style={{ textAlign: "center", color: "#94a3b8" }}>
              Loading...
            </p>
          ) : filteredQuestions.length > 0 ? (
            filteredQuestions.map((question) => (
              <article
                className="question-card"
                key={question._id}
                onClick={() => navigate(`/questions/${question._id}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="vote-section">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVote(question._id);
                    }}
                    style={{
                      color: hasVoted(question) ? "#7c3aed" : undefined,
                    }}
                  >
                    ▲
                  </button>

                  <strong>{question.votes?.length || 0}</strong>
                  <span>votes</span>
                </div>

                <div className="question-main">
                  <div className="question-top">
                    <span className="question-tag">
                      {question.category}
                    </span>

                    <span className="question-status">
                      ● Open
                    </span>
                  </div>

                  <h3>{question.title}</h3>
                  <p>{question.description}</p>

                  <div className="question-footer">
                    <div className="question-author">
                      <div className="question-avatar">
                        {question.author?.name?.charAt(0) || "?"}
                      </div>

                      <span>
                        Asked by{" "}
                        <strong>
                          {question.author?.name || "Unknown"}
                        </strong>
                      </span>
                    </div>

                    <div className="question-stats">
                      <span>
                        💬 {question.answers?.length || 0} Answers
                      </span>

                      <span>
                        👁 {question.views || 0} Views
                      </span>
                    </div>
                  </div>

                  {/* DELETE BUTTON - ONLY FOR QUESTION CREATOR */}
                  {user &&
                    (question.author?._id === user.id ||
                      question.author?._id === user._id) && (
                      <button
                        className="delete-question-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(question._id);
                        }}
                      >
                        🗑️ Delete Question
                      </button>
                    )}
                </div>
              </article>
            ))
          ) : (
            <div className="question-no-results">
              <div>❓</div>
              <h3>No questions found</h3>
              <p>
                Try searching for a different topic, or ask the first one.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Questions;

