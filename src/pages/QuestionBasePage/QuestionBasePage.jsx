import { useMemo, useState } from "react";
import { Badge, Button, MetricCard } from "../../components/Ui";
import { levels, questionBank, tracks } from "../../data/mockData";
import "./QuestionBasePage.css";

const trackTitles = tracks.reduce(
  (map, track) => ({
    ...map,
    [track.id]: track.title,
  }),
  { soft: "Soft Skills" }
);

function getTrackTitle(trackId) {
  if (trackTitles[trackId]) {
    return trackTitles[trackId];
  }

  return trackId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getSearchText(question) {
  return [
    question.title,
    question.prompt,
    question.topic,
    question.level,
    getTrackTitle(question.track),
    question.model,
    ...question.answerPlan,
  ]
    .join(" ")
    .toLowerCase();
}

function QuestionBasePage({ onStartPractice }) {
  const [query, setQuery] = useState("");
  const [trackFilter, setTrackFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  const trackOptions = useMemo(() => {
    const ids = Array.from(new Set(questionBank.map((question) => question.track)));

    return ids.map((id) => ({
      id,
      title: getTrackTitle(id),
      count: questionBank.filter((question) => question.track === id).length,
    }));
  }, []);

  const topicOptions = useMemo(
    () => Array.from(new Set(questionBank.map((question) => question.topic))).sort(),
    []
  );

  const filteredQuestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return questionBank.filter((question) => {
      const matchesTrack = trackFilter === "all" || question.track === trackFilter;
      const matchesLevel = levelFilter === "all" || question.level === levelFilter;
      const matchesTopic = topicFilter === "all" || question.topic === topicFilter;
      const matchesQuery = !normalizedQuery || getSearchText(question).includes(normalizedQuery);

      return matchesTrack && matchesLevel && matchesTopic && matchesQuery;
    });
  }, [levelFilter, query, topicFilter, trackFilter]);

  const bankStats = useMemo(
    () => ({
      total: questionBank.length,
      tracks: trackOptions.length,
      topics: topicOptions.length,
    }),
    [topicOptions.length, trackOptions.length]
  );

  const activeFilterCount = [trackFilter, levelFilter, topicFilter].filter((item) => item !== "all").length +
    (query.trim() ? 1 : 0);

  function resetFilters() {
    setQuery("");
    setTrackFilter("all");
    setLevelFilter("all");
    setTopicFilter("all");
    setExpandedId(null);
  }

  return (
    <section className="page question-base-page">
      <div className="bank-hero panel">
        <div>
          <Badge tone="success">Question Base</Badge>
          <h1>Search the full interview question database.</h1>
          <p>
            Curated questions for frontend, backend, UX, QA, and behavioral practice. Each item includes
            answer checkpoints and a concise model answer for fast review.
          </p>
          <div className="action-row">
            <Button onClick={onStartPractice}>Start practice run</Button>
            <Button variant="secondary" onClick={resetFilters}>Reset filters</Button>
          </div>
        </div>

        <div className="bank-metrics">
          <MetricCard label="Questions" value={bankStats.total} detail="ready for mock sessions" />
          <MetricCard label="Tracks" value={bankStats.tracks} detail="including soft skills" />
          <MetricCard label="Topics" value={bankStats.topics} detail="searchable tags" />
        </div>
      </div>

      <div className="bank-workspace">
        <aside className="panel bank-filter-panel">
          <div className="bank-filter-heading">
            <h2>Filters</h2>
            <Badge>{activeFilterCount ? `${activeFilterCount} active` : "All questions"}</Badge>
          </div>

          <label className="bank-search">
            <span>Search</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="React, auth, camera, feedback..."
            />
          </label>

          <div className="bank-filter-block">
            <span>Track</span>
            <div className="bank-chip-grid">
              <button
                className={trackFilter === "all" ? "bank-chip active" : "bank-chip"}
                type="button"
                onClick={() => setTrackFilter("all")}
              >
                All
                <small>{questionBank.length}</small>
              </button>
              {trackOptions.map((track) => (
                <button
                  className={trackFilter === track.id ? "bank-chip active" : "bank-chip"}
                  key={track.id}
                  type="button"
                  onClick={() => setTrackFilter(track.id)}
                >
                  {track.title}
                  <small>{track.count}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="bank-filter-block">
            <span>Level</span>
            <div className="bank-chip-grid compact">
              <button
                className={levelFilter === "all" ? "bank-chip active" : "bank-chip"}
                type="button"
                onClick={() => setLevelFilter("all")}
              >
                All
              </button>
              {levels.map((level) => (
                <button
                  className={levelFilter === level ? "bank-chip active" : "bank-chip"}
                  key={level}
                  type="button"
                  onClick={() => setLevelFilter(level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <label className="bank-topic-select">
            <span>Topic</span>
            <select value={topicFilter} onChange={(event) => setTopicFilter(event.target.value)}>
              <option value="all">All topics</option>
              {topicOptions.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </label>
        </aside>

        <section className="bank-results" aria-live="polite">
          <div className="bank-results-header">
            <div>
              <Badge tone="warning">{filteredQuestions.length} shown</Badge>
              <h2>Interview questions</h2>
            </div>
            <span>{activeFilterCount ? "Filtered view" : "Complete database"}</span>
          </div>

          {filteredQuestions.length ? (
            <div className="bank-card-grid">
              {filteredQuestions.map((question) => {
                const expanded = expandedId === question.id;

                return (
                  <article className="bank-question-card" key={question.id}>
                    <div className="bank-card-meta">
                      <Badge>{getTrackTitle(question.track)}</Badge>
                      <span>{question.level}</span>
                    </div>
                    <h3>{question.title}</h3>
                    <p>{question.prompt}</p>
                    <div className="bank-topic-row">
                      <span>{question.topic}</span>
                      <small>{question.answerPlan.length} checkpoints</small>
                    </div>
                    <ul className="bank-answer-plan">
                      {question.answerPlan.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ul>
                    <button
                      className="bank-model-toggle"
                      type="button"
                      onClick={() => setExpandedId(expanded ? null : question.id)}
                    >
                      {expanded ? "Hide model answer" : "Show model answer"}
                    </button>
                    {expanded ? (
                      <div className="bank-model-answer">
                        <strong>Model answer</strong>
                        <p>{question.model}</p>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="panel bank-empty">
              <h2>No matching questions</h2>
              <p>Clear one filter or search for a broader topic.</p>
              <Button variant="secondary" onClick={resetFilters}>Show all questions</Button>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

export default QuestionBasePage;
