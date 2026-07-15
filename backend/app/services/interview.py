import uuid

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.question import Question
from app.models.interview import Interview
from app.models.answer import Answer


# Number of questions per mode
MODE_QUESTION_COUNT = {
    "quick": 3,
    "topic": 5,
    "soft": 4,
}


async def get_questions_for_interview(
    db: AsyncSession,
    specialization: str,
    level: str,
    mode: str,
) -> list[Question]:
    """Select random questions matching the interview parameters."""
    count = MODE_QUESTION_COUNT.get(mode, 3)

    # For 'soft' mode, specialization doesn't matter (behavioral questions)
    query = select(Question).where(
        Question.level == level,
        Question.mode == mode,
    )
    if mode != "soft":
        query = query.where(Question.specialization == specialization)

    query = query.order_by(func.random()).limit(count)
    result = await db.execute(query)
    return list(result.scalars().all())


async def create_interview(
    db: AsyncSession,
    candidate_id: uuid.UUID,
    mode: str,
    questions: list[Question],
) -> Interview:
    """Create an interview session and pre-create empty answer records for each question."""
    interview = Interview(
        candidate_id=candidate_id,
        mode=mode,
        status="started",
    )
    db.add(interview)
    await db.flush()

    # Pre-create answer records for each selected question
    for question in questions:
        answer = Answer(
            interview_id=interview.id,
            question_id=question.id,
        )
        db.add(answer)

    await db.flush()
    await db.refresh(interview)
    return interview


async def generate_share_token(
    db: AsyncSession,
    interview: Interview,
) -> uuid.UUID:
    """Generate a unique share token for mentor access."""
    token = uuid.uuid4()
    interview.share_token = token
    await db.flush()
    return token
