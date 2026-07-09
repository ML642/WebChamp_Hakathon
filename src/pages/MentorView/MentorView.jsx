import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge, Button, EmptyState, MetricCard } from "../../components/Ui";
import "./MentorView.css";

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

function MentorCommentBox({ questionId, initialValue, onSave }) {
  const [value, setValue] = useState(initialValue || "");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    onSave(questionId, value);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="mentor-comment">
      <label>
        <span>Mentor comment</span>
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Leave one precise next step for this answer."
        />
      </label>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <Button onClick={handleSave}>Save comment</Button>
        <AnimatePresence>
          {saved && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              style={{ color: "var(--success)", fontSize: "13px", fontWeight: "600" }}
            >
              Saved ✓
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MentorView({ session, playerProfile, playerProgress, mentorLink, onSaveComment, onBackToResults, onReset }) {
  if (!session) {
    return (
      <EmptyState
        title="Mentor link is empty"
        text="Load a demo session or complete an interview before opening mentor review."
        actionLabel="Reset demo"
        onAction={onReset}
      />
    );
  }

  const commentCount = Object.values(session.mentorComments).filter(Boolean).length;

  return (
    <motion.section
      className="page mentor-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mentor-hero panel">
        <div>
          <Badge tone="success">Mentor Review</Badge>
          <h1>Review answers and leave targeted feedback.</h1>
          <p>
            This is a mocked private page for the hackathon demo. It proves the feedback loop without backend auth.
          </p>
          <small>{mentorLink}</small>
        </div>
        <div className="metrics-row">
          <MetricCard label="Answers" value={session.answers.length} />
          <MetricCard label="Comments" value={commentCount} />
          <MetricCard label="Access" value="Mock link" />
        </div>
      </div>

      {playerProfile ? (
        <motion.div
          className="panel mentor-player-panel"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div>
            <Badge tone="warning">Candidate profile</Badge>
            <h2>{playerProfile.name}</h2>
            <p>{playerProfile.goal}</p>
          </div>
          <div className="mentor-level-card">
            <span>Level {playerProgress.current.level}</span>
            <strong>{playerProgress.current.title}</strong>
            <small>{playerProfile.xp} XP total</small>
          </div>
        </motion.div>
      ) : null}

      <motion.div
        className="mentor-list"
        variants={listVariants}
        initial="hidden"
        animate="show"
      >
        {session.questions.map((question, index) => {
          const answer = session.answers.find((item) => item.questionId === question.id);

          return (
            <motion.article
              className="panel mentor-card"
              variants={itemVariants}
              key={question.id}
              layout
            >
              <div className="video-placeholder">
                <span>{answer?.videoLabel || "No mock video"}</span>
              </div>

              <div className="mentor-answer">
                <div className="inline-row">
                  <Badge>Question {index + 1}</Badge>
                  <Badge tone={answer ? "success" : "warning"}>{answer ? `${answer.score}% score` : "Missing"}</Badge>
                </div>
                <h2>{question.title}</h2>
                <p>{question.prompt}</p>
                <div className="mentor-review-grid">
                  <div>
                    <strong>Candidate transcript</strong>
                    <p>{answer?.transcript || "No answer recorded."}</p>
                  </div>
                  <div>
                    <strong>Rubric</strong>
                    <ul>
                      {question.answerPlan.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <MentorCommentBox
                questionId={question.id}
                initialValue={session.mentorComments[question.id]}
                onSave={onSaveComment}
              />
            </motion.article>
          );
        })}
      </motion.div>

      <div className="bottom-actions">
        <Button variant="secondary" onClick={onBackToResults}>
          Back to results
        </Button>
        <Button variant="ghost" onClick={onReset}>
          Reset demo
        </Button>
      </div>
    </motion.section>
  );
}

export default MentorView;

