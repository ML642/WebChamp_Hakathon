import { useState } from "react";
import { Badge, Button } from "../../components/Ui";
import { createPlayerProfile, levels, tracks } from "../../data/mockData";
import "./RegistrationPage.css";

const initialForm = {
  nickname: "",
  email: "",
  password: "",
  level: "Junior",
  track: "frontend",
  studying: "",
};

function RegistrationPage({ onRegister, onLoadDemo, onOpenLogin }) {
  const [form, setForm] = useState(initialForm);

  function updateForm(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submitRegistration(event) {
    event.preventDefault();

    onRegister(
      createPlayerProfile({
        name: form.nickname,
        email: form.email,
        track: form.track,
        level: form.level,
        goal: form.studying.trim() || "Interview preparation",
        studying: form.studying,
        weeklyTarget: "steady",
      })
    );
  }

  return (
    <section className="page registration-page">
      <div className="registration-layout">
        <form className="panel registration-form" onSubmit={submitRegistration}>
          <div className="registration-heading">
            <Badge tone="success">Create account</Badge>
            <h1>Register for WebChamp.</h1>
            <p>
              Start with your account details, then tell us your current level, field, and study focus.
            </p>
          </div>

          <div className="registration-group">
            <div className="registration-group-heading">
              <span>Step 1</span>
              <h2>Account details</h2>
            </div>

            <div className="form-grid">
              <label>
                <span>Nickname</span>
                <input
                  required
                  value={form.nickname}
                  onChange={(event) => updateForm("nickname", event.target.value)}
                  placeholder="Maksym"
                />
              </label>
              <label>
                <span>Email</span>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => updateForm("email", event.target.value)}
                  placeholder="candidate@webchamp.demo"
                />
              </label>
            </div>

            <label>
              <span>Password</span>
              <input
                required
                minLength={6}
                type="password"
                value={form.password}
                onChange={(event) => updateForm("password", event.target.value)}
                placeholder="At least 6 characters"
              />
            </label>
          </div>

          <div className="registration-group">
            <div className="registration-group-heading">
              <span>Step 2</span>
              <h2>Learning profile</h2>
            </div>

            <div className="form-grid">
              <label>
                <span>Level</span>
                <select value={form.level} onChange={(event) => updateForm("level", event.target.value)}>
                  {levels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Field</span>
                <select value={form.track} onChange={(event) => updateForm("track", event.target.value)}>
                  {tracks.map((track) => (
                    <option key={track.id} value={track.id}>{track.title}</option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              <span>What are you studying?</span>
              <textarea
                value={form.studying}
                onChange={(event) => updateForm("studying", event.target.value)}
                placeholder="React fundamentals, REST APIs, algorithms, UI/UX portfolio..."
              />
            </label>
          </div>

          <div className="action-row">
            <Button type="submit">Create account</Button>
            <Button variant="secondary" onClick={onLoadDemo}>Load demo player</Button>
          </div>

          <p className="auth-switch">
            Already have an account?
            <button type="button" onClick={onOpenLogin}>Log in</button>
          </p>
        </form>

        <aside className="panel registration-summary">
          <Badge>Profile setup</Badge>
          <h2>One account, one practice path.</h2>
          <p>
            WebChamp uses this information to prepare relevant interview questions and keep your practice
            sessions focused.
          </p>

          <div className="summary-list">
            <div>
              <span>Nickname</span>
              <strong>{form.nickname || "Not set"}</strong>
            </div>
            <div>
              <span>Level</span>
              <strong>{form.level}</strong>
            </div>
            <div>
              <span>Field</span>
              <strong>{tracks.find((track) => track.id === form.track)?.title}</strong>
            </div>
            <div>
              <span>Studying</span>
              <strong>{form.studying || "Add your focus"}</strong>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default RegistrationPage;
