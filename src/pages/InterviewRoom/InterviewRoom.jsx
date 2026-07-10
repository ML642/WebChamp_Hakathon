import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
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
  const [audioLevel, setAudioLevel] = useState(0);
  const videoRef = useRef(null);

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
    let mediaStream = null;
    let audioContext = null;
    let analyser = null;
    let dataArray = null;
    let animationId = null;
    
    async function setupCamera() {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
        if (AudioContextConstructor) {
          audioContext = new AudioContextConstructor();
          const source = audioContext.createMediaStreamSource(mediaStream);
          analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          dataArray = new Uint8Array(analyser.frequencyBinCount);

          const updateAudioLevel = () => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            setAudioLevel(Math.min(1, average / 50)); 
            animationId = requestAnimationFrame(updateAudioLevel);
          };
          updateAudioLevel();
        }
      } catch (err) {
        console.warn("Camera/Mic access denied or unavailable", err);
      }
    }
    
    setupCamera();
    
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (audioContext && audioContext.state !== 'closed') audioContext.close();
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

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

  useEffect(() => {
    if (phase !== "recording") return;

    const mockSpeech = (question?.model || "I would structure my answer by giving a clear example.").split(" ");
    let wordIndex = 0;
    
    const interval = window.setInterval(() => {
      if (wordIndex < mockSpeech.length) {
        const nextWord = mockSpeech[wordIndex];
        setDraft(prev => (prev ? prev + " " : "") + nextWord);
        wordIndex++;
      }
    }, 600);
    
    return () => window.clearInterval(interval);
  }, [phase, question]);

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

  // Visual cues for low time
  const prepWarning = prepLeft <= 3 && phase === "prep";
  const answerWarning = answerLeft <= 15 && phase === "recording";

  return (
    <motion.section
      className="page interview-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
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
          <motion.div animate={prepWarning ? { scale: [1, 1.05, 1], color: "#ef4444" } : {}} transition={{ repeat: Infinity, duration: 0.5 }}>
            <MetricCard label="Prep" value={formatTime(prepLeft)} />
          </motion.div>
          <motion.div animate={answerWarning ? { scale: [1, 1.05, 1], color: "#ef4444" } : {}} transition={{ repeat: Infinity, duration: 0.5 }}>
            <MetricCard label="Answer" value={formatTime(answerLeft)} />
          </motion.div>
        </div>
      </div>

      <div className="interview-layout">
        <div className="panel camera-panel">
          <div className={`mock-camera ${phase === "recording" ? "recording" : ""}`}>
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-video-feed"
              style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0, zIndex: 0, borderRadius: "inherit" }}
            />
            <div className={phase === "recording" ? "camera-status recording" : "camera-status"} style={{ zIndex: 1 }}>
              {phase === "recording" ? "● REC" : "Camera active"}
            </div>

            {phase === "recording" && (
              <div className="soundwave" aria-hidden="true" style={{ zIndex: 1 }}>
                {[0.5, 0.8, 1.0, 0.9, 0.6].map((multiplier, i) => (
                  <div 
                    key={i} 
                    className="soundwave-bar" 
                    style={{ 
                      height: `${Math.max(6, Math.min(24, 6 + audioLevel * multiplier * 24))}px`,
                      animation: "none",
                      backgroundColor: audioLevel > 0.1 ? "var(--danger)" : "rgba(255,255,255,0.8)"
                    }} 
                  />
                ))}
              </div>
            )}
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
              <Button variant="secondary" onClick={() => setPhase("ready")}>
                Skip prep
              </Button>
            )}
            {(phase === "ready" || phase === "prep") && (
              <Button onClick={startRecording}>Start mock recording</Button>
            )}
            {phase === "recording" && (
              <Button variant="danger" onClick={saveCurrentAnswer}>
                Stop and save
              </Button>
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
    </motion.section>
  );
}

export default InterviewRoom;

