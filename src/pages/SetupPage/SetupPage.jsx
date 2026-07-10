import { motion } from "framer-motion";
import { Badge, Button } from "../../components/Ui";
import { getMode, getTrainingQuests, getTrack, levels, modes, tracks } from "../../data/mockData";
import "./SetupPage.css";

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 20 } },
};

function SetupPage({ settings, questions, playerProfile, onUpdateSetting, onStart, onLoadDemo }) {
  const selectedTrack = getTrack(settings.track);
  const selectedMode = getMode(settings.mode);
  const trainingQuests = getTrainingQuests(playerProfile);

  return (
    <motion.section
      className="page setup-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="section-heading">
        <Badge tone="success">Step 1</Badge>
        <h1>Build a focused interview run.</h1>
        <p>
          Choose a role, level, and mode. The MVP keeps the session short so the complete flow is demo-ready.
        </p>
      </div>

      <div className="setup-layout">
        <motion.div
          className="panel"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="panel-heading">
            <h2>Track</h2>
            <Badge>{selectedTrack.role}</Badge>
          </div>
          <div className="option-grid two">
            {tracks.map((track) => (
              <button
                key={track.id}
                className={settings.track === track.id ? "option-card selected" : "option-card"}
                type="button"
                onClick={() => onUpdateSetting("track", track.id)}
              >
                <strong>{track.title}</strong>
                <span>{track.summary}</span>
                <small>{track.skills.join(" / ")}</small>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="panel"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="panel-heading">
            <h2>Level and mode</h2>
            <Badge tone="success">{selectedMode.title}</Badge>
          </div>

          <div className="segmented">
            {levels.map((level) => (
              <button
                key={level}
                className={settings.level === level ? "selected" : ""}
                type="button"
                onClick={() => onUpdateSetting("level", level)}
              >
                {level}
              </button>
            ))}
          </div>

          <div className="mode-list">
            {modes.map((mode) => (
              <button
                key={mode.id}
                className={settings.mode === mode.id ? "mode-card selected" : "mode-card"}
                type="button"
                onClick={() => onUpdateSetting("mode", mode.id)}
              >
                <strong>{mode.title}</strong>
                <span>{mode.summary}</span>
              </button>
            ))}
          </div>

          <div className="action-row" style={{ marginTop: "24px" }}>
            <Button onClick={onStart}>Start interview</Button>
            <Button variant="secondary" onClick={onLoadDemo}>
              Load demo session
            </Button>
          </div>
        </motion.div>

        <motion.aside
          className="panel session-plan"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Badge tone="warning">Preview</Badge>
          <h2>{settings.level} {selectedTrack.role}</h2>
          <p>Three curated real-world interview questions.</p>
          <motion.ol
            variants={listVariants}
            initial="hidden"
            animate="show"
            key={settings.track + settings.mode + settings.level}
          >
            {questions.map((question) => (
              <motion.li variants={itemVariants} key={question.id}>
                <strong>{question.title}</strong>
                <span>{question.prompt}</span>
              </motion.li>
            ))}
          </motion.ol>

          {playerProfile ? (
            <motion.div
              className="setup-quest-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <strong>{playerProfile.name}'s quest board</strong>
              <div className="setup-quest-list">
                {trainingQuests.slice(0, 3).map((quest) => (
                  <div className="setup-quest-item" key={quest.id}>
                    <span>{quest.title}</span>
                    <small>+{quest.xp} XP</small>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : null}
        </motion.aside>
      </div>
    </motion.section>
  );
}

export default SetupPage;

