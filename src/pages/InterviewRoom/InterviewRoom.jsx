import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge, Button, EmptyState, MetricCard } from "../../components/Ui";
import "./InterviewRoom.css";

const prepSeconds = 10;
const answerSeconds = 120;

function formatTime(value) {
  const minutes = String(Math.floor(value / 60)).padStart(2, "0");
  const seconds = String(value % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function InterviewRoom({ session, activeQuestionIndex, onSaveAnswer, onNext, onBackToSetup, onFinish }) {
  const [phase, setPhase] = useState("prep");
  const [prepLeft, setPrepLeft] = useState(prepSeconds);
  const [answerLeft, setAnswerLeft] = useState(answerSeconds);
  const [draft, setDraft] = useState("");

  const question = session?.questions[activeQuestionIndex];
  const existingAnswer = session?.answers.find((answer) => answer.questionId === question?.id);
  const hasExistingAnswer = Boolean(existingAnswer);
  const existingTranscript = existingAnswer?.transcript || "";

  const progressLabel = useMemo(() => {
    if (!session) {
      return "No session";
    }

    return `Question ${activeQuestionIndex + 1} of ${session.questions.length}`;
  }, [activeQuestionIndex, session]);

  useEffect(() => {
    setPhase(hasExistingAnswer ? "saved" : "prep");
    setPrepLeft(prepSeconds);
    setAnswerLeft(answerSeconds);
    setDraft(existingTranscript);
  }, [activeQuestionIndex, existingTranscript, hasExistingAnswer]);

  const saveCurrentAnswer = useCallback(() => {
    if (!question) {
      return;
    }

    onSaveAnswer(question.id, draft);
    setPhase("saved");
  }, [draft, onSaveAnswer, question]);

  useEffect(() => {
    if (phase !== "prep") {
      return undefined;
    }

    if (prepLeft <= 0) {
      setPhase("ready");
      return undefined;
    }

    const timer = window.setTimeout(() => setPrepLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [phase, prepLeft]);

  useEffect(() => {
    if (phase !== "recording") {
      return undefined;
    }

    if (answerLeft <= 0) {
      saveCurrentAnswer();
      return undefined;
    }

    const timer = window.setTimeout(() => setAnswerLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [phase, answerLeft, saveCurrentAnswer]);

  if (!session || !question) {
    return (
      <EmptyState
        title="No active session"
        text="Create a practice setup before opening the interview room."
        actionLabel="Go to practice setup"
        onAction={onBackToSetup}
      />
    );
  }

  function startRecording() {
    setAnswerLeft(answerSeconds);
    setPhase("recording");
  }

  const isLastQuestion = activeQuestionIndex === session.questions.length - 1;

  return (
    <section className="page interview-page">
      <div className="interview-header panel">
        <div>
          <div className="inline-row">
            <Badge tone={phase === "recording" ? "danger" : "success"}>{phase}</Badge>
            <Badge>{progressLabel}</Badge>
          </div>
          <h1>{question.title}</h1>
          <p>{question.prompt}</p>
        </div>
        <div className="timer-grid">
          <MetricCard label="Prep" value={formatTime(prepLeft)} />
          <MetricCard label="Answer" value={formatTime(answerLeft)} />
        </div>
      </div>

      <div className="interview-layout">
        <div className="panel camera-panel">
          <div className="mock-camera">
            <div className={phase === "recording" ? "camera-status recording" : "camera-status"}>
              {phase === "recording" ? "REC" : "Mock camera"}
            </div>
            <div className="avatar-circle">You</div>
            <p>No real video is stored in this MVP. This tile simulates the call experience for the demo.</p>
          </div>

          <label className="answer-editor">
            <span>Mock transcript / notes</span>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Type a rough version of what the candidate said, or leave it blank to auto-generate a mock answer."
            />
          </label>

          <div className="action-row">
            {phase === "prep" && (
              <Button variant="secondary" onClick={() => setPhase("ready")}>Skip prep</Button>
            )}
            {(phase === "ready" || phase === "prep") && (
              <Button onClick={startRecording}>Start mock recording</Button>
            )}
            {phase === "recording" && (
              <Button variant="danger" onClick={saveCurrentAnswer}>Stop and save</Button>
            )}
            {phase === "saved" && (
              <Button onClick={isLastQuestion ? onFinish : onNext}>
                {isLastQuestion ? "Open results" : "Next question"}
              </Button>
            )}
          </div>
        </div>

        <aside className="panel answer-plan">
          <Badge tone="warning">{question.topic}</Badge>
          <h2>Answer structure</h2>
          <ol>
            {question.answerPlan.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <div className="model-answer">
            <strong>Model answer</strong>
            <p>{question.model}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default InterviewRoom;
