import { useEffect, useMemo, useState } from "react";
import { CircleUserRound } from "lucide-react";
import "./App.css";
import {
  awardSessionXp,
  buildQuestions,
  createDemoAnswers,
  createMockHistorySessions,
  createPlayerProfile,
  getPlayerProgress,
} from "./data/mockData";
import { authApi, interviewApi } from "./api/client";
import LandingPage from "./pages/LandingPage/LandingPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegistrationPage from "./pages/RegistrationPage/RegistrationPage";
import SetupPage from "./pages/SetupPage/SetupPage";
import QuestionBasePage from "./pages/QuestionBasePage/QuestionBasePage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import InterviewRoom from "./pages/InterviewRoom/InterviewRoom";
import ResultsDashboard from "./pages/ResultsDashboard/ResultsDashboard";
import MentorView from "./pages/MentorView/MentorView";
import HistoryPage from "./pages/HistoryPage/HistoryPage";

const initialSettings = {
  track: "frontend",
  level: "Junior",
  mode: "quick",
};

const publicNavItems = [
  { id: "landing", label: "Home" },
  { id: "questionBase", label: "Questions" },
];

const authNavItems = [
  { id: "setup", label: "Practice Setup" },
  { id: "interview", label: "Mock Room" },
  { id: "results", label: "Insights" },
  { id: "history", label: "History" },
  { id: "mentor", label: "Mentor Review" },
];

const historyStorageKey = "answerlyInterviewHistory";

