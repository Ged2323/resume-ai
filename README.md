# Resume AI

Paste a job description and your resume — get a tailored cover letter and a skill gap analysis in seconds.

Powered by **NVIDIA NIM** + **DeepSeek V4 Flash** (free endpoint).

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | FastAPI + Python 3.11 |
| AI | NVIDIA NIM — DeepSeek V4 Flash |

## Setup

### 1. Get a NVIDIA NIM API key
Sign up at [build.nvidia.com](https://build.nvidia.com) → free tier available.

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env and add your NVIDIA_API_KEY

poetry install
uvicorn app.main:app --reload
# Runs on http://localhost:8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173), paste a job description and resume, click **Generate**.

## API

`POST /api/generate`

```json
{
  "job_description": "...",
  "resume": "..."
}
```

Response:
```json
{
  "cover_letter": "...",
  "gap_analysis": "..."
}
```
