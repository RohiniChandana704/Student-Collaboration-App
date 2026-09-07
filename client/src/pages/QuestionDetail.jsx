import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./QuestionDetail.css";

function QuestionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState("");

  const fetchedIdRef = useRef(null);

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

  const handleVote = async () => {
    if (!user) {
      alert("Please log in to vote.");
      return;
    }
    try {
      await api.put(`/questions/${id}/vote`);
      fetchQuestion();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to vote");
    }
  };

  const handleAnswer = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please log in to answer.");
      return;
    }

    if (!answerText.trim()) return;

    try {
      await api.post(`/questions/${id}/answers`, { text: answerText });
      setAnswerText("");
      fetchQuestion();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to post answer");
    }
  };

  const hasVoted =
    user && question?.votes?.some((v) => v === user.id || v === user._id);

  if (loading) {
    return <p style={{ textAlign: "center", padding: "60px" }}>Loading...</p>;
  }

  if (!question) {
    return <p style={{ textAlign: "center", padding: "60px" }}>Question not found.</p>;
  }

  return (
    <div className="question-detail-page">
      <div className="question-detail-container">
        <button className="back-btn" onClick={() => navigate("/questions")}>
          ← Back to Questions
        </button>

        <div className="detail-top">
          <button
            className="vote-btn"
            onClick={handleVote}
            style={{ color: hasVoted ? "#7c3aed" : undefined }}
          >
            ▲ {question.votes?.length || 0} votes
          </button>

          <span className="question-tag">{question.category}</span>
        </div>

        <h1>{question.title}</h1>

        <div className="detail-meta">
          <span>Asked by <strong>{question.author?.name || "Unknown"}</strong></span>
          <span>👁 {question.views || 0} views</span>
        </div>

        <p className="detail-description">{question.description}</p>

        <div className="answers-section">
          <h3>Answers ({question.answers?.length || 0})</h3>

          <form className="answer-form" onSubmit={handleAnswer}>
            <textarea
              placeholder="Write your answer..."
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
            />
            <button type="submit">Post Answer</button>
          </form>

          <div className="answers-list">
            {question.answers && question.answers.length > 0 ? (
              question.answers.map((answer) => (
                <div className="answer-item" key={answer._id}>
                  <div className="answer-avatar">
                    {answer.author?.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <strong>{answer.author?.name || "Unknown"}</strong>
                    <p>{answer.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-answers">No answers yet. Be the first to help!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionDetail;