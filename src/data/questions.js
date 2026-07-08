export const tracks = [
  {
    id: "frontend",
    title: "Frontend",
    role: "Junior Frontend",
    accent: "emerald",
    summary: "React, JavaScript, browser APIs, UI decisions",
    skills: ["React", "JavaScript", "CSS", "Web APIs"],
  },
  {
    id: "backend",
    title: "Backend Python",
    role: "Junior Backend",
    accent: "sky",
    summary: "API design, data models, async tasks, databases",
    skills: ["Python", "REST", "SQL", "Auth"],
  },
  {
    id: "ux",
    title: "UI/UX",
    role: "Product Designer",
    accent: "amber",
    summary: "User flows, design systems, research, clarity",
    skills: ["Flows", "Research", "Systems", "Metrics"],
  },
  {
    id: "qa",
    title: "QA",
    role: "Junior QA",
    accent: "rose",
    summary: "Test cases, bug reports, risk thinking, automation",
    skills: ["Testing", "Bugs", "Automation", "Risk"],
  },
];

export const modes = [
  {
    id: "quick",
    title: "Fast start",
    summary: "3 balanced questions for a 2 minute demo run",
  },
  {
    id: "topic",
    title: "Topic focus",
    summary: "More technical depth in the selected track",
  },
  {
    id: "soft",
    title: "Soft skills",
    summary: "Behavioral answers with STAR structure",
  },
];

export const levels = ["Trainee", "Junior", "Middle"];

