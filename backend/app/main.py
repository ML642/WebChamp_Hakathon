from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import auth, interview, mentor

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — startup and shutdown events."""
    # Startup: nothing extra needed for now
    yield
    # Shutdown: cleanup if needed


app = FastAPI(
    title="Antigravity Interview Simulator",
    description="API for automated interview practice with AI feedback and mentor review.",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(interview.router)
app.include_router(mentor.router)


@app.get("/api/v1/health", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}
