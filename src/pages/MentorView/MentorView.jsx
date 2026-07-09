import { useState } from "react";
import { Badge, Button, EmptyState, MetricCard } from "../../components/Ui";
import "./MentorView.css";

function MentorCommentBox({ questionId, initialValue, onSave }) {
  const [value, setValue] = useState(initialValue || "");

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
      <Button onClick={() => onSave(questionId, value)}>Save comment</Button>
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
    <section className="page mentor-page">
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
        <div className="panel mentor-player-panel">
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
        </div>
      ) : null}

      <div className="mentor-list">
        {session.questions.map((question, index) => {
          const answer = session.answers.find((item) => item.questionId === question.id);

          return (
            <article className="panel mentor-card" key={question.id}>
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
            </article>
          );
        })}
      </div>

      <div className="bottom-actions">
        <Button variant="secondary" onClick={onBackToResults}>Back to results</Button>
        <Button variant="ghost" onClick={onReset}>Reset demo</Button>
      </div>
    </section>
  );
}

export default MentorView;
