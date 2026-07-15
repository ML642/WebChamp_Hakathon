import uuid
import os
import shutil
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status, UploadFile, File
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.interview import Interview
from app.models.answer import Answer
from app.models.question import Question
from app.schemas.interview import (
    InterviewStartRequest,
    InterviewResponse,
    InterviewDashboardResponse,
    InterviewDashboardAnswer,
    QuestionResponse,
    ShareTokenResponse,
)
from app.schemas.answer import AnswerSubmitResponse
from app.services.interview import (
    get_questions_for_interview,
    create_interview,
    generate_share_token,
)
from app.services.ai_pipeline import process_answer

router = APIRouter(prefix="/api/v1/interview", tags=["interview"])


@router.post("/start", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
async def start_interview(
    data: InterviewStartRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Start a new interview session.
    Selects questions by specialization + level + mode and returns them.
    """
    questions = await get_questions_for_interview(
        db=db,
        specialization=data.specialization,
        level=data.level,
        mode=data.mode,
    )

    if not questions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No questions found for the given parameters. Run seed first.",
        )

    interview = await create_interview(
        db=db,
        candidate_id=current_user.id,
        mode=data.mode,
        questions=questions,
    )

    return InterviewResponse(
        id=interview.id,
        mode=interview.mode,
        status=interview.status,
        created_at=interview.created_at,
        questions=[QuestionResponse.model_validate(q) for q in questions],
    )


@router.post(
    "/{interview_id}/answer/{question_id}/submit",
    response_model=AnswerSubmitResponse,
)
async def submit_answer(
    interview_id: uuid.UUID,
    question_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    video: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Accept video file upload and trigger async AI processing.
    """
    # Find the pre-created answer record
    result = await db.execute(
        select(Answer)
        .join(Interview)
        .where(
            Answer.interview_id == interview_id,
            Answer.question_id == question_id,
            Interview.candidate_id == current_user.id,
        )
    )
    answer = result.scalar_one_or_none()
    if answer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Answer not found")

    # Ensure upload directory exists
    upload_dir = Path(f"uploads/interviews/{interview_id}")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    file_path = upload_dir / f"{question_id}.webm"
    
    # Save file locally
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(video.file, buffer)

    # Set the local path as the "key"
    answer.video_s3_key = str(file_path)
    await db.flush()

    # Fetch the question for AI evaluation
    q_result = await db.execute(select(Question).where(Question.id == question_id))
    question = q_result.scalar_one_or_none()

    # Trigger async AI processing
    if question:
        background_tasks.add_task(process_answer, db, answer, question)

    return AnswerSubmitResponse(id=answer.id, status="processing")


@router.get("/{interview_id}/dashboard", response_model=InterviewDashboardResponse)
async def get_dashboard(
    interview_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get full interview results including transcripts, AI feedback, and scores."""
    result = await db.execute(
        select(Interview)
        .options(selectinload(Interview.answers).selectinload(Answer.question))
        .where(
            Interview.id == interview_id,
            Interview.candidate_id == current_user.id,
        )
    )
    interview = result.scalar_one_or_none()
    if interview is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")

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


@router.post("/{interview_id}/share", response_model=ShareTokenResponse)
async def share_interview(
    interview_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a secret share link for mentor review."""
    result = await db.execute(
        select(Interview).where(
            Interview.id == interview_id,
            Interview.candidate_id == current_user.id,
        )
    )
    interview = result.scalar_one_or_none()
    if interview is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")

    # Return existing token if already generated
    if interview.share_token:
        return ShareTokenResponse(share_token=interview.share_token)

    token = await generate_share_token(db, interview)
    return ShareTokenResponse(share_token=token)

@router.get("/history", response_model=list[InterviewDashboardResponse])
async def get_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all interviews for the current user, including answers."""
    result = await db.execute(
        select(Interview)
        .options(selectinload(Interview.answers).selectinload(Answer.question))
        .where(Interview.candidate_id == current_user.id)
        .order_by(Interview.created_at.desc())
    )
    interviews = result.scalars().unique().all()
    
    responses = []
    for interview in interviews:
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
        responses.append(
            InterviewDashboardResponse(
                id=interview.id,
                mode=interview.mode,
                status=interview.status,
                created_at=interview.created_at,
                share_token=interview.share_token,
                answers=answers,
            )
        )
    return responses
