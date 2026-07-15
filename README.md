# Answerly

> Practice AI-style interviews before the real opportunity arrives.

Answerly is a WebChamp 2026 hackathon project for students and junior candidates. It turns passive interview preparation into an interactive practice flow: choose a role, answer timed questions, review your response, and keep a private history of your progress.

## Why we built it

AI-led interviews are becoming a common part of recruitment. Knowing the material is only one part of succeeding: candidates also need to organise their thoughts, speak under time pressure, and become comfortable with the interview format.

Answerly provides a low-pressure sandbox for that practice. The public site explains the problem and offers a live demo; registered users get a personal setup flow, interview archive, and profile.

## Features

- Public landing page, question library, project story, and live mock-room demo
- Registration and JWT-based login backed by PostgreSQL
- Two-step practice setup: level, track, mode, and study focus
- Timed interview room with optional camera/microphone, transcript capture, recording, and local answer scoring
- Candidate-controlled delivery signals: speaking pace, pause count, camera/mic availability, and a self-check note
- Results dashboard, mentor link flow, and account-specific interview history
- Responsive Framer Motion interactions and an optional, performance-gated Vanta Fog background

## Tech stack

| Area | Tools |
| --- | --- |
| Frontend | React, Create React App, Framer Motion, Lucide React |
| Backend | FastAPI, SQLAlchemy async, Pydantic |
| Database | PostgreSQL, asyncpg |
| Auth | JWT with `python-jose`, bcrypt password hashing |
| Media | Browser MediaDevices, MediaRecorder, Web Speech API when available |

## Project structure

```text
WebChamp/
├── frontend/                 # React application
│   ├── src/
│   ├── .env                  # Local frontend API URL (not committed)
│   └── .env.example
└── frontend/backend/         # FastAPI application
    ├── app/
    ├── .env                  # Local database/API secrets (not committed)
    └── requirements.txt
```

## Prerequisites

- Node.js 18+
- Python 3.12 (Python 3.14 is not supported by the pinned `asyncpg` version)
- PostgreSQL 16+ running locally on port `5432`

## Local installation

### 1. Create the PostgreSQL database

Install PostgreSQL, then open PowerShell and run:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d postgres
```

Enter the PostgreSQL password, then run:

```sql
CREATE DATABASE antigravity;
\q
```

`antigravity` is only the local database name; it is not an extra program.

### 2. Configure and run the backend

```powershell
cd frontend\backend
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Copy `.env.example` to `.env` if needed, then set the PostgreSQL password you chose during installation:

```env
DATABASE_URL=postgresql+asyncpg://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/antigravity
SECRET_KEY=replace-this-in-production
FRONTEND_URL=http://localhost:3000
```

Create the tables and seed the interview questions:

```powershell
.\.venv\Scripts\python.exe -m app.seed
```

Start the API:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

Check it at [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health). You should receive:

```json
{"status":"ok"}
```

### 3. Configure and run the frontend

In a second terminal:

```powershell
cd frontend
npm install
npm start
```

The frontend runs at [http://localhost:3000](http://localhost:3000).

The API address is controlled by `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:8000/api/v1
```

Restart `npm start` after changing a Create React App environment variable.

## Demo flow

1. Open the site and select **Live Demo** to try the public mock interview room without an account.
2. Create an account with a valid email and a password of at least six characters.
3. Select a practice track and level.
4. Answer a timed question with your microphone/camera or type your response.
5. Review the local answer feedback and open the saved session from **History**.

## Privacy notes

- Camera and microphone access are optional.
- The app does not infer emotions from camera footage.
- Delivery check-ins are explicitly selected by the candidate.
- Media recording is handled in the browser; production deployments should configure secure object storage before storing recordings.

## Environment files

Real `.env` files are ignored by Git. Commit only the provided `.env.example` templates and never commit database passwords, JWT secrets, or API keys.

## Production build

```powershell
cd frontend
npm run build
```

The optimized frontend is written to `frontend/build`.

