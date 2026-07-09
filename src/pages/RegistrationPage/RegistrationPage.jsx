import { useRef, useState } from "react";
import { Badge, Button } from "../../components/Ui";
import { createPlayerProfile, levels, tracks } from "../../data/mockData";
import "./RegistrationPage.css";

const initialForm = {
  name: "",
  email: "",
  password: "",
  level: "Junior",
  track: "frontend",
  studying: "",
};

const registrationSteps = [
  {
    title: "Account",
    description: "Name, email, and password",
  },
  {
    title: "Profile",
    description: "Level, field, and study focus",
  },
];

function RegistrationPage({ onRegister, onLoadDemo, onOpenLogin }) {
  const [form, setForm] = useState(initialForm);
  const [stepIndex, setStepIndex] = useState(0);
  const formRef = useRef(null);
  const selectedTrack = tracks.find((track) => track.id === form.track);
  const isProfileStep = stepIndex === 1;

  function updateForm(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function createAccount() {
    onRegister(
      createPlayerProfile({
        name: form.name,
        email: form.email,
        track: form.track,
        level: form.level,
        goal: form.studying.trim() || "Interview preparation",
        studying: form.studying,
        weeklyTarget: "steady",
      })
    );
  }

  function goToNextStep() {
    if (!formRef.current?.reportValidity()) {
      return;
    }

    setStepIndex(1);
  }

  function submitRegistration(event) {
    event.preventDefault();

    if (!isProfileStep) {
      goToNextStep();
      return;
    }

    createAccount();
  }

  return (
    <section className="page registration-page">
      <div className="registration-layout">
        <form ref={formRef} className="panel registration-form" onSubmit={submitRegistration}>
          <div className="registration-heading">
            <Badge tone="success">Create account</Badge>
            <h1>Register for Answerly.</h1>
            <p>Complete two quick steps to personalize your interview practice.</p>
          </div>

          <div className="registration-stepper" aria-label="Registration progress">
            {registrationSteps.map((step, index) => (
              <div
                className={[
                  "step-pill",
                  stepIndex === index ? "active" : "",
                  stepIndex > index ? "complete" : "",
                ].join(" ").trim()}
                key={step.title}
                aria-current={stepIndex === index ? "step" : undefined}
              >
                <strong>{index + 1}</strong>
                <span>{step.title}</span>
                <small>{step.description}</small>
              </div>
            ))}
          </div>

          <div className="registration-progress" aria-hidden="true">
            <div style={{ width: `${((stepIndex + 1) / registrationSteps.length) * 100}%` }} />
          </div>

          {!isProfileStep ? (
            <div className="registration-step">
              <div className="registration-step-heading">
                <span>Step 1 of 2</span>
                <h2>Account details</h2>
              </div>

              <div className="form-grid">
                <label>
                  <span>Name</span>
                  <input
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={(event) => updateForm("name", event.target.value)}
                    placeholder="Maksym"
                  />
                </label>

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
              </div>

              <label>
                <span>Password</span>
                <input
                  required
                  minLength={6}
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(event) => updateForm("password", event.target.value)}
                  placeholder="At least 6 characters"
                />
              </label>
            </div>
          ) : (
            <div className="registration-step">
              <div className="registration-step-heading">
                <span>Step 2 of 2</span>
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
          )}

          <div className="action-row">
            {isProfileStep ? (
              <Button variant="secondary" onClick={() => setStepIndex(0)}>Back</Button>
            ) : null}
            <Button type="submit">{isProfileStep ? "Create account" : "Continue"}</Button>
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
            Answerly uses this information to prepare relevant interview questions and keep your practice
            sessions focused.
          </p>

          <div className="summary-list">
            <div>
              <span>Name</span>
              <strong>{form.name || "Not set"}</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>{form.email || "Not set"}</strong>
            </div>
            <div>
              <span>Level</span>
              <strong>{form.level}</strong>
            </div>
            <div>
              <span>Field</span>
              <strong>{selectedTrack?.title}</strong>
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
