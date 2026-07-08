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
      email: form.email.trim() || "candidate@webchamp.demo",
      password: form.password,
    });
  }

  return (
    <section className="page login-page">
      <div className="login-layout">
        <form className="panel login-form" onSubmit={submitLogin}>
          <Badge tone="success">Welcome back</Badge>
          <div>
            <h1>Log in to WebChamp.</h1>
            <p>
              Authentication is mocked for the MVP. Continue with any email to restore a local practice profile.
            </p>
          </div>

          <label>
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateForm("email", event.target.value)}
              placeholder="candidate@webchamp.demo"
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => updateForm("password", event.target.value)}
              placeholder="Any password for the MVP"
            />
          </label>

          <div className="action-row">
            <Button type="submit">Log in</Button>
            <Button variant="secondary" onClick={onLoadDemo}>Load demo player</Button>
          </div>

          <p className="auth-switch">
            New to WebChamp?
            <button type="button" onClick={onOpenRegister}>Create an account</button>
          </p>
        </form>

        <aside className="panel login-side">
          <Badge>Practice loop</Badge>
          <h2>Pick up where your interview training starts.</h2>
          <div className="login-step-list">
            <div>
              <strong>1</strong>
              <span>Choose your track and rank</span>
            </div>
            <div>
              <strong>2</strong>
              <span>Run a timed mock interview</span>
            </div>
            <div>
              <strong>3</strong>
              <span>Review answers and mentor notes</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default LoginPage;
