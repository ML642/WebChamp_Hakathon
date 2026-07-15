import uuid

from sqlalchemy import String, Text, Float, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Answer(Base):
    __tablename__ = "answers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    interview_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("interviews.id"), nullable=False
    )
    question_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("questions.id"), nullable=False
    )
    video_s3_key: Mapped[str | None] = mapped_column(String(512), nullable=True)
    transcript: Mapped[str | None] = mapped_column(Text, nullable=True)

    # AI scores
    ai_score_understanding: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    ai_score_structure: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    ai_score_timing: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    ai_feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    confidence_score: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Relationships
    interview = relationship("Interview", back_populates="answers", lazy="selectin")
    question = relationship("Question", lazy="selectin")
    mentor_comments = relationship(
        "MentorComment", back_populates="answer", lazy="selectin"
    )
