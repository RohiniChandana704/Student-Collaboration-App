import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    const email = e.target.elements.email.value.trim();
    const password = e.target.elements.password.value;

    setSubmitting(true);

    try {
      const data = await login(email, password);
      alert(`Welcome back, ${data.user.name}!`);
      e.target.reset();
      navigate("/profile");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
      e.target.reset();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* LEFT SECTION */}
        <div className="auth-welcome">
          <div className="welcome-content">
            <div className="welcome-logo">StudentHub</div>

            <span className="welcome-badge">🎓 Student Community</span>

            <h1>
              Welcome
              <span> Back!</span>
            </h1>

            <p>
              Connect with students, exchange knowledge, ask questions, and
              collaborate on exciting projects.
            </p>

            <div className="welcome-features">
              <div>
                <span>📚</span>
                <p>Share & discover knowledge</p>
              </div>

              <div>
                <span>💡</span>
                <p>Ask questions and learn</p>
              </div>

              <div>
                <span>🚀</span>
                <p>Build projects together</p>
              </div>
            </div>
          </div>
        </div>

        {/* LOGIN FORM */}
        <div className="auth-form-section">
          <div className="auth-card">
            <div className="mobile-logo">StudentHub</div>

            <div className="auth-header">
              <h2>Sign in</h2>

              <p>Welcome back! Please enter your details.</p>
            </div>

            <form onSubmit={handleLogin}>
              {/* EMAIL */}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>

                <div className="input-wrapper">
                  <span>✉️</span>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div className="form-group">
                <div className="label-row">
                  <label htmlFor="password">Password</label>

                  <Link
                    to="/forgot-password"
                    className="forgot-password"
                    onClick={(e) => e.preventDefault()}
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="input-wrapper">
                  <span>🔒</span>

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* REMEMBER */}

              <div className="remember-row">
                <label>
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
              </div>

              {/* LOGIN BUTTON */}

              <button type="submit" className="auth-submit" disabled={submitting}>
                {submitting ? "Signing in..." : "Sign In"}
                <span>→</span>
              </button>
            </form>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <p className="auth-switch">
              Don't have an account?
              <Link to="/register"> Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;