import { useMemo, useState } from "react";
import "./App.css";
import { buildQuestions, createDemoAnswers, createMockAnswer } from "./data/mockData";
import LandingPage from "./pages/LandingPage";
import SetupPage from "./pages/SetupPage";
import InterviewRoom from "./pages/InterviewRoom";
import ResultsDashboard from "./pages/ResultsDashboard";
import MentorView from "./pages/MentorView";

const initialSettings = {
  track: "frontend",
  level: "Junior",
  mode: "quick",
};

const navItems = [
  { id: "landing", label: "Landing" },
  { id: "setup", label: "Setup" },
  { id: "interview", label: "Interview" },
  { id: "results", label: "Results" },
  { id: "mentor", label: "Mentor" },
];

function createSession(settings) {
  const questions = buildQuestions(settings);

  return {
    id: `session-${Date.now()}`,
    settings,
    questions,
    answers: [],
    mentorComments: {},
    mentorToken: `mentor-${Math.random().toString(36).slice(2, 8)}`,
    xp: 360,
    streak: 4,
  };
}

function App() {
  const [page, setPage] = useState("landing");
  const [settings, setSettings] = useState(initialSettings);
  const [session, setSession] = useState(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  const previewQuestions = useMemo(() => buildQuestions(settings), [settings]);
  const mentorLink = session ? `https://webchamp.demo/review/${session.mentorToken}` : "";

  function updateSetting(key, value) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function startSession(nextSettings = settings) {
    const nextSession = createSession(nextSettings);
    setSession(nextSession);
    setActiveQuestionIndex(0);
    setPage("interview");
  }

  function loadDemoSession() {
    const demoSettings = { track: "frontend", level: "Junior", mode: "quick" };
    const nextSession = createSession(demoSettings);
    const demoAnswers = createDemoAnswers(nextSession.questions);

    setSettings(demoSettings);
    setSession({
      ...nextSession,
      answers: demoAnswers,
      mentorComments: {
        [nextSession.questions[0].id]:
          "Strong structure. Next time, add one concrete example from a project to make the answer more memorable.",
      },
      xp: 620,
      streak: 6,
    });
    setActiveQuestionIndex(0);
    setPage("results");
  }

  function saveAnswer(questionId, draft) {
    if (!session) {
      return;
    }

    const question = session.questions.find((item) => item.id === questionId);
    if (!question) {
      return;
    }

    const answer = createMockAnswer(question, draft, activeQuestionIndex);

    setSession((current) => ({
      ...current,
      answers: [
        ...current.answers.filter((item) => item.questionId !== questionId),
        answer,
      ],
    }));
  }

  function goToNextQuestion() {
    if (!session) {
      return;
    }

    if (activeQuestionIndex >= session.questions.length - 1) {
      setPage("results");
      return;
    }

    setActiveQuestionIndex((index) => index + 1);
  }

  function updateChecklist(questionId, key) {
    setSession((current) => ({
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
    }));
  }

  function updateDifficulty(questionId, difficulty) {
    const repeatMap = {
      easy: "7 days",
      medium: "3 days",
      hard: "1 day",
    };

    setSession((current) => ({
      ...current,
      answers: current.answers.map((answer) =>
        answer.questionId === questionId
          ? { ...answer, difficulty, repeatIn: repeatMap[difficulty] }
          : answer
      ),
    }));
  }

  function saveMentorComment(questionId, comment) {
    setSession((current) => ({
      ...current,
      mentorComments: {
        ...current.mentorComments,
        [questionId]: comment,
      },
    }));
  }

  function resetDemo() {
    setSettings(initialSettings);
    setSession(null);
    setActiveQuestionIndex(0);
    setPage("landing");
  }

  function goToPage(nextPage) {
    if ((nextPage === "interview" || nextPage === "results" || nextPage === "mentor") && !session) {
      setPage("setup");
      return;
    }

    setPage(nextPage);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand-button" type="button" onClick={() => setPage("landing")}>
          <span className="brand-mark">WC</span>
          <span>
            <strong>WebChamp Interview Coach</strong>
            <small>Mock MVP frontend</small>
          </span>
        </button>

        <nav className="topnav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={page === item.id ? "nav-link active" : "nav-link"}
              onClick={() => goToPage(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {page === "landing" && (
          <LandingPage
            onStart={() => setPage("setup")}
            onLoadDemo={loadDemoSession}
          />
        )}

        {page === "setup" && (
          <SetupPage
            settings={settings}
            questions={previewQuestions}
            onUpdateSetting={updateSetting}
            onStart={() => startSession(settings)}
            onLoadDemo={loadDemoSession}
          />
        )}

        {page === "interview" && (
          <InterviewRoom
            session={session}
            activeQuestionIndex={activeQuestionIndex}
            onSaveAnswer={saveAnswer}
            onNext={goToNextQuestion}
            onBackToSetup={() => setPage("setup")}
            onFinish={() => setPage("results")}
          />
        )}

        {page === "results" && (
          <ResultsDashboard
            session={session}
            mentorLink={mentorLink}
            onUpdateChecklist={updateChecklist}
            onUpdateDifficulty={updateDifficulty}
            onOpenMentor={() => setPage("mentor")}
            onPracticeAgain={() => setPage("setup")}
          />
        )}

        {page === "mentor" && (
          <MentorView
            session={session}
            mentorLink={mentorLink}
            onSaveComment={saveMentorComment}
            onBackToResults={() => setPage("results")}
            onReset={resetDemo}
          />
        )}
      </main>
    </div>
  );
}

export default App;
