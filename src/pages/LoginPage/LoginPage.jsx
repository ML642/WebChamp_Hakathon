import { useState } from "react";
import { motion } from "framer-motion";
import { Badge, Button, Card3D } from "../../components/Ui";
import "./LoginPage.css";

const initialForm = {
  email: "",
  password: "",
};

function LoginPage({ onLogin, onLoadDemo, onOpenRegister }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  function updateForm(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    if (error) setError(""); // clear error when typing
  }

  async function submitLogin(event) {
    event.preventDefault();
    try {
      await onLogin({
        email: form.email.trim() || "candidate@answerly.demo",
        password: form.password,
      });
    } catch (err) {
      if (err.message.includes("Unauthorized") || err.message.includes("401")) {
        setError("Incorrect email or password");
      } else {
        setError("Login failed: " + err.message);
      }
    }
  }

  return (
    <motion.section
      className="page login-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={submitLogin} style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <div className="panel login-card" style={{ cursor: "default" }}>
          <div className="login-brand-row">
            <span className="login-brand-mark" aria-hidden="true">
              A
            </span>
            <span>Answerly</span>
          </div>

          <div className="login-heading" style={{ marginTop: "12px" }}>
            <Badge tone="success">Welcome back</Badge>
            <h1>Log in to your account</h1>
            <p>Continue to your interview practice workspace.</p>
          </div>

          {error && (
            <div className="login-error" style={{ color: "#ef4444", backgroundColor: "rgba(239, 68, 68, 0.1)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(239, 68, 68, 0.2)", fontSize: "0.875rem", textAlign: "center" }}>
              {error}
            </div>
          )}

          <div className="login-fields">
            <label>
              <span>Email</span>
              <input
                required
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => updateForm("email", event.target.value)}
                placeholder="candidate@answerly.demo"
              />
            </label>

            <label>
              <span>Password</span>
              <input
                required
                minLength={6}
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={(event) => updateForm("password", event.target.value)}
                placeholder="Enter your password"
              />
            </label>
          </div>

          <div className="login-actions">
            <Button type="submit" className="login-submit">
              Log in
            </Button>
            <Button variant="secondary" className="login-submit" onClick={onLoadDemo}>
              Load demo player
            </Button>
          </div>

          <div className="login-footer">
            <p>
              Don't have an account?{" "}
              <button type="button" onClick={onOpenRegister}>
                Create one
              </button>
            </p>
          </div>
        </div>
      </form>
    </motion.section>
  );
}

export default LoginPage;
