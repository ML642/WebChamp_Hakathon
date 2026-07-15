import uuid
from datetime import datetime

from pydantic import BaseModel
from app.schemas.auth import UserResponse


class MentorRequestCreate(BaseModel):
    answer_id: uuid.UUID
    mentor_id: uuid.UUID


class MentorRequestResponse(BaseModel):
    id: uuid.UUID
    answer_id: uuid.UUID
    mentor_id: uuid.UUID
    status: str
    created_at: datetime
    
    # We might want to include nested data later if needed, but for now simple response
    # We can include answer details or mentor details if needed for the UI
    mentor: UserResponse | None = None

    model_config = {"from_attributes": True}


class MentorCommentCreate(BaseModel):
    answer_id: uuid.UUID
    comment_text: str
    mentor_id: uuid.UUID | None = None

class MentorRequestUpdate(BaseModel):
    status: str


class MentorCommentResponse(BaseModel):
    id: uuid.UUID
    answer_id: uuid.UUID
    mentor_id: uuid.UUID | None = None
    comment_text: str
    created_at: datetime

    model_config = {"from_attributes": True}
