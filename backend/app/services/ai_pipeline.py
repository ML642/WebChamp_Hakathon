import json
import logging
import os

import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.answer import Answer
from app.models.question import Question

settings = get_settings()
logger = logging.getLogger(__name__)


async def process_answer(
    db: AsyncSession,
    answer: Answer,
    question: Question,
) -> None:
    """
    Background task: transcribe audio via Whisper API, then analyze with GPT.

    This runs as a FastAPI BackgroundTask after the client submits an answer.
    Steps:
      1. Call OpenAI Whisper API with the S3 audio URL to get a transcript
      2. Send transcript + question + reference answer to GPT for evaluation
      3. Store results (transcript, scores, feedback) in the Answer record
    """
    if not settings.openai_api_key:
        logger.warning("OPENAI_API_KEY not set — skipping AI pipeline for answer %s", answer.id)
        answer.transcript = "[AI pipeline disabled — no API key configured]"
        answer.ai_feedback = "AI evaluation is not available. Configure OPENAI_API_KEY to enable."
        await db.commit()
        return

    try:
        transcript = await _transcribe_audio(answer.video_s3_key)
        answer.transcript = transcript

        evaluation = await _evaluate_with_llm(
            question_text=question.text,
            reference_answer=question.reference_answer,
            transcript=transcript,
        )

        answer.ai_score_understanding = evaluation.get("understood", False)
        answer.ai_score_structure = evaluation.get("structured", False)
        answer.ai_score_timing = evaluation.get("timing", False)
        answer.ai_feedback = evaluation.get("feedback", "")
        answer.confidence_score = evaluation.get("confidence_score", 0.0)

        await db.commit()
        logger.info("AI pipeline completed for answer %s", answer.id)

    except Exception:
        logger.exception("AI pipeline failed for answer %s", answer.id)
        answer.ai_feedback = "AI evaluation failed. Please try again later."
        await db.commit()


async def _transcribe_audio(file_path: str | None) -> str:
    """Call OpenAI Whisper API to transcribe the audio from the local video file."""
    if not file_path or not os.path.exists(file_path):
        return "[No audio file available]"

    async with httpx.AsyncClient(timeout=120.0) as client:
        with open(file_path, "rb") as audio_file:
            response = await client.post(
                "https://api.openai.com/v1/audio/transcriptions",
                headers={"Authorization": f"Bearer {settings.openai_api_key}"},
                data={"model": "whisper-1", "language": "ru"},
                files={"file": ("audio.webm", audio_file, "audio/webm")},
            )
            response.raise_for_status()
            return response.json().get("text", "")


async def _evaluate_with_llm(
    question_text: str,
    reference_answer: str,
    transcript: str,
) -> dict:
    """Send the transcript to GPT for structured evaluation."""
    prompt = f"""Ты — профессиональный технический интервьюер. Оцени ответ кандидата.
Вопрос: {question_text}
Эталонный ответ: {reference_answer}
Ответ кандидата (транскрипт): {transcript}

Выдай результат строго в формате JSON со следующими полями:
- understood (true/false, раскрыл ли кандидат суть темы)
- structured (true/false, последовательно ли изложена мысль, без хаотичного перескакивания)
- timing (true/false, уложился ли концептуально, нет ли «воды»)
- feedback (подробный разбор ошибок и зон роста)
- confidence_score (от 0.0 до 1.0, степень твоей уверенности в оценке)"""

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openai_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "gpt-4o-mini",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.3,
                "response_format": {"type": "json_object"},
            },
        )
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
        return json.loads(content)
