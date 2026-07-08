import { Button, Badge } from "../components/Ui";
import { pitchCards, roadmap } from "../data/mockData";

function LandingPage({ onStart, onLoadDemo }) {
  return (
    <section className="page landing-page">
      <div className="hero-grid">
        <div className="hero-copy">
          <Badge tone="success">Hackathon MVP</Badge>
          <h1>Practice interviews like a real call, then get feedback through one private link.</h1>
          <p>
            WebChamp Interview Coach helps students and junior candidates move from passive reading to timed,
            spoken practice with self-review and mentor feedback.
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
