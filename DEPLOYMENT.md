# AI-Playground Deployment Guide

AI-Playground has two deployable parts:

- Frontend: React + Vite
- Backend: FastAPI + scikit-learn

Deploy the backend first so you can copy its public URL into the frontend environment variable.

## Environment Variables

### Frontend

Create this variable on Vercel or Netlify:

```env
VITE_API_BASE_URL=https://your-backend-url
```

For local development, copy `frontend/.env.example` to `frontend/.env` and adjust the URL if your backend uses a different port.

### Backend

Set this variable on Render or Railway:

```env
CORS_ORIGINS=https://your-frontend-url
```

For multiple frontend URLs, separate them with commas:

```env
CORS_ORIGINS=https://your-site.vercel.app,https://your-site.netlify.app
```

## Deploy Frontend on Vercel

1. Push the project to GitHub.
2. Open Vercel and choose **New Project**.
3. Import the repository.
4. Set the root directory to `frontend`.
5. Add environment variable:
   - `VITE_API_BASE_URL`
   - value: your deployed backend URL
6. Build command:

```bash
npm run build
```

7. Output directory:

```bash
dist
```

8. Deploy.

## Deploy Frontend on Netlify

1. Push the project to GitHub.
2. Open Netlify and choose **Add new site**.
3. Import the repository.
4. Set base directory:

```bash
frontend
```

5. Build command:

```bash
npm run build
```

6. Publish directory:

```bash
frontend/dist
```

7. Add environment variable:
   - `VITE_API_BASE_URL`
   - value: your deployed backend URL
8. Deploy.

## Deploy Backend on Render

1. Push the project to GitHub.
2. Open Render and choose **New Web Service**.
3. Connect the repository.
4. Set root directory:

```bash
backend
```

5. Build command:

```bash
pip install -r requirements.txt
```

6. Start command:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

7. Add environment variable:
   - `CORS_ORIGINS`
   - value: your deployed frontend URL
8. Deploy.
9. Test the health endpoint:

```text
https://your-backend-url/health
```

It should return:

```json
{
  "status": "healthy"
}
```

## Deploy Backend on Railway

1. Push the project to GitHub.
2. Open Railway and create a new project from the repository.
3. Set the service root directory to `backend`.
4. Use this start command if Railway asks for one:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

5. Add environment variable:
   - `CORS_ORIGINS`
   - value: your deployed frontend URL
6. Deploy.
7. Open `/health` on the backend URL to confirm the service is running.

## Local Production Test

### Backend

From the `backend` folder:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

Then open:

```text
http://localhost:8000/health
```

### Frontend

From the `frontend` folder:

```bash
copy .env.example .env
npm run build
npm run preview
```

Open the preview URL and test the full workflow.

## Troubleshooting

### Frontend says Failed to fetch

- Check that `VITE_API_BASE_URL` points to the deployed backend URL.
- Do not include a trailing slash in the backend URL.
- Confirm the backend `/health` endpoint works.
- Check that backend `CORS_ORIGINS` includes the frontend URL.

### Upload or report generation fails

- Confirm the backend service has write access for local folders such as `uploads`, `models`, and `reports`.
- Restart the backend service after changing environment variables.

### Model prediction fails after import

- Only import `.joblib` files exported by AI-Playground.
- Train or import a model before using the prediction section.

### Backend deploy fails

- Confirm `backend/requirements.txt` is used during install.
- Confirm the start command uses:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

