import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CircleAlert, LockKeyhole, Mail, X } from "lucide-react";
import { Badge, Button } from "../../components/Ui";
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
      <form className="login-form" onSubmit={submitLogin} autoComplete="off">
        <motion.div
          className="panel login-card"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="login-brand-row">
            <span className="login-brand-mark" aria-hidden="true">
              A
            </span>
            <span>Answerly</span>
          </div>

          <div className="login-heading">
            <Badge tone="success">Welcome back</Badge>
            <h1>Log in to your account</h1>
            <p>Continue to your interview practice workspace.</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div className="auth-error-popup" role="alert" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <CircleAlert size={19} aria-hidden="true" />
                <div><strong>We couldn’t sign you in</strong><p>{error}</p><button type="button" onClick={onLoadDemo}>Open demo instead</button></div>
                <button className="auth-popup-close" type="button" onClick={() => setError("")} aria-label="Dismiss error"><X size={17} /></button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="login-fields">
            <label htmlFor="login-email">
              <span>Email</span>
              <div className="login-input-wrap">
                <Mail size={18} aria-hidden="true" />
                <input
                  id="login-email"
                required
                type="email"
                maxLength={20}
                autoComplete="off"
                value={form.email}
                onChange={(event) => updateForm("email", event.target.value)}
                placeholder="candidate@answerly.demo"
                />
              </div>
            </label>

            <label htmlFor="login-password">
              <span>Password</span>
              <div className="login-input-wrap">
                <LockKeyhole size={18} aria-hidden="true" />
                <input
                  id="login-password"
                required
                minLength={6}
                type="password"
                autoComplete="off"
                value={form.password}
                onChange={(event) => updateForm("password", event.target.value)}
                placeholder="Enter your password"
                />
              </div>
            </label>
          </div>

          <div className="login-actions">
            <Button type="submit" className="login-submit">
              Log in <ArrowRight size={17} />
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
        </motion.div>
      </form>
    </motion.section>
  );
}

export default LoginPage;
