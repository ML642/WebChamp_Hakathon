import { useMemo, useState } from "react";
import "./App.css";
import {
  awardSessionXp,
  buildQuestions,
  createDemoAnswers,
  createMockAnswer,
  createPlayerProfile,
  getPlayerProgress,
} from "./data/mockData";
import LandingPage from "./pages/LandingPage/LandingPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegistrationPage from "./pages/RegistrationPage/RegistrationPage";
import SetupPage from "./pages/SetupPage/SetupPage";
import QuestionBasePage from "./pages/QuestionBasePage/QuestionBasePage";
import InterviewRoom from "./pages/InterviewRoom/InterviewRoom";
import ResultsDashboard from "./pages/ResultsDashboard/ResultsDashboard";
import MentorView from "./pages/MentorView/MentorView";

const initialSettings = {
  track: "frontend",
  level: "Junior",
  mode: "quick",
};

const navItems = [
  { id: "landing", label: "Landing" },
  { id: "setup", label: "Setup" },
  { id: "questionBase", label: "Question Base" },
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
    rewarded: false,
    xp: 360,
    streak: 4,
  };
}

function App() {
  const [page, setPage] = useState("landing");
  const [playerProfile, setPlayerProfile] = useState(null);
  const [settings, setSettings] = useState(initialSettings);
  const [session, setSession] = useState(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  const previewQuestions = useMemo(() => buildQuestions(settings), [settings]);
  const playerProgress = useMemo(
    () => getPlayerProgress(playerProfile?.xp || 0),
    [playerProfile?.xp]
  );
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

  function registerPlayer(profile) {
    setPlayerProfile(profile);
    setSettings((current) => ({
      ...current,
      track: profile.track,
      level: profile.level,
    }));
    setPage("setup");
  }

  function loginPlayer(credentials) {
    const emailName = credentials.email.split("@")[0] || "candidate";
    const profile = createPlayerProfile({
      name: emailName
        .split(/[._-]/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ") || "Returning Candidate",
      email: credentials.email,
      track: settings.track,
      level: settings.level,
      goal: "Junior developer role",
      weeklyTarget: "steady",
    });

    setPlayerProfile(profile);
    setPage("setup");
  }

  function loadDemoSession() {
    const demoSettings = { track: "frontend", level: "Junior", mode: "quick" };
    const nextSession = createSession(demoSettings);
    const demoAnswers = createDemoAnswers(nextSession.questions);
    const demoProfile = createPlayerProfile({
      name: "Maksym Demo",
      email: "candidate@webchamp.demo",
      track: "frontend",
      level: "Junior",
      goal: "Junior developer role",
      weeklyTarget: "sprint",
    });

    setPlayerProfile({
      ...demoProfile,
      xp: 980,
      streak: 8,
      completedSessions: 3,
      achievements: ["question-scout", "first-run", "mentor-ready", "structured-answer"],
    });
    setSettings(demoSettings);
    setSession({
      ...nextSession,
      answers: demoAnswers,
      rewarded: true,
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
      finishSession();
      return;
    }

    setActiveQuestionIndex((index) => index + 1);
  }

  function finishSession() {
    if (!session) {
      setPage("results");
      return;
    }

    if (!session.rewarded && playerProfile) {
      setPlayerProfile((current) => awardSessionXp(current, session.answers, true));
      setSession((current) => ({ ...current, rewarded: true }));
    }

    setPage("results");
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
    setPlayerProfile(null);
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

        <div className="header-actions" aria-label="Account actions">
          <button
            className={page === "login" ? "nav-link auth-link active" : "nav-link auth-link"}
            type="button"
            onClick={() => setPage("login")}
          >
            Log in
          </button>
          <button
            className={page === "register" ? "nav-link auth-link primary active" : "nav-link auth-link primary"}
            type="button"
            onClick={() => setPage("register")}
          >
            Register
          </button>
        </div>
      </header>

      <main>
        {page === "landing" && (
          <LandingPage
            onStart={() => setPage("register")}
            onOpenQuestionBase={() => setPage("questionBase")}
            onLoadDemo={loadDemoSession}
          />
        )}

        {page === "register" && (
          <RegistrationPage
            onRegister={registerPlayer}
            onLoadDemo={loadDemoSession}
            onOpenLogin={() => setPage("login")}
          />
        )}

        {page === "login" && (
          <LoginPage
            onLogin={loginPlayer}
            onLoadDemo={loadDemoSession}
            onOpenRegister={() => setPage("register")}
          />
        )}

        {page === "setup" && (
          <SetupPage
            settings={settings}
            questions={previewQuestions}
            playerProfile={playerProfile}
            onUpdateSetting={updateSetting}
            onStart={() => startSession(settings)}
            onLoadDemo={loadDemoSession}
          />
        )}

        {page === "questionBase" && (
          <QuestionBasePage onStartPractice={() => setPage("register")} />
        )}

        {page === "interview" && (
          <InterviewRoom
            session={session}
            activeQuestionIndex={activeQuestionIndex}
            onSaveAnswer={saveAnswer}
            onNext={goToNextQuestion}
            onBackToSetup={() => setPage("setup")}
            onFinish={finishSession}
          />
        )}

        {page === "results" && (
          <ResultsDashboard
            session={session}
            playerProfile={playerProfile}
            playerProgress={playerProgress}
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
            playerProfile={playerProfile}
            playerProgress={playerProgress}
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
