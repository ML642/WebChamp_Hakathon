import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.interview import Interview
from app.models.answer import Answer
from app.models.mentor_comment import MentorComment
from app.schemas.interview import (
    InterviewDashboardResponse,
    InterviewDashboardAnswer,
    QuestionResponse,
)
from app.schemas.mentor import MentorCommentCreate, MentorCommentResponse

router = APIRouter(prefix="/api/v1/mentor", tags=["mentor"])


@router.get("/share/{share_token}", response_model=InterviewDashboardResponse)
async def view_shared_interview(
    share_token: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """
    View interview results via a secret share link.
    No authentication required — access is granted by knowledge of the token.
    """
    result = await db.execute(
        select(Interview)
        .options(selectinload(Interview.answers).selectinload(Answer.question))
        .where(Interview.share_token == share_token)
    )
    interview = result.scalar_one_or_none()
    if interview is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found or share link is invalid",
        )

    answers = []
    for ans in interview.answers:
        answers.append(
            InterviewDashboardAnswer(
                id=ans.id,
                question=QuestionResponse.model_validate(ans.question),
                video_s3_key=ans.video_s3_key,
                transcript=ans.transcript,
                ai_score_understanding=ans.ai_score_understanding,
                ai_score_structure=ans.ai_score_structure,
                ai_score_timing=ans.ai_score_timing,
                ai_feedback=ans.ai_feedback,
                confidence_score=ans.confidence_score,
            )
        )

    return InterviewDashboardResponse(
        id=interview.id,
        mode=interview.mode,
        status=interview.status,
        created_at=interview.created_at,
        share_token=interview.share_token,
        answers=answers,
    )


@router.post("/comment", response_model=MentorCommentResponse, status_code=status.HTTP_201_CREATED)
async def add_comment(
    data: MentorCommentCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Add a mentor comment to a specific answer.
    Does not require authentication (anonymous commenting via share link).
    """
    # Verify the answer exists
    result = await db.execute(select(Answer).where(Answer.id == data.answer_id))
    answer = result.scalar_one_or_none()
    if answer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Answer not found",
        )

    comment = MentorComment(
        answer_id=data.answer_id,
        comment_text=data.comment_text,
    )
    db.add(comment)
    await db.flush()
    await db.refresh(comment)
    return comment
