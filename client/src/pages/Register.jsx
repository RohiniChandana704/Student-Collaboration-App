import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form values
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Touched states
  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  const [termsAccepted, setTermsAccepted] = useState(false);

  // =========================
  // NAME VALIDATION
  // =========================

  const isNameValid = /^[A-Za-z ]+$/.test(name) && name.trim().length >= 3;

  // =========================
  // EMAIL VALIDATION
  // =========================

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // =========================
  // PASSWORD VALIDATION
  // =========================

  const passwordRules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isPasswordValid =
    passwordRules.length &&
    passwordRules.uppercase &&
    passwordRules.lowercase &&
    passwordRules.number &&
    passwordRules.special;

  // =========================
  // CONFIRM PASSWORD
  // =========================

  const isConfirmPasswordValid =
    confirmPassword.length > 0 && password === confirmPassword;

  // =========================
  // COMPLETE FORM
  // =========================

  const isFormValid =
    isNameValid &&
    isEmailValid &&
    isPasswordValid &&
    isConfirmPasswordValid &&
    termsAccepted;

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setTermsAccepted(false);
    setNameTouched(false);
    setEmailTouched(false);
    setPasswordTouched(false);
    setConfirmPasswordTouched(false);
  };

  // =========================
  // REGISTER
  // =========================

  const handleRegister = async (e) => {
    e.preventDefault();

    setNameTouched(true);
    setEmailTouched(true);
    setPasswordTouched(true);
    setConfirmPasswordTouched(true);

    if (!isFormValid) {
      return;
    }

    setSubmitting(true);

    try {
      await register(name.trim(), email, password);

      alert("Registration successful!");

      resetForm();
      navigate("/profile");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
      // Clear only the password fields on failure, keep name/email so the user doesn't have to retype them
      setPassword("");
      setConfirmPassword("");
      setPasswordTouched(false);
      setConfirmPasswordTouched(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        {/* LEFT SECTION */}

        <div className="register-welcome">
          <div className="register-welcome-content">
            <div className="register-logo">StudentHub</div>

            <span className="register-badge">🚀 Join the Community</span>

            <h1>
              Build Your
              <span> Student Network.</span>
            </h1>

            <p>
              Create your account and connect with students who share your
              interests, goals, and passion for learning.
            </p>

            <div className="community-stats">
              <div>
                <strong>10K+</strong>
                <span>Students</span>
              </div>

              <div>
                <strong>5K+</strong>
                <span>Discussions</span>
              </div>

              <div>
                <strong>1K+</strong>
                <span>Projects</span>
              </div>
            </div>
          </div>
        </div>

        {/* REGISTER FORM */}

        <div className="register-form-section">
          <div className="register-card">
            <div className="register-mobile-logo">StudentHub</div>

            <div className="register-header">
              <h2>Create Account</h2>

              <p>Start your learning journey with StudentHub.</p>
            </div>

            <form onSubmit={handleRegister}>
              {/* NAME */}

              <div className="register-form-group">
                <label htmlFor="name">Full Name</label>

                <div
                  className={`register-input ${
                    nameTouched
                      ? isNameValid
                        ? "register-input-valid"
                        : "register-input-invalid"
                      : ""
                  }`}
                >
                  <span>👤</span>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => {
                      const value = e.target.value;

                      if (/^[A-Za-z ]*$/.test(value)) {
                        setName(value);
                      }
                    }}
                    onBlur={() => setNameTouched(true)}
                    required
                  />

                  {nameTouched && (
                    <span className="register-validation-icon">
                      {isNameValid ? "✓" : "✕"}
                    </span>
                  )}
                </div>

                {nameTouched && !isNameValid && (
                  <p className="register-error-message">
                    Name must contain at least 3 letters.
                  </p>
                )}

                {nameTouched && isNameValid && (
                  <p className="register-success-message">Valid name ✓</p>
                )}
              </div>

              {/* EMAIL */}

              <div className="register-form-group">
                <label htmlFor="email">Email Address</label>

                <div
                  className={`register-input ${
                    emailTouched
                      ? isEmailValid
                        ? "register-input-valid"
                        : "register-input-invalid"
                      : ""
                  }`}
                >
                  <span>✉️</span>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                    onBlur={() => setEmailTouched(true)}
                    required
                  />

                  {emailTouched && (
                    <span className="register-validation-icon">
                      {isEmailValid ? "✓" : "✕"}
                    </span>
                  )}
                </div>

                {emailTouched && !isEmailValid && (
                  <p className="register-error-message">
                    Please enter a valid email address.
                  </p>
                )}

                {emailTouched && isEmailValid && (
                  <p className="register-success-message">
                    Valid email address ✓
                  </p>
                )}
              </div>

              {/* PASSWORD */}

              <div className="register-form-group">
                <label htmlFor="password">Password</label>

                <div
                  className={`register-input ${
                    password.length > 0
                      ? isPasswordValid
                        ? "register-input-valid"
                        : "register-input-invalid"
                      : ""
                  }`}
                >
                  <span>🔒</span>

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setPasswordTouched(true)}
                    required
                  />

                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>

                {/* PASSWORD REQUIREMENTS */}

                {password.length > 0 && (
                  <div className="register-password-requirements">
                    <p
                      className={
                        passwordRules.length
                          ? "register-requirement-valid"
                          : "register-requirement-invalid"
                      }
                    >
                      {passwordRules.length ? "✓" : "✕"} At least 8 characters
                    </p>

                    <p
                      className={
                        passwordRules.uppercase
                          ? "register-requirement-valid"
                          : "register-requirement-invalid"
                      }
                    >
                      {passwordRules.uppercase ? "✓" : "✕"} One uppercase
                      letter (A-Z)
                    </p>

                    <p
                      className={
                        passwordRules.lowercase
                          ? "register-requirement-valid"
                          : "register-requirement-invalid"
                      }
                    >
                      {passwordRules.lowercase ? "✓" : "✕"} One lowercase
                      letter (a-z)
                    </p>

                    <p
                      className={
                        passwordRules.number
                          ? "register-requirement-valid"
                          : "register-requirement-invalid"
                      }
                    >
                      {passwordRules.number ? "✓" : "✕"} One number (0-9)
                    </p>

                    <p
                      className={
                        passwordRules.special
                          ? "register-requirement-valid"
                          : "register-requirement-invalid"
                      }
                    >
                      {passwordRules.special ? "✓" : "✕"} One special
                      character (!@#$...)
                    </p>
                  </div>
                )}
              </div>

              {/* CONFIRM PASSWORD */}

              <div className="register-form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>

                <div
                  className={`register-input ${
                    confirmPasswordTouched
                      ? isConfirmPasswordValid
                        ? "register-input-valid"
                        : "register-input-invalid"
                      : ""
                  }`}
                >
                  <span>🔐</span>

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => setConfirmPasswordTouched(true)}
                    required
                  />

                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                </div>

                {confirmPasswordTouched && !isConfirmPasswordValid && (
                  <p className="register-error-message">
                    Passwords do not match.
                  </p>
                )}

                {confirmPasswordTouched && isConfirmPasswordValid && (
                  <p className="register-success-message">
                    Passwords match ✓
                  </p>
                )}
              </div>

              {/* TERMS */}

              <label className="terms-row">
                <input
                  type="checkbox"
                  name="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />

                <span>
                  I agree to the{" "}
                  <a href="/" onClick={(e) => e.preventDefault()}>
                    Terms & Conditions
                  </a>{" "}
                  and{" "}
                  <a href="/" onClick={(e) => e.preventDefault()}>
                    Privacy Policy
                  </a>
                </span>
              </label>

              {/* REGISTER BUTTON */}

              <button
                type="submit"
                className="register-submit"
                disabled={submitting || !isFormValid}
              >
                {submitting ? "Creating account..." : "Create Account"}
                <span>→</span>
              </button>
            </form>

            <div className="register-divider">
              <span>ALREADY A MEMBER?</span>
            </div>

            <p className="login-link">
              Already have an account?
              <Link to="/login"> Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;