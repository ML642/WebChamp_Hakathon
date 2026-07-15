import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Badge, Button, EmptyState, MetricCard } from "../../components/Ui";
import { achievementCatalog, getLevelLadder, getTrainingQuests } from "../../data/mockData";
import { usersApi, mentorApi } from "../../api/client";
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

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';
  return [
    "Answerly Review Packet",
    `Role: ${session.settings.track} / ${session.settings.level}`,
    `Answers: ${session.answers.length}/${session.questions.length}`,
    `Mentor link: ${baseUrl}/review/${session.mentorToken || ""}`,
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
  onGenerateShareToken,
  onRefreshResults
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [sentRequests, setSentRequests] = useState({});

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
    if (!session.mentorToken) {
      await onGenerateShareToken();
    }
    // Need a small timeout to let the token update in the component state, but since we're using current link:
    const link = session.mentorToken ? `${window.location.origin}/review/${session.mentorToken}` : "Generating...";
    const packet = buildReviewPacket(session, link);
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(packet);
    }
  }

  async function handleSearchMentor(e) {
    e.preventDefault();
    if (!searchQuery || searchQuery.length < 2) return;
    setSearching(true);
    try {
      const results = await usersApi.search(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  }

  async function handleSendRequest(answerId, mentorId) {
    try {
      await mentorApi.createRequest(answerId, mentorId);
      setSentRequests(prev => ({...prev, [answerId]: true}));
    } catch (err) {
      alert("Failed to send request: " + err.message);
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
                  {answer?.videoUrl ? (
                    <video src={answer.videoUrl} controls className="answer-video-player" style={{ width: "100%", height: "180px", borderRadius: "12px", background: "#000", objectFit: "cover", display: "block" }} />
                  ) : (
                    <div className="video-placeholder">
                      <span>{answer?.videoLabel || "No mock video"}</span>
                    </div>
                  )}
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

                  {answer && (
                    <div className="mentor-assignment-panel" style={{ marginTop: "24px", padding: "16px", backgroundColor: "rgba(168, 85, 247, 0.05)", borderRadius: "12px", border: "1px solid rgba(168, 85, 247, 0.2)" }}>
                      <strong style={{ display: "block", marginBottom: "12px" }}>Ask a friend to review this answer</strong>
                      {sentRequests[answer.id] ? (
                        <div style={{ color: "var(--success)", display: "flex", alignItems: "center", gap: "8px" }}>
                          <Check size={18} /> Request sent successfully!
                        </div>
                      ) : (
                        <div>
                          <form onSubmit={handleSearchMentor} style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                            <input 
                              type="text" 
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Search by nickname..." 
                              style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--surface)", color: "white" }}
                            />
                            <Button type="submit" variant="secondary" disabled={searching}>Search</Button>
                          </form>
                          {searchResults.length > 0 && (
                            <div className="search-results" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              {searchResults.map(user => (
                                <div key={user.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "8px" }}>
                                  <span>{user.username} <small style={{ opacity: 0.6 }}>({user.role})</small></span>
                                  <Button size="small" onClick={() => handleSendRequest(answer.id, user.id)}>Send</Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {answer?.mentor_comments?.length > 0 && (
                    <div className="mentor-feedback-panel" style={{ marginTop: "24px", padding: "16px", backgroundColor: "rgba(34, 197, 94, 0.05)", borderRadius: "12px", border: "1px solid rgba(34, 197, 94, 0.2)" }}>
                      <strong style={{ display: "block", marginBottom: "12px", color: "#4ade80", fontSize: "1.1rem" }}>Feedback from Mentors</strong>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {answer.mentor_comments.map(comment => (
                          <div key={comment.id} style={{ padding: "12px", backgroundColor: "rgba(255, 255, 255, 0.03)", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                            <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: "1.5", color: "#e5e7eb" }}>{comment.comment_text}</p>
                            <small style={{ display: "block", marginTop: "8px", color: "var(--muted)", fontSize: "0.8rem" }}>
                              {new Date(comment.created_at).toLocaleDateString()} at {new Date(comment.created_at).toLocaleTimeString()}
                            </small>
                          </div>
                        ))}
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
          <h2>Mentor review</h2>
          <p>
            You can generate a public link to share the entire interview, or use the search blocks above to ask specific friends to review specific answers.
          </p>
          <input readOnly value={session.mentorToken ? `${window.location.origin}/review/${session.mentorToken}` : "Click to generate link..."} />
          <div className="stacked-actions">
            {!session.mentorToken && <Button onClick={onGenerateShareToken}>Generate Share Link</Button>}
            <Button variant="secondary" onClick={copyPacket}>Copy review packet</Button>
            <Button variant="ghost" onClick={onRefreshResults}>Refresh AI Feedback</Button>
            <Button variant="ghost" onClick={onPracticeAgain}>Practice again</Button>
          </div>
          <div className="demo-note" style={{ marginTop: "24px" }}>
            <strong>Updates</strong>
            <p>
              AI Feedback is fetched automatically. If it's missing, click Refresh AI Feedback.
            </p>
          </div>
        </aside>
      </div>
    </motion.section>
  );
}

export default ResultsDashboard;
