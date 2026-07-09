export const tracks = [
  {
    id: "frontend",
    title: "Frontend",
    role: "Junior Frontend Developer",
    summary: "React, JavaScript, UI states, accessibility, browser APIs.",
    skills: ["React", "JavaScript", "CSS", "Accessibility"],
  },
  {
    id: "backend",
    title: "Backend Python",
    role: "Junior Backend Developer",
    summary: "REST APIs, database basics, auth, background processing.",
    skills: ["Python", "REST", "SQL", "Auth"],
  },
  {
    id: "ux",
    title: "UI/UX",
    role: "Product Designer",
    summary: "User flows, research, design systems, product metrics.",
    skills: ["Flows", "Research", "Systems", "Metrics"],
  },
  {
    id: "qa",
    title: "QA",
    role: "Junior QA Engineer",
    summary: "Test planning, bug reports, regression risk, automation scope.",
    skills: ["Testing", "Bugs", "Risk", "Automation"],
  },
];

export const levels = ["Trainee", "Junior", "Middle"];

export const modes = [
  {
    id: "quick",
    title: "Fast start",
    summary: "Three balanced questions for a short demo run.",
  },
  {
    id: "topic",
    title: "Topic focus",
    summary: "More depth in the selected track.",
  },
  {
    id: "soft",
    title: "Soft skills",
    summary: "Behavioral answers with a simple STAR structure.",
  },
];

export const gameLevels = [
  {
    level: 1,
    title: "New Challenger",
    minXp: 0,
    perk: "Create a profile and start practice runs.",
    reward: "Question Scout badge",
  },
  {
    level: 2,
    title: "Prepared Speaker",
    minXp: 250,
    perk: "Unlock self-review streak tracking.",
    reward: "Daily quest board",
  },
  {
    level: 3,
    title: "Structured Thinker",
    minXp: 600,
    perk: "Unlock mentor packet summaries.",
    reward: "Mentor Ready badge",
  },
  {
    level: 4,
    title: "Interview Climber",
    minXp: 1050,
    perk: "Unlock advanced question packs.",
    reward: "Advanced practice mode",
  },
  {
    level: 5,
    title: "Demo Finalist",
    minXp: 1600,
    perk: "Unlock showcase-ready progress profile.",
    reward: "Finalist profile frame",
  },
];

export const weeklyTargets = [
  { id: "light", title: "Light", sessions: 2, xpBoost: 0, summary: "Two calm sessions per week." },
  { id: "steady", title: "Steady", sessions: 4, xpBoost: 80, summary: "Enough repetition to build confidence." },
  { id: "sprint", title: "Sprint", sessions: 6, xpBoost: 160, summary: "Hackathon-style focused prep." },
];

export const profileGoals = [
  "First internship interview",
  "Junior developer role",
  "University project defense",
  "Career switch interview",
];

export const achievementCatalog = [
  {
    id: "first-run",
    title: "First Run",
    description: "Complete your first mock interview session.",
    xp: 120,
  },
  {
    id: "mentor-ready",
    title: "Mentor Ready",
    description: "Generate a private mentor review link.",
    xp: 90,
  },
  {
    id: "structured-answer",
    title: "Structured Answer",
    description: "Mark topic, structure, and timing in self-review.",
    xp: 80,
  },
  {
    id: "question-scout",
    title: "Question Scout",
    description: "Explore the curated question library.",
    xp: 50,
  },
];

export const trainingQuestCatalog = [
  {
    id: "warmup",
    title: "Warm-up answer",
    summary: "Record one answer with a clear opening sentence.",
    xp: 70,
    target: 1,
  },
  {
    id: "structure",
    title: "Structure check",
    summary: "Mark topic, structure, and timing in self-review.",
    xp: 90,
    target: 3,
  },
  {
    id: "mentor",
    title: "Mentor packet",
    summary: "Generate the private review link and copy the review packet.",
    xp: 110,
    target: 1,
  },
  {
    id: "streak",
    title: "Streak builder",
    summary: "Keep the weekly practice target alive.",
    xp: 80,
    target: 4,
  },
];

