import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Copy,
  ExternalLink,
  Link,
  MessageSquare,
  Mic,
  Play,
  RefreshCcw,
  Send,
  ShieldCheck,
  Square,
  Star,
  Timer,
  Video,
  Zap,
} from "lucide-react";
import { buildQuestionSet, levels, modes, tracks } from "./data/questions";

const PREP_SECONDS = 10;
const ANSWER_SECONDS = 120;
const MAX_LOCAL_VIDEO_BYTES = 2_800_000;
const STORAGE_PREFIX = "webchamp-coach-session:";

const accentStyles = {
  emerald: {
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    text: "text-emerald-700",
    solid: "bg-emerald-600",
    soft: "bg-emerald-100 text-emerald-800",
  },
  sky: {
    bg: "bg-sky-50",
    border: "border-sky-300",
    text: "text-sky-700",
    solid: "bg-sky-600",
    soft: "bg-sky-100 text-sky-800",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-700",
    solid: "bg-amber-500",
    soft: "bg-amber-100 text-amber-900",
  },
  rose: {
    bg: "bg-rose-50",
    border: "border-rose-300",
    text: "text-rose-700",
    solid: "bg-rose-600",
    soft: "bg-rose-100 text-rose-800",
  },
};

const viewMeta = {
  setup: { title: "Setup", icon: Zap },
  interview: { title: "Room", icon: Video },
  review: { title: "Review", icon: ClipboardCheck },
  mentor: { title: "Mentor", icon: MessageSquare },
};

const productPromise =
  "Practice interviews like a real call, review your answers, and get mentor feedback through one private link.";

const pitchPoints = [
  {
    label: "Problem",
    title: "Passive prep does not build interview confidence.",
    body: "Students and junior candidates often read answers, but rarely practice speaking clearly under time pressure.",
  },
  {
    label: "Solution",
    title: "A calm interview simulator with timed video answers.",
    body: "The product focuses on one complete loop: role-based questions, recording, self-review, model answers, and mentor feedback.",
  },
  {
    label: "Impact",
    title: "Better communication, not just memorized knowledge.",
    body: "The candidate trains structure, pacing, confidence, and the habit of asking for targeted feedback from real people.",
  },
];

const coreLoop = [
  "Choose a role and level",
  "Answer timed questions on camera",
  "Review transcript and model answer",
  "Mark self-review checklist",
  "Share one private mentor link",
];

const roadmapItems = [
  {
    title: "Spaced repetition",
    body: "Keep the simple easy, medium, hard repeat schedule as the next learning layer.",
  },
  {
    title: "AI feedback",
    body: "Add speech rate, clarity hints, and follow-up prompts after the human feedback loop is stable.",
  },
  {
    title: "Question marketplace",
    body: "Let mentors and communities publish curated interview-style question packs.",
  },
];

