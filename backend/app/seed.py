"""
Seed script to populate the questions table.

Usage:
    python -m app.seed

Maps frontend mockData questionBank to the DB schema:
  track → specialization
  level → level
  topic mode mapping: questions from 'soft' track → mode='soft',
                       others are assigned 'quick' or 'topic' based on level/count.
  prompt → text
  model → reference_answer
"""
import asyncio

from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session_factory, engine, Base
from app.models.question import Question


SEED_QUESTIONS = [
    # ──────── Frontend ────────
    {"text": "A child component needs to update data that is also used by a sibling. Where should the state live, and why?", "specialization": "frontend", "level": "Junior", "mode": "topic", "reference_answer": "The shared value should usually live in the closest common parent. That parent owns the source of truth, passes values down through props, and exposes callbacks for updates."},
    {"text": "How would you design a React screen that loads data from an API and can fail?", "specialization": "frontend", "level": "Junior", "mode": "topic", "reference_answer": "I would treat request status as explicit UI state. The screen should show loading, success, empty, and error states, include retry, and avoid stale data from older requests."},
    {"text": "A clickable card behaves like a button. How do you implement it accessibly?", "specialization": "frontend", "level": "Junior", "mode": "topic", "reference_answer": "If the element triggers an action, I would use a real button and style it as a card. That gives semantics, focus, and keyboard support without extra custom code."},
    {"text": "A component starts a timer inside useEffect. What problem appears if you do not clean it up?", "specialization": "frontend", "level": "Junior", "mode": "topic", "reference_answer": "Without cleanup, a timer can continue after unmount or be duplicated after dependency changes. I would return a cleanup function from useEffect to clear the timer."},
    {"text": "How would you handle validation in a registration form?", "specialization": "frontend", "level": "Junior", "mode": "topic", "reference_answer": "Client validation catches obvious mistakes quickly, but server validation is still the source of truth. I would show field-level errors and preserve user input."},
    {"text": "A React dashboard gets slow when filters update. What would you check before adding memoization everywhere?", "specialization": "frontend", "level": "Middle", "mode": "topic", "reference_answer": "I would profile first, then inspect list rendering, derived calculations, and whether state is too high in the tree. Memoization helps when the inputs are stable and the work is actually expensive."},
    {"text": "When would you choose CSS Grid instead of Flexbox for a dashboard?", "specialization": "frontend", "level": "Trainee", "mode": "quick", "reference_answer": "Grid is better when rows and columns need to align as a system. Flexbox is better for a toolbar or a single-direction list."},
    {"text": "How would you design a Button component that supports variants without becoming hard to maintain?", "specialization": "frontend", "level": "Middle", "mode": "topic", "reference_answer": "I would define a small set of variants, sizes, and states, then map those props to predictable classes. The component should cover disabled, loading, and icon cases."},
    {"text": "How would you test a page where users search and filter interview questions?", "specialization": "frontend", "level": "Junior", "mode": "quick", "reference_answer": "I would render the page, assert the initial questions, type into search, click filters, and check that the visible results update."},
    {"text": "Users report that checkout occasionally freezes, but you cannot reproduce it locally. How would you investigate?", "specialization": "frontend", "level": "Middle", "mode": "topic", "reference_answer": "I would first identify the affected users and collect errors, session context, and network traces. I would look for differences between local and production conditions."},

    # ──────── Backend ────────
    {"text": "How would you store recorded answers and share them privately with a mentor?", "specialization": "backend", "level": "Junior", "mode": "topic", "reference_answer": "I would store video files in object storage and keep metadata in a database. The mentor link should be signed or unguessable."},
    {"text": "A mentor comment cannot be saved because the interview session does not exist. What HTTP status should the API return?", "specialization": "backend", "level": "Junior", "mode": "quick", "reference_answer": "If the session id points to no resource, I would return 404 Not Found. If the payload is invalid, I would use a validation error response."},
    {"text": "An endpoint loads sessions and then runs one query per session to load answers. What is the issue?", "specialization": "backend", "level": "Junior", "mode": "topic", "reference_answer": "That is an N plus one query pattern. I would batch related data, use a join, or use eager loading."},
    {"text": "A video upload endpoint also generates thumbnails and blocks for 20 seconds. How would you redesign it?", "specialization": "backend", "level": "Middle", "mode": "topic", "reference_answer": "The request should store the upload and return a resource id quickly. Thumbnail generation belongs in a background worker with status tracking and retries."},
    {"text": "How would you keep a user logged in safely after they sign in?", "specialization": "backend", "level": "Junior", "mode": "quick", "reference_answer": "A common approach is a server-side session with an HTTP-only secure cookie. Sensitive tokens should not be readable by client scripts."},
    {"text": "A user uploads a video answer that is too large. What should the API and UI do?", "specialization": "backend", "level": "Junior", "mode": "topic", "reference_answer": "The backend should enforce size and type limits, often returning 413 for payloads that are too large. The UI should explain the limit and offer a recovery path."},
    {"text": "A user double-clicks submit and the same answer is saved twice. How would you prevent that?", "specialization": "backend", "level": "Middle", "mode": "topic", "reference_answer": "An idempotency key or unique constraint can make repeated requests return the same saved answer instead of creating duplicates."},
    {"text": "Why should sign-in and mentor-link endpoints have rate limits?", "specialization": "backend", "level": "Junior", "mode": "quick", "reference_answer": "Rate limits reduce brute-force sign-in attempts and token guessing."},

    # ──────── UI/UX ────────
    {"text": "A student feels nervous about recording. How would you design the first minute?", "specialization": "ux", "level": "Junior", "mode": "topic", "reference_answer": "The first minute should feel controlled. I would show the flow, allow preview, make recording state obvious, and let the student retry before sharing anything."},
    {"text": "Which metrics would show that an interview practice product is actually useful?", "specialization": "ux", "level": "Middle", "mode": "topic", "reference_answer": "I would track completion, repeat practice, mentor comments, and whether users improve self-review scores over time."},
    {"text": "A review dashboard has no recorded answers yet. What should the empty state communicate?", "specialization": "ux", "level": "Junior", "mode": "quick", "reference_answer": "A helpful empty state explains the current situation and gives one clear next action."},
    {"text": "How would you run a quick usability test for the first interview practice flow?", "specialization": "ux", "level": "Junior", "mode": "topic", "reference_answer": "I would ask a target user to choose a role, record one answer, review it, and create a mentor link while I observe where they pause."},
    {"text": "A product grows from one dashboard to ten screens. How do you keep the UI consistent?", "specialization": "ux", "level": "Middle", "mode": "topic", "reference_answer": "I would create a small component system with clear states like loading, empty, error, selected, and disabled."},
    {"text": "How would you design recording for users who feel anxious about being on camera?", "specialization": "ux", "level": "Junior", "mode": "topic", "reference_answer": "I would provide preview, clear start and stop controls, visible privacy status, and retry."},
    {"text": "A team wants profiles, leaderboards, real video upload, and AI scoring. What would you keep for the MVP?", "specialization": "ux", "level": "Middle", "mode": "quick", "reference_answer": "I would keep one complete practice flow: choose a track, answer timed questions, review results, and share a mentor link."},
    {"text": "What should a designer include when handing off the interview results dashboard?", "specialization": "ux", "level": "Junior", "mode": "quick", "reference_answer": "I would include responsive layouts, spacing and component states, empty and long-content examples, and notes for interactions."},

    # ──────── QA ────────
    {"text": "How would you test private mentor links before a demo?", "specialization": "qa", "level": "Junior", "mode": "topic", "reference_answer": "I would test creating a link, opening it, reviewing answers, saving a mentor comment, refreshing, and returning to the student dashboard."},
    {"text": "Two bugs remain before demo: mentor comments sometimes fail, and a badge icon is misaligned. What do you prioritize?", "specialization": "qa", "level": "Junior", "mode": "quick", "reference_answer": "I would prioritize mentor comments because feedback is part of the core value."},
    {"text": "A small release changes the recording screen. Which regression tests would you run first?", "specialization": "qa", "level": "Junior", "mode": "topic", "reference_answer": "I would run the main flow first: setup, mock recording, save answer, results, and mentor review."},
    {"text": "Which parts of this interview coach would you automate, and which would you leave manual?", "specialization": "qa", "level": "Middle", "mode": "topic", "reference_answer": "I would automate setup choices, saved results, mentor comments, and empty states. Real camera quality should remain partly manual."},
    {"text": "What edge cases would you test for a two-minute answer timer?", "specialization": "qa", "level": "Junior", "mode": "quick", "reference_answer": "I would test starting immediately, skipping prep, stopping near zero, auto-stop at timeout, and double-clicking controls."},
    {"text": "What information should be in a bug report for a broken camera permission flow?", "specialization": "qa", "level": "Trainee", "mode": "quick", "reference_answer": "A useful report includes steps, expected and actual results, environment, permission state, evidence, and severity."},
    {"text": "A timer test passes locally but fails in CI. How would you investigate it?", "specialization": "qa", "level": "Middle", "mode": "topic", "reference_answer": "I would look for real-time assumptions, missing awaits, or environment differences. Fake timers make the test more reliable."},
    {"text": "What test data would you prepare before presenting an interview coach MVP?", "specialization": "qa", "level": "Junior", "mode": "topic", "reference_answer": "I would prepare a complete happy-path session, one partial session, and a mentor-reviewed session."},

    # ──────── Soft Skills ────────
    {"text": "Tell me about a time you received feedback that was hard to hear.", "specialization": "soft", "level": "Junior", "mode": "soft", "reference_answer": "A strong answer explains the feedback, how you processed it professionally, what action you took, and how collaboration improved."},
    {"text": "Tell me about a time you did not know the answer to a technical question. What did you do?", "specialization": "soft", "level": "Junior", "mode": "soft", "reference_answer": "A strong answer shows honesty, reasoning, and follow-up. Explain how you think and learn rather than pretending you know everything."},
    {"text": "Tell me about a time you disagreed with a teammate about a technical or design decision.", "specialization": "soft", "level": "Junior", "mode": "soft", "reference_answer": "A strong answer shows calm communication, evidence-based decision-making, and respect for the team."},
    {"text": "Tell me about a time you had too much to do before a deadline. How did you decide what mattered most?", "specialization": "soft", "level": "Junior", "mode": "soft", "reference_answer": "A strong answer explains how you identified the essential outcome, reduced scope responsibly, and communicated tradeoffs."},
]


async def seed_questions():
    """Insert seed questions into the database, skipping duplicates."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as session:
        for q_data in SEED_QUESTIONS:
            question = Question(**q_data)
            session.add(question)

        await session.commit()
        print(f"Seeded {len(SEED_QUESTIONS)} questions.")


if __name__ == "__main__":
    asyncio.run(seed_questions())
