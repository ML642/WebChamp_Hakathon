import { Badge, Button, EmptyState, MetricCard } from "../../components/Ui";
import { achievementCatalog, getLevelLadder, getTrainingQuests } from "../../data/mockData";
import "./ResultsDashboard.css";

function buildReviewPacket(session, mentorLink) {
  if (!session) {
    return "";
  }

  return [
    "WebChamp Interview Coach Review Packet",
    `Role: ${session.settings.track} / ${session.settings.level}`,
    `Answers: ${session.answers.length}/${session.questions.length}`,
    `Mentor link: ${mentorLink}`,
    "",
    ...session.questions.flatMap((question, index) => {
      const answer = session.answers.find((item) => item.questionId === question.id);

      return [
        `${index + 1}. ${question.title}`,
        `Prompt: ${question.prompt}`,
        answer ? `Transcript: ${answer.transcript}` : "Transcript: not recorded",
        answer ? `Score: ${answer.score}% / Pace: ${answer.wpm} wpm / Repeat: ${answer.repeatIn}` : "",
        "",
      ];
    }),
  ].join("\n");
}

function ResultsDashboard({
  session,
  playerProfile,
  playerProgress,
  mentorLink,
  onUpdateChecklist,
  onUpdateDifficulty,
  onOpenMentor,
  onPracticeAgain,
}) {
  if (!session) {
    return (
      <EmptyState
        title="No results yet"
        text="Complete or load a demo session to see the results dashboard."
        actionLabel="Back to setup"
        onAction={onPracticeAgain}
      />
    );
  }

  const recordedCount = session.answers.length;
  const progress = Math.round((recordedCount / session.questions.length) * 100);
  const averageScore = recordedCount
    ? Math.round(session.answers.reduce((sum, answer) => sum + answer.score, 0) / recordedCount)
    : 0;
  const unlockedAchievements = playerProfile
    ? achievementCatalog.filter((achievement) => playerProfile.achievements.includes(achievement.id))
    : [];
  const trainingQuests = getTrainingQuests(playerProfile, session);
  const levelLadder = getLevelLadder(playerProfile?.xp || 0);

  async function copyPacket() {
    const packet = buildReviewPacket(session, mentorLink);
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(packet);
    }
  }

  return (
    <section className="page results-page">
      <div className="dashboard-hero panel">
        <div>
          <Badge tone="success">Step 3</Badge>
          <h1>Review the session before sharing it.</h1>
          <p>
            The dashboard shows mock recordings, transcripts, model answers, self-review, and a private mentor link.
          </p>
        </div>
        <div className="metrics-row">
          <MetricCard label="Recorded" value={`${recordedCount}/${session.questions.length}`} detail="answers" />
          <MetricCard label="Average" value={`${averageScore}%`} detail="rubric score" />
          <MetricCard label="Progress" value={`${progress}%`} detail={`${session.streak} day streak`} />
        </div>
      </div>

      {playerProfile ? (
        <section className="panel player-progress-panel">
          <div className="player-progress-main">
            <div>
              <Badge tone="success">Player level</Badge>
              <h2>{playerProfile.name}</h2>
              <p>{playerProfile.goal}</p>
            </div>
            <div className="player-level-card">
              <span>Level {playerProgress.current.level}</span>
              <strong>{playerProgress.current.title}</strong>
              <div className="results-level-bar">
                <div style={{ width: `${playerProgress.progress}%` }} />
              </div>
              <small>{playerProgress.xpToNext} XP to {playerProgress.next?.title || "max level"}</small>
            </div>
          </div>

          <div className="achievement-row">
            {unlockedAchievements.map((achievement) => (
              <article className="achievement-card" key={achievement.id}>
                <strong>{achievement.title}</strong>
                <span>{achievement.description}</span>
                <small>+{achievement.xp} XP</small>
              </article>
            ))}
          </div>

          <div className="quest-and-ladder-grid">
            <div className="quest-board">
              <div className="panel-heading">
                <h3>Daily quests</h3>
                <Badge>{trainingQuests.filter((quest) => quest.complete).length}/{trainingQuests.length} done</Badge>
              </div>
              <div className="quest-list">
                {trainingQuests.map((quest) => (
                  <article className={quest.complete ? "quest-card complete" : "quest-card"} key={quest.id}>
                    <div>
                      <strong>{quest.title}</strong>
                      <span>{quest.summary}</span>
                    </div>
                    <small>{quest.progress}/{quest.target} +{quest.xp} XP</small>
                  </article>
                ))}
              </div>
            </div>

            <div className="results-ladder">
              <div className="panel-heading">
                <h3>Level path</h3>
                <Badge>{playerProgress.current.title}</Badge>
              </div>
              <div className="results-ladder-list">
                {levelLadder.map((level) => (
                  <div className={level.unlocked ? "results-ladder-step unlocked" : "results-ladder-step"} key={level.level}>
                    <span>Level {level.level}</span>
                    <strong>{level.title}</strong>
                    <small>{level.reward}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <div className="results-layout">
        <div className="answer-list">
          {session.questions.map((question, index) => {
            const answer = session.answers.find((item) => item.questionId === question.id);

            return (
              <article className="panel answer-card" key={question.id}>
                <div className="answer-media">
                  <div className="video-placeholder">
                    <span>{answer?.videoLabel || "No mock video"}</span>
                  </div>
                  <MetricCard label="Duration" value={answer ? `${answer.duration}s` : "--"} />
                  <MetricCard label="Pace" value={answer ? `${answer.wpm} wpm` : "--"} />
                </div>

                <div className="answer-content">
                  <div className="inline-row">
                    <Badge>Question {index + 1}</Badge>
                    <Badge tone={answer ? "success" : "warning"}>{answer ? "Recorded" : "Missing"}</Badge>
                  </div>
                  <h2>{question.title}</h2>
                  <p>{question.prompt}</p>

                  <div className="review-grid">
                    <div>
                      <strong>Transcript</strong>
                      <p>{answer?.transcript || "Record or load a demo answer to fill this area."}</p>
                    </div>
                    <div>
                      <strong>Model answer</strong>
                      <p>{question.model}</p>
                    </div>
                  </div>

                  {answer && (
                    <div className="self-review">
                      {[
                        ["topic", "Understood topic"],
                        ["structure", "Structured answer"],
                        ["timing", "Finished on time"],
                      ].map(([key, label]) => (
                        <label key={key}>
                          <input
                            type="checkbox"
                            checked={Boolean(answer.checklist[key])}
                            onChange={() => onUpdateChecklist(question.id, key)}
                          />
                          {label}
                        </label>
                      ))}

                      <div className="difficulty-row">
                        {["easy", "medium", "hard"].map((difficulty) => (
                          <button
                            key={difficulty}
                            className={answer.difficulty === difficulty ? "selected" : ""}
                            type="button"
                            onClick={() => onUpdateDifficulty(question.id, difficulty)}
                          >
                            {difficulty}
                          </button>
                        ))}
                        <span>Repeat in {answer.repeatIn}</span>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <aside className="panel share-panel">
          <Badge tone="warning">Step 4</Badge>
          <h2>Private mentor review</h2>
          <p>
            The MVP uses a mocked private link. No backend, auth, or real video storage is implemented.
          </p>
          <input readOnly value={mentorLink} />
          <div className="stacked-actions">
            <Button onClick={onOpenMentor}>Open mentor view</Button>
            <Button variant="secondary" onClick={copyPacket}>Copy review packet</Button>
            <Button variant="ghost" onClick={onPracticeAgain}>Practice again</Button>
          </div>
          <div className="demo-note">
            <strong>Demo architecture</strong>
            <p>
              Frontend state holds the session, answers, and mentor comments. Production would replace this with
              object storage, database rows, and signed links.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default ResultsDashboard;
