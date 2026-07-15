import uuid
from datetime import datetime

from pydantic import BaseModel


class InterviewStartRequest(BaseModel):
    specialization: str  # frontend, backend, ux, qa
    level: str           # Trainee, Junior, Middle
    mode: str            # quick, topic, soft


class QuestionResponse(BaseModel):
    id: uuid.UUID
    text: str
    specialization: str
    level: str
    mode: str
    reference_answer: str

    model_config = {"from_attributes": True}


class InterviewResponse(BaseModel):
    id: uuid.UUID
    mode: str
    status: str
    created_at: datetime
    questions: list[QuestionResponse]

    model_config = {"from_attributes": True}


class InterviewDashboardAnswer(BaseModel):
    id: uuid.UUID
    question: QuestionResponse
    video_s3_key: str | None = None
    transcript: str | None = None
    ai_score_understanding: bool | None = None
    ai_score_structure: bool | None = None
    ai_score_timing: bool | None = None
    ai_feedback: str | None = None
    confidence_score: float | None = None

    model_config = {"from_attributes": True}


class InterviewDashboardResponse(BaseModel):
    id: uuid.UUID
    mode: str
    status: str
    created_at: datetime
    share_token: uuid.UUID | None = None
    answers: list[InterviewDashboardAnswer]

    model_config = {"from_attributes": True}


class ShareTokenResponse(BaseModel):
    share_token: uuid.UUID
