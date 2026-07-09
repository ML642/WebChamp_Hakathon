import { useMemo, useState } from "react";
import { Button, Badge } from "../../components/Ui";
import { pitchCards, questionBank, roadmap, tracks } from "../../data/mockData";
import "./LandingPage.css";

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
    <section className="page landing-page">
      <div className="hero-grid">
        <div className="hero-copy">
          <Badge tone="success">Hackathon MVP</Badge>
          <h1>Practice interviews like a real call, then get feedback through one private link.</h1>
          <p>
            Answerly helps students and junior candidates move from passive reading to timed, spoken practice
            with self-review and mentor feedback.
          </p>
          <div className="action-row">
            <Button onClick={onStart}>Build practice session</Button>
            <Button variant="secondary" onClick={onLoadDemo}>Load polished demo</Button>
          </div>
        </div>

        <div className="hero-product" aria-label="Product preview">
          <div className="mock-call">
            <div className="mock-call-main">
              <span className="record-dot" />
              <strong>Interview room</strong>
              <p>Question, timer, answer structure, and mock camera tile in one focused workspace.</p>
            </div>
            <div className="mock-call-side">
              <span>Prep 00:10</span>
              <span>Answer 02:00</span>
              <span>Mentor link ready</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pitch-grid">
        {pitchCards.map((card) => (
          <article className="panel" key={card.label}>
            <Badge>{card.label}</Badge>
            <h2>{card.title}</h2>
            <p>{card.text}</p>
          </article>
        ))}
      </div>

      <section className="panel question-base-panel">
        <div className="question-base-header">
          <div>
            <Badge tone="success">Question Library</Badge>
            <h2>Curated real-world interview-style questions.</h2>
            <p>
              A lightweight mock database powers practice setup, interview practice, model answers, and mentor review.
              It is intentionally content-first, so the MVP feels useful without backend complexity.
            </p>
            <div className="action-row">
              <Button variant="secondary" onClick={onOpenQuestionBase}>Open question library</Button>
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

        <div className="question-base-grid">
          {visibleQuestions.map((question) => (
            <article className="question-preview" key={question.id}>
              <div className="question-meta">
                <Badge>{question.topic}</Badge>
                <span>{question.level}</span>
              </div>
              <h3>{question.title}</h3>
              <p>{question.prompt}</p>
              <small>{question.answerPlan.length} answer checkpoints</small>
            </article>
          ))}
        </div>
      </section>

      <section className="panel roadmap-panel">
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
      </section>
    </section>
  );
}

export default LandingPage;
