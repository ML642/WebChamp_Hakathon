import { motion } from "framer-motion";
import { Badge, Button, EmptyState, MetricCard } from "../../components/Ui";
import { achievementCatalog, getLevelLadder, getTrainingQuests } from "../../data/mockData";
import "./ResultsDashboard.css";

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
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } },
};

function buildReviewPacket(session, mentorLink) {
  if (!session) {
    return "";
  }

  return [
    "Answerly Review Packet",
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
        actionLabel="Back to practice setup"
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
    <motion.section
      className="page results-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="dashboard-hero panel">
        <div>
          <Badge tone="success">Step 3</Badge>
          <h1>Review the session before sharing.</h1>
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
        <motion.section
          className="panel player-progress-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
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
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${playerProgress.progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <small>{playerProgress.xpToNext} XP to {playerProgress.next?.title || "max level"}</small>
            </div>
          </div>

          <motion.div
            className="achievement-row"
            variants={listVariants}
            initial="hidden"
            animate="show"
          >
            {unlockedAchievements.map((achievement) => (
              <motion.article
                className="achievement-card"
                variants={itemVariants}
                key={achievement.id}
                whileHover={{ y: -3, borderColor: "rgba(168, 85, 247, 0.4)" }}
              >
                <strong>{achievement.title}</strong>
                <span>{achievement.description}</span>
                <small>+{achievement.xp} XP</small>
              </motion.article>
            ))}
          </motion.div>

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
        </motion.section>
      ) : null}

      <div className="results-layout">
        <motion.div
          className="answer-list"
          variants={listVariants}
          initial="hidden"
          animate="show"
        >
          {session.questions.map((question, index) => {
            const answer = session.answers.find((item) => item.questionId === question.id);

            return (
              <motion.article
                className="panel answer-card"
                variants={itemVariants}
                key={question.id}
                layout
              >
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

                  {answer?.aiFeedback && (
                    <div className="ai-feedback" style={{ marginTop: "24px", padding: "16px", backgroundColor: "rgba(168, 85, 247, 0.1)", borderRadius: "12px", border: "1px solid rgba(168, 85, 247, 0.3)" }}>
                      <h3 style={{ marginTop: 0, marginBottom: "16px", color: "#a855f7", display: "flex", alignItems: "center", gap: "8px", fontSize: "1.1rem" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
                        AI Analysis
                      </h3>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div>
                          <strong style={{ display: "block", marginBottom: "4px", fontSize: "0.9rem" }}>How to improve:</strong>
                          <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: "1.5" }}>{answer.aiFeedback.improvement}</p>
                        </div>
                        
                        <div>
                          <strong style={{ display: "block", marginBottom: "4px", fontSize: "0.9rem" }}>Accuracy check:</strong>
                          <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: "1.5", color: answer.aiFeedback.inaccuracies.includes("No major") ? "inherit" : "#ef4444" }}>
                            {answer.aiFeedback.inaccuracies}
                          </p>
                        </div>

                        {answer.aiFeedback.topicsToReview?.length > 0 && (
                          <div>
                            <strong style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem" }}>Topics to review:</strong>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                              {answer.aiFeedback.topicsToReview.map(topic => (
                                <Badge key={topic} tone="warning">{topic}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {answer && (
                    <div className="self-review">
                      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
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
                      </div>

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
              </motion.article>
            );
          })}
        </motion.div>

        <aside className="panel share-panel">
          <Badge tone="warning">Step 4</Badge>
          <h2>Private mentor review</h2>
          <p>
            The MVP uses a mocked private link. No backend, auth, or real video storage is implemented.
          </p>
          <input readOnly value={mentorLink} />
          <div className="stacked-actions">
            <Button onClick={onOpenMentor}>Open mentor review</Button>
            <Button variant="secondary" onClick={copyPacket}>Copy review packet</Button>
            <Button variant="ghost" onClick={onPracticeAgain}>Practice again</Button>
          </div>
          <div className="demo-note" style={{ marginTop: "24px" }}>
            <strong>Demo architecture</strong>
            <p>
              Frontend state holds the session, answers, and mentor comments. Production would replace this with
              object storage, database rows, and signed links.
            </p>
          </div>
        </aside>
      </div>
    </motion.section>
  );
}

export default ResultsDashboard;
