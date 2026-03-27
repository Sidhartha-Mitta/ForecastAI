# Forecast AI Frontend

React + Vite + TailwindCSS frontend for the `ML_Model` FastAPI backend.

## Run locally

1. Start the FastAPI app from `ML_Model` on port `8000`.
2. Start the frontend:

```bash
npm install
npm run dev
```

The Vite dev server proxies `/api/*` requests to `http://127.0.0.1:8000`.