export const pitchCards = [
  {
    label: "Problem",
    title: "Passive prep does not build interview confidence.",
    text: "Students often read answers, but rarely practice speaking clearly under time pressure.",
  },
  {
    label: "Solution",
    title: "Practice like a real call, then review what happened.",
    text: "The MVP guides a candidate through timed answers, self-review, model answers, and mentor feedback.",
  },
  {
    label: "Impact",
    title: "Better communication, not just memorized knowledge.",
    text: "Juniors train structure, pacing, confidence, and the habit of asking for targeted feedback.",
  },
];

export const roadmap = [
  "Signed backend mentor links with object storage for video files",
  "Speech-rate and clarity hints after the human feedback loop is stable",
  "Community question packs curated by mentors and universities",
  "Spaced repetition based on easy, medium, hard self-review",
];

export const questionBank = [
  {
    id: "fe-state",
    track: "frontend",
    level: "Junior",
    topic: "React",
    title: "State ownership in React",
    prompt:
      "A child component needs to update data that is also used by a sibling. Where should the state live, and why?",
    answerPlan: [
      "Lift shared state to the closest common parent.",
      "Pass data down as props and updates through callbacks.",
      "Keep one source of truth so the UI is easier to debug.",
    ],
    model:
      "The shared value should usually live in the closest common parent. That parent owns the source of truth, passes values down through props, and exposes callbacks for updates.",
  },
  {
    id: "fe-loading",
    track: "frontend",
    level: "Junior",
    topic: "JavaScript",
    title: "Loading and error states",
    prompt:
      "How would you design a React screen that loads data from an API and can fail?",
    answerPlan: [
      "Model idle, loading, success, empty, and error states.",
      "Make retry visible and keep error copy specific.",
      "Guard against stale requests when filters change quickly.",
    ],
    model:
      "I would treat request status as explicit UI state. The screen should show loading, success, empty, and error states, include retry, and avoid stale data from older requests.",
  },
  {
    id: "fe-accessibility",
    track: "frontend",
    level: "Junior",
    topic: "Accessibility",
    title: "Accessible action cards",
    prompt:
      "A clickable card behaves like a button. How do you implement it accessibly?",
    answerPlan: [
      "Use a real button when the element performs an action.",
      "Preserve keyboard and focus behavior.",
      "Give the control a clear accessible name.",
    ],
    model:
      "If the element triggers an action, I would use a real button and style it as a card. That gives semantics, focus, and keyboard support without extra custom code.",
  },
  {
    id: "fe-effects",
    track: "frontend",
    level: "Junior",
    topic: "React",
    title: "Cleaning up effects",
    prompt:
      "A component starts a timer inside useEffect. What problem appears if you do not clean it up?",
    answerPlan: [
      "Name the leaked timer or duplicate subscription.",
      "Return a cleanup function from useEffect.",
      "Explain unmounts and dependency changes.",
    ],
    model:
      "Without cleanup, a timer can continue after unmount or be duplicated after dependency changes. I would return a cleanup function from useEffect to clear the timer.",
  },
  {
    id: "fe-form-validation",
    track: "frontend",
    level: "Junior",
    topic: "Forms",
    title: "Client and server validation",
    prompt:
      "How would you handle validation in a registration form?",
    answerPlan: [
      "Use client validation for fast feedback.",
      "Treat server validation as the source of truth.",
      "Show clear field-level errors.",
    ],
    model:
      "Client validation catches obvious mistakes quickly, but server validation is still the source of truth. I would show field-level errors and preserve user input.",
  },
  {
    id: "fe-performance",
    track: "frontend",
    level: "Middle",
    topic: "Performance",
    title: "Avoiding unnecessary renders",
    prompt:
      "A React dashboard gets slow when filters update. What would you check before adding memoization everywhere?",
    answerPlan: [
      "Profile first to find the real bottleneck.",
      "Check list rendering, derived data, and state ownership.",
      "Memoize only expensive work with stable inputs.",
    ],
    model:
      "I would profile first, then inspect list rendering, derived calculations, and whether state is too high in the tree. Memoization helps when the inputs are stable and the work is actually expensive.",
  },
  {
    id: "fe-responsive-layout",
    track: "frontend",
    level: "Trainee",
    topic: "CSS",
    title: "Grid versus Flexbox",
    prompt:
      "When would you choose CSS Grid instead of Flexbox for a dashboard?",
    answerPlan: [
      "Use Grid for two-dimensional layout.",
      "Use Flexbox for one-dimensional alignment.",
      "Define stable responsive constraints.",
    ],
    model:
      "Grid is better when rows and columns need to align as a system. Flexbox is better for a toolbar or a single-direction list. For dashboards, I would use grid tracks and responsive constraints.",
  },
  {
    id: "fe-component-api",
    track: "frontend",
    level: "Middle",
    topic: "React",
    title: "Designing a reusable component API",
    prompt:
      "How would you design a Button component that supports variants without becoming hard to maintain?",
    answerPlan: [
      "Keep the public props small and predictable.",
      "Map variants to known styles instead of arbitrary strings.",
      "Document loading, disabled, and icon states.",
    ],
    model:
      "I would define a small set of variants, sizes, and states, then map those props to predictable classes. The component should cover disabled, loading, and icon cases without exposing every internal style detail.",
  },
  {
    id: "fe-ui-testing",
    track: "frontend",
    level: "Junior",
    topic: "Testing",
    title: "Testing a filterable list",
    prompt:
      "How would you test a page where users search and filter interview questions?",
    answerPlan: [
      "Test the default list count and visible content.",
      "Simulate search and filter changes like a user.",
      "Assert empty and reset states.",
    ],
    model:
      "I would render the page, assert the initial questions, type into search, click filters, and check that the visible results update. I would also cover the empty state and reset behavior.",
  },
  {
    id: "be-private-link",
    track: "backend",
    level: "Junior",
    topic: "Storage",
    title: "Private mentor links",
    prompt:
      "How would you store recorded answers and share them privately with a mentor?",
    answerPlan: [
      "Store videos in object storage, not directly in a database row.",
      "Store session metadata and comments in a database.",
      "Use signed or unguessable links for mentor access.",
    ],
    model:
      "I would store video files in object storage and keep metadata in a database. The mentor link should be signed or unguessable, and the server should check access before returning video URLs.",
  },
  {
    id: "be-status",
    track: "backend",
    level: "Junior",
    topic: "REST",
    title: "API response design",
    prompt:
      "A mentor comment cannot be saved because the interview session does not exist. What HTTP status should the API return?",
    answerPlan: [
      "Use 404 when the target session resource is missing.",
      "Use 400 or 422 for invalid comment payloads.",
      "Let the client show a broken-link state or form error.",
    ],
    model:
      "If the session id points to no resource, I would return 404 Not Found. If the session exists but the payload is invalid, I would use a validation error response.",
  },
  {
    id: "be-n-plus-one",
    track: "backend",
    level: "Junior",
    topic: "SQL",
    title: "N plus one queries",
    prompt:
      "An endpoint loads sessions and then runs one query per session to load answers. What is the issue?",
    answerPlan: [
      "Name the N plus one pattern.",
      "Batch related IDs or use a join.",
      "Measure query count before and after.",
    ],
    model:
      "That is an N plus one query pattern. It can become slow as the list grows, so I would batch related data, use a join, or use eager loading.",
  },
  {
    id: "be-background-jobs",
    track: "backend",
    level: "Middle",
    topic: "Async tasks",
    title: "Slow processing in requests",
    prompt:
      "A video upload endpoint also generates thumbnails and blocks for 20 seconds. How would you redesign it?",
    answerPlan: [
      "Return quickly after storing the upload.",
      "Move slow processing to a background job.",
      "Expose status and retry behavior.",
    ],
    model:
      "The request should store the upload and return a resource id quickly. Thumbnail generation belongs in a background worker with status tracking and retries.",
  },
  {
    id: "be-auth-session",
    track: "backend",
    level: "Junior",
    topic: "Auth",
    title: "Keeping a user logged in",
    prompt:
      "How would you keep a user logged in safely after they sign in?",
    answerPlan: [
      "Create a server-controlled session.",
      "Use HTTP-only secure cookies in production.",
      "Expire sessions and avoid browser-readable secret storage.",
    ],
    model:
      "A common approach is a server-side session with an HTTP-only secure cookie. The cookie should have proper SameSite and expiration settings, and sensitive tokens should not be readable by client scripts.",
  },
  {
    id: "be-upload-limits",
    track: "backend",
    level: "Junior",
    topic: "Storage",
    title: "Handling large uploads",
    prompt:
      "A user uploads a video answer that is too large. What should the API and UI do?",
    answerPlan: [
      "Enforce clear size and type limits on the backend.",
      "Return a helpful error status.",
      "Offer recovery paths like shorter recording or transcript-only mode.",
    ],
    model:
      "The backend should enforce size and type limits, often returning 413 for payloads that are too large. The UI should explain the limit and offer a recovery path.",
  },
  {
    id: "be-idempotency",
    track: "backend",
    level: "Middle",
    topic: "Reliability",
    title: "Preventing duplicate submissions",
    prompt:
      "A user double-clicks submit and the same answer is saved twice. How would you prevent that?",
    answerPlan: [
      "Disable repeated submits in the UI.",
      "Use idempotency keys or unique constraints on the backend.",
      "Return the existing result for duplicate safe requests.",
    ],
    model:
      "I would prevent double submit in the UI, but the backend must still be safe. An idempotency key or unique constraint can make repeated requests return the same saved answer instead of creating duplicates.",
  },
  {
    id: "be-rate-limits",
    track: "backend",
    level: "Junior",
    topic: "Security",
    title: "Rate limiting auth endpoints",
    prompt:
      "Why should sign-in and mentor-link endpoints have rate limits?",
    answerPlan: [
      "Protect against brute force and token guessing.",
      "Apply limits by IP, user, or token scope.",
      "Return clear but not overly detailed errors.",
    ],
    model:
      "Rate limits reduce brute-force sign-in attempts and token guessing. I would apply scoped limits and return a generic error so the API protects users without leaking useful attack details.",
  },
  {
    id: "ux-anxiety",
    track: "ux",
    level: "Junior",
    topic: "User flow",
    title: "Reducing camera anxiety",
    prompt:
      "A student feels nervous about recording. How would you design the first minute?",
    answerPlan: [
      "Show the next step clearly before recording starts.",
      "Give camera preview and obvious start or stop controls.",
      "Make privacy and retry behavior visible.",
    ],
    model:
      "The first minute should feel controlled. I would show the flow, allow preview, make recording state obvious, and let the student retry before sharing anything.",
  },
  {
    id: "ux-metrics",
    track: "ux",
    level: "Middle",
    topic: "Product metrics",
    title: "Measuring product value",
    prompt:
      "Which metrics would show that an interview practice product is actually useful?",
    answerPlan: [
      "Track completed practice sessions.",
      "Track repeat sessions and mentor feedback activity.",
      "Avoid relying only on signups or page views.",
    ],
    model:
      "I would track completion, repeat practice, mentor comments, and whether users improve self-review scores over time. Pure signups are too shallow.",
  },
  {
    id: "ux-empty-state",
    track: "ux",
    level: "Junior",
    topic: "UX writing",
    title: "Helpful empty states",
    prompt:
      "A review dashboard has no recorded answers yet. What should the empty state communicate?",
    answerPlan: [
      "Explain what is missing.",
      "Give one clear next action.",
      "Avoid blaming the user.",
    ],
    model:
      "A helpful empty state explains the current situation and gives one clear next action. It should reduce anxiety, not make the user feel stuck.",
  },
  {
    id: "ux-usability-test",
    track: "ux",
    level: "Junior",
    topic: "Research",
    title: "Testing the first session",
    prompt:
      "How would you run a quick usability test for the first interview practice flow?",
    answerPlan: [
      "Give a realistic task.",
      "Observe without leading the user.",
      "Capture completion, confusion, and confidence.",
    ],
    model:
      "I would ask a target user to choose a role, record one answer, review it, and create a mentor link while I observe where they pause or misunderstand labels.",
  },
  {
    id: "ux-design-system",
    track: "ux",
    level: "Middle",
    topic: "Design systems",
    title: "Scaling component consistency",
    prompt:
      "A product grows from one dashboard to ten screens. How do you keep the UI consistent?",
    answerPlan: [
      "Define reusable components with documented states.",
      "Keep spacing, typography, and interaction rules explicit.",
      "Audit real screens instead of designing in isolation.",
    ],
    model:
      "I would create a small component system with clear states like loading, empty, error, selected, and disabled. Then I would audit real screens to make sure the system fits actual product needs.",
  },
  {
    id: "ux-accessibility-flow",
    track: "ux",
    level: "Junior",
    topic: "Accessibility",
    title: "Designing for camera anxiety",
    prompt:
      "How would you design recording for users who feel anxious about being on camera?",
    answerPlan: [
      "Give control before recording starts.",
      "Show clear privacy and recording state.",
      "Allow retry and transcript-only fallback.",
    ],
    model:
      "I would provide preview, clear start and stop controls, visible privacy status, and retry. A transcript-only fallback keeps practice useful even when camera feels uncomfortable.",
  },
  {
    id: "ux-prioritization",
    track: "ux",
    level: "Middle",
    topic: "Product strategy",
    title: "Choosing the MVP flow",
    prompt:
      "A team wants profiles, leaderboards, real video upload, and AI scoring. What would you keep for the MVP?",
    answerPlan: [
      "Keep the smallest complete user story.",
      "Prioritize setup, answer, review, and mentor feedback.",
      "Move expensive or risky ideas to roadmap.",
    ],
    model:
      "I would keep one complete practice flow: choose a track, answer timed questions, review results, and share a mentor link. Real storage, leaderboards, and AI scoring can come after the loop is proven.",
  },
  {
    id: "ux-handoff",
    track: "ux",
    level: "Junior",
    topic: "Handoff",
    title: "Design handoff for developers",
    prompt:
      "What should a designer include when handing off the interview results dashboard?",
    answerPlan: [
      "Show responsive layouts and component states.",
      "Define content rules for long transcripts and empty answers.",
      "Explain interaction behavior for review controls.",
    ],
    model:
      "I would include responsive layouts, spacing and component states, empty and long-content examples, and notes for interactions like difficulty selection and mentor comments.",
  },
  {
    id: "qa-camera",
    track: "qa",
    level: "Junior",
    topic: "Test planning",
    title: "Testing mentor link flow",
    prompt:
      "How would you test private mentor links before a demo?",
    answerPlan: [
      "Test the happy path from setup to mentor comment.",
      "Test broken token and missing-answer states.",
      "Test camera denied and transcript-only fallback.",
    ],
    model:
      "I would test creating a link, opening it, reviewing answers, saving a mentor comment, refreshing, and returning to the student dashboard. I would also test fake tokens and camera denied states.",
  },
  {
    id: "qa-priority",
    track: "qa",
    level: "Junior",
    topic: "Bug triage",
    title: "Prioritizing launch bugs",
    prompt:
      "Two bugs remain before demo: mentor comments sometimes fail, and a badge icon is misaligned. What do you prioritize?",
    answerPlan: [
      "Prioritize the core user flow.",
      "Explain user impact and demo risk.",
      "Defer cosmetic issues when they do not block value.",
    ],
    model:
      "I would prioritize mentor comments because feedback is part of the core value. A misaligned badge is visible, but it does not block the product story.",
  },
  {
    id: "qa-regression",
    track: "qa",
    level: "Junior",
    topic: "Regression",
    title: "Choosing regression tests",
    prompt:
      "A small release changes the recording screen. Which regression tests would you run first?",
    answerPlan: [
      "Cover the main setup to results path.",
      "Include denied camera or transcript-only fallback.",
      "Check that saved answers still appear in results.",
    ],
    model:
      "I would run the main flow first: setup, mock recording, save answer, results, and mentor review. Then I would test denied camera and missing-answer states.",
  },
  {
    id: "qa-automation-scope",
    track: "qa",
    level: "Middle",
    topic: "Automation",
    title: "What to automate first",
    prompt:
      "Which parts of this interview coach would you automate, and which would you leave manual?",
    answerPlan: [
      "Automate deterministic state transitions.",
      "Mock browser-specific media behavior.",
      "Leave real camera quality checks manual.",
    ],
    model:
      "I would automate setup choices, saved results, mentor comments, and empty states. Real camera quality and hardware behavior should remain partly manual.",
  },
  {
    id: "qa-timer-edge-cases",
    track: "qa",
    level: "Junior",
    topic: "Risk",
    title: "Timer edge cases",
    prompt:
      "What edge cases would you test for a two-minute answer timer?",
    answerPlan: [
      "Test start, skip prep, stop, and timeout boundaries.",
      "Check double-clicks and tab switching.",
      "Verify saved duration and answer status.",
    ],
    model:
      "I would test starting immediately, skipping prep, stopping near zero, auto-stop at timeout, double-clicking controls, and whether the saved result matches the timer state.",
  },
  {
    id: "qa-bug-report",
    track: "qa",
    level: "Trainee",
    topic: "Bug reports",
    title: "Useful camera bug report",
    prompt:
      "What information should be in a bug report for a broken camera permission flow?",
    answerPlan: [
      "Include reproduction steps and expected versus actual behavior.",
      "Include browser, OS, device, and permission state.",
      "Attach evidence such as screenshots or console errors.",
    ],
    model:
      "A useful report includes steps, expected and actual results, environment, permission state, evidence, and severity. For camera features, HTTPS and browser support matter.",
  },
  {
    id: "qa-flaky-tests",
    track: "qa",
    level: "Middle",
    topic: "Automation",
    title: "Debugging flaky tests",
    prompt:
      "A timer test passes locally but fails in CI. How would you investigate it?",
    answerPlan: [
      "Check timing assumptions and async waits.",
      "Use fake timers or deterministic state where possible.",
      "Collect CI logs, screenshots, and retry evidence.",
    ],
    model:
      "I would look for real-time assumptions, missing awaits, or environment differences. For timer behavior, fake timers or deterministic state make the test more reliable than waiting for wall-clock time.",
  },
  {
    id: "qa-test-data",
    track: "qa",
    level: "Junior",
    topic: "Test data",
    title: "Creating useful demo test data",
    prompt:
      "What test data would you prepare before presenting an interview coach MVP?",
    answerPlan: [
      "Create at least one complete session with answers.",
      "Include missing-answer and mentor-comment states.",
      "Use realistic names, questions, and transcripts.",
    ],
    model:
      "I would prepare a complete happy-path session, one partial session, and a mentor-reviewed session. Realistic transcripts and prompts make the demo easier to trust.",
  },
  {
    id: "soft-feedback",
    track: "soft",
    level: "Junior",
    topic: "Behavioral",
    title: "Receiving difficult feedback",
    prompt:
      "Tell me about a time you received feedback that was hard to hear.",
    answerPlan: [
      "Use STAR: situation, task, action, result.",
      "Show maturity instead of defensiveness.",
      "Name a concrete behavior change.",
    ],
    model:
      "A strong answer explains the feedback, how you processed it professionally, what action you took, and how the next collaboration improved because of it.",
  },
  {
    id: "soft-unknown-answer",
    track: "soft",
    level: "Junior",
    topic: "Behavioral",
    title: "Handling an unknown answer",
    prompt:
      "Tell me about a time you did not know the answer to a technical question. What did you do?",
    answerPlan: [
      "Be honest without giving up.",
      "Clarify the question and reason from what you know.",
      "Follow up with what you learned afterward.",
    ],
    model:
      "A strong answer shows honesty, reasoning, and follow-up. It is better to explain how you think and learn than to pretend you know everything.",
  },
  {
    id: "soft-conflict",
    track: "soft",
    level: "Junior",
    topic: "Behavioral",
    title: "Handling team conflict",
    prompt:
      "Tell me about a time you disagreed with a teammate about a technical or design decision.",
    answerPlan: [
      "Describe the disagreement without blaming the teammate.",
      "Explain how you compared options with evidence.",
      "End with the decision and what you learned.",
    ],
    model:
      "A strong answer shows calm communication, evidence-based decision-making, and respect for the team. The goal is to show how you disagree productively.",
  },
  {
    id: "soft-deadline",
    track: "soft",
    level: "Junior",
    topic: "Behavioral",
    title: "Working under deadline pressure",
    prompt:
      "Tell me about a time you had too much to do before a deadline. How did you decide what mattered most?",
    answerPlan: [
      "Clarify the goal and constraints.",
      "Prioritize core user value before polish.",
      "Communicate tradeoffs early.",
    ],
    model:
      "A strong answer explains how you identified the essential outcome, reduced scope responsibly, communicated tradeoffs, and still delivered useful work.",
  },
];

