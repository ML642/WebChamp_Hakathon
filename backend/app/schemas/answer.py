import uuid
from pydantic import BaseModel


class AnswerSubmitResponse(BaseModel):
    id: uuid.UUID
    status: str = "processing"

    model_config = {"from_attributes": True}
