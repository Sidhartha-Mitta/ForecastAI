# Deployment Guide

## Architecture

- `ML_Model`: FastAPI backend that loads the trained models and serves prediction APIs.
- `Frontend`: React + Vite frontend that consumes the backend APIs.

Recommended production setup:

1. Deploy `ML_Model` as a Python web service or Docker container.
2. Deploy `Frontend` as a static site.
3. Set `VITE_API_BASE_URL` in the frontend to the deployed backend URL.

## Backend Deployment

Backend root:

```bash
/home/user/FAI/ML_Model
```

### Option A: Render / Railway / similar Python service

Build/install:

```bash
pip install -r requirements.txt
```

Start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Required files already added:

- `requirements.txt`
- `Dockerfile`

Environment variables:

- `GEMINI_API_KEY`
- `GEMINI_MODEL` (optional, defaults to `gemini-1.5-flash`)

Health endpoints:

- `/health`
- `/meta`

### Option B: Docker

From `ML_Model`:

```bash
docker build -t forecast-ai-backend .
docker run -p 8000:8000 --env GEMINI_API_KEY=your_key forecast-ai-backend
```

## Frontend Deployment

Frontend root:

```bash
/home/user/FAI/Frontend
```

Install and build:

```bash
npm install
npm run build
```

Build output:

```bash
dist
```

Environment variables:

- `VITE_API_BASE_URL=https://your-backend-domain`

Example file:

- `Frontend/.env.example`

### Vercel / Netlify

Use:

- Build command: `npm run build`
- Output directory: `dist`
- Root directory: `Frontend`

Add environment variable:

```bash
VITE_API_BASE_URL=https://your-backend-domain
```

## Recommended Deployment Flow

1. Deploy the backend first.
2. Open `https://your-backend-domain/health` and confirm it returns `{"status":"ok"}`.
3. Open `https://your-backend-domain/meta` and confirm metadata loads.
4. Deploy the frontend with `VITE_API_BASE_URL` set to that backend URL.
5. Test prediction, charts, and AI explanation in production.

## Notes

- The backend includes TensorFlow and model files, so choose a service that supports larger Python deployments.
- The frontend is already configured as an installable web app (PWA), so once deployed over HTTPS it can be added to a mobile home screen.
- The backend now loads model files using absolute paths relative to the project, which is safer for hosted environments.