export function getWeeklyTarget(targetId) {
  return weeklyTargets.find((target) => target.id === targetId) || weeklyTargets[1];
}

export function getPlayerProgress(xp = 0) {
  const current = [...gameLevels].reverse().find((level) => xp >= level.minXp) || gameLevels[0];
  const next = gameLevels.find((level) => level.minXp > xp) || null;
  const previousMin = current.minXp;
  const nextMin = next?.minXp || current.minXp + 650;
  const progress = Math.min(100, Math.round(((xp - previousMin) / (nextMin - previousMin)) * 100));

  return {
    current,
    next,
    progress,
    xpToNext: next ? next.minXp - xp : 0,
  };
}

export function getLevelLadder(xp = 0) {
  return gameLevels.map((level) => {
    const next = gameLevels.find((item) => item.minXp > level.minXp);
    const cap = next ? next.minXp : level.minXp + 650;
    const progress = Math.min(100, Math.max(0, Math.round(((xp - level.minXp) / (cap - level.minXp)) * 100)));

    return {
      ...level,
      unlocked: xp >= level.minXp,
      progress,
    };
  });
}

export function getTrainingQuests(profile, session) {
  const answers = session?.answers || [];
  const completeChecklistCount = answers.filter((answer) =>
    Object.values(answer.checklist || {}).every(Boolean)
  ).length;

  return trainingQuestCatalog.map((quest) => {
    const progressMap = {
      warmup: answers.length,
      structure: completeChecklistCount,
      mentor: session?.mentorToken ? 1 : 0,
      streak: profile?.streak || 0,
    };
    const progress = Math.min(quest.target, progressMap[quest.id] || 0);

    return {
      ...quest,
      progress,
      complete: progress >= quest.target,
    };
  });
}

