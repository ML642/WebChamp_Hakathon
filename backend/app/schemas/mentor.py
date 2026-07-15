import uuid
from datetime import datetime

from pydantic import BaseModel


class MentorCommentCreate(BaseModel):
    answer_id: uuid.UUID
    comment_text: str


class MentorCommentResponse(BaseModel):
    id: uuid.UUID
    answer_id: uuid.UUID
    mentor_id: uuid.UUID | None = None
    comment_text: str
    created_at: datetime

    model_config = {"from_attributes": True}
