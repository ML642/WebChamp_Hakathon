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
];

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
