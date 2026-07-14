import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Badge, Button, EmptyState, MetricCard } from "../../components/Ui";
import { evaluateDemoAnswer } from "../../data/dynamicInterview";
import "./InterviewRoom.css";

const prepSeconds = 10;
const answerSeconds = 120;
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function formatTime(value) {
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

function InterviewRoom({ session, activeQuestionIndex, onSaveAnswer, onNext, onBackToSetup, onFinish }) {
  const [phase, setPhase] = useState("prep");
  const [prepLeft, setPrepLeft] = useState(prepSeconds);
  const [answerLeft, setAnswerLeft] = useState(answerSeconds);
  const [draft, setDraft] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  const [pauseDetected, setPauseDetected] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(Boolean(SpeechRecognition));
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef("");
  const lastSpeechRef = useRef(Date.now());

  const question = session?.questions[activeQuestionIndex];
  const existingAnswer = session?.answers.find((answer) => answer.questionId === question?.id);
  const existingTranscript = existingAnswer?.transcript || "";
  const progressLabel = session ? `Question ${activeQuestionIndex + 1} of ${session.questions.length}` : "No session";
  const isLastQuestion = activeQuestionIndex === session?.questions.length - 1;

  const speak = useCallback((text) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.02;
    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    let stream; let context; let animationId;
    async function setupMedia() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        context = new AudioContext();
        const analyser = context.createAnalyser();
        analyser.fftSize = 256;
        context.createMediaStreamSource(stream).connect(analyser);
        const values = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          analyser.getByteFrequencyData(values);
          const level = values.reduce((sum, value) => sum + value, 0) / values.length / 50;
          setAudioLevel(Math.min(1, level));
          if (level > 0.08) { lastSpeechRef.current = Date.now(); setPauseDetected(false); }
          animationId = requestAnimationFrame(tick);
        };
        tick();
      } catch { /* Camera and microphone remain optional in the demo. */ }
    }
    setupMedia();
    return () => { if (animationId) cancelAnimationFrame(animationId); if (context) context.close(); stream?.getTracks().forEach((track) => track.stop()); };
  }, []);

  useEffect(() => {
    setPhase(existingTranscript ? "saved" : "prep");
    setPrepLeft(prepSeconds); setAnswerLeft(answerSeconds); setDraft(existingTranscript);
    setFeedback(null); setPauseDetected(false); transcriptRef.current = existingTranscript;
    return () => window.speechSynthesis?.cancel();
  }, [activeQuestionIndex, existingTranscript]);

  useEffect(() => {
    if (phase !== "prep") return undefined;
    if (prepLeft <= 0) { setPhase("ready"); speak(question?.prompt); return undefined; }
    const timer = window.setTimeout(() => setPrepLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [phase, prepLeft, question?.prompt, speak]);

  useEffect(() => {
    if (phase !== "recording") return undefined;
    if (answerLeft <= 0) { finishAnswer(); return undefined; }
    const timer = window.setTimeout(() => setAnswerLeft((value) => value - 1), 1000);
    const pauseTimer = window.setInterval(() => {
      if (Date.now() - lastSpeechRef.current > 1800 && transcriptRef.current.trim().split(/\s+/).length > 5) setPauseDetected(true);
    }, 400);
    return () => { window.clearTimeout(timer); window.clearInterval(pauseTimer); };
  // finishAnswer is intentionally stable enough for this timer cycle.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, answerLeft]);

  const startRecognition = useCallback(() => {
    if (!voiceEnabled || !SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true; recognition.interimResults = true; recognition.lang = "en-US";
    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        if (event.results[i].isFinal) transcriptRef.current += `${event.results[i][0].transcript} `;
        else interim += event.results[i][0].transcript;
      }
      setDraft(`${transcriptRef.current}${interim}`.trim());
      lastSpeechRef.current = Date.now(); setPauseDetected(false);
    };
    recognition.onerror = () => setVoiceEnabled(false);
    recognition.start(); recognitionRef.current = recognition;
  }, [voiceEnabled]);

  function startAnswer() {
    setPhase("recording"); setAnswerLeft(answerSeconds); setPauseDetected(false); lastSpeechRef.current = Date.now();
    transcriptRef.current = draft ? `${draft} ` : "";
    startRecognition();
  }

  function finishAnswer() {
    recognitionRef.current?.stop(); recognitionRef.current = null;
    const answer = draft.trim();
    if (!answer) { setPauseDetected(true); return; }
    const nextFeedback = evaluateDemoAnswer(question, answer);
    setFeedback(nextFeedback); setPhase(nextFeedback.isComplete ? "saved" : "followup");
    speak(nextFeedback.interviewerMessage);
    if (nextFeedback.isComplete) onSaveAnswer(question.id, answer);
  }

  function continueAnswer() { setPauseDetected(false); setPhase("recording"); lastSpeechRef.current = Date.now(); startRecognition(); }

  if (!session || !question) return <EmptyState title="No active session" text="Create a practice setup before opening the interview room." actionLabel="Go to practice setup" onAction={onBackToSetup} />;

  return (
    <motion.section className="page interview-page" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="interview-header panel">
        <div><div className="inline-row"><Badge tone="success">Free dynamic demo</Badge><Badge tone={phase === "recording" ? "danger" : "neutral"}>{phase}</Badge><Badge>{progressLabel}</Badge></div><h1>{question.title}</h1><p>{feedback?.followUpQuestion || question.prompt}</p></div>
        <div className="timer-grid"><MetricCard label="Prep" value={formatTime(prepLeft)} /><MetricCard label="Answer" value={formatTime(answerLeft)} /></div>
      </div>
      <div className="interview-layout">
        <div className="panel camera-panel">
          <div className={`mock-camera ${phase === "recording" ? "recording" : ""}`}>
            <video ref={videoRef} autoPlay playsInline muted className="camera-video-feed" />
            <div className={phase === "recording" ? "camera-status recording" : "camera-status"}>{phase === "recording" ? "● Listening" : "Camera optional"}</div>
            <div className="soundwave" aria-hidden="true">{[.5,.8,1,.9,.6].map((multiplier, index) => <div key={index} className="soundwave-bar" style={{ height: `${Math.max(6, 6 + audioLevel * multiplier * 24)}px` }} />)}</div>
          </div>
          {pauseDetected && phase === "recording" && <div className="pause-prompt"><strong>Still thinking, or ready for feedback?</strong><span>We detected a pause but will never move on automatically.</span><div className="action-row"><Button variant="secondary" onClick={() => { setPauseDetected(false); lastSpeechRef.current = Date.now(); }}>Keep answering</Button><Button onClick={finishAnswer}>Review answer</Button></div></div>}
          {feedback && <div className="demo-feedback"><Badge tone={feedback.isComplete ? "success" : "warning"}>{feedback.isComplete ? "Ready to move on" : "One follow-up"}</Badge><strong>{feedback.score}/100 local answer score</strong><p>{feedback.interviewerMessage}</p><small>Concept coverage: {feedback.covered}/{feedback.total}</small></div>}
          <label className="answer-editor"><span>Live transcript <small>{voiceEnabled ? "Voice capture on" : "Type your answer — voice capture is unavailable in this browser."}</small></span><textarea value={draft} onChange={(event) => { setDraft(event.target.value); transcriptRef.current = event.target.value; }} placeholder="Speak or type your answer here…" /></label>
          <div className="action-row">
            {phase === "prep" && <Button variant="secondary" onClick={() => { setPhase("ready"); speak(question.prompt); }}>Skip prep</Button>}
            {(phase === "ready" || phase === "prep") && <Button onClick={startAnswer}>Start answering</Button>}
            {phase === "recording" && <Button variant="danger" onClick={finishAnswer}>Finish answer</Button>}
            {phase === "followup" && <Button onClick={continueAnswer}>Answer follow-up</Button>}
            {phase === "saved" && <Button onClick={isLastQuestion ? onFinish : onNext}>{isLastQuestion ? "Open results" : "Next question"}</Button>}
          </div>
        </div>
        <aside className="panel answer-plan"><Badge tone="warning">{question.topic}</Badge><h2>What the demo detects</h2><ol>{question.answerPlan.map((step) => <li key={step}>{step}</li>)}</ol><div className="model-answer"><strong>How scoring works</strong><p>The simulator looks for key ideas, answer depth, a concrete example, and a result. It does not require exact wording.</p></div></aside>
      </div>
    </motion.section>
  );
}

export default InterviewRoom;
