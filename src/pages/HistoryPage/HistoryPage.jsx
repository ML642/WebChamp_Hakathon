import { useMemo, useState } from "react";
import { Badge, Button, MetricCard } from "../../components/Ui";
import { getMode, getTrack } from "../../data/mockData";
import "./HistoryPage.css";

function formatDate(value) {
  if (!value) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getAverageScore(session) {
  const answers = session.answers || [];

  if (!answers.length) {
    return 0;
  }

  return Math.round(answers.reduce((sum, answer) => sum + answer.score, 0) / answers.length);
}

function getSearchText(session) {
  const track = getTrack(session.settings.track);
  const mode = getMode(session.settings.mode);

  return [
    session.playerName,
    track.title,
    track.role,
    mode.title,
    session.settings.level,
    ...session.questions.flatMap((question) => [
      question.title,
      question.prompt,
      question.topic,
    ]),
  ]
    .join(" ")
    .toLowerCase();
}

function getInitials(name = "Candidate") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function HistoryPage({ history, onOpenSession, onPracticeAgain, onStartPractice }) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [selectedId, setSelectedId] = useState(history[0]?.id || "");

  const visibleHistory = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = normalizedQuery
      ? history.filter((item) => getSearchText(item).includes(normalizedQuery))
      : history;

    return [...filtered].sort((a, b) => {
      if (sortBy === "date-asc") {
        return new Date(a.completedAt) - new Date(b.completedAt);
      }

      if (sortBy === "score-desc") {
        return getAverageScore(b) - getAverageScore(a);
      }

      if (sortBy === "questions-desc") {
        return b.questions.length - a.questions.length;
      }

      return new Date(b.completedAt) - new Date(a.completedAt);
    });
  }, [history, query, sortBy]);

  const selectedSession =
    visibleHistory.find((item) => item.id === selectedId) || visibleHistory[0] || history[0];
  const selectedTrack = selectedSession ? getTrack(selectedSession.settings.track) : null;
  const selectedMode = selectedSession ? getMode(selectedSession.settings.mode) : null;
  const totalAnswers = history.reduce((sum, item) => sum + (item.answers || []).length, 0);
  const bestScore = history.length ? Math.max(...history.map((item) => getAverageScore(item))) : 0;

  if (!history.length) {
    return (
      <section className="page history-page">
        <div className="panel history-empty">
          <Badge tone="warning">History</Badge>
          <h1>No interview history yet</h1>
          <p>Complete a mock interview to store your first history entry.</p>
          <Button onClick={onStartPractice}>Start practice</Button>
        </div>
      </section>
    );
  }

  return (
    <section className="page history-page">
      <div className="section-heading">
        <Badge tone="success">History</Badge>
        <h1>Your mock interview archive.</h1>
        <p>Search, sort, and inspect saved interview runs with mock video previews and question-level details.</p>
      </div>

      <div className="history-metrics metrics-row">
        <MetricCard label="Sessions" value={history.length} detail="stored locally" />
        <MetricCard label="Answers" value={totalAnswers} detail="recorded responses" />
        <MetricCard label="Best score" value={`${bestScore}%`} detail="session average" />
      </div>

      <div className="panel history-controls">
        <label className="history-search">
          <span>Search interviews</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Frontend, React, mentor, candidate..."
          />
        </label>

        <label className="history-sort">
          <span>Sort by</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="date-desc">Date newest first</option>
            <option value="date-asc">Date oldest first</option>
            <option value="score-desc">Highest score</option>
            <option value="questions-desc">Most questions</option>
          </select>
        </label>
      </div>

      <div className="history-workspace">
        <aside className="panel history-video-panel">
          <Badge tone="warning">Mock video</Badge>
          <div className="history-video-frame">
            <div className="history-video-topbar">
              <span />
              <strong>Saved recording</strong>
            </div>
            <div className="history-video-avatar">
              {getInitials(selectedSession?.playerName)}
            </div>
            <p>{selectedSession?.playerName || "Candidate"}</p>
          </div>

          <div className="history-video-meta">
            <div>
              <span>Interview</span>
              <strong>{selectedTrack?.role}</strong>
            </div>
            <div>
              <span>Date</span>
              <strong>{formatDate(selectedSession?.completedAt)}</strong>
            </div>
            <div>
              <span>Average score</span>
              <strong>{getAverageScore(selectedSession)}%</strong>
            </div>
          </div>

          <Button onClick={() => onOpenSession(selectedSession)}>Open full insights</Button>
        </aside>

        <div className="history-results">
          <div className="history-list-panel">
            <div className="history-list-header">
              <h2>Interviews</h2>
              <Badge>{visibleHistory.length} shown</Badge>
            </div>

            {visibleHistory.length ? (
              <div className="history-list">
                {visibleHistory.map((item) => {
                  const track = getTrack(item.settings.track);
                  const mode = getMode(item.settings.mode);
                  const averageScore = getAverageScore(item);
                  const recordedCount = item.answers?.length || 0;
                  const active = selectedSession?.id === item.id;

                  return (
                    <article className={active ? "history-card active" : "history-card"} key={item.id}>
                      <button
                        className="history-card-select"
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                      >
                        <div>
                          <Badge>{mode.title}</Badge>
                          <h3>{track.role}</h3>
                          <p>{item.playerName || "Candidate"} · {formatDate(item.completedAt)}</p>
                        </div>
                        <div className="history-card-score">
                          <strong>{averageScore}%</strong>
                          <span>{recordedCount}/{item.questions.length} answers</span>
                        </div>
                      </button>

                      <div className="history-card-actions">
                        <Button onClick={() => onOpenSession(item)}>Insights</Button>
                        <Button variant="secondary" onClick={() => onPracticeAgain(item)}>Practice again</Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="panel history-no-results">
                <h2>No matching interviews</h2>
                <p>Try a broader search term or change the sort option.</p>
              </div>
            )}
          </div>

          {selectedSession ? (
            <section className="panel history-detail-panel">
              <div className="history-detail-heading">
                <div>
                  <Badge tone="success">{selectedMode?.title}</Badge>
                  <h2>{selectedTrack?.title} interview details</h2>
                  <p>{selectedSession.settings.level} · {formatDate(selectedSession.completedAt)}</p>
                </div>
                <MetricCard label="Score" value={`${getAverageScore(selectedSession)}%`} />
              </div>

              <div className="history-question-list">
                {selectedSession.questions.map((question, index) => {
                  const answer = selectedSession.answers?.find((item) => item.questionId === question.id);

                  return (
                    <article className="history-question-card" key={question.id}>
                      <div className="history-question-heading">
                        <div>
                          <Badge>Question {index + 1}</Badge>
                          <h3>{question.title}</h3>
                        </div>
                        <strong>{answer ? `${answer.score}%` : "Missing"}</strong>
                      </div>
                      <p>{question.prompt}</p>
                      <div className="history-question-answer">
                        <span>Transcript</span>
                        <p>{answer?.transcript || "No transcript saved for this question."}</p>
                      </div>
                      <div className="history-question-meta">
                        <span>{question.topic}</span>
                        <span>{answer ? `${answer.duration}s` : "--"}</span>
                        <span>{answer ? `${answer.wpm} wpm` : "--"}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default HistoryPage;
