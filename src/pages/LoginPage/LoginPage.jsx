import { useState } from "react";
import { Badge, Button } from "../../components/Ui";
import "./LoginPage.css";

const initialForm = {
  email: "",
  password: "",
};

function LoginPage({ onLogin, onLoadDemo, onOpenRegister }) {
  const [form, setForm] = useState(initialForm);

  function updateForm(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submitLogin(event) {
    event.preventDefault();
    onLogin({
      email: form.email.trim() || "candidate@answerly.demo",
      password: form.password,
    });
  }

  return (
    <section className="page login-page">
      <form className="login-card" onSubmit={submitLogin}>
        <div className="login-brand-row">
          <span className="login-brand-mark" aria-hidden="true">A</span>
          <span>Answerly</span>
        </div>

        <div className="login-heading">
          <Badge tone="success">Welcome back</Badge>
          <h1>Log in to your account</h1>
          <p>Continue to your interview practice workspace.</p>
        </div>

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
          <Button type="submit" className="login-submit">Log in</Button>
          <Button variant="secondary" className="login-submit" onClick={onLoadDemo}>
            Load demo player
          </Button>
        </div>

        <p className="auth-switch login-switch">
          New to Answerly?
          <button type="button" onClick={onOpenRegister}>Create an account</button>
        </p>
      </form>
    </section>
  );
}

export default LoginPage;
