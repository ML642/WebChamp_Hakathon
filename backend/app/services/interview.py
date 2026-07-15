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

    if mode == "topic":
        query = select(Question).where(
            Question.level == level,
            Question.specialization == specialization,
            Question.mode == "topic"
        ).order_by(func.random()).limit(count)
        result = await db.execute(query)
        return list(result.scalars().all())

    elif mode == "soft":
        query = select(Question).where(
            Question.level == level,
            Question.mode == "soft"
        ).order_by(func.random()).limit(count)
        result = await db.execute(query)
        return list(result.scalars().all())

    else:  # "quick" or mixed mode
        tech_count = max(1, count - 1)
        soft_count = count - tech_count
        
        tech_query = select(Question).where(
            Question.level == level,
            Question.specialization == specialization,
            Question.mode == "topic"
        ).order_by(func.random()).limit(tech_count)
        tech_res = await db.execute(tech_query)
        questions = list(tech_res.scalars().all())

        if soft_count > 0:
            soft_query = select(Question).where(
                Question.level == level,
                Question.mode == "soft"
            ).order_by(func.random()).limit(soft_count)
            soft_res = await db.execute(soft_query)
            questions.extend(soft_res.scalars().all())
            
        return questions


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