export const questionBank = [
  {
    id: "fe-react-state",
    track: "frontend",
    level: "Junior",
    topic: "React",
    source: "Real-world interview style",
    title: "State ownership in React",
    prompt:
      "A child component needs to update data that is also used by a sibling. Where should the state live, and why?",
    answerPlan: ["Lift shared state to the closest common parent", "Pass data down as props", "Keep update logic explicit"],
    model:
      "The shared value should usually live in the closest common parent of both components. That parent becomes the source of truth, passes the value down through props, and passes callbacks for updates. This keeps sibling components independent and makes data flow easier to debug.",
    rubric: ["Names the common parent", "Explains source of truth", "Mentions callback or state update flow"],
  },
  {
    id: "fe-async-ui",
    track: "frontend",
    level: "Junior",
    topic: "JavaScript",
    source: "Real-world interview style",
    title: "Loading and error states",
    prompt:
      "How would you design a React screen that loads data from an API and can fail?",
    answerPlan: ["Idle, loading, success, empty, error", "Abort or ignore stale requests", "Make retry visible"],
    model:
      "I would model the request as explicit UI states: loading, success, empty, and error. The component should show useful feedback in every state and offer retry on failure. I would also guard against stale requests if filters change quickly, for example with AbortController or a request id.",
    rubric: ["Covers all states", "Explains retry", "Mentions stale request handling"],
  },
  {
    id: "fe-css-layout",
    track: "frontend",
    level: "Trainee",
    topic: "CSS",
    source: "Real-world interview style",
    title: "Responsive layout choice",
    prompt:
      "When would you use CSS Grid instead of Flexbox for a product dashboard?",
    answerPlan: ["Grid for two-dimensional layouts", "Flexbox for one axis", "Use stable constraints"],
    model:
      "Grid is better when the dashboard has rows and columns that must align as a system. Flexbox is better for a single direction, like a toolbar or list. For a dashboard I would use grid tracks, minmax constraints, and responsive breakpoints so panels remain predictable.",
    rubric: ["Separates Grid and Flexbox", "Mentions two-dimensional layout", "Talks about responsiveness"],
  },
  {
    id: "fe-browser-recording",
    track: "frontend",
    level: "Middle",
    topic: "Web APIs",
    source: "Hackathon core feature",
    title: "Recording in the browser",
    prompt:
      "What risks do you expect when building webcam recording with MediaRecorder?",
    answerPlan: ["Permissions and browser support", "Large blobs and storage", "Fallback path"],
    model:
      "The main risks are camera permissions, inconsistent codec support, large video blobs, and upload or storage limits. I would detect MediaRecorder support, keep recordings short, store locally for MVP if needed, and provide an audio or text fallback so the core flow still works.",
    rubric: ["Mentions permissions", "Mentions storage size", "Provides fallback"],
  },
  {
    id: "fe-effects-cleanup",
    track: "frontend",
    level: "Junior",
    topic: "React",
    source: "Curated real-world interview-style question",
    title: "Cleaning up side effects",
    prompt:
      "A component starts a timer inside useEffect. What problem appears if you do not clean it up?",
    answerPlan: ["Name the leaked timer", "Return a cleanup function", "Explain repeated renders and unmounts"],
    model:
      "Without cleanup, a timer can keep running after the component unmounts or can be duplicated when dependencies change. I would return a cleanup function from useEffect, usually clearInterval or clearTimeout. This prevents memory leaks, duplicated updates, and state updates on a component that is no longer mounted.",
    rubric: ["Mentions cleanup return", "Explains unmount or dependency changes", "Names the practical bug"],
  },
  {
    id: "fe-accessible-button",
    track: "frontend",
    level: "Junior",
    topic: "Accessibility",
    source: "Curated real-world interview-style question",
    title: "Accessible interactive controls",
    prompt:
      "A designer gives you a clickable card that behaves like a button. How do you implement it accessibly?",
    answerPlan: ["Use a real button when possible", "Preserve keyboard and focus behavior", "Add clear accessible name"],
    model:
      "If the action behaves like a button, I would use a real button element and style it as needed. That gives keyboard support, focus behavior, and semantics for free. If a custom element is unavoidable, it needs role, tabIndex, keyboard handlers for Enter and Space, and a clear accessible name.",
    rubric: ["Prefers semantic HTML", "Mentions keyboard access", "Mentions accessible name or focus"],
  },
  {
    id: "fe-render-performance",
    track: "frontend",
    level: "Middle",
    topic: "Performance",
    source: "Curated real-world interview-style question",
    title: "Avoiding unnecessary renders",
    prompt:
      "A React dashboard becomes slow when filters update. What would you check before adding memoization everywhere?",
    answerPlan: ["Profile first", "Find expensive render or derived data", "Memoize only stable bottlenecks"],
    model:
      "I would profile the dashboard first to see which component or calculation is actually expensive. Then I would check derived data, list rendering, keys, and whether state is stored too high in the tree. Memoization is useful when inputs are stable and the work is expensive, but adding it everywhere can hide the real problem.",
    rubric: ["Says profile first", "Mentions state or list rendering", "Uses memoization selectively"],
  },
  {
    id: "fe-form-validation",
    track: "frontend",
    level: "Junior",
    topic: "Forms",
    source: "Curated real-world interview-style question",
    title: "Form validation strategy",
    prompt:
      "How would you handle client-side and server-side validation in a registration form?",
    answerPlan: ["Client validation for fast feedback", "Server validation as source of truth", "Show field-level errors"],
    model:
      "Client-side validation gives fast feedback for obvious mistakes, such as empty fields or invalid email format. Server-side validation is still the source of truth because the client can be bypassed and the server knows unique constraints. I would show field-level errors, preserve entered values, and avoid vague messages.",
    rubric: ["Separates client and server roles", "Mentions source of truth", "Mentions usable error messages"],
  },
  {
    id: "be-api-status",
    track: "backend",
    level: "Junior",
    topic: "REST",
    source: "Real-world interview style",
    title: "API response design",
    prompt:
      "A mentor comment cannot be saved because the interview session does not exist. What HTTP status should the API return?",
    answerPlan: ["404 for missing resource", "Validation errors use 400 or 422", "Explain client behavior"],
    model:
      "If the session id points to no resource, I would return 404 Not Found. If the session exists but the comment payload is invalid, that is a validation error and should be 400 or 422 depending on the API convention. The client can then show either a broken link state or a form error.",
    rubric: ["Chooses 404", "Separates validation", "Mentions client state"],
  },
  {
    id: "be-video-storage",
    track: "backend",
    level: "Junior",
    topic: "Storage",
    source: "Hackathon core feature",
    title: "Private video links",
    prompt:
      "How would you store recorded answers and share them privately with a mentor?",
    answerPlan: ["Object storage for video", "Database row for session metadata", "Signed or unguessable links"],
    model:
      "I would put video files in object storage and keep session metadata, question ids, and mentor comments in a database. The mentor link should be unguessable or signed, and the server should check whether the token maps to the session before returning the video urls.",
    rubric: ["Separates file and metadata storage", "Mentions token privacy", "Mentions mentor comments"],
  },
  {
    id: "be-db-index",
    track: "backend",
    level: "Middle",
    topic: "Databases",
    source: "Real-world interview style",
    title: "Finding slow queries",
    prompt:
      "A dashboard page is slow when filtering interview sessions by user and created date. What would you inspect first?",
    answerPlan: ["Query plan", "Indexes on user and date", "Pagination"],
    model:
      "I would inspect the query plan to see if the database scans too many rows. Then I would check indexes that match the filter and sort pattern, for example user id plus created date. I would also make sure the endpoint uses pagination and does not load all sessions at once.",
    rubric: ["Mentions query plan", "Mentions composite index", "Mentions pagination"],
  },
  {
    id: "be-auth-session",
    track: "backend",
    level: "Junior",
    topic: "Auth",
    source: "Curated real-world interview-style question",
    title: "Session authentication",
    prompt:
      "How would you keep a user logged in safely after they sign in?",
    answerPlan: ["Issue a server-controlled session", "Use secure cookie settings", "Expire and rotate sensitive tokens"],
    model:
      "A common approach is to create a server-side session and send the browser an HTTP-only secure cookie with the session id. The cookie should use SameSite rules, HTTPS in production, and an expiration policy. Sensitive tokens should not be stored in localStorage because scripts can read them.",
    rubric: ["Mentions HTTP-only cookies", "Mentions expiration", "Avoids localStorage for sensitive tokens"],
  },
  {
    id: "be-background-jobs",
    track: "backend",
    level: "Middle",
    topic: "Async tasks",
    source: "Curated real-world interview-style question",
    title: "Moving slow work out of requests",
    prompt:
      "A video upload endpoint also generates thumbnails and blocks for 20 seconds. How would you redesign it?",
    answerPlan: ["Accept upload quickly", "Queue background processing", "Expose processing status"],
    model:
      "The request should store the upload and return quickly with a resource id. Thumbnail generation should move to a background worker or job queue. The client can poll or subscribe to a processing status, and the backend should handle retries and failed jobs explicitly.",
    rubric: ["Moves work to background job", "Returns a resource id or status", "Mentions retry or failure handling"],
  },
  {
    id: "be-sql-n-plus-one",
    track: "backend",
    level: "Junior",
    topic: "SQL",
    source: "Curated real-world interview-style question",
    title: "N plus one queries",
    prompt:
      "An endpoint loads sessions and then runs one query per session to load answers. What is the issue?",
    answerPlan: ["Define the N plus one problem", "Batch or join related data", "Measure query count"],
    model:
      "That is an N plus one query pattern: one query gets the list, then N more queries fetch related rows. It can become slow as the list grows. I would batch related ids, use a join or eager loading, and verify the query count in logs or a profiler.",
    rubric: ["Names N plus one", "Suggests batching or joins", "Mentions measuring query count"],
  },
  {
    id: "be-cache-invalidation",
    track: "backend",
    level: "Middle",
    topic: "Caching",
    source: "Curated real-world interview-style question",
    title: "Caching mentor dashboard data",
    prompt:
      "What would you cache in a mentor dashboard, and what would you avoid caching?",
    answerPlan: ["Cache stable read-heavy data", "Avoid stale private comments", "Invalidate on writes"],
    model:
      "I would cache stable read-heavy data, such as question metadata or public templates. I would be careful with private session data and mentor comments because stale or leaked data is worse than a slow page. Any cached session summary needs clear invalidation when a student records an answer or a mentor saves a comment.",
    rubric: ["Chooses stable data", "Mentions privacy risk", "Mentions invalidation"],
  },
  {
    id: "be-file-upload-limits",
    track: "backend",
    level: "Junior",
    topic: "Storage",
    source: "Curated real-world interview-style question",
    title: "Handling large uploads",
    prompt:
      "A user uploads a video answer that is too large. What should the API and UI do?",
    answerPlan: ["Define limits clearly", "Return a helpful error", "Offer compression or shorter recording"],
    model:
      "The backend should enforce documented size and type limits and return a clear error, usually 413 Payload Too Large for size. The UI should explain the limit before upload and offer a recovery path, such as recording a shorter answer, lowering quality, or saving transcript-only feedback for the MVP.",
    rubric: ["Mentions server-side limit", "Uses clear error behavior", "Gives a recovery path"],
  },
  {
    id: "ux-flow",
    track: "ux",
    level: "Junior",
    topic: "User flow",
    source: "Real-world interview style",
    title: "Reducing first-use anxiety",
    prompt:
      "A student opens an interview simulator and feels nervous about recording. How would you design the first minute?",
    answerPlan: ["Show clear steps", "Give a rehearsal state", "Make control and privacy obvious"],
    model:
      "I would make the first minute feel controlled: show the next step, allow camera preview before recording, explain recording status through clear labels, and let the student retry before sharing. The interface should reduce uncertainty instead of pushing them into a high-pressure state immediately.",
    rubric: ["Addresses anxiety", "Mentions preview or retry", "Mentions privacy/control"],
  },
  {
    id: "ux-metrics",
    track: "ux",
    level: "Middle",
    topic: "Product metrics",
    source: "Real-world interview style",
    title: "Measuring product value",
    prompt:
      "Which metrics would show that an interview practice product is actually useful?",
    answerPlan: ["Completion rate", "Repeat sessions", "Mentor feedback loop"],
    model:
      "I would track whether users finish a practice session, return for another one, and share answers with mentors. For quality, I would look at how often mentors leave comments and whether users improve self-review scores over time. Pure signups would be too shallow.",
    rubric: ["Avoids vanity metrics", "Mentions completion", "Mentions feedback loop"],
  },
  {
    id: "ux-empty-states",
    track: "ux",
    level: "Junior",
    topic: "UX writing",
    source: "Curated real-world interview-style question",
    title: "Helpful empty states",
    prompt:
      "A review dashboard has no recorded answers yet. What should the empty state communicate?",
    answerPlan: ["Explain what is missing", "Give one primary action", "Avoid blame or dead ends"],
    model:
      "A helpful empty state should explain the current situation and give one clear next action, such as starting the first interview run. It should not blame the user or show a dead panel. In this product, it can also reduce anxiety by saying that transcript-only practice is still useful.",
    rubric: ["Explains state", "Provides one action", "Uses supportive tone"],
  },
  {
    id: "ux-usability-test",
    track: "ux",
    level: "Junior",
    topic: "Research",
    source: "Curated real-world interview-style question",
    title: "Testing the first session",
    prompt:
      "How would you run a quick usability test for the first interview practice flow?",
    answerPlan: ["Pick a realistic task", "Observe without leading", "Capture confusion and completion"],
    model:
      "I would ask a target user to complete one realistic task: choose a role, record one answer, review it, and create a mentor link. I would observe where they pause or misunderstand labels instead of explaining the interface. The key measures are completion, confidence, and the moments that create anxiety.",
    rubric: ["Uses a realistic task", "Avoids leading the user", "Captures behavioral evidence"],
  },
  {
    id: "ux-design-system",
    track: "ux",
    level: "Middle",
    topic: "Design systems",
    source: "Curated real-world interview-style question",
    title: "Scaling component consistency",
    prompt:
      "A product grows from one dashboard to ten screens. How do you keep the UI consistent?",
    answerPlan: ["Define reusable components", "Create rules for states", "Audit real screens"],
    model:
      "I would define a small set of reusable components with clear states: empty, loading, error, selected, disabled, and success. The system should include spacing, type, controls, and tone rules. I would still audit real screens because a design system only works when it matches actual product needs.",
    rubric: ["Mentions reusable components", "Covers states", "Mentions auditing real usage"],
  },
  {
    id: "ux-accessible-flow",
    track: "ux",
    level: "Junior",
    topic: "Accessibility",
    source: "Curated real-world interview-style question",
    title: "Designing for camera anxiety",
    prompt:
      "How would you design the recording flow for users who are anxious about being on camera?",
    answerPlan: ["Give control before recording", "Show privacy status", "Allow retry or transcript-only fallback"],
    model:
      "I would give users control before recording starts: camera preview, clear recording state, and an obvious stop button. Privacy should be visible, especially who can access the recording. A retry or transcript-only fallback keeps the practice useful even if the camera feels uncomfortable.",
    rubric: ["Gives user control", "Mentions privacy", "Provides retry or fallback"],
  },
  {
    id: "qa-bug-report",
    track: "qa",
    level: "Trainee",
    topic: "Bug reports",
    source: "Real-world interview style",
    title: "Useful bug report",
    prompt:
      "What information should be in a bug report for a broken camera permission flow?",
    answerPlan: ["Steps to reproduce", "Actual vs expected", "Environment and evidence"],
    model:
      "A useful report should include steps to reproduce, expected result, actual result, browser and OS, permission state, screenshots or console errors, and severity. For a camera feature I would also mention whether the issue appears on localhost, HTTPS, or a specific device.",
    rubric: ["Includes reproduction steps", "Includes environment", "Includes evidence"],
  },
  {
    id: "qa-test-plan",
    track: "qa",
    level: "Junior",
    topic: "Test planning",
    source: "Hackathon core feature",
    title: "Testing mentor link flow",
    prompt:
      "How would you test private mentor links before a demo?",
    answerPlan: ["Happy path", "Broken link", "Permission and reload cases"],
    model:
      "I would test creating a link, opening it in a new tab, adding a comment, refreshing, and returning to the student view. I would also test a fake token, no answers recorded, large video fallback, and camera permission denied. This covers the demo path and likely edge cases.",
    rubric: ["Covers happy path", "Covers invalid token", "Covers permission/reload risk"],
  },
  {
    id: "qa-regression-scope",
    track: "qa",
    level: "Junior",
    topic: "Regression",
    source: "Curated real-world interview-style question",
    title: "Choosing regression tests",
    prompt:
      "A small release changes the recording screen. Which regression tests would you run first?",
    answerPlan: ["Cover the main user path", "Include permission edge cases", "Check saved review output"],
    model:
      "I would start with the main path: create a session, enable camera, record, stop, review, and create a mentor link. Then I would test camera denied, browser without MediaRecorder, and transcript-only fallback. Finally, I would verify that saved answers still appear in the review dashboard.",
    rubric: ["Prioritizes main path", "Covers permissions", "Checks persistence or review output"],
  },
  {
    id: "qa-automation-value",
    track: "qa",
    level: "Middle",
    topic: "Automation",
    source: "Curated real-world interview-style question",
    title: "What to automate first",
    prompt:
      "Which parts of this interview coach would you automate, and which would you leave manual?",
    answerPlan: ["Automate deterministic flows", "Leave camera quality manual", "Use mocks for browser APIs"],
    model:
      "I would automate deterministic flows such as setup choices, state transitions, saved review data, mentor comments, and broken-link states. I would leave visual camera quality and real microphone behavior partly manual because hardware differs. For automated tests, I would mock MediaRecorder and getUserMedia.",
    rubric: ["Chooses deterministic flows", "Mentions hardware variability", "Mentions mocks"],
  },
  {
    id: "qa-edge-cases",
    track: "qa",
    level: "Junior",
    topic: "Risk",
    source: "Curated real-world interview-style question",
    title: "Edge cases for a timed answer",
    prompt:
      "What edge cases would you test for a two-minute answer timer?",
    answerPlan: ["Start and stop boundaries", "Tab switch or refresh", "Auto-save at timeout"],
    model:
      "I would test starting immediately, skipping prep, stopping right before timeout, and automatic stop at zero. I would also check tab switching, refresh during recording, double-clicking buttons, and whether the saved duration matches the actual recording state.",
    rubric: ["Covers timer boundaries", "Mentions browser behavior", "Checks saved state"],
  },
  {
    id: "qa-priority",
    track: "qa",
    level: "Junior",
    topic: "Bug triage",
    source: "Curated real-world interview-style question",
    title: "Prioritizing launch bugs",
    prompt:
      "Two bugs remain before demo: mentor comments sometimes fail, and a badge icon is misaligned. What do you prioritize?",
    answerPlan: ["Prioritize core user flow", "Explain impact", "Defer cosmetic issue"],
    model:
      "I would prioritize mentor comments because they are part of the core value: feedback through a private link. A misaligned badge is visible, but it does not block the story. I would document the cosmetic issue and fix it only after the recording, review, and mentor feedback flow is reliable.",
    rubric: ["Prioritizes core flow", "Explains user impact", "Defers cosmetic work appropriately"],
  },
  {
    id: "soft-failure",
    track: "soft",
    level: "Junior",
    topic: "Behavioral",
    source: "STAR interview style",
    title: "Learning from failure",
    prompt:
      "Tell me about a technical mistake you made and what changed after it.",
    answerPlan: ["Situation", "Task", "Action", "Result"],
    model:
      "Use STAR: describe the project context, your responsibility, the specific mistake, what you did to fix it, and the measurable lesson. A strong answer accepts ownership without dramatizing and shows a concrete process change afterward.",
    rubric: ["Uses STAR", "Shows ownership", "Names a concrete improvement"],
  },
  {
    id: "soft-unknown",
    track: "soft",
    level: "Junior",
    topic: "Behavioral",
    source: "STAR interview style",
    title: "Handling an unknown answer",
    prompt:
      "Tell me about a time you did not know the answer to a technical question. What did you do?",
    answerPlan: ["Situation", "Honest response", "Learning action", "Result"],
    model:
      "A strong answer is honest without giving up. Explain the situation, say how you clarified the question, reasoned from what you did know, and followed up after learning the missing part. The result should show growth, not just embarrassment.",
    rubric: ["Shows honesty", "Explains reasoning", "Shows follow-up learning"],
  },
  {
    id: "soft-conflict",
    track: "soft",
    level: "Junior",
    topic: "Behavioral",
    source: "STAR interview style",
    title: "Receiving difficult feedback",
    prompt:
      "Tell me about a time you received feedback that was hard to hear.",
    answerPlan: ["Situation", "Feedback", "Action", "Change in behavior"],
    model:
      "Use STAR and focus on the behavior change. A good answer explains what the feedback was, how you processed it professionally, what concrete action you took, and how the next project or collaboration improved because of it.",
    rubric: ["Uses STAR", "Shows maturity", "Names a concrete behavior change"],
  },
];

export function buildQuestionSet(settings) {
  const trackQuestions = questionBank.filter(
    (question) =>
      question.track === settings.track &&
      (question.level === settings.level || question.level === "Junior")
  );

  const fallback = questionBank.filter((question) => question.track === settings.track);
  const soft = questionBank.filter((question) => question.track === "soft");
  const pool = trackQuestions.length >= 3 ? trackQuestions : fallback;

  if (settings.mode === "soft") {
    return [pool[0], soft[0], pool[1] || fallback[1]].filter(Boolean).slice(0, 3);
  }

  if (settings.mode === "topic") {
    return pool.slice(0, 3);
  }

  return [pool[0], pool[1], soft[0] || pool[2]].filter(Boolean).slice(0, 3);
}
