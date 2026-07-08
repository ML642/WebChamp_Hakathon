import { Badge, Button } from "../../components/Ui";
import { getMode, getTrainingQuests, getTrack, levels, modes, tracks } from "../../data/mockData";
import "./SetupPage.css";

function SetupPage({ settings, questions, playerProfile, onUpdateSetting, onStart, onLoadDemo }) {
  const selectedTrack = getTrack(settings.track);
  const selectedMode = getMode(settings.mode);
  const trainingQuests = getTrainingQuests(playerProfile);

  return (
    <section className="page setup-page">
      <div className="section-heading">
        <Badge tone="success">Step 1</Badge>
        <h1>Build a focused interview run.</h1>
        <p>
          Choose a role, level, and mode. The MVP keeps the session short so the complete flow is demo-ready.
        </p>
      </div>

      <div className="setup-layout">
        <div className="panel">
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
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h2>Level and mode</h2>
            <Badge>{selectedMode.title}</Badge>
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

          <div className="action-row">
            <Button onClick={onStart}>Start interview</Button>
            <Button variant="secondary" onClick={onLoadDemo}>Load demo session</Button>
          </div>
        </div>

        <aside className="panel session-plan">
          <Badge tone="warning">Preview</Badge>
          <h2>{selectedTrack.role}</h2>
          <p>Three curated real-world interview-style questions.</p>
          <ol>
            {questions.map((question) => (
              <li key={question.id}>
                <strong>{question.title}</strong>
                <span>{question.prompt}</span>
              </li>
            ))}
          </ol>

          {playerProfile ? (
            <div className="setup-quest-panel">
              <strong>{playerProfile.name}'s quest board</strong>
              <div className="setup-quest-list">
                {trainingQuests.slice(0, 3).map((quest) => (
                  <div className="setup-quest-item" key={quest.id}>
                    <span>{quest.title}</span>
                    <small>+{quest.xp} XP</small>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

export default SetupPage;
