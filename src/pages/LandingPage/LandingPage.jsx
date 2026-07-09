import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Badge, Card3D } from "../../components/Ui";
import { pitchCards, questionBank, roadmap, tracks } from "../../data/mockData";
import "./LandingPage.css";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } },
};

function LandingPage({ onStart, onOpenQuestionBase, onLoadDemo }) {
  const [activeTrack, setActiveTrack] = useState("all");
  const visibleQuestions = useMemo(() => {
    const filtered =
      activeTrack === "all"
        ? questionBank
        : questionBank.filter((question) => question.track === activeTrack);

    return filtered.slice(0, 6);
  }, [activeTrack]);

  return (
    <motion.section
      className="page landing-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="hero-grid">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        >
          <div style={{ marginBottom: "12px" }}>
            <Badge tone="success">WebChamp 2026</Badge>
          </div>
          <h1>Practice interviews like a real call, then get feedback.</h1>
          <p>
            Answerly helps students and junior candidates move from passive reading to timed, spoken practice
            with self-review and mentor feedback.
          </p>
          <div className="action-row">
            <Button onClick={onStart}>Build practice session</Button>
            <Button variant="secondary" onClick={onLoadDemo}>
              Load polished demo
            </Button>
          </div>
        </motion.div>

        <motion.div
          className="hero-product-container"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
        >
          <Card3D className="hero-product">
            <div className="mock-call">
              <div className="mock-call-main">
                <span className="record-dot" />
                <strong>Mock Interview Room</strong>
                <p>Question, timer, answer structure, and mock camera tile in one workspace.</p>
              </div>
              <div className="mock-call-side">
                <span>Prep 00:10</span>
                <span>Answer 02:00</span>
                <span className="glow-success">Mentor Link Ready</span>
              </div>
            </div>
          </Card3D>
        </motion.div>
      </div>

      <motion.div
        className="pitch-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        {pitchCards.map((card) => (
          <motion.div variants={itemVariants} key={card.label}>
            <Card3D className="pitch-card-panel">
              <Badge tone="success">{card.label}</Badge>
              <h2>{card.title}</h2>
              <p>{card.text}</p>
            </Card3D>
          </motion.div>
        ))}
      </motion.div>

      <motion.section
        className="panel question-base-panel"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="question-base-header">
          <div>
            <Badge tone="success">Question Library</Badge>
            <h2>Curated real-world interview questions.</h2>
            <p>
              A lightweight mock database powers practice setup, interview practice, model answers, and mentor review.
              It is content-first, so the MVP feels useful without backend complexity.
            </p>
            <div className="action-row" style={{ marginTop: "16px" }}>
              <Button variant="secondary" onClick={onOpenQuestionBase}>
                Open question library
              </Button>
            </div>
          </div>
          <div className="question-base-stats">
            <strong>{questionBank.length}</strong>
            <span>mock questions</span>
          </div>
        </div>

        <div className="question-base-controls" aria-label="Question base filters">
          <button
            className={activeTrack === "all" ? "filter-chip active" : "filter-chip"}
            type="button"
            onClick={() => setActiveTrack("all")}
          >
            All
            <span>{questionBank.length}</span>
          </button>
          {tracks.map((track) => {
            const count = questionBank.filter((question) => question.track === track.id).length;

            return (
              <button
                key={track.id}
                className={activeTrack === track.id ? "filter-chip active" : "filter-chip"}
                type="button"
                onClick={() => setActiveTrack(track.id)}
              >
                {track.title}
                <span>{count}</span>
              </button>
            );
          })}
        </div>

        <motion.div
          className="question-base-grid"
          layout
        >
          <AnimatePresence mode="popLayout">
            {visibleQuestions.map((question) => (
              <motion.article
                className="question-preview"
                key={question.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                whileHover={{ y: -4, borderColor: "rgba(99, 102, 241, 0.4)", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}
              >
                <div className="question-meta">
                  <Badge>{question.topic}</Badge>
                  <span>{question.level}</span>
                </div>
                <h3>{question.title}</h3>
                <p>{question.prompt}</p>
                <small>{question.answerPlan.length} answer checkpoints</small>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </motion.section>

      <motion.section
        className="panel roadmap-panel"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <Badge tone="warning">Roadmap</Badge>
          <h2>Strong future plan, no MVP bloat.</h2>
          <p>
            The demo focuses on one complete user story. The next steps are visible, but not half-built.
          </p>
        </div>
        <ul className="roadmap-list">
          {roadmap.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </motion.section>
    </motion.section>
  );
}

export default LandingPage;

