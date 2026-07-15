import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, CircleAlert, X } from "lucide-react";
import { Badge, Button, Card3D } from "../../components/Ui";
import { createPlayerProfile, levels, tracks } from "../../data/mockData";
import "./RegistrationPage.css";

const initialForm = {
  name: "",
  username: "",
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

const stepVariants = {
  initial: (direction) => ({
    opacity: 0,
    x: direction > 0 ? 50 : -50,
  }),
  animate: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 25 },
  },
  exit: (direction) => ({
    opacity: 0,
    x: direction > 0 ? -50 : 50,
    transition: { duration: 0.2 },
  }),
};

function StyledSelect({ id, value, options, isOpen, onToggle, onChange }) {
  const selected = options.find((option) => option.value === value);

  return (
    <div className="select-dropdown">
      <button
        id={id}
        className={isOpen ? "custom-select is-open" : "custom-select"}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span>{selected?.label}</span>
        <ChevronDown size={18} aria-hidden="true" />
      </button>
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            className="custom-select-menu"
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
          >
            {options.map((option) => (
              <button
                className={option.value === value ? "custom-select-option is-selected" : "custom-select-option"}
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => onChange(option.value)}
              >
                <span>{option.label}</span>
                {option.value === value ? <Check size={16} aria-hidden="true" /> : null}
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function RegistrationPage({ onRegister, onLoadDemo, onOpenLogin }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [openSelect, setOpenSelect] = useState(null);
  const formRef = useRef(null);
  const selectedTrack = tracks.find((track) => track.id === form.track);
  const isProfileStep = stepIndex === 1;
  const levelOptions = levels.map((level) => ({ value: level, label: level }));
  const trackOptions = tracks.map((track) => ({ value: track.id, label: track.title }));

  function updateForm(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    if (error) setError("");
  }

  async function createAccount() {
    try {
      await onRegister({
        ...createPlayerProfile({
          name: form.name,
          username: form.username,
          email: form.email,
          track: form.track,
          level: form.level,
          goal: form.studying.trim() || "Interview preparation",
          studying: form.studying,
          weeklyTarget: "steady",
        }),
        password: form.password,
      });
    } catch (err) {
      setError("Registration failed: " + err.message);
    }
  }

  function goToNextStep() {
    if (!formRef.current?.reportValidity()) {
      return;
    }
    setDirection(1);
    setStepIndex(1);
  }

  function goToPrevStep() {
    setDirection(-1);
    setStepIndex(0);
  }

  async function submitRegistration(event) {
    event.preventDefault();

    if (!isProfileStep) {
      goToNextStep();
      return;
    }

    await createAccount();
  }

  return (
    <motion.section
      className="page registration-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="registration-layout">
        <form ref={formRef} className="panel registration-form" onSubmit={submitRegistration}>
          <div className="registration-heading">
            <Badge tone="success">Create account</Badge>
            <h1>Register for Answerly.</h1>
            <p>Complete two quick steps to personalize your interview practice.</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div className="auth-error-popup" role="alert" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <CircleAlert size={19} aria-hidden="true" />
                <div><strong>Account wasn’t created</strong><p>{error}</p><button type="button" onClick={onLoadDemo}>Open demo instead</button></div>
                <button className="auth-popup-close" type="button" onClick={() => setError("")} aria-label="Dismiss error"><X size={17} /></button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="registration-stepper" aria-label="Registration progress">
            {registrationSteps.map((step, index) => (
              <div
                className={[
                  "step-pill",
                  stepIndex === index ? "active" : "",
                  stepIndex > index ? "complete" : "",
                ]
                  .join(" ")
                  .trim()}
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
            <motion.div
              initial={{ width: "50%" }}
              animate={{ width: isProfileStep ? "100%" : "50%" }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
          </div>

          <div style={{ position: "relative", overflow: "hidden", minHeight: "310px" }}>
            <AnimatePresence initial={false} custom={direction} mode="wait">
              {!isProfileStep ? (
                <motion.div
                  key="step-1"
                  custom={direction}
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="registration-step"
                >
                  <div className="registration-step-heading">
                    <span>Step 1 of 2</span>
                    <h2>Account details</h2>
                  </div>

                  <div className="form-grid" style={{paddingLeft:"20px",paddingRight:"20px"}}>
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
                        maxLength={254}
                        autoComplete="email"
                        value={form.email}
                        onChange={(event) => updateForm("email", event.target.value)}
                        placeholder="candidate@answerly.demo"
                      />
                    </label>

                    <label style={{gridColumn: "1 / -1"}}>
                      <span>Username (for mentor search)</span>
                      <input
                        required
                        autoComplete="username"
                        value={form.username}
                        onChange={(event) => updateForm("username", event.target.value)}
                        placeholder="cool_dev_99"
                      />
                    </label>
                  </div>

                  <label style={{paddingLeft:"20px",paddingRight:"20px"}}>
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
                </motion.div>
              ) : (
                <motion.div
                  key="step-2"
                  custom={direction}
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="registration-step"
                >
                  <div className="registration-step-heading">
                    <span>Step 2 of 2</span>
                    <h2>Learning profile</h2>
                  </div>

                  <div className="form-grid">
                    <label htmlFor="registration-level">
                      <span>Level</span>
                      <StyledSelect
                        id="registration-level"
                        value={form.level}
                        options={levelOptions}
                        isOpen={openSelect === "level"}
                        onToggle={() => setOpenSelect((current) => current === "level" ? null : "level")}
                        onChange={(value) => { updateForm("level", value); setOpenSelect(null); }}
                      />
                    </label>
                    <label htmlFor="registration-track">
                      <span>Field</span>
                      <StyledSelect
                        id="registration-track"
                        value={form.track}
                        options={trackOptions}
                        isOpen={openSelect === "track"}
                        onToggle={() => setOpenSelect((current) => current === "track" ? null : "track")}
                        onChange={(value) => { updateForm("track", value); setOpenSelect(null); }}
                      />
                    </label>
                  </div>

                  <label style={{padding:"20px"}}>
                    <span>What are you studying?</span>
                    <textarea
                      value={form.studying}
                      onChange={(event) => updateForm("studying", event.target.value)}
                      placeholder="React fundamentals, REST APIs, algorithms, UI/UX portfolio..."
                    />
                  </label>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="action-row">
            {isProfileStep ? (
              <Button variant="secondary" onClick={goToPrevStep}>
                Back
              </Button>
            ) : null}
            <Button type="submit">{isProfileStep ? "Create account" : "Continue"}</Button>
            <Button variant="secondary" onClick={onLoadDemo}>
              Load demo player
            </Button>
          </div>

          <p className="auth-switch">
            Already have an account?
            <button type="button" onClick={onOpenLogin}>
              Log in
            </button>
          </p>
        </form>

        <Card3D className="registration-summary">
          <Badge tone="success">Profile Setup</Badge>
          <h2>One account, one practice path.</h2>
          <p>
            Answerly uses this information to prepare relevant interview questions and keep your practice
            sessions focused.
          </p>

          <div className="summary-list">
            <div className="user-set">
              <span>Name</span>
              <strong>{form.name || "Not set"}</strong>
            </div>
            <div className="user-set">
              <span>Username</span>
              <strong>{form.username || "Not set"}</strong>
            </div>
            <div className="user-set">
              <span>Email</span>
              <strong>{form.email || "Not set"}</strong>
            </div>
            <div className="user-set">
              <span>Level</span>
              <strong>{form.level}</strong>
            </div>
            <div className="user-set">
              <span>Field</span>
              <strong>{selectedTrack?.title}</strong>
            </div>
            <div className="user-set">
              <span>Studying</span>
              <strong>{form.studying || "Add your focus"}</strong>
            </div>
          </div>
        </Card3D>
      </div>
    </motion.section>
  );
}

export default RegistrationPage;
