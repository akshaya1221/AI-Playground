# AI-Playground v1.0.0

AI-Playground is a no-code machine learning experimentation platform. It helps users upload CSV datasets, inspect data quality, choose a target column, train classification or regression models, compare results, tune hyperparameters, make predictions, export trained models, and download PDF experiment reports.

## Features

- CSV upload and dataset preview
- Dataset insights with missing values, duplicate rows, and column summaries
- Target column selection
- Classification and regression support
- Advanced preprocessing controls
- Custom train/test split and cross-validation
- Single model training
- Model comparison with charts and recommendations
- Hyperparameter tuning with GridSearchCV
- Feature importance and correlation insights
- Prediction using trained or imported models
- Model export and import using `.joblib`
- PDF experiment report generation
- Experiment history using browser localStorage
- Professional responsive dashboard UI
- Deployment-ready frontend and backend configuration

## Architecture

```text
AI-Playground/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── Procfile
│   ├── runtime.txt
│   ├── uploads/
│   ├── models/
│   └── reports/
├── frontend/
│   ├── .env.example
│   ├── package.json
│   └── src/
├── DEPLOYMENT.md
├── TESTING_CHECKLIST.md
└── RELEASE_NOTES_v1.0.0.md
```

## Technology Stack

- Frontend: React, Vite, Tailwind CSS
- Charts: Recharts
- Icons: lucide-react
- Backend: FastAPI
- Machine Learning: pandas, scikit-learn, joblib
- PDF Reports: reportlab
- Storage: local folders for uploads, models, and reports
- History: browser localStorage

## Installation

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
copy .env.example .env
```

`frontend/.env` should contain:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Running Backend

Development:

```bash
cd backend
uvicorn main:app --reload
```

Production-style:

```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

Health check:

```text
http://localhost:8000/health
```

Expected response:

```json
{
  "status": "healthy"
}
```

## Running Frontend

```bash
cd frontend
npm run dev
```

Production build:

```bash
cd frontend
npm run build
```

## Windows Quick Start

Double-click:

```text
start_project.bat
```

This opens backend and frontend in separate command windows.

## Usage Guide

1. Upload a CSV dataset.
2. Select the target column.
3. Choose classification or regression.
4. Review dataset insights.
5. Adjust preprocessing and evaluation settings if needed.
6. Train a model.
7. Review metrics, confusion matrix, classification report, or regression metrics.
8. Compare models.
9. Tune model hyperparameters.
10. Analyze feature importance and correlations.
11. Make predictions using the trained model.
12. Export/import `.joblib` models if needed.
13. Download the PDF experiment report.
14. Review saved experiments in Experiment History.

## Screenshots

Add screenshots for your final submission here:

- Dashboard overview
- Dataset upload and preview
- Training results
- Model comparison chart
- Prediction result
- PDF report

## Deployment Guide

Deployment instructions are available in [DEPLOYMENT.md](DEPLOYMENT.md).

Supported deployment targets:

- Frontend: Vercel or Netlify
- Backend: Render or Railway

Important environment variables:

```env
VITE_API_BASE_URL=https://your-backend-url
CORS_ORIGINS=https://your-frontend-url
```

## Future Improvements

- User accounts and cloud experiment storage
- Database-backed experiment history
- More ML algorithms
- Advanced visualizations
- Dataset versioning
- Cloud model registry
- Automated deployment pipeline

## Known Limitations

- Uploaded files, models, and reports are stored locally on the backend server.
- Experiment history is stored in browser localStorage.
- Imported models should be `.joblib` files exported by AI-Playground.
- Very small datasets can produce unstable evaluation scores.

## License

MIT License

## Author

Final-year project by the AI-Playground project author.