export function createPlayerProfile(form) {
  const weeklyTarget = getWeeklyTarget(form.weeklyTarget);
  const startingXp = 120 + weeklyTarget.xpBoost;
  const displayName = (form.name || form.nickname || "").trim() || "Demo Candidate";

  return {
    id: `player-${Date.now()}`,
    name: displayName,
    nickname: form.nickname?.trim() || displayName,
    email: form.email?.trim() || "candidate@answerly.demo",
    goal: form.goal,
    studying: form.studying?.trim() || form.goal,
    track: form.track,
    level: form.level,
    weeklyTarget: weeklyTarget.id,
    xp: startingXp,
    streak: weeklyTarget.sessions >= 4 ? 3 : 1,
    completedSessions: 0,
    achievements: ["question-scout"],
  };
}

export function awardSessionXp(profile, answers = [], hasMentorLink = false) {
  if (!profile) {
    return null;
  }

  const completeChecklistCount = answers.filter((answer) =>
    Object.values(answer.checklist || {}).every(Boolean)
  ).length;
  const earnedXp = 140 + answers.length * 55 + completeChecklistCount * 25 + (hasMentorLink ? 90 : 0);
  const achievements = new Set(profile.achievements);

  if (answers.length > 0) {
    achievements.add("first-run");
  }
  if (hasMentorLink) {
    achievements.add("mentor-ready");
  }
  if (completeChecklistCount > 0) {
    achievements.add("structured-answer");
  }

  return {
    ...profile,
    xp: profile.xp + earnedXp,
    streak: profile.streak + 1,
    completedSessions: profile.completedSessions + 1,
    achievements: Array.from(achievements),
  };
}

