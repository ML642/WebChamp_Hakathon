import { useEffect, useMemo, useState } from "react";
import { CircleUserRound } from "lucide-react";
import "./App.css";
import VantaFogBackground from "./components/VantaFogBackground";
import {
  awardSessionXp,
  buildQuestions,
  createDemoAnswers,
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
import AboutPage from "./pages/AboutPage/AboutPage";
import MentorRequests from "./pages/MentorRequests/MentorRequests";

const initialSettings = {
  track: "frontend",
  level: "Junior",
  mode: "quick",
};

const publicNavItems = [
  { id: "landing", label: "Home" },
  { id: "questionBase", label: "Questions" },
  { id: "about", label: "Why Answerly" },
  { id: "publicDemo", label: "Live Demo" },
];

const authNavItems = [
  { id: "setup", label: "Practice Setup" },
  { id: "history", label: "History" },
  { id: "mentorRequests", label: "Review Requests" },
];

const historyStorageKey = "answerlyInterviewHistory";

function getHistoryStorageKey(email) {
  return `${historyStorageKey}:${String(email || "guest").toLowerCase()}`;
}

function readStoredHistory(email) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(getHistoryStorageKey(email));
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
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
  const [history, setHistory] = useState([]);

  const previewQuestions = useMemo(() => buildQuestions(settings), [settings]);
  const playerProgress = useMemo(
    () => getPlayerProgress(playerProfile?.xp || 0),
    [playerProfile?.xp]
  );
  const mentorLink = session ? `https://answerly.demo/review/${session.mentorToken}` : "";

  useEffect(() => {
    if (!playerProfile?.email) return;

    try {
      window.localStorage.setItem(getHistoryStorageKey(playerProfile.email), JSON.stringify(history));
    } catch {
      // Local storage can be unavailable in private or restricted environments.
    }
  }, [history, playerProfile?.email]);
  const syncHistory = async (playerName) => {
    try {
      const backendHistory = await interviewApi.getHistory();
      const mappedHistory = backendHistory.map(interview => ({
        id: interview.id,
        settings: { track: interview.answers[0]?.question.specialization || "frontend", mode: interview.mode, level: interview.answers[0]?.question.level || "Junior" },
        questions: interview.answers.map(ans => ({
          id: ans.question.id,
          topic: ans.question.specialization,
          title: `Question: ${ans.question.level} ${ans.question.mode}`,
          prompt: ans.question.text,
          model: ans.question.reference_answer || "No reference answer available.",
          answerPlan: ["Understand the prompt", "Structure your response", "Provide a concrete example", "Summarize the outcome"],
          timeLimit: 180
        })),
        answers: interview.answers.map(ans => ({
          id: ans.id,
          questionId: ans.question.id,
          transcript: ans.transcript || "",
          score: null,
          isComplete: true,
          timeSpent: 120,
          duration: 60,
          wpm: 120,
          videoUrl: ans.video_s3_key ? `http://localhost:8000/${ans.video_s3_key}` : null,
          videoLabel: "Recorded video",
          checklist: {
            understood: ans.ai_score_understanding || false,
            structured: ans.ai_score_structure || false,
            timing: ans.ai_score_timing || false
          },
          aiFeedback: ans.ai_feedback ? {
            improvement: ans.ai_feedback,
            inaccuracies: "Checked by AI",
            topicsToReview: []
          } : null,
          mentor_comments: ans.mentor_comments || []
        })),
        completedAt: interview.created_at,
        playerName: playerName,
        mentorToken: interview.share_token,
        rewarded: true,
        xp: 360,
        streak: 4
      }));
      
      setHistory(current => {
        const merged = [...mappedHistory, ...current];
        const unique = merged.filter((item, index, self) => self.findIndex(t => t.id === item.id) === index);
        return unique.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)).slice(0, 20);
      });
    } catch (e) {
      console.error("Failed to sync history", e);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      authApi.getMe()
        .then(async userResp => {
          const profile = createPlayerProfile({
            name: userResp.email.split("@")[0],
            email: userResp.email,
            track: "frontend",
            level: "Junior"
          });
          setPlayerProfile(profile);
          setHistory(readStoredHistory(profile.email));
          await syncHistory(profile.name);
        })
        .catch(() => {
          localStorage.removeItem("auth_token");
        });
    }
  }, []);

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
      
      const mappedQuestions = response.questions.map((q, idx) => ({
        id: q.id,
        topic: q.specialization,
        title: `Question ${idx + 1}: ${q.level} ${q.mode}`,
        prompt: q.text,
        model: q.reference_answer || "No reference answer available.",
        answerPlan: ["Understand the prompt", "Structure your response", "Provide a concrete example", "Summarize the outcome"],
        timeLimit: 180,
      }));

      const nextSession = {
        id: response.id,
        settings: nextSettings,
        questions: mappedQuestions,
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
      await authApi.register(profile.username || profile.name, profile.email, password);
      
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
      setHistory([]);
      setPage("setup");
    } catch (err) {
      throw err;
    }
  }

  async function loginPlayer(credentials) {
    try {
      const password = credentials.password || "password123";
      const resp = await authApi.login(credentials.email, password);
      localStorage.setItem("auth_token", resp.access_token);
      
      const userResp = await authApi.getMe();
      const profile = createPlayerProfile({
        name: userResp.email.split("@")[0],
        email: userResp.email,
        track: settings.track,
        level: settings.level
      });
      setPlayerProfile(profile);
      setHistory(readStoredHistory(profile.email));
      await syncHistory(profile.name);
      setPage("setup");
    } catch (err) {
      throw err;
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

  function openPublicDemo() {
    const demoSettings = { track: "frontend", level: "Junior", mode: "quick" };
    setSession(createSession(demoSettings));
    setActiveQuestionIndex(0);
    setPage("publicDemo");
  }

  function savePublicDemoAnswer(questionId, draft, audioBlob, stats = {}) {
    if (!session) return;

    setSession((current) => ({
      ...current,
      answers: [
        ...current.answers.filter((answer) => answer.questionId !== questionId),
        {
          id: `public-demo-${Date.now()}`,
          questionId,
          transcript: draft,
          isComplete: true,
          timeSpent: 120,
          duration: stats.duration || 0,
          wpm: stats.wpm || 0,
          selfCheck: stats.selfCheck || "Neutral",
          pauseCount: stats.pauseCount || 0,
          videoUrl: audioBlob ? URL.createObjectURL(audioBlob) : null,
          videoLabel: audioBlob ? "Demo recording" : "No video recorded",
          checklist: { understood: false, structured: false, timing: false },
        },
      ],
    }));
  }

  function goToNextPublicDemoQuestion() {
    if (!session || activeQuestionIndex >= session.questions.length - 1) {
      setSession(null);
      setPage("landing");
      return;
    }

    setActiveQuestionIndex((index) => index + 1);
  }

  function logoutPlayer() {
    localStorage.removeItem("auth_token");
    setPlayerProfile(null);
    setHistory([]);
    setSession(null);
    setPage("landing");
  }

  async function saveAnswer(questionId, draft, audioBlob, stats = {}) {
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
      duration: stats.duration || 0,
      wpm: stats.wpm || 0,
      selfCheck: stats.selfCheck || "Neutral",
      pauseCount: stats.pauseCount || 0,
      videoUrl: audioBlob ? URL.createObjectURL(audioBlob) : null,
      videoLabel: audioBlob ? "Recorded video" : "No video recorded",
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
        const resp = await interviewApi.submitAnswer(session.id, questionId, audioBlob);
        setSession((current) => ({
          ...current,
          answers: current.answers.map((item) =>
            item.questionId === questionId ? { ...item, id: resp.id } : item
          ),
        }));
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

  async function generateShareToken() {
    if (!session || !session.id) return;
    try {
      const response = await interviewApi.share(session.id);
      setSession(current => ({
        ...current,
        mentorToken: response.share_token
      }));
    } catch (err) {
      console.error("Failed to generate share token", err);
    }
  }

  async function fetchDashboard() {
    if (!session || !session.id) return;
    try {
      const dashboard = await interviewApi.getDashboard(session.id);
      
      setSession(current => {
        const nextAnswers = current.answers.map(ans => {
          const remoteAns = dashboard.answers.find(da => da.question.id === ans.questionId);
          if (remoteAns) {
            return {
              ...ans,
              id: remoteAns.id,
              transcript: remoteAns.transcript || ans.transcript,
              score: remoteAns.confidence_score ? Math.round(remoteAns.confidence_score * 100) : ans.score,
              videoUrl: remoteAns.video_s3_key ? `http://localhost:8000/${remoteAns.video_s3_key}` : ans.videoUrl,
              aiFeedback: remoteAns.ai_feedback ? { improvement: remoteAns.ai_feedback, inaccuracies: "Checked by AI", topicsToReview: [] } : ans.aiFeedback,
              checklist: {
                ...ans.checklist,
                understood: remoteAns.ai_score_understanding ?? ans.checklist.understood,
                structured: remoteAns.ai_score_structure ?? ans.checklist.structured,
                timing: remoteAns.ai_score_timing ?? ans.checklist.timing
              },
              mentor_comments: remoteAns.mentor_comments || ans.mentor_comments || []
            };
          }
          return ans;
        });

        return {
          ...current,
          answers: nextAnswers,
          mentorToken: dashboard.share_token || current.mentorToken
        };
      });
    } catch (err) {
      console.error("Failed to fetch dashboard", err);
    }
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
    
    // Poll dashboard to get AI feedback
    if (session.id) {
      setTimeout(fetchDashboard, 2000); // 2s
      setTimeout(fetchDashboard, 6000); // 6s
      setTimeout(fetchDashboard, 15000); // 15s
    }
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
    if (nextPage === "publicDemo") {
      if (playerProfile) {
        setPage("setup");
        return;
      }
      openPublicDemo();
      return;
    }

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
      <VantaFogBackground />
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
            if (playerProfile && (item.id === "landing" || item.id === "publicDemo")) return null;
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
            onGenerateShareToken={generateShareToken}
            onRefreshResults={fetchDashboard}
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

        {page === "mentorRequests" && (
          <MentorRequests />
        )}

        {page === "publicDemo" && (
          <InterviewRoom
            session={session}
            activeQuestionIndex={activeQuestionIndex}
            onSaveAnswer={savePublicDemoAnswer}
            onNext={goToNextPublicDemoQuestion}
            onBackToSetup={() => { setSession(null); setPage("landing"); }}
            onFinish={() => { setSession(null); setPage("landing"); }}
          />
        )}

        {page === "about" && (
          <AboutPage
            playerName={playerProfile?.name}
            isSignedIn={Boolean(playerProfile)}
            onStartPractice={() => setPage(playerProfile ? "setup" : "register")}
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
