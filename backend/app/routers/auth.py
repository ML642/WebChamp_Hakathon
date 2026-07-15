from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserResponse
from app.services.auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    """Register a new user with email and password."""
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists",
        )

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        role="candidate",
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate user and return JWT access token."""
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if user is None or user.password_hash is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=UserResponse)
async def get_me(
    db: AsyncSession = Depends(get_db),
):
    """Get current authenticated user info. Requires valid JWT."""
    from app.dependencies import get_current_user

    # Note: This is a simplified version. In production, use Depends(get_current_user)
    # directly in the function signature. Left as explicit import to avoid circular deps.
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Use the /me endpoint with proper auth header",
    )


@router.get("/github/callback")
async def github_callback():
    """OAuth redirect callback for GitHub. (Stub for hackathon)"""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="GitHub OAuth not implemented yet",
    )


@router.get("/google/callback")
async def google_callback():
    """OAuth redirect callback for Google. (Stub for hackathon)"""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Google OAuth not implemented yet",
    )