export function getTrack(trackId) {
  return tracks.find((track) => track.id === trackId) || tracks[0];
}

export function getMode(modeId) {
  return modes.find((mode) => mode.id === modeId) || modes[0];
}

export function buildQuestions(settings) {
  const trackQuestions = questionBank.filter((question) => question.track === settings.track);
  const softQuestion = questionBank.find((question) => question.track === "soft");

  if (settings.mode === "soft") {
    return [trackQuestions[0], softQuestion, trackQuestions[1]].filter(Boolean).slice(0, 3);
  }

  if (settings.mode === "topic") {
    return trackQuestions.slice(0, 3);
  }

  return [trackQuestions[0], trackQuestions[1], softQuestion || trackQuestions[2]]
    .filter(Boolean)
    .slice(0, 3);
}

export function createMockAnswer(question, draft, index = 0) {
  const transcript =
    draft?.trim() ||
    `${question.model} I would keep the answer concise, name the tradeoff, and connect it to user impact.`;
  const words = transcript.trim().split(/\s+/).filter(Boolean).length;
  const duration = Math.max(48, Math.min(118, 68 + index * 14 + Math.round(words / 4)));
  const wpm = Math.round((words / duration) * 60);
  const score = Math.min(96, 58 + Math.round(words / 3) + (duration <= 120 ? 12 : 0));

  return {
    questionId: question.id,
    transcript,
    duration,
    words,
    wpm,
    score,
    videoStatus: "Mock recording saved",
    videoLabel: "Demo video placeholder",
    checklist: {
      topic: true,
      structure: true,
      timing: duration <= 120,
    },
    difficulty: "medium",
    repeatIn: "3 days",
  };
}