function readStoredHistory() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(historyStorageKey);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) && parsed.length ? parsed : createMockHistorySessions();
  } catch {
    return createMockHistorySessions();
  }
}

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
  const [history, setHistory] = useState(readStoredHistory);

  const previewQuestions = useMemo(() => buildQuestions(settings), [settings]);
  const playerProgress = useMemo(
    () => getPlayerProgress(playerProfile?.xp || 0),
    [playerProfile?.xp]
  );
  const mentorLink = session ? `https://answerly.demo/review/${session.mentorToken}` : "";

  useEffect(() => {
    try {
      window.localStorage.setItem(historyStorageKey, JSON.stringify(history));
    } catch {
      // Local storage can be unavailable in private or restricted environments.
    }
  }, [history]);

  function storeHistorySession(nextSession, profile = playerProfile) {
    const archivedSession = {
      ...nextSession,
      completedAt: nextSession.completedAt || new Date().toISOString(),
      playerName: profile?.name || nextSession.playerName || "Candidate",
    };

    setHistory((current) => [
      archivedSession,
      ...current.filter((item) => item.id !== archivedSession.id),
    ].slice(0, 20));

    return archivedSession;
  }

  function updateSetting(key, value) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function startSession(nextSettings = settings) {
    try {
      const response = await interviewApi.start(
        nextSettings.track,
        nextSettings.level,
        nextSettings.mode
      );
      
      const nextSession = {
        id: response.id,
        settings: nextSettings,
        questions: response.questions,
        answers: [],
        mentorComments: {},
        mentorToken: null,
        rewarded: false,
        xp: 360,
        streak: 4,
      };

      setSession(nextSession);
      setActiveQuestionIndex(0);
      setPage("interview");
    } catch (err) {
      alert("Failed to start session: " + err.message);
    }
  }

  async function registerPlayer(profile) {
    try {
      const password = profile.password || "password123";
      await authApi.register(profile.email, password);
      
      // Register does not return a token, so we need to login
      const loginResp = await authApi.login(profile.email, password);
      localStorage.setItem("auth_token", loginResp.access_token);
      
      const userResp = await authApi.getMe();
      setPlayerProfile(createPlayerProfile({
        name: userResp.email.split("@")[0],
        email: userResp.email,
        track: profile.track,
        level: profile.level
      }));
      setSettings((current) => ({
        ...current,
        track: profile.track,
        level: profile.level,
      }));
      setPage("setup");
    } catch (err) {
      alert("Registration failed: " + err.message);
    }
  }

  async function loginPlayer(credentials) {
    try {
      const password = credentials.password || "password123";
      const resp = await authApi.login(credentials.email, password);
      localStorage.setItem("auth_token", resp.access_token);
      
      const userResp = await authApi.getMe();
      setPlayerProfile(createPlayerProfile({
        name: userResp.email.split("@")[0],
        email: userResp.email,
        track: settings.track,
        level: settings.level
      }));
      setPage("setup");
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  }

  function loadDemoSession() {
    const demoSettings = { track: "frontend", level: "Junior", mode: "quick" };
    const nextSession = createSession(demoSettings);
    const demoAnswers = createDemoAnswers(nextSession.questions);
    const demoProfile = createPlayerProfile({
      name: "Maksym Demo",
      email: "candidate@answerly.demo",
      track: "frontend",
      level: "Junior",
      goal: "Master React interviews",
      weeklyTarget: "steady",
    });

    setPlayerProfile({
      ...demoProfile,
      xp: 980,
      streak: 8,
      completedSessions: 3,
      achievements: ["question-scout", "first-run", "mentor-ready", "structured-answer"],
    });
    setSettings(demoSettings);
    const demoSession = {
      ...nextSession,
      answers: demoAnswers,
      rewarded: true,
      mentorComments: {
        [nextSession.questions[0].id]:
          "Strong structure. Next time, add one concrete example from a project to make the answer more memorable.",
      },
      xp: 620,
      streak: 6,
    };

    setSession(storeHistorySession(demoSession, demoProfile));
    setActiveQuestionIndex(0);
    setPage("results");
  }

  function logoutPlayer() {
    localStorage.removeItem("auth_token");
    setPlayerProfile(null);
    setSession(null);
    setPage("landing");
  }

  async function saveAnswer(questionId, draft, audioBlob) {
    if (!session) return;

    const question = session.questions.find((item) => item.id === questionId);
    if (!question) return;

    // Save locally to show in UI immediately
    const answer = {
      id: `ans-${Date.now()}`,
      questionId: question.id,
      transcript: draft,
      score: null, // Will be updated when AI finishes
      isComplete: true,
      timeSpent: 120,
      checklist: { understood: false, structured: false, timing: false },
    };

    setSession((current) => ({
      ...current,
      answers: [
        ...current.answers.filter((item) => item.questionId !== questionId),
        answer,
      ],
    }));

    // Send audio to real backend
    if (audioBlob && session.id) {
      try {
        await interviewApi.submitAnswer(session.id, questionId, audioBlob);
      } catch (err) {
        console.error("Failed to upload audio:", err);
      }
    }
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

    const completedSession = {
      ...session,
      rewarded: true,
      completedAt: session.completedAt || new Date().toISOString(),
    };

    if (!session.rewarded && playerProfile) {
      setPlayerProfile((current) => awardSessionXp(current, session.answers, true));
    }

    setSession(storeHistorySession(completedSession));
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

  function openHistorySession(historySession) {
    setSession(historySession);
    setSettings(historySession.settings || initialSettings);
    setActiveQuestionIndex(0);
    setPage("results");
  }

  function practiceFromHistory(historySession) {
    setSettings(historySession.settings || initialSettings);
    setPage("setup");
  }

  function goToPage(nextPage) {
    const authPages = ["setup", "interview", "results", "history", "mentor"];
    if (authPages.includes(nextPage) && !playerProfile) {
      setPage("login");
      return;
    }

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
          <span className="brand-mark" aria-hidden="true">
            <span className="brand-mark-initial">A</span>
          </span>
          <span className="brand-name">
            <strong>Answerly</strong>
          </span>
        </button>

        <nav className="topnav" aria-label="Primary navigation">
          {publicNavItems.map((item) => {
            if (playerProfile && item.id === "landing") return null;
            return (
              <button
                key={item.id}
                type="button"
                className={page === item.id ? "nav-link active" : "nav-link"}
                onClick={() => goToPage(item.id)}
              >
                {item.label}
              </button>
            );
          })}
          {playerProfile && authNavItems.map((item) => (
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

        <div className={playerProfile ? "header-actions has-account" : "header-actions"} aria-label="Account actions">
          {playerProfile ? (
            <button
              className="account-button"
              type="button"
              onClick={() => setPage("profile")}
              title={`Signed in as ${playerProfile.name}`}
              aria-label={`Signed in as ${playerProfile.name}`}
            >
              <CircleUserRound size={24} strokeWidth={2.2} aria-hidden="true" />
              <span className="account-status-dot" aria-hidden="true" />
            </button>
          ) : (
            <>
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
            </>
          )}
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

        {page === "profile" && (
          <ProfilePage
            playerProfile={playerProfile}
            onBack={() => setPage("setup")}
            onLogout={logoutPlayer}
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

        {page === "history" && (
          <HistoryPage
            history={history}
            onOpenSession={openHistorySession}
            onPracticeAgain={practiceFromHistory}
            onStartPractice={() => setPage("setup")}
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
