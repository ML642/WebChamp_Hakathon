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
from app.schemas.mentor import MentorCommentCreate, MentorCommentResponse, MentorRequestCreate, MentorRequestResponse, MentorRequestUpdate
from app.models.mentor_request import MentorRequest
from app.models.user import User
from app.dependencies import get_current_user

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


@router.post("/requests", response_model=MentorRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_mentor_request(
    data: MentorRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a request for a mentor to review a specific answer.
    """
    # Verify the answer exists
    result = await db.execute(select(Answer).where(Answer.id == data.answer_id))
    answer = result.scalar_one_or_none()
    if answer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Answer not found",
        )

    # Verify the mentor exists
    mentor_result = await db.execute(select(User).where(User.id == data.mentor_id))
    mentor = mentor_result.scalar_one_or_none()
    if mentor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor not found",
        )

    # Check if request already exists
    existing = await db.execute(
        select(MentorRequest).where(
            MentorRequest.answer_id == data.answer_id,
            MentorRequest.mentor_id == data.mentor_id
        )
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Request already exists for this mentor and answer",
        )

    request = MentorRequest(
        answer_id=data.answer_id,
        mentor_id=data.mentor_id,
    )
    db.add(request)
    await db.flush()
    await db.refresh(request)
    return request


@router.get("/requests/incoming")
async def get_incoming_requests(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all pending requests for the current user (acting as mentor).
    """
    result = await db.execute(
        select(MentorRequest)
        .options(
            selectinload(MentorRequest.mentor),
            selectinload(MentorRequest.answer).selectinload(Answer.question),
            selectinload(MentorRequest.answer).selectinload(Answer.mentor_comments)
        )
        .where(MentorRequest.mentor_id == current_user.id)
        .order_by(MentorRequest.created_at.desc())
    )
    requests = result.scalars().all()
    # We return a custom response or just use model dict since we need nested objects
    # It's easier to just return dicts for the frontend
    return [
        {
            "id": req.id,
            "answer_id": req.answer_id,
            "status": req.status,
            "created_at": req.created_at,
            "answer": {
                "transcript": req.answer.transcript,
                "video_url": req.answer.video_s3_key,
                "question": {
                    "id": req.answer.question.id,
                    "text": req.answer.question.text,
                    "specialization": req.answer.question.specialization,
                    "level": req.answer.question.level
                },
                "comments": [
                    {
                        "id": c.id,
                        "comment_text": c.comment_text,
                        "created_at": c.created_at
                    }
                    for c in req.answer.mentor_comments
                ]
            }
        }
        for req in requests
    ]


@router.patch("/requests/{request_id}")
async def update_request_status(
    request_id: uuid.UUID,
    data: MentorRequestUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update the status of a mentor request.
    """
    result = await db.execute(
        select(MentorRequest).where(MentorRequest.id == request_id)
    )
    request = result.scalar_one_or_none()
    if request is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found",
        )
    
    if request.mentor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this request",
        )

    request.status = data.status
    await db.commit()
    return {"status": "ok"}

