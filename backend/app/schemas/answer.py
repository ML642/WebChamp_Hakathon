import uuid
from pydantic import BaseModel


class PresignedUrlRequest(BaseModel):
    question_id: uuid.UUID


class PresignedUrlResponse(BaseModel):
    upload_url: str
    s3_key: str


class AnswerSubmitResponse(BaseModel):
    id: uuid.UUID
    status: str = "processing"

    model_config = {"from_attributes": True}