export function createDemoAnswers(questions) {
  return questions.map((question, index) =>
    createMockAnswer(
      question,
      `${question.model} In my own answer, I would first state the decision, then explain the tradeoff, then give one project-style example. That keeps the answer practical for a junior interview.`,
      index
    )
  );
}

export function createMockHistorySessions() {
  const configs = [
    {
      id: "mock-history-frontend-01",
      settings: { track: "frontend", level: "Junior", mode: "quick" },
      playerName: "Maksym Demo",
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      mentorToken: "mentor-fe-24",
      xp: 620,
      streak: 6,
    },
    {
      id: "mock-history-backend-01",
      settings: { track: "backend", level: "Junior", mode: "topic" },
      playerName: "Maksym Demo",
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
      mentorToken: "mentor-be-18",
      xp: 540,
      streak: 5,
    },
    {
      id: "mock-history-ux-01",
      settings: { track: "ux", level: "Trainee", mode: "soft" },
      playerName: "Maksym Demo",
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      mentorToken: "mentor-ux-09",
      xp: 410,
      streak: 3,
    },
  ];

  return configs.map((config) => {
    const questions = buildQuestions(config.settings);

    return {
      ...config,
      questions,
      answers: createDemoAnswers(questions),
      mentorComments: {},
      rewarded: true,
    };
  });
}
