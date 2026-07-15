import uuid

import aioboto3
from app.config import get_settings

settings = get_settings()


async def generate_presigned_upload_url(
    interview_id: uuid.UUID,
    question_id: uuid.UUID,
) -> tuple[str, str]:
    """
    Generate a presigned S3 PUT URL for direct video upload from the client.

    Returns:
        (upload_url, s3_key) tuple
    """
    s3_key = f"interviews/{interview_id}/{question_id}.webm"

    session = aioboto3.Session(
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
        region_name=settings.aws_region,
    )

    async with session.client("s3") as s3_client:
        url = await s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": settings.s3_bucket_name,
                "Key": s3_key,
                "ContentType": "video/webm",
            },
            ExpiresIn=600,  # 10 minutes
        )

    return url, s3_key


async def generate_presigned_download_url(s3_key: str) -> str:
    """Generate a presigned S3 GET URL for video playback."""
    session = aioboto3.Session(
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
        region_name=settings.aws_region,
    )

    async with session.client("s3") as s3_client:
        url = await s3_client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": settings.s3_bucket_name,
                "Key": s3_key,
            },
            ExpiresIn=3600,  # 1 hour
        )

    return url
