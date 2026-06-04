# AI-Playground v1.0.0 Testing Checklist

Use this checklist before a demo, viva, or deployment.

## Setup

- [ ] Backend dependencies install successfully with `pip install -r requirements.txt`.
- [ ] Frontend dependencies install successfully with `npm install`.
- [ ] Backend starts with `uvicorn main:app --host 0.0.0.0 --port 8000`.
- [ ] Frontend starts with `npm run dev`.
- [ ] `GET /health` returns `{ "status": "healthy" }`.
- [ ] `npm run build` completes successfully.

## Dataset Upload

- [ ] CSV upload works.
- [ ] Non-CSV upload shows a friendly error.
- [ ] Dataset preview appears.
- [ ] Row count, column count, and column names appear.

## Classification

- [ ] Upload `student_performance.csv`.
- [ ] Select target column `Result`.
- [ ] Select task type `Classification`.
- [ ] Train `Decision Tree`.
- [ ] Accuracy appears.
- [ ] Confusion matrix appears.
- [ ] Classification report appears.

## Regression

- [ ] Upload a dataset with a numeric target such as `FinalMarks`.
- [ ] Select task type `Regression`.
- [ ] Train `Random Forest Regressor`.
- [ ] R2 score appears.
- [ ] MAE, MSE, and RMSE appear.
- [ ] Classification-only tables are hidden for regression.

## Prediction

- [ ] Train a model.
- [ ] Prediction inputs appear.
- [ ] Empty prediction inputs keep the button disabled.
- [ ] Prediction returns a clear result.

## Model Comparison

- [ ] Compare all models works for classification.
- [ ] Compare all models works for regression.
- [ ] Best model is highlighted.
- [ ] Recommendation card appears.
- [ ] Chart renders correctly.

## Cross-Validation

- [ ] Test size dropdown works.
- [ ] Random state input works.
- [ ] Cross-validation can be enabled.
- [ ] CV scores, mean, and standard deviation appear.
- [ ] CV comparison results appear.

## Feature Analysis

- [ ] Feature importance route works.
- [ ] Feature importance table appears.
- [ ] Feature importance chart appears.
- [ ] Correlation insights appear for numeric targets.
- [ ] Friendly message appears when correlation is not suitable.

## Hyperparameter Tuning

- [ ] Tune `Decision Tree`.
- [ ] Tune `Random Forest`.
- [ ] Best parameters appear.
- [ ] Tuned score appears.
- [ ] Tuning result can be included in the report.

## Advanced Preprocessing

- [ ] Missing numeric strategy works.
- [ ] Missing categorical strategy works.
- [ ] Remove duplicates toggle works.
- [ ] Remove constant columns toggle works.
- [ ] Scaling toggle works.
- [ ] Encoding strategy dropdown works.
- [ ] Preprocessing summary appears after training.

## Model Export and Import

- [ ] Trained model downloads as `.joblib`.
- [ ] Invalid model file shows a friendly error.
- [ ] Exported `.joblib` imports successfully.
- [ ] Imported model can be used for prediction.

## PDF Report

- [ ] Report downloads after training.
- [ ] Report includes timestamp and v1.0.0.
- [ ] Report includes dataset summary.
- [ ] Report includes training metrics.
- [ ] Report includes comparison results when available.
- [ ] Report includes recommendation when available.
- [ ] Report includes feature analysis when available.
- [ ] Report includes prediction result when available.

## Dashboard and History

- [ ] Dashboard is responsive on mobile, tablet, laptop, and desktop.
- [ ] Tables scroll horizontally on small screens.
- [ ] Experiment saves after training.
- [ ] View Details works.
- [ ] Delete history item works.
- [ ] Clear All History works.

## Accessibility and UX

- [ ] Buttons can be reached with keyboard navigation.
- [ ] Form controls have labels.
- [ ] Disabled buttons look disabled.
- [ ] Loading states appear during long actions.
- [ ] Success messages are clear.
- [ ] Error messages are friendly.