const demoArchitecture = [
  {
    title: "Browser recording",
    body: "MediaRecorder captures short answers directly in the browser, with transcript-only fallback when camera access fails.",
  },
  {
    title: "Local demo storage",
    body: "The hackathon build stores session metadata locally and keeps small recordings portable for same-browser mentor review.",
  },
  {
    title: "Production path",
    body: "The next backend step is object storage for videos, database rows for sessions, and signed private mentor links.",
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatTime(value) {
  const minutes = Math.floor(value / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function getTrack(id) {
  return tracks.find((track) => track.id === id) || tracks[0];
}

function createId(prefix = "wc") {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now()
    .toString(36)
    .slice(-5)}`;
}

function buildShareUrl(id) {
  return `${window.location.origin}${window.location.pathname}?mentor=${id}`;
}

function getAnswerTemplate(question) {
  return `I would structure the answer around ${question.answerPlan
    .map((item) => item.toLowerCase())
    .join(", ")}.`;
}

function getSpeechRecognition() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function countWords(value) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function getAnswerInsights(answer) {
  if (!answer) {
    return null;
  }

  const words = countWords(answer.transcript || "");
  const minutes = Math.max(answer.duration || 1, 1) / 60;
  const wpm = Math.round(words / minutes);
  const checklistScore = Object.values(answer.checklist || {}).filter(Boolean).length * 18;
  const paceScore = wpm >= 90 && wpm <= 170 ? 24 : wpm >= 60 && wpm <= 210 ? 14 : 8;
  const depthScore = words >= 55 ? 22 : words >= 28 ? 14 : 6;
  const score = Math.min(100, checklistScore + paceScore + depthScore);

  let paceLabel = "Controlled";
  let coachingNote = "Good interview pace. Keep the answer structured and specific.";

  if (wpm < 60) {
    paceLabel = "Too slow";
    coachingNote = "Add one concrete example and keep the answer moving.";
  } else if (wpm > 210) {
    paceLabel = "Too fast";
    coachingNote = "Slow down, pause between points, and make the structure visible.";
  } else if (wpm < 90) {
    paceLabel = "Slow";
    coachingNote = "The pace is understandable, but the answer can be tighter.";
  } else if (wpm > 170) {
    paceLabel = "Fast";
    coachingNote = "The pace is energetic. Add short pauses after each main point.";
  }

  return {
    score,
    words,
    wpm,
    paceLabel,
    coachingNote,
  };
}

function buildReviewPacket(session, shareUrl) {
  if (!session) {
    return "";
  }

  const lines = [
    "WebChamp Interview Coach Review Packet",
    "",
    `Role: ${session.role}`,
    `Track: ${session.trackTitle}`,
    `Questions recorded: ${session.answers.length}/${session.questions.length}`,
    shareUrl ? `Mentor link: ${shareUrl}` : "Mentor link: not generated yet",
    "",
    "Session summary:",
  ];

  session.questions.forEach((question, index) => {
    const answer = session.answers.find((item) => item.questionId === question.id);
    const insight = answer ? getAnswerInsights(answer) : null;
    const checklist = answer?.checklist || {};

    lines.push("");
    lines.push(`${index + 1}. ${question.title}`);
    lines.push(`Topic: ${question.topic}`);
    lines.push(`Prompt: ${question.prompt}`);

    if (!answer) {
      lines.push("Status: not recorded");
      return;
    }

    lines.push(`Duration: ${formatTime(answer.duration)}`);
    lines.push(`Transcript words: ${insight.words}`);
    lines.push(`Pace: ${insight.wpm} wpm (${insight.paceLabel})`);
    lines.push(`Self-review: topic ${checklist.topic ? "yes" : "no"}, structure ${checklist.structure ? "yes" : "no"}, timing ${checklist.timing ? "yes" : "no"}`);
    lines.push(`Repeat schedule: ${answer.repeatIn}`);
    lines.push(`Coaching note: ${insight.coachingNote}`);
  });

  lines.push("");
  lines.push(productPromise);
  return lines.join("\n");
}

function canUseMediaRecorder(stream) {
  return Boolean(stream && window.MediaRecorder);
}

function getRecorderOptions() {
  if (!window.MediaRecorder) {
    return undefined;
  }

  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];

  const mimeType = candidates.find((type) => window.MediaRecorder.isTypeSupported(type));
  return mimeType ? { mimeType } : undefined;
}

function blobToDataUrl(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => resolve("");
    reader.readAsDataURL(blob);
  });
}

function makeSession(settings) {
  const track = getTrack(settings.track);

  return {
    id: createId("session"),
    shareId: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    settings,
    trackTitle: track.title,
    role: track.role,
    questions: buildQuestionSet(settings),
    answers: [],
    mentorComments: {},
    xp: 320,
    streak: 3,
  };
}

function persistSession(session) {
  if (!session?.shareId) {
    return;
  }

  const portableSession = {
    ...session,
    answers: session.answers.map((answer) => ({
      ...answer,
      videoUrl: answer.videoDataUrl || "",
    })),
  };

  try {
    localStorage.setItem(`${STORAGE_PREFIX}${session.shareId}`, JSON.stringify(portableSession));
  } catch (error) {
    console.warn("Session could not be saved locally", error);
  }
}

function readStoredSession(id) {
  try {
    const value = localStorage.getItem(`${STORAGE_PREFIX}${id}`);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    return null;
  }
}

function Button({ children, icon: Icon, variant = "primary", className, ...props }) {
  const variants = {
    primary:
      "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 disabled:border-zinc-300 disabled:bg-zinc-200 disabled:text-zinc-500",
    secondary:
      "border-zinc-300 bg-white text-zinc-900 hover:border-zinc-400 hover:bg-zinc-50 disabled:text-zinc-400",
    danger:
      "border-rose-600 bg-rose-600 text-white hover:bg-rose-700 disabled:border-rose-200 disabled:bg-rose-200",
    ghost:
      "border-transparent bg-transparent text-zinc-700 hover:bg-zinc-100 disabled:text-zinc-400",
  };

  return (
    <button
      type="button"
      className={classNames(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    >
      {Icon ? <Icon aria-hidden="true" size={18} strokeWidth={2.2} /> : null}
      <span>{children}</span>
    </button>
  );
}

function StatusChip({ children, tone = "zinc", icon: Icon }) {
  const tones = {
    zinc: "bg-zinc-100 text-zinc-700",
    green: "bg-emerald-100 text-emerald-800",
    amber: "bg-amber-100 text-amber-900",
    rose: "bg-rose-100 text-rose-800",
    sky: "bg-sky-100 text-sky-800",
  };

  return (
    <span className={classNames("inline-flex items-center gap-2 rounded-lg px-3 py-1 text-xs font-semibold", tones[tone])}>
      {Icon ? <Icon aria-hidden="true" size={14} /> : null}
      {children}
    </span>
  );
}

function App() {
  const initialMentorId = useMemo(() => new URLSearchParams(window.location.search).get("mentor"), []);
  const [settings, setSettings] = useState({
    track: "frontend",
    level: "Junior",
    mode: "quick",
  });
  const [session, setSession] = useState(null);
  const [view, setView] = useState("setup");
  const [mentorMissing, setMentorMissing] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [roomState, setRoomState] = useState("idle");
  const [prepLeft, setPrepLeft] = useState(PREP_SECONDS);
  const [answerLeft, setAnswerLeft] = useState(ANSWER_SECONDS);
  const [cameraStatus, setCameraStatus] = useState("idle");
  const [cameraMessage, setCameraMessage] = useState("");
  const [stream, setStream] = useState(null);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [copyState, setCopyState] = useState("idle");
  const [packetCopyState, setPacketCopyState] = useState("idle");
  const [mentorDrafts, setMentorDrafts] = useState({});

  const videoRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const startedAtRef = useRef(null);
  const saveLockRef = useRef(false);

  const selectedTrack = getTrack(settings.track);
  const selectedAccent = accentStyles[selectedTrack.accent];
  const previewQuestions = useMemo(() => buildQuestionSet(settings), [settings]);
  const currentQuestion = session?.questions[questionIndex];
  const recordedCount = session?.answers.length || 0;
  const completion = session ? Math.round((recordedCount / session.questions.length) * 100) : 0;
  const shareUrl = session?.shareId ? buildShareUrl(session.shareId) : "";
  const mentorCommentCount = session
    ? Object.values(session.mentorComments || {}).filter((comment) => comment.trim()).length
    : 0;

  useEffect(() => {
    if (!initialMentorId) {
      return;
    }

    const storedSession = readStoredSession(initialMentorId);
    if (storedSession) {
      setSession(storedSession);
      setMentorDrafts(storedSession.mentorComments || {});
      setView("mentor");
    } else {
      setMentorMissing(true);
      setView("mentor");
    }
  }, [initialMentorId]);

  useEffect(() => {
    if (videoRef.current && stream && view === "interview") {
      videoRef.current.srcObject = stream;
    }
  }, [stream, view, questionIndex, roomState]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    if (view !== "interview" || roomState !== "prep") {
      return undefined;
    }

    if (prepLeft <= 0) {
      setRoomState("ready");
      return undefined;
    }

    const timeout = window.setTimeout(() => setPrepLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timeout);
  }, [view, roomState, prepLeft]);

  useEffect(() => {
    if (roomState !== "recording") {
      return undefined;
    }

    if (answerLeft <= 0) {
      stopRecording();
      return undefined;
    }

    const timeout = window.setTimeout(() => setAnswerLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomState, answerLeft]);

  function updateSettings(key, value) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function startSession() {
    const nextSession = makeSession(settings);
    setSession(nextSession);
    setQuestionIndex(0);
    setPrepLeft(PREP_SECONDS);
    setAnswerLeft(ANSWER_SECONDS);
    setLiveTranscript("");
    setRoomState("prep");
    setView("interview");
    setMentorMissing(false);
  }

  function loadDemoSession() {
    const demoSettings = { track: settings.track, level: settings.level, mode: settings.mode };
    const nextSession = makeSession(demoSettings);
    const repeatByIndex = ["7 days", "3 days", "1 day"];
    const difficultyByIndex = ["easy", "medium", "hard"];

    const demoAnswers = nextSession.questions.map((question, index) => ({
      questionId: question.id,
      recordedAt: new Date(Date.now() - (index + 1) * 90_000).toISOString(),
      duration: 82 + index * 19,
      transcript: `${question.model} In a real interview, I would keep the answer concise, name the tradeoff, and connect it to user impact.`,
      videoUrl: "",
      videoDataUrl: "",
      videoSize: 0,
      checklist: {
        topic: true,
        structure: index !== 2,
        timing: true,
      },
      difficulty: difficultyByIndex[index] || "medium",
      repeatIn: repeatByIndex[index] || "3 days",
    }));

    const demoSession = {
      ...nextSession,
      shareId: createId("mentor"),
      answers: demoAnswers,
      xp: 520,
      streak: 5,
      updatedAt: new Date().toISOString(),
    };

    setSession(demoSession);
    setMentorDrafts({});
    setQuestionIndex(0);
    setPrepLeft(PREP_SECONDS);
    setAnswerLeft(ANSWER_SECONDS);
    setLiveTranscript("");
    setRoomState("saved");
    setMentorMissing(false);
    persistSession(demoSession);
    setView("review");
  }

  async function enableCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("unsupported");
      setCameraMessage("Camera API is not available in this browser.");
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      setStream(mediaStream);
      setCameraStatus("ready");
      setCameraMessage("Camera is ready.");

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      setCameraStatus("blocked");
      setCameraMessage("Camera permission was blocked. You can still run the demo without video.");
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setCameraStatus("idle");
    setCameraMessage("");
  }

  function startSpeechRecognition() {
    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      return;
    }

    try {
      const recognition = new Recognition();
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        let transcript = "";
        for (let index = 0; index < event.results.length; index += 1) {
          transcript += event.results[index][0].transcript;
        }
        setLiveTranscript(transcript.trim());
      };
      recognition.onerror = () => {
        recognition.stop();
      };
      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      recognitionRef.current = null;
    }
  }

  function stopSpeechRecognition() {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        // SpeechRecognition can already be stopped by the browser.
      }
      recognitionRef.current = null;
    }
  }

  function startRecording() {
    if (!currentQuestion) {
      return;
    }

    setRoomState("recording");
    setAnswerLeft(ANSWER_SECONDS);
    setLiveTranscript("");
    setCameraMessage("");
    chunksRef.current = [];
    recorderRef.current = null;
    startedAtRef.current = Date.now();
    saveLockRef.current = false;
    startSpeechRecognition();

    if (!canUseMediaRecorder(stream)) {
      return;
    }

    try {
      const options = getRecorderOptions();
      const recorder = options ? new MediaRecorder(stream, options) : new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data?.size) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onstop = async () => {
        const type = recorder.mimeType || "video/webm";
        const blob = new Blob(chunksRef.current, { type });
        const videoUrl = blob.size ? URL.createObjectURL(blob) : "";
        const videoDataUrl =
          blob.size > 0 && blob.size <= MAX_LOCAL_VIDEO_BYTES ? await blobToDataUrl(blob) : "";

        commitAnswer({
          videoUrl,
          videoDataUrl,
          videoSize: blob.size,
        });
      };
      recorder.start(1000);
    } catch (error) {
      setCameraMessage("Recording fell back to transcript-only mode.");
      recorderRef.current = null;
    }
  }

  function stopRecording() {
    if (roomState !== "recording") {
      return;
    }

    setRoomState("saving");
    stopSpeechRecognition();

    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
      return;
    }

    commitAnswer({
      videoUrl: "",
      videoDataUrl: "",
      videoSize: 0,
    });
  }

  function commitAnswer(payload) {
    if (!session || !currentQuestion || saveLockRef.current) {
      return;
    }

    saveLockRef.current = true;
    stopSpeechRecognition();

    const duration = startedAtRef.current
      ? Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000))
      : Math.max(1, ANSWER_SECONDS - answerLeft);
    const transcript = liveTranscript.trim() || getAnswerTemplate(currentQuestion);

    const answer = {
      questionId: currentQuestion.id,
      recordedAt: new Date().toISOString(),
      duration,
      transcript,
      videoUrl: payload.videoUrl,
      videoDataUrl: payload.videoDataUrl,
      videoSize: payload.videoSize,
      checklist: {
        topic: false,
        structure: false,
        timing: duration <= ANSWER_SECONDS,
      },
      difficulty: "medium",
      repeatIn: "3 days",
    };

    setSession((current) => {
      const answers = [
        ...current.answers.filter((item) => item.questionId !== answer.questionId),
        answer,
      ];
      const nextSession = { ...current, answers, updatedAt: new Date().toISOString() };
      persistSession(nextSession);
      return nextSession;
    });

    setRoomState("saved");
    setAnswerLeft(Math.max(0, ANSWER_SECONDS - duration));
  }

  function moveToNextQuestion() {
    if (!session) {
      return;
    }

    const nextIndex = questionIndex + 1;
    if (nextIndex >= session.questions.length) {
      stopCamera();
      setView("review");
      return;
    }

    setQuestionIndex(nextIndex);
    setPrepLeft(PREP_SECONDS);
    setAnswerLeft(ANSWER_SECONDS);
    setLiveTranscript("");
    setRoomState("prep");
  }

  function skipPrep() {
    setPrepLeft(0);
    setRoomState("ready");
  }

  function ensureShareSession() {
    if (!session) {
      return null;
    }

    const nextSession = {
      ...session,
      shareId: session.shareId || createId("mentor"),
      updatedAt: new Date().toISOString(),
    };
    setSession(nextSession);
    persistSession(nextSession);
    return nextSession;
  }

  async function copyShareLink() {
    const nextSession = ensureShareSession();
    if (!nextSession) {
      return;
    }

    const url = buildShareUrl(nextSession.shareId);
    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API is not available.");
      }
      await navigator.clipboard.writeText(url);
      setCopyState("copied");
    } catch (error) {
      setCopyState("ready");
    }

    window.setTimeout(() => setCopyState("idle"), 1800);
  }

  async function copyReviewPacket() {
    const nextSession = ensureShareSession();
    if (!nextSession) {
      return;
    }

    const url = buildShareUrl(nextSession.shareId);
    const packet = buildReviewPacket(nextSession, url);

    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API is not available.");
      }
      await navigator.clipboard.writeText(packet);
      setPacketCopyState("copied");
    } catch (error) {
      setPacketCopyState("ready");
    }

    window.setTimeout(() => setPacketCopyState("idle"), 1800);
  }

  function openMentorPreview() {
    const nextSession = ensureShareSession();
    if (!nextSession) {
      return;
    }

    setMentorDrafts(nextSession.mentorComments || {});
    setMentorMissing(false);
    setView("mentor");
  }

  function updateTranscript(questionId, value) {
    setSession((current) => {
      const nextSession = {
        ...current,
        answers: current.answers.map((answer) =>
          answer.questionId === questionId ? { ...answer, transcript: value } : answer
        ),
        updatedAt: new Date().toISOString(),
      };
      persistSession(nextSession);
      return nextSession;
    });
  }

  function toggleChecklist(questionId, key) {
    setSession((current) => {
      const nextSession = {
        ...current,
        answers: current.answers.map((answer) =>
          answer.questionId === questionId
            ? {
                ...answer,
                checklist: {
                  ...answer.checklist,
                  [key]: !answer.checklist[key],
                },
              }
            : answer
        ),
        updatedAt: new Date().toISOString(),
      };
      persistSession(nextSession);
      return nextSession;
    });
  }

  function setDifficulty(questionId, difficulty) {
    const repeatMap = {
      easy: "7 days",
      medium: "3 days",
      hard: "1 day",
    };

    setSession((current) => {
      const nextSession = {
        ...current,
        answers: current.answers.map((answer) =>
          answer.questionId === questionId
            ? { ...answer, difficulty, repeatIn: repeatMap[difficulty] }
            : answer
        ),
        updatedAt: new Date().toISOString(),
      };
      persistSession(nextSession);
      return nextSession;
    });
  }

  function saveMentorComment(questionId) {
    if (!session) {
      return;
    }

    const nextSession = {
      ...session,
      mentorComments: {
        ...session.mentorComments,
        [questionId]: mentorDrafts[questionId] || "",
      },
      updatedAt: new Date().toISOString(),
    };
    setSession(nextSession);
    persistSession(nextSession);
  }

  function resetProduct() {
    stopCamera();
    setSession(null);
    setQuestionIndex(0);
    setPrepLeft(PREP_SECONDS);
    setAnswerLeft(ANSWER_SECONDS);
    setRoomState("idle");
    setLiveTranscript("");
    setCopyState("idle");
    setPacketCopyState("idle");
    setMentorMissing(false);
    setView("setup");
    window.history.replaceState({}, "", window.location.pathname);
  }

  function getAnswer(questionId) {
    return session?.answers.find((answer) => answer.questionId === questionId);
  }

  function Header() {
    return (
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-900 text-white">
              <Video aria-hidden="true" size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-zinc-950">WebChamp Interview Coach</h1>
                <StatusChip tone="green" icon={ShieldCheck}>
                  MVP
                </StatusChip>
              </div>
              <p className="text-sm text-zinc-500">Timed practice, self-review, mentor feedback.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {Object.entries(viewMeta).map(([key, item]) => {
              const Icon = item.icon;
              const isDisabled = key !== "setup" && !session;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => setView(key)}
                  className={classNames(
                    "inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition",
                    view === key
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-950",
                    isDisabled && "cursor-not-allowed opacity-45"
                  )}
                >
                  <Icon aria-hidden="true" size={16} />
                  {item.title}
                </button>
              );
            })}
          </div>
        </div>
      </header>
    );
  }

  function SetupView() {
    return (
      <motion.section
        key="setup"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.28 }}
        className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]"
      >
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-panel">
          <div className="mb-5 flex flex-col gap-3 border-b border-zinc-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-500">Practice setup</p>
              <h2 className="mt-1 max-w-2xl text-3xl font-bold text-zinc-950 text-balance">
                Build one smooth interview loop for a 2-3 minute demo
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">{productPromise}</p>
            </div>
            <StatusChip tone="sky" icon={Timer}>
              3 questions
            </StatusChip>
          </div>

          <div className="space-y-6">
            <div className="grid gap-3 xl:grid-cols-3">
              {pitchPoints.map((point) => (
                <div key={point.label} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs font-bold uppercase text-zinc-500">{point.label}</p>
                  <h3 className="mt-2 text-base font-bold leading-6 text-zinc-950">{point.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">{point.body}</p>
                </div>
              ))}
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase text-zinc-500">Track</h3>
                <span className={classNames("rounded-lg px-3 py-1 text-xs font-bold", selectedAccent.soft)}>
                  {selectedTrack.role}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {tracks.map((track) => {
                  const accent = accentStyles[track.accent];
                  const isActive = settings.track === track.id;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => updateSettings("track", track.id)}
                      className={classNames(
                        "min-h-32 rounded-lg border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm",
                        isActive
                          ? `${accent.bg} ${accent.border}`
                          : "border-zinc-200 bg-white hover:border-zinc-300"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-zinc-950">{track.title}</p>
                          <p className="mt-1 text-sm leading-6 text-zinc-600">{track.summary}</p>
                        </div>
                        {isActive ? <CheckCircle2 className={accent.text} size={21} /> : null}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {track.skills.map((skill) => (
                          <span key={skill} className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-zinc-600">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase text-zinc-500">Level</h3>
                <div className="grid grid-cols-3 gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-1">
                  {levels.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => updateSettings("level", level)}
                      className={classNames(
                        "min-h-10 rounded-lg px-3 text-sm font-bold transition",
                        settings.level === level
                          ? "bg-white text-zinc-950 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-950"
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-bold uppercase text-zinc-500">Mode</h3>
                <div className="grid gap-2">
                  {modes.map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => updateSettings("mode", mode.id)}
                      className={classNames(
                        "flex min-h-12 items-center justify-between rounded-lg border px-3 text-left transition",
                        settings.mode === mode.id
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                      )}
                    >
                      <span>
                        <span className="block text-sm font-bold">{mode.title}</span>
                        <span className={classNames("block text-xs", settings.mode === mode.id ? "text-zinc-300" : "text-zinc-500")}>
                          {mode.summary}
                        </span>
                      </span>
                      <ChevronRight aria-hidden="true" size={17} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-zinc-200 pt-5 sm:flex-row">
              <Button icon={Play} onClick={startSession} className="sm:min-w-52">
                Start interview
              </Button>
              <Button icon={ClipboardCheck} variant="secondary" onClick={loadDemoSession}>
                Load demo session
              </Button>
              <Button icon={RefreshCcw} variant="secondary" onClick={() => setSettings({ track: "frontend", level: "Junior", mode: "quick" })}>
                Reset setup
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-panel">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-500">Session plan</p>
                <h3 className="text-xl font-bold text-zinc-950">{selectedTrack.role}</h3>
              </div>
              <div className={classNames("flex h-12 w-12 items-center justify-center rounded-lg text-white", selectedAccent.solid)}>
                <BadgeCheck aria-hidden="true" size={23} />
              </div>
            </div>

            <div className="space-y-3">
              {previewQuestions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 p-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-bold text-zinc-700">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-zinc-950">{question.title}</p>
                      <p className="mt-1 text-sm leading-6 text-zinc-600">{question.prompt}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-950 p-4 text-white shadow-panel">
            <div className="aspect-video overflow-hidden rounded-lg border border-white/10 bg-zinc-900">
              <div className="grid h-full grid-cols-[1fr_0.72fr]">
                <div className="flex flex-col justify-between bg-zinc-900 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Live practice room
                  </div>
                  <div>
                    <p className="max-w-xs text-lg font-bold">Answer out loud, then review what actually happened.</p>
                    <div className="mt-4 h-2 rounded-lg bg-white/10">
                      <div className="h-2 w-2/3 rounded-lg bg-emerald-400" />
                    </div>
                  </div>
                </div>
                <div className="grid gap-2 border-l border-white/10 bg-white/5 p-3">
                  <div className="rounded-lg bg-white/10 p-3">
                    <Camera size={18} />
                    <p className="mt-2 text-sm font-semibold">Camera preview</p>
                  </div>
                  <div className="rounded-lg bg-white/10 p-3">
                    <MessageSquare size={18} />
                    <p className="mt-2 text-sm font-semibold">Mentor note</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-panel">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-500">Demo core loop</p>
                <h3 className="text-xl font-bold text-zinc-950">Clear, complete, judge-friendly</h3>
              </div>
              <StatusChip tone="green" icon={CheckCircle2}>
                Scoped MVP
              </StatusChip>
            </div>
            <div className="space-y-2">
              {coreLoop.map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-bold text-zinc-700">
                    {index + 1}
                  </span>
                  <p className="text-sm font-semibold text-zinc-800">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-panel">
            <div className="mb-4">
              <p className="text-sm font-semibold text-zinc-500">Future improvements</p>
              <h3 className="text-xl font-bold text-zinc-950">Strong roadmap, not MVP noise</h3>
            </div>
            <div className="space-y-3">
              {roadmapItems.map((item) => (
                <div key={item.title} className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                  <p className="text-sm font-bold text-zinc-950">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-zinc-600">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>
    );
  }

  function InterviewView() {
    if (!session || !currentQuestion) {
      return <EmptyState onAction={startSession} label="Start a session first" action="Create session" />;
    }

    const currentAnswer = getAnswer(currentQuestion.id);
    const isLastQuestion = questionIndex === session.questions.length - 1;
    const roomStatus = {
      idle: "Ready",
      prep: "Prep",
      ready: "Ready",
      recording: "Recording",
      saving: "Saving",
      saved: "Saved",
    }[roomState];

    return (
      <motion.section
        key="interview"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.28 }}
        className="space-y-5"
      >
        <div className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-panel lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <StatusChip tone={roomState === "recording" ? "rose" : "sky"} icon={Clock}>
                {roomStatus}
              </StatusChip>
              <StatusChip tone="zinc">Question {questionIndex + 1} of {session.questions.length}</StatusChip>
              <StatusChip tone="green">{session.trackTitle}</StatusChip>
            </div>
            <h2 className="text-2xl font-bold text-zinc-950">{currentQuestion.title}</h2>
            <p className="mt-2 max-w-4xl text-base leading-7 text-zinc-600">{currentQuestion.prompt}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:min-w-64">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-xs font-bold uppercase text-zinc-500">Prep</p>
              <p className="mt-1 text-2xl font-bold text-zinc-950">{formatTime(prepLeft)}</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-xs font-bold uppercase text-zinc-500">Answer</p>
              <p className="mt-1 text-2xl font-bold text-zinc-950">{formatTime(answerLeft)}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-panel">
            <div className="relative aspect-video overflow-hidden rounded-lg border border-zinc-900 bg-zinc-950">
              {stream ? (
                <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center text-white">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white/10">
                    <Camera aria-hidden="true" size={30} />
                  </div>
                  <div>
                    <p className="text-lg font-bold">Camera off</p>
                    <p className="mt-1 max-w-sm text-sm leading-6 text-zinc-300">
                      Enable camera for a real answer, or continue transcript-only for the demo.
                    </p>
                  </div>
                </div>
              )}

              <div className="absolute left-3 top-3 flex items-center gap-2 rounded-lg bg-black/70 px-3 py-2 text-sm font-semibold text-white">
                <motion.span
                  className={classNames("h-2.5 w-2.5 rounded-full", roomState === "recording" ? "bg-rose-400" : "bg-zinc-400")}
                  animate={roomState === "recording" ? { scale: [1, 1.35, 1] } : { scale: 1 }}
                  transition={{ duration: 1.1, repeat: roomState === "recording" ? Infinity : 0 }}
                />
                {roomState === "recording" ? "REC" : cameraStatus === "ready" ? "Preview" : "Standby"}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-h-6 text-sm font-medium text-zinc-500">
                {cameraMessage || (currentAnswer ? "Answer saved for review." : "Use a short, structured answer.")}
              </div>
              <div className="flex flex-wrap gap-2">
                {!stream ? (
                  <Button icon={Camera} variant="secondary" onClick={enableCamera}>
                    Enable camera
                  </Button>
                ) : null}
                {roomState === "prep" ? (
                  <Button icon={ArrowRight} variant="secondary" onClick={skipPrep}>
                    Start now
                  </Button>
                ) : null}
                {(roomState === "ready" || roomState === "idle" || roomState === "prep") ? (
                  <Button icon={Mic} onClick={startRecording}>
                    Start recording
                  </Button>
                ) : null}
                {roomState === "recording" ? (
                  <Button icon={Square} variant="danger" onClick={stopRecording}>
                    Stop answer
                  </Button>
                ) : null}
                {roomState === "saving" ? (
                  <Button icon={Clock} disabled>
                    Saving
                  </Button>
                ) : null}
                {roomState === "saved" ? (
                  <Button icon={isLastQuestion ? ClipboardCheck : ChevronRight} onClick={moveToNextQuestion}>
                    {isLastQuestion ? "Go to review" : "Next question"}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-panel">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-zinc-950">Answer structure</h3>
                <StatusChip tone="amber">{currentQuestion.topic}</StatusChip>
              </div>
              <div className="space-y-3">
                {currentQuestion.answerPlan.map((step, index) => (
                  <div key={step} className="flex gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-bold text-zinc-700">
                      {index + 1}
                    </span>
                    <p className="text-sm font-medium leading-6 text-zinc-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-panel">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-zinc-950">Live transcript</h3>
                <StatusChip tone={getSpeechRecognition() ? "green" : "zinc"} icon={Mic}>
                  {getSpeechRecognition() ? "On device" : "Manual fallback"}
                </StatusChip>
              </div>
              <div className="min-h-36 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm leading-6 text-zinc-700">
                {liveTranscript || currentAnswer?.transcript || "Transcript appears here while you answer."}
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    );
  }

  function ReviewView() {
    if (!session) {
      return <EmptyState onAction={startSession} label="No active session yet" action="Create session" />;
    }

    return (
      <motion.section
        key="review"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.28 }}
        className="space-y-5"
      >
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-panel">
          <div className="grid gap-5 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold text-zinc-500">Review dashboard</p>
              <h2 className="mt-1 text-3xl font-bold text-zinc-950">
                {recordedCount}/{session.questions.length} answers recorded
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
                Compare each answer with a model structure, mark what worked, and turn the session into one private mentor review link.
              </p>
              <div className="mt-4 h-3 overflow-hidden rounded-lg bg-zinc-100">
                <motion.div
                  className="h-full rounded-lg bg-zinc-900"
                  initial={{ width: 0 }}
                  animate={{ width: `${completion}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Metric icon={Star} label="XP" value={session.xp + recordedCount * 40} />
              <Metric icon={Zap} label="Streak" value={`${session.streak} days`} />
              <Metric icon={BarChart3} label="Progress" value={`${completion}%`} />
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {session.questions.map((question, index) => {
              const answer = getAnswer(question.id);
              const videoSource = answer?.videoDataUrl || answer?.videoUrl;
              const insight = answer ? getAnswerInsights(answer) : null;

              return (
                <motion.article
                  key={question.id}
                  layout
                  className="rounded-lg border border-zinc-200 bg-white p-4 shadow-panel"
                >
                  <div className="grid gap-4 xl:grid-cols-[290px_1fr]">
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <StatusChip tone="sky">Question {index + 1}</StatusChip>
                        <StatusChip tone={answer ? "green" : "amber"}>{answer ? "Recorded" : "Missing"}</StatusChip>
                      </div>
                      <div className="aspect-video overflow-hidden rounded-lg border border-zinc-200 bg-zinc-950">
                        {videoSource ? (
                          <video src={videoSource} controls className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-white">
                            <Video size={26} />
                            <p className="text-sm font-semibold">Transcript-only answer</p>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <Metric compact icon={Clock} label="Duration" value={answer ? formatTime(answer.duration) : "--:--"} />
                        <Metric compact icon={Timer} label="Repeat" value={answer?.repeatIn || "Unset"} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-bold uppercase text-zinc-500">{question.topic}</p>
                        <h3 className="mt-1 text-xl font-bold text-zinc-950">{question.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-zinc-600">{question.prompt}</p>
                      </div>

                      <div className="grid gap-3 lg:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-bold text-zinc-700" htmlFor={`transcript-${question.id}`}>
                            Transcript
                          </label>
                          <textarea
                            id={`transcript-${question.id}`}
                            value={answer?.transcript || ""}
                            onChange={(event) => updateTranscript(question.id, event.target.value)}
                            placeholder="Record an answer to fill this area."
                            className="min-h-36 w-full resize-none rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm leading-6 text-zinc-800 outline-none transition focus:border-zinc-900 focus:bg-white"
                          />
                        </div>
                        <div>
                          <p className="mb-2 text-sm font-bold text-zinc-700">Model answer</p>
                          <div className="min-h-36 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-950">
                            {question.model}
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3 xl:grid-cols-[1fr_auto]">
                        <div className="grid gap-2 sm:grid-cols-3">
                          {[
                            ["topic", "Understood"],
                            ["structure", "Structured"],
                            ["timing", "On time"],
                          ].map(([key, label]) => (
                            <label
                              key={key}
                              className="flex min-h-11 items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm font-semibold text-zinc-700"
                            >
                              <input
                                type="checkbox"
                                checked={Boolean(answer?.checklist?.[key])}
                                onChange={() => answer && toggleChecklist(question.id, key)}
                                disabled={!answer}
                                className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                              />
                              {label}
                            </label>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          {["easy", "medium", "hard"].map((difficulty) => (
                            <button
                              key={difficulty}
                              type="button"
                              disabled={!answer}
                              onClick={() => setDifficulty(question.id, difficulty)}
                              className={classNames(
                                "min-h-11 rounded-lg border px-3 text-sm font-bold capitalize transition",
                                answer?.difficulty === difficulty
                                  ? "border-zinc-900 bg-zinc-900 text-white"
                                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300",
                                !answer && "cursor-not-allowed opacity-50"
                              )}
                            >
                              {difficulty}
                            </button>
                          ))}
                        </div>
                      </div>

                      {insight ? (
                        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                          <div className="grid gap-2 sm:grid-cols-3">
                            <Metric compact icon={BarChart3} label="Rubric" value={`${insight.score}%`} />
                            <Metric compact icon={Mic} label="Pace" value={`${insight.wpm} wpm`} />
                            <Metric compact icon={MessageSquare} label="Words" value={insight.words} />
                          </div>
                          <div className="mt-3 rounded-lg border border-zinc-200 bg-white p-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-bold text-zinc-950">Coaching note</p>
                              <StatusChip tone={insight.paceLabel === "Controlled" ? "green" : "amber"}>
                                {insight.paceLabel}
                              </StatusChip>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-zinc-600">{insight.coachingNote}</p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>

          <aside className="h-fit rounded-lg border border-zinc-200 bg-white p-4 shadow-panel lg:sticky lg:top-24">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-500">Mentor link</p>
                <h3 className="text-xl font-bold text-zinc-950">Private review</h3>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-900 text-white">
                <Link aria-hidden="true" size={21} />
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <input
                readOnly
                value={shareUrl || "Create a link when the review is ready"}
                className="w-full overflow-hidden rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 outline-none"
              />
              <div className="mt-3 grid gap-2">
                <Button icon={Copy} onClick={copyShareLink}>
                  {copyState === "copied" ? "Copied" : "Copy link"}
                </Button>
                <Button icon={ClipboardCheck} variant="secondary" onClick={copyReviewPacket}>
                  {packetCopyState === "copied" ? "Packet copied" : "Copy review packet"}
                </Button>
                <Button icon={ExternalLink} variant="secondary" onClick={openMentorPreview}>
                  Open mentor view
                </Button>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3">
              <p className="text-sm font-bold text-zinc-950">Demo architecture</p>
              <div className="mt-3 space-y-2">
                {demoArchitecture.map((item) => (
                  <div key={item.title} className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                    <p className="text-sm font-bold text-zinc-900">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-zinc-600">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-sm font-bold text-zinc-950">Why mentor feedback?</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                The MVP avoids overpromising AI scoring. A real mentor can review the video, transcript, rubric, and leave one precise next step.
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {session.questions.map((question) => (
                <div key={question.id} className="rounded-lg border border-zinc-200 bg-white p-3">
                  <p className="text-sm font-bold text-zinc-900">{question.title}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {session.mentorComments[question.id] ? "Mentor comment saved" : "Awaiting comment"}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Metric compact icon={MessageSquare} label="Comments" value={`${mentorCommentCount}/${session.questions.length}`} />
              <Metric compact icon={ShieldCheck} label="Link" value={session.shareId ? "Ready" : "Draft"} />
            </div>

            <Button icon={RefreshCcw} variant="ghost" onClick={resetProduct} className="mt-4 w-full">
              New session
            </Button>
          </aside>
        </div>
      </motion.section>
    );
  }

  function MentorView() {
    if (mentorMissing) {
      return (
        <motion.section
          key="mentor-missing"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-panel"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
            <Link size={26} />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-zinc-950">Mentor link not found</h2>
          <p className="mx-auto mt-2 max-w-xl text-zinc-600">
            This MVP stores demo sessions locally. Create a session and generate a mentor link in this browser.
          </p>
          <Button icon={ArrowRight} onClick={resetProduct} className="mt-5">
            Go to setup
          </Button>
        </motion.section>
      );
    }

    if (!session) {
      return <EmptyState onAction={startSession} label="No session selected" action="Create session" />;
    }

    return (
      <motion.section
        key="mentor"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.28 }}
        className="space-y-5"
      >
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-panel">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-500">Mentor review</p>
              <h2 className="mt-1 text-3xl font-bold text-zinc-950">{session.role}</h2>
              <p className="mt-2 text-zinc-600">Review answers, compare with the rubric, leave focused comments.</p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:min-w-96">
              <Metric icon={Video} label="Answers" value={recordedCount} />
              <Metric icon={MessageSquare} label="Comments" value={mentorCommentCount} />
              <Metric icon={Clock} label="Target" value="2 min" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {session.questions.map((question, index) => {
            const answer = getAnswer(question.id);
            const videoSource = answer?.videoDataUrl || answer?.videoUrl;
            const insight = answer ? getAnswerInsights(answer) : null;

            return (
              <article key={question.id} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-panel">
                <div className="grid gap-4 lg:grid-cols-[320px_1fr_360px]">
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <StatusChip tone="sky">Question {index + 1}</StatusChip>
                      <StatusChip tone={answer ? "green" : "amber"}>{answer ? formatTime(answer.duration) : "No answer"}</StatusChip>
                    </div>
                    <div className="aspect-video overflow-hidden rounded-lg border border-zinc-200 bg-zinc-950">
                      {videoSource ? (
                        <video src={videoSource} controls className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-white">
                          <Video size={26} />
                          <p className="text-sm font-semibold">No local video</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-bold uppercase text-zinc-500">{question.source}</p>
                    <h3 className="mt-1 text-xl font-bold text-zinc-950">{question.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">{question.prompt}</p>

                    <div className="mt-4 grid gap-3 xl:grid-cols-2">
                      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                        <p className="text-sm font-bold text-zinc-700">Candidate transcript</p>
                        <p className="mt-2 text-sm leading-6 text-zinc-600">
                          {answer?.transcript || "No transcript captured."}
                        </p>
                      </div>
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                        <p className="text-sm font-bold text-emerald-950">Rubric</p>
                        <ul className="mt-2 space-y-2 text-sm leading-6 text-emerald-950">
                          {question.rubric.map((item) => (
                            <li key={item} className="flex gap-2">
                              <CheckCircle2 className="mt-1 shrink-0" size={15} />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {insight ? (
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        <Metric compact icon={BarChart3} label="Self score" value={`${insight.score}%`} />
                        <Metric compact icon={Mic} label="Pace" value={`${insight.wpm} wpm`} />
                        <Metric compact icon={MessageSquare} label="Words" value={insight.words} />
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-zinc-700" htmlFor={`mentor-${question.id}`}>
                      Mentor comment
                    </label>
                    <textarea
                      id={`mentor-${question.id}`}
                      value={mentorDrafts[question.id] || ""}
                      onChange={(event) =>
                        setMentorDrafts((current) => ({ ...current, [question.id]: event.target.value }))
                      }
                      placeholder="Leave one precise next step."
                      className="min-h-40 w-full resize-none rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm leading-6 text-zinc-800 outline-none transition focus:border-zinc-900 focus:bg-white"
                    />
                    <Button icon={Send} onClick={() => saveMentorComment(question.id)} className="mt-3 w-full">
                      Save comment
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button icon={ClipboardCheck} variant="secondary" onClick={() => setView("review")}>
            Student review
          </Button>
          <Button icon={RefreshCcw} variant="ghost" onClick={resetProduct}>
            New session
          </Button>
        </div>
      </motion.section>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-5 lg:px-6">
        <AnimatePresence mode="wait">
          {view === "setup" ? <SetupView /> : null}
          {view === "interview" ? <InterviewView /> : null}
          {view === "review" ? <ReviewView /> : null}
          {view === "mentor" ? <MentorView /> : null}
        </AnimatePresence>
      </main>
    </div>
  );
}

function Metric({ icon: Icon, label, value, compact = false }) {
  return (
    <div className={classNames("rounded-lg border border-zinc-200 bg-zinc-50", compact ? "p-2" : "p-3")}>
      <div className="flex items-center gap-2 text-xs font-bold uppercase text-zinc-500">
        <Icon aria-hidden="true" size={compact ? 14 : 16} />
        {label}
      </div>
      <p className={classNames("mt-1 font-bold text-zinc-950", compact ? "text-base" : "text-xl")}>{value}</p>
    </div>
  );
}

function EmptyState({ label, action, onAction }) {
  return (
    <motion.section
      key="empty"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-panel"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
        <ClipboardCheck size={26} />
      </div>
      <h2 className="mt-4 text-2xl font-bold text-zinc-950">{label}</h2>
      <Button icon={ArrowRight} onClick={onAction} className="mt-5">
        {action}
      </Button>
    </motion.section>
  );
}

export default App;
