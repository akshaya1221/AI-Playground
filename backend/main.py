import os
import shutil
import uuid
from datetime import datetime
from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from sklearn.ensemble import RandomForestClassifier
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LogisticRegression
from sklearn.linear_model import LinearRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)
from sklearn.model_selection import GridSearchCV, cross_val_score, train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neighbors import KNeighborsRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier
from sklearn.tree import DecisionTreeRegressor

app = FastAPI(title="AI-Playground Backend")

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
MODELS_DIR = Path("models")
MODELS_DIR.mkdir(exist_ok=True)
REPORTS_DIR = Path("reports")
REPORTS_DIR.mkdir(exist_ok=True)


class TrainRequest(BaseModel):
    filename: str
    target_column: str
    model_name: str
    task_type: str | None = None
    test_size: float = 0.2
    random_state: int = 42
    use_cross_validation: bool = False
    cv_folds: int = 5
    preprocessing_settings: dict | None = None


class CompareRequest(BaseModel):
    filename: str
    target_column: str
    task_type: str | None = None
    use_cross_validation: bool = False
    cv_folds: int = 5
    preprocessing_settings: dict | None = None


class PredictRequest(BaseModel):
    model_id: str
    input_data: dict


class FeatureAnalysisRequest(BaseModel):
    filename: str
    target_column: str
    task_type: str | None = None
    model_name: str | None = None
    preprocessing_settings: dict | None = None


class ReportRequest(BaseModel):
    filename: str | None = None
    target_column: str | None = None
    selected_model: str | None = None
    task_type: str | None = None
    evaluation_settings: dict | None = None
    accuracy: float | None = None
    r2_score: float | None = None
    mean_absolute_error: float | None = None
    mean_squared_error: float | None = None
    root_mean_squared_error: float | None = None
    cv_scores: list | None = None
    cv_mean_score: float | None = None
    cv_std_score: float | None = None
    cv_folds: int | None = None
    total_rows: int | None = None
    training_rows: int | None = None
    testing_rows: int | None = None
    feature_columns: list | None = None
    dataset_insights: dict | None = None
    feature_analysis: dict | None = None
    preprocessing_summary: dict | None = None
    confusion_matrix: list | None = None
    class_labels: list | None = None
    classification_report: dict | None = None
    comparison_results: list | None = None
    best_model: dict | None = None
    recommendation: dict | None = None
    tuning_result: dict | None = None
    prediction_result: dict | None = None
    model_portability: dict | None = None


DEFAULT_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5199",
    "http://127.0.0.1:5199",
    "http://localhost:5200",
    "http://127.0.0.1:5200",
]

cors_origins_from_env = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=DEFAULT_CORS_ORIGINS + cors_origins_from_env,
    allow_origin_regex=r"https://.*\.(vercel\.app|netlify\.app)$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Return friendly, consistent API errors for the frontend."""
    message = exc.detail if isinstance(exc.detail, str) else "Request failed."
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": message, "detail": message},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Avoid leaking raw tracebacks to users in production."""
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Something went wrong. Please try again.",
            "detail": "Something went wrong. Please try again.",
        },
    )


def normalize_task_type(task_type):
    if task_type is None:
        return None

    normalized = task_type.lower().strip()
    if normalized not in ["classification", "regression"]:
        raise HTTPException(status_code=400, detail="Invalid task type selected.")

    return normalized


def detect_task_type(target_series, requested_task_type=None):
    """Auto-detect classification vs regression when the user does not choose."""
    normalized_task_type = normalize_task_type(requested_task_type)
    if normalized_task_type:
        return normalized_task_type

    if not pd.api.types.is_numeric_dtype(target_series):
        return "classification"

    unique_count = target_series.nunique(dropna=True)
    if unique_count <= 10:
        return "classification"

    return "regression"


def normalize_preprocessing_settings(settings=None):
    defaults = {
        "remove_duplicates": True,
        "remove_constant_columns": True,
        "numeric_missing_strategy": "mean",
        "categorical_missing_strategy": "mode",
        "scale_numeric": False,
        "encoding_strategy": "onehot",
    }
    settings = {**defaults, **(settings or {})}

    if settings["numeric_missing_strategy"] not in ["mean", "median", "zero"]:
        raise HTTPException(status_code=400, detail="Invalid numeric missing value strategy.")
    if settings["categorical_missing_strategy"] not in ["mode", "unknown"]:
        raise HTTPException(status_code=400, detail="Invalid categorical missing value strategy.")
    if settings["encoding_strategy"] not in ["onehot", "label"]:
        raise HTTPException(status_code=400, detail="Invalid categorical encoding strategy.")

    return settings


def get_models(task_type="classification", training_rows=None):
    """Return the simple classification models used in this project."""
    knn_neighbors = 5 if training_rows is None else min(5, training_rows)

    if task_type == "classification":
        return {
            "Logistic Regression": LogisticRegression(max_iter=1000),
            "Decision Tree": DecisionTreeClassifier(random_state=42),
            "Random Forest": RandomForestClassifier(random_state=42),
            "KNN": KNeighborsClassifier(n_neighbors=knn_neighbors),
            "Naive Bayes": GaussianNB(),
        }

    if task_type == "regression":
        return {
            "Linear Regression": LinearRegression(),
            "Decision Tree Regressor": DecisionTreeRegressor(random_state=42),
            "Random Forest Regressor": RandomForestRegressor(random_state=42),
            "KNN Regressor": KNeighborsRegressor(n_neighbors=knn_neighbors),
        }

    raise HTTPException(status_code=400, detail="Invalid task type selected.")


def get_parameter_grid(model_name, task_type="classification"):
    """Return beginner-friendly hyperparameter options for GridSearchCV."""
    parameter_grids = {
        "classification": {
            "Decision Tree": {
                "max_depth": [2, 3, 5, 10, None],
                "criterion": ["gini", "entropy"],
            },
            "Random Forest": {
                "n_estimators": [50, 100],
                "max_depth": [3, 5, 10, None],
            },
            "KNN": {
                "n_neighbors": [3, 5, 7],
                "weights": ["uniform", "distance"],
            },
            "Logistic Regression": {
                "C": [0.1, 1.0, 10.0],
                "max_iter": [500],
            },
            "Naive Bayes": {
                "var_smoothing": [1e-9, 1e-8, 1e-7],
            },
        },
        "regression": {
            "Decision Tree Regressor": {
                "max_depth": [2, 3, 5, 10, None],
            },
            "Random Forest Regressor": {
                "n_estimators": [50, 100],
                "max_depth": [3, 5, 10, None],
            },
            "KNN Regressor": {
                "n_neighbors": [3, 5, 7],
                "weights": ["uniform", "distance"],
            },
        },
    }

    return parameter_grids.get(task_type, {}).get(model_name)


def prepare_training_data(filename, target_column, task_type=None, preprocessing_settings=None):
    """Load a CSV and prepare features/target for classification or regression."""
    file_path = UPLOAD_DIR / Path(filename).name

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Uploaded file was not found.")

    try:
        dataframe = pd.read_csv(file_path)
    except Exception as error:
        raise HTTPException(status_code=400, detail="Could not read the CSV file.") from error

    settings = normalize_preprocessing_settings(preprocessing_settings)
    rows_before_cleaning = len(dataframe)
    duplicate_rows_removed = 0

    if settings["remove_duplicates"]:
        duplicate_rows_removed = int(dataframe.duplicated().sum())
        dataframe = dataframe.drop_duplicates()

    if target_column not in dataframe.columns:
        raise HTTPException(status_code=400, detail="Target column was not found.")

    if len(dataframe) < 5:
        raise HTTPException(
            status_code=400,
            detail="Dataset is too small. Please upload at least 5 rows.",
        )

    X = dataframe.drop(columns=[target_column])
    constant_columns_removed = []

    if settings["remove_constant_columns"]:
        constant_columns_removed = [
            column for column in X.columns if X[column].nunique(dropna=False) <= 1
        ]
        X = X.drop(columns=constant_columns_removed)

    if X.empty:
        raise HTTPException(
            status_code=400,
            detail="No usable feature columns left after preprocessing.",
        )

    y = dataframe[target_column]
    feature_columns = X.columns.tolist()
    detected_task_type = detect_task_type(y, task_type)

    if detected_task_type == "classification" and y.nunique(dropna=True) < 2:
        raise HTTPException(
            status_code=400,
            detail="Target column must contain at least 2 different values.",
        )

    if detected_task_type == "regression":
        y = pd.to_numeric(y, errors="coerce")
        if y.isna().any():
            mean_value = y.mean()
            if pd.isna(mean_value):
                raise HTTPException(
                    status_code=400,
                    detail="Regression target column must contain numeric values.",
                )
            y = y.fillna(mean_value)

    # Fill missing values in a beginner-friendly way before training.
    numeric_columns = X.select_dtypes(include=["number"]).columns
    categorical_columns = X.columns.difference(numeric_columns)
    numeric_fill_values = {}
    categorical_fill_values = {}

    for column in numeric_columns:
        if settings["numeric_missing_strategy"] == "median":
            fill_value = X[column].median()
        elif settings["numeric_missing_strategy"] == "zero":
            fill_value = 0
        else:
            fill_value = X[column].mean()
        fill_value = 0 if pd.isna(fill_value) else fill_value
        numeric_fill_values[column] = fill_value
        X[column] = X[column].fillna(fill_value)

    for column in categorical_columns:
        if settings["categorical_missing_strategy"] == "unknown":
            fill_value = "Unknown"
        else:
            mode_value = X[column].mode()
            fill_value = mode_value.iloc[0] if not mode_value.empty else "Unknown"
        categorical_fill_values[column] = fill_value
        X[column] = X[column].fillna(fill_value)

    if detected_task_type == "classification" and y.isna().any():
        mode_value = y.mode()
        y = y.fillna(mode_value.iloc[0] if not mode_value.empty else "Unknown")

    scaler = None
    if settings["scale_numeric"] and len(numeric_columns) > 0:
        scaler = StandardScaler()
        X[numeric_columns] = scaler.fit_transform(X[numeric_columns])

    categorical_label_mappings = {}
    if settings["encoding_strategy"] == "label":
        for column in categorical_columns:
            categories = sorted(X[column].astype(str).unique().tolist())
            categorical_label_mappings[column] = categories
            X[column] = pd.Categorical(X[column].astype(str), categories=categories).codes
    else:
        X = pd.get_dummies(X)

    dummy_columns = X.columns.tolist()

    if detected_task_type == "regression":
        report_labels = []
        class_labels = []
        label_encoder = None
    elif pd.api.types.is_numeric_dtype(y):
        report_labels = sorted(y.unique().tolist())
        class_labels = [str(label) for label in report_labels]
        label_encoder = None
    else:
        label_encoder = LabelEncoder()
        y = label_encoder.fit_transform(y.astype(str))
        report_labels = list(range(len(label_encoder.classes_)))
        class_labels = label_encoder.classes_.tolist()

    preprocessing_info = {
        "feature_columns": feature_columns,
        "numeric_columns": numeric_columns.tolist(),
        "categorical_columns": categorical_columns.tolist(),
        "numeric_fill_values": numeric_fill_values,
        "categorical_fill_values": categorical_fill_values,
        "scaler": scaler,
        "categorical_label_mappings": categorical_label_mappings,
        "dummy_columns": dummy_columns,
        "label_encoder": label_encoder,
        "class_labels": class_labels,
        "task_type": detected_task_type,
        "preprocessing_settings": settings,
        "preprocessing_summary": {
            "preprocessing_settings_used": settings,
            "rows_before_cleaning": rows_before_cleaning,
            "rows_after_cleaning": len(dataframe),
            "duplicate_rows_removed": duplicate_rows_removed,
            "constant_columns_removed": constant_columns_removed,
            "numeric_missing_strategy": settings["numeric_missing_strategy"],
            "categorical_missing_strategy": settings["categorical_missing_strategy"],
            "scale_numeric": settings["scale_numeric"],
            "encoding_strategy": settings["encoding_strategy"],
        },
    }

    return dataframe, X, y, feature_columns, report_labels, class_labels, preprocessing_info, detected_task_type


def validate_evaluation_settings(total_rows, test_size=0.2, cv_folds=5):
    if test_size < 0.1 or test_size > 0.5:
        raise HTTPException(
            status_code=400,
            detail="test_size must be between 0.1 and 0.5.",
        )

    if cv_folds < 3 or cv_folds > 10:
        raise HTTPException(
            status_code=400,
            detail="cv_folds must be between 3 and 10.",
        )

    if cv_folds > total_rows:
        raise HTTPException(
            status_code=400,
            detail="cv_folds cannot be greater than the number of rows.",
        )


def get_safe_cv_folds(y, task_type, requested_folds):
    if task_type == "classification":
        min_class_count = int(pd.Series(y).value_counts().min())
        if min_class_count < 2:
            raise HTTPException(
                status_code=400,
                detail="Cross-validation needs at least 2 rows for each target class.",
            )
        return min(requested_folds, min_class_count)

    return requested_folds


def run_cross_validation(model, X, y, task_type, cv_folds):
    scoring = "accuracy" if task_type == "classification" else "r2"
    scores = cross_val_score(model, X, y, cv=cv_folds, scoring=scoring)

    return {
        "cv_scores": [round(float(score), 4) for score in scores],
        "cv_mean_score": round(float(scores.mean()), 4),
        "cv_std_score": round(float(scores.std()), 4),
        "cv_folds": cv_folds,
    }


def split_training_data(X, y, test_size=0.2, random_state=42):
    return train_test_split(X, y, test_size=test_size, random_state=random_state)


def prepare_prediction_input(input_data, preprocessing_info):
    """Apply the same simple preprocessing used during training."""
    if not isinstance(input_data, dict) or not input_data:
        raise HTTPException(status_code=400, detail="Invalid input data.")

    feature_columns = preprocessing_info["feature_columns"]
    missing_columns = [column for column in feature_columns if column not in input_data]

    if missing_columns:
        raise HTTPException(
            status_code=400,
            detail=f"Missing input values for: {', '.join(missing_columns)}",
        )

    input_frame = pd.DataFrame([{column: input_data[column] for column in feature_columns}])

    for column in preprocessing_info["numeric_columns"]:
        input_frame[column] = pd.to_numeric(input_frame[column], errors="coerce")
        input_frame[column] = input_frame[column].fillna(
            preprocessing_info["numeric_fill_values"][column]
        )

    for column in preprocessing_info["categorical_columns"]:
        input_frame[column] = input_frame[column].fillna(
            preprocessing_info["categorical_fill_values"][column]
        )

    scaler = preprocessing_info.get("scaler")
    numeric_columns = preprocessing_info["numeric_columns"]
    if scaler is not None and numeric_columns:
        input_frame[numeric_columns] = scaler.transform(input_frame[numeric_columns])

    if preprocessing_info.get("preprocessing_settings", {}).get("encoding_strategy") == "label":
        for column, categories in preprocessing_info.get("categorical_label_mappings", {}).items():
            input_frame[column] = pd.Categorical(
                input_frame[column].astype(str),
                categories=categories,
            ).codes
    else:
        input_frame = pd.get_dummies(input_frame)

    input_frame = input_frame.reindex(
        columns=preprocessing_info["dummy_columns"],
        fill_value=0,
    )

    return input_frame


def add_heading(story, styles, text):
    story.append(Paragraph(text, styles["Heading2"]))
    story.append(Spacer(1, 8))


def add_key_value_table(story, rows):
    table = Table(rows, colWidths=[170, 330])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), colors.whitesmoke),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("PADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(table)
    story.append(Spacer(1, 14))


def safe_text(value):
    if value is None:
        return "Not available"
    if isinstance(value, float):
        return f"{value:.4f}"
    return str(value)


def build_model_recommendation(results, best_model, total_rows):
    """Create simple rule-based suggestions after model comparison."""
    score_key = "cv_mean_score" if "cv_mean_score" in best_model else "accuracy"
    score_label = "cross-validation mean accuracy" if score_key == "cv_mean_score" else "accuracy"
    best_accuracy = best_model[score_key]
    tied_models = [
        result["model_name"]
        for result in results
        if result.get(score_key) == best_accuracy
    ]

    if len(tied_models) > 1:
        reason = (
            f"{', '.join(tied_models)} achieved the same highest accuracy "
            "among all tested models."
        )
    else:
        reason = (
            f"{best_model['model_name']} achieved the highest {score_label} "
            "among all tested models."
        )

    if best_accuracy >= 0.9:
        suggestion = "This model performed very well on the current dataset."
    elif best_accuracy >= 0.7:
        suggestion = (
            "This model performed reasonably well. Try adding more data for better reliability."
        )
    else:
        suggestion = (
            "Model performance is low. Consider cleaning data, adding more rows, "
            "or choosing better features."
        )

    if total_rows < 50:
        caution = "The dataset is small. Accuracy may not be reliable."
    else:
        caution = "Review results with new data before using the model for important decisions."

    return {
        "recommended_model": best_model["model_name"],
        "recommended_accuracy": best_accuracy,
        "recommended_metric": score_label,
        "reason": reason,
        "suggestion": suggestion,
        "caution": caution,
    }


def calculate_regression_metrics(y_test, predictions):
    mse = mean_squared_error(y_test, predictions)

    return {
        "r2_score": round(float(r2_score(y_test, predictions)), 4),
        "mean_absolute_error": round(float(mean_absolute_error(y_test, predictions)), 4),
        "mean_squared_error": round(float(mse), 4),
        "root_mean_squared_error": round(float(mse ** 0.5), 4),
    }


def group_dummy_feature_importances(dummy_importances, dummy_columns, feature_columns):
    """Group one-hot encoded feature importances back to the original columns."""
    grouped_importances = {feature: 0.0 for feature in feature_columns}

    for dummy_column, importance in zip(dummy_columns, dummy_importances):
        matched_feature = None
        for feature in feature_columns:
            if dummy_column == feature or dummy_column.startswith(f"{feature}_"):
                matched_feature = feature
                break

        if matched_feature:
            grouped_importances[matched_feature] += float(importance)

    return [
        {
            "feature_name": feature,
            "importance_score": round(score, 4),
        }
        for feature, score in sorted(
            grouped_importances.items(),
            key=lambda item: item[1],
            reverse=True,
        )
    ]


def calculate_correlation_insights(dataframe, target_column, task_type):
    if task_type != "regression" and not pd.api.types.is_numeric_dtype(dataframe[target_column]):
        return [], "Correlation is mainly useful for numeric targets."

    numeric_dataframe = dataframe.select_dtypes(include=["number"])
    if target_column not in numeric_dataframe.columns:
        return [], "Correlation is mainly useful for numeric targets."

    correlations = numeric_dataframe.corr(numeric_only=True)[target_column].drop(
        labels=[target_column],
        errors="ignore",
    )

    sorted_correlations = correlations.reindex(
        correlations.abs().sort_values(ascending=False).index
    )

    return [
        {
            "feature_name": feature,
            "correlation_value": round(float(value), 4),
        }
        for feature, value in sorted_correlations.items()
        if pd.notna(value)
    ], "Correlation shows how strongly numeric features move with the numeric target."


def build_regression_recommendation(results, best_model, total_rows):
    score_key = "cv_mean_score" if "cv_mean_score" in best_model else "r2_score"
    score_label = "cross-validation mean R2 score" if score_key == "cv_mean_score" else "R2 score"
    best_r2 = best_model[score_key]
    tied_models = [
        result["model_name"]
        for result in results
        if result.get(score_key) == best_r2
    ]

    if len(tied_models) > 1:
        reason = (
            f"{', '.join(tied_models)} achieved the same highest R2 score "
            "among all tested regression models."
        )
    else:
        reason = (
            f"{best_model['model_name']} achieved the highest {score_label} "
            "among all tested regression models."
        )

    if best_r2 >= 0.8:
        suggestion = "This regression model explains the numeric target well on the current dataset."
    elif best_r2 >= 0.5:
        suggestion = "This regression model is reasonable, but more data may improve reliability."
    else:
        suggestion = "Regression performance is weak. Consider cleaning data, adding rows, or improving features."

    if total_rows < 50:
        caution = "The dataset is small. Regression metrics may not be reliable."
    elif best_r2 < 0.5:
        caution = "The R2 score is low, so predictions may be weak."
    else:
        caution = "Validate the regression model with fresh data before using predictions."

    return {
        "recommended_model": best_model["model_name"],
        "recommended_accuracy": best_r2,
        "recommended_metric": score_label,
        "reason": reason,
        "suggestion": suggestion,
        "caution": caution,
    }


def add_list_section(story, styles, title, values):
    add_heading(story, styles, title)
    if values:
        for value in values:
            story.append(Paragraph(f"- {safe_text(value)}", styles["Normal"]))
    else:
        story.append(Paragraph("Not available", styles["Normal"]))
    story.append(Spacer(1, 14))


def add_matrix_table(story, labels, matrix):
    if not labels or not matrix:
        story.append(Paragraph("Not available", getSampleStyleSheet()["Normal"]))
        story.append(Spacer(1, 14))
        return

    rows = [["Actual \\ Predicted", *labels]]
    for label, row in zip(labels, matrix):
        rows.append([label, *row])

    table = Table(rows)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                ("BACKGROUND", (0, 1), (0, -1), colors.whitesmoke),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
                ("ALIGN", (1, 1), (-1, -1), "CENTER"),
                ("PADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(table)
    story.append(Spacer(1, 14))


def add_classification_report_table(story, report):
    if not report:
        story.append(Paragraph("Not available", getSampleStyleSheet()["Normal"]))
        story.append(Spacer(1, 14))
        return

    rows = [["Class", "Precision", "Recall", "F1-score", "Support"]]
    for label, metrics in report.items():
        if label == "accuracy" or not isinstance(metrics, dict):
            continue
        rows.append(
            [
                label,
                safe_text(metrics.get("precision")),
                safe_text(metrics.get("recall")),
                safe_text(metrics.get("f1-score")),
                safe_text(metrics.get("support")),
            ]
        )

    table = Table(rows)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("PADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(table)
    story.append(Spacer(1, 14))


@app.get("/")
def read_root():
    """Simple health check route."""
    return {"message": "AI-Playground backend is running"}


@app.get("/health")
def health_check():
    """Deployment health check route."""
    return {"status": "healthy"}


@app.post("/upload")
def upload_csv(file: UploadFile = File(...)):
    """Upload a CSV file and return a small dataset preview."""
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a CSV file.")

    file_path = UPLOAD_DIR / Path(file.filename).name

    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as error:
        raise HTTPException(status_code=500, detail="Could not save the file.") from error

    try:
        dataframe = pd.read_csv(file_path)
    except Exception as error:
        raise HTTPException(status_code=400, detail="Could not read the CSV file.") from error

    preview = dataframe.head(5).astype(object).where(pd.notnull(dataframe.head(5)), None)

    return {
        "filename": file.filename,
        "row_count": len(dataframe),
        "column_count": len(dataframe.columns),
        "columns": dataframe.columns.tolist(),
        "preview": preview.to_dict(orient="records"),
    }


@app.post("/dataset-insights")
def dataset_insights(request: CompareRequest):
    """Return simple dataset information for the uploaded CSV."""
    file_path = UPLOAD_DIR / Path(request.filename).name

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Uploaded file was not found.")

    try:
        dataframe = pd.read_csv(file_path)
    except Exception as error:
        raise HTTPException(status_code=400, detail="Could not read the CSV file.") from error

    if request.target_column not in dataframe.columns:
        raise HTTPException(status_code=400, detail="Target column was not found.")

    return {
        "filename": request.filename,
        "target_column": request.target_column,
        "row_count": len(dataframe),
        "column_count": len(dataframe.columns),
        "duplicate_rows": int(dataframe.duplicated().sum()),
        "constant_columns": [
            column for column in dataframe.columns if column != request.target_column and dataframe[column].nunique(dropna=False) <= 1
        ],
        "missing_values": dataframe.isna().sum().to_dict(),
        "numeric_columns": dataframe.select_dtypes(include=["number"]).columns.tolist(),
        "categorical_columns": dataframe.select_dtypes(exclude=["number"]).columns.tolist(),
        "suggested_preprocessing_actions": [
            "Remove duplicate rows if any are present.",
            "Remove constant columns because they do not help the model.",
            "Fill missing numeric values and categorical values before training.",
            "Use one-hot encoding for categorical columns by default.",
        ],
    }


@app.post("/train")
def train_model(request: TrainRequest):
    """Train a simple classification or regression model using the uploaded CSV file."""
    (
        dataframe,
        X,
        y,
        feature_columns,
        report_labels,
        class_labels,
        preprocessing_info,
        task_type,
    ) = prepare_training_data(
        request.filename,
        request.target_column,
        request.task_type,
        request.preprocessing_settings,
    )
    models = get_models(task_type)

    if request.model_name not in models:
        raise HTTPException(status_code=400, detail="Invalid model for selected task type.")

    validate_evaluation_settings(
        len(dataframe),
        request.test_size,
        request.cv_folds,
    )

    try:
        X_train, X_test, y_train, y_test = split_training_data(
            X,
            y,
            request.test_size,
            request.random_state,
        )
        models = get_models(task_type, training_rows=len(X_train))
        model = models[request.model_name]
        model.fit(X_train, y_train)
        predictions = model.predict(X_test)
        cv_results = {}

        if request.use_cross_validation:
            safe_cv_folds = get_safe_cv_folds(y, task_type, request.cv_folds)
            cv_results = run_cross_validation(
                models[request.model_name],
                X,
                y,
                task_type,
                safe_cv_folds,
            )

        if task_type == "classification":
            accuracy = accuracy_score(y_test, predictions)
            matrix = confusion_matrix(y_test, predictions, labels=report_labels)
            report = classification_report(
                y_test,
                predictions,
                labels=report_labels,
                target_names=class_labels,
                output_dict=True,
                zero_division=0,
            )
            regression_metrics = {}
        else:
            accuracy = None
            matrix = []
            report = {}
            regression_metrics = calculate_regression_metrics(y_test, predictions)

        model_id = str(uuid.uuid4())
        joblib.dump(
            {
                "model": model,
                "model_name": request.model_name,
                "target_column": request.target_column,
                "preprocessing_info": preprocessing_info,
                "task_type": task_type,
            },
            MODELS_DIR / f"{model_id}.joblib",
        )
    except Exception as error:
        raise HTTPException(status_code=400, detail=f"Training failed: {error}") from error

    return {
        "model_id": model_id,
        "model_name": request.model_name,
        "target_column": request.target_column,
        "task_type": task_type,
        "test_size": request.test_size,
        "random_state": request.random_state,
        "use_cross_validation": request.use_cross_validation,
        "accuracy": round(float(accuracy), 4) if accuracy is not None else None,
        **regression_metrics,
        **cv_results,
        "total_rows": len(dataframe),
        "training_rows": len(X_train),
        "testing_rows": len(X_test),
        "feature_columns": feature_columns,
        **preprocessing_info["preprocessing_summary"],
        "confusion_matrix": matrix.tolist() if hasattr(matrix, "tolist") else matrix,
        "class_labels": class_labels,
        "classification_report": report,
    }


@app.post("/compare-models")
def compare_models(request: CompareRequest):
    """Train all available models and compare classification or regression metrics."""
    dataframe, X, y, feature_columns, report_labels, class_labels, preprocessing_info, task_type = prepare_training_data(
        request.filename,
        request.target_column,
        request.task_type,
        request.preprocessing_settings,
    )
    validate_evaluation_settings(len(dataframe), 0.2, request.cv_folds)

    try:
        X_train, X_test, y_train, y_test = split_training_data(X, y)
        models = get_models(task_type, training_rows=len(X_train))
        results = []

        for model_name, model in models.items():
            cv_results = {}
            if request.use_cross_validation:
                safe_cv_folds = get_safe_cv_folds(y, task_type, request.cv_folds)
                cv_results = run_cross_validation(model, X, y, task_type, safe_cv_folds)

            model.fit(X_train, y_train)
            predictions = model.predict(X_test)
            if task_type == "classification":
                accuracy = accuracy_score(y_test, predictions)
                results.append(
                    {
                        "model_name": model_name,
                        "accuracy": round(float(accuracy), 4),
                        **cv_results,
                    }
                )
            else:
                results.append(
                    {
                        "model_name": model_name,
                        **calculate_regression_metrics(y_test, predictions),
                        **cv_results,
                    }
                )
    except Exception as error:
        raise HTTPException(status_code=400, detail=f"Comparison failed: {error}") from error

    if task_type == "classification":
        best_model = max(
            results,
            key=lambda result: result.get("cv_mean_score", result["accuracy"]),
        )
        recommendation = build_model_recommendation(results, best_model, len(dataframe))
    else:
        best_model = max(
            results,
            key=lambda result: result.get("cv_mean_score", result["r2_score"]),
        )
        recommendation = build_regression_recommendation(results, best_model, len(dataframe))

    return {
        "target_column": request.target_column,
        "task_type": task_type,
        "use_cross_validation": request.use_cross_validation,
        "cv_folds": request.cv_folds,
        "total_rows": len(dataframe),
        "training_rows": len(X_train),
        "testing_rows": len(X_test),
        "feature_columns": feature_columns,
        "results": results,
        "best_model": best_model,
        "recommendation": recommendation,
    }


@app.post("/tune-model")
def tune_model(request: TrainRequest):
    """Tune one model with a small GridSearchCV parameter grid."""
    dataframe, X, y, feature_columns, report_labels, class_labels, preprocessing_info, task_type = prepare_training_data(
        request.filename,
        request.target_column,
        request.task_type,
        request.preprocessing_settings,
    )
    models = get_models(task_type)
    parameter_grid = get_parameter_grid(request.model_name, task_type)

    if request.model_name not in models or not parameter_grid:
        raise HTTPException(status_code=400, detail="Invalid model for tuning or selected task type.")

    try:
        X_train, X_test, y_train, y_test = split_training_data(X, y)
        if task_type == "classification":
            class_counts = pd.Series(y_train).value_counts()
            min_group_count = int(class_counts.min())
            if min_group_count < 2:
                raise ValueError(
                    "Tuning needs at least 2 training rows for each target class."
                )
        else:
            min_group_count = len(X_train)
            if min_group_count < 3:
                raise ValueError("Regression tuning needs at least 3 training rows.")

        cv_folds = min(3, min_group_count)
        if request.model_name in ["KNN", "KNN Regressor"]:
            parameter_grid = {
                **parameter_grid,
                "n_neighbors": [
                    value
                    for value in parameter_grid["n_neighbors"]
                    if value <= len(X_train)
                ],
            }
        models = get_models(task_type, training_rows=len(X_train))
        base_model = models[request.model_name]

        base_model.fit(X_train, y_train)
        original_predictions = base_model.predict(X_test)
        if task_type == "classification":
            original_score = accuracy_score(y_test, original_predictions)
            scoring = "accuracy"
        else:
            original_score = r2_score(y_test, original_predictions)
            scoring = "r2"

        grid_search = GridSearchCV(
            estimator=models[request.model_name],
            param_grid=parameter_grid,
            cv=cv_folds,
            scoring=scoring,
        )
        grid_search.fit(X_train, y_train)
        tuned_predictions = grid_search.best_estimator_.predict(X_test)
        if task_type == "classification":
            tuned_score = accuracy_score(y_test, tuned_predictions)
            regression_metrics = {}
        else:
            tuned_score = r2_score(y_test, tuned_predictions)
            regression_metrics = calculate_regression_metrics(y_test, tuned_predictions)
    except Exception as error:
        raise HTTPException(status_code=400, detail=f"Tuning failed: {error}") from error

    return {
        "model_name": request.model_name,
        "target_column": request.target_column,
        "task_type": task_type,
        "best_parameters": grid_search.best_params_,
        "tuned_accuracy": round(float(tuned_score), 4),
        "original_accuracy": round(float(original_score), 4),
        **regression_metrics,
        "total_rows": len(dataframe),
        "training_rows": len(X_train),
        "testing_rows": len(X_test),
        "message": (
            "Hyperparameter tuning completed. These settings gave the best "
            "cross-validation performance for the selected model."
        ),
    }


@app.post("/feature-analysis")
def feature_analysis(request: FeatureAnalysisRequest):
    """Return simple feature importance and correlation insights."""
    (
        dataframe,
        X,
        y,
        feature_columns,
        report_labels,
        class_labels,
        preprocessing_info,
        task_type,
    ) = prepare_training_data(
        request.filename,
        request.target_column,
        request.task_type,
        request.preprocessing_settings,
    )

    try:
        if task_type == "classification":
            model = RandomForestClassifier(random_state=42)
        else:
            model = RandomForestRegressor(random_state=42)

        model.fit(X, y)
        important_features = group_dummy_feature_importances(
            model.feature_importances_,
            preprocessing_info["dummy_columns"],
            feature_columns,
        )
        correlation_insights, correlation_message = calculate_correlation_insights(
            dataframe,
            request.target_column,
            task_type,
        )
    except Exception as error:
        raise HTTPException(status_code=400, detail=f"Feature analysis failed: {error}") from error

    return {
        "filename": request.filename,
        "target_column": request.target_column,
        "task_type": task_type,
        "important_features": important_features,
        "correlation_insights": correlation_insights,
        "correlation_message": correlation_message,
        "explanation": (
            "Feature importance shows which input columns had the strongest "
            "influence on the model prediction."
        ),
        "caution": (
            "Feature importance is model-based and may change with different "
            "datasets or algorithms."
        ),
    }


@app.get("/export-model/{model_id}")
def export_model(model_id: str):
    """Download a saved model bundle as a joblib file."""
    model_path = MODELS_DIR / f"{Path(model_id).stem}.joblib"

    if not model_path.exists():
        raise HTTPException(status_code=404, detail="Saved model was not found.")

    return FileResponse(
        path=model_path,
        media_type="application/octet-stream",
        filename="AI-Playground-trained-model.joblib",
    )


@app.post("/import-model")
def import_model(file: UploadFile = File(...)):
    """Import a previously exported AI-Playground joblib model bundle."""
    if not file.filename.lower().endswith(".joblib"):
        raise HTTPException(status_code=400, detail="Please upload a .joblib model file.")

    model_id = str(uuid.uuid4())
    model_path = MODELS_DIR / f"{model_id}.joblib"

    try:
        with model_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        saved_model = joblib.load(model_path)
        required_keys = {"model", "model_name", "target_column", "preprocessing_info"}
        if not isinstance(saved_model, dict) or not required_keys.issubset(saved_model.keys()):
            model_path.unlink(missing_ok=True)
            raise HTTPException(status_code=400, detail="Invalid AI-Playground model file.")
    except HTTPException:
        raise
    except Exception as error:
        model_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=f"Model import failed: {error}") from error

    return {
        "model_id": model_id,
        "filename": file.filename,
        "message": "Model imported successfully. You can now use it for prediction.",
        "model_name": saved_model.get("model_name"),
        "target_column": saved_model.get("target_column"),
        "task_type": saved_model.get("task_type", saved_model["preprocessing_info"].get("task_type", "classification")),
        "feature_columns": saved_model["preprocessing_info"].get("feature_columns", []),
    }


@app.post("/predict")
def predict(request: PredictRequest):
    """Load a saved model and predict the target value for new input data."""
    if not request.model_id:
        raise HTTPException(status_code=400, detail="model_id is required.")

    model_path = MODELS_DIR / f"{request.model_id}.joblib"

    if not model_path.exists():
        raise HTTPException(status_code=404, detail="Saved model was not found.")

    try:
        saved_model = joblib.load(model_path)
        model = saved_model["model"]
        preprocessing_info = saved_model["preprocessing_info"]
        input_frame = prepare_prediction_input(request.input_data, preprocessing_info)
        prediction = model.predict(input_frame)[0]
        task_type = saved_model.get("task_type", preprocessing_info.get("task_type", "classification"))

        label_encoder = preprocessing_info.get("label_encoder")
        if task_type == "regression":
            prediction_value = round(float(prediction), 4)
        elif label_encoder is not None:
            prediction_value = label_encoder.inverse_transform([prediction])[0]
        else:
            prediction_value = prediction

        prediction_probability = None
        probabilities = None

        if task_type == "classification" and hasattr(model, "predict_proba"):
            probability_values = model.predict_proba(input_frame)[0]
            model_classes = model.classes_
            probabilities = {}

            for class_value, probability in zip(model_classes, probability_values):
                if label_encoder is not None:
                    class_label = label_encoder.inverse_transform([class_value])[0]
                else:
                    class_label = class_value

                probabilities[str(class_label)] = round(float(probability), 4)

            prediction_probability = probabilities.get(str(prediction_value))
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=400, detail=f"Prediction failed: {error}") from error

    return {
        "model_id": request.model_id,
        "model_name": saved_model["model_name"],
        "task_type": task_type,
        "input_data": request.input_data,
        "prediction": str(prediction_value),
        "prediction_probability": prediction_probability,
        "probabilities": probabilities,
    }


@app.post("/download-report")
def download_report(report: ReportRequest):
    """Generate and return a PDF summary of the ML experiment."""
    if not report.filename and not report.selected_model:
        raise HTTPException(status_code=400, detail="Missing report data.")

    report_path = REPORTS_DIR / f"AI-Playground-Experiment-Report-{uuid.uuid4()}.pdf"

    try:
        styles = getSampleStyleSheet()
        story = []
        document = SimpleDocTemplate(str(report_path), pagesize=letter)

        story.append(Paragraph("AI-Playground ML Experiment Report", styles["Title"]))
        story.append(
            Paragraph(
                f"Generated on {datetime.now().strftime('%d %B %Y, %I:%M %p')}",
                styles["Normal"],
            )
        )
        story.append(Paragraph("Release version: v1.0.0", styles["Normal"]))
        story.append(Spacer(1, 18))

        add_heading(story, styles, "Dataset Summary")
        add_key_value_table(
            story,
            [
                ["Filename", safe_text(report.filename)],
                ["Task type", safe_text(report.task_type)],
                ["Target column", safe_text(report.target_column)],
                ["Total rows", safe_text(report.total_rows)],
                ["Training rows", safe_text(report.training_rows)],
                ["Testing rows", safe_text(report.testing_rows)],
            ],
        )

        add_heading(story, styles, "Target Column")
        story.append(Paragraph(safe_text(report.target_column), styles["Normal"]))
        story.append(Spacer(1, 14))

        add_list_section(story, styles, "Feature Columns", report.feature_columns)

        add_heading(story, styles, "Evaluation Settings")
        if report.evaluation_settings:
            add_key_value_table(
                story,
                [[key, safe_text(value)] for key, value in report.evaluation_settings.items()],
            )
        else:
            story.append(Paragraph("Default train/test split settings were used.", styles["Normal"]))
            story.append(Spacer(1, 14))

        add_heading(story, styles, "Dataset Insights")
        if report.dataset_insights:
            add_key_value_table(
                story,
                [[key, safe_text(value)] for key, value in report.dataset_insights.items()],
            )
        else:
            story.append(Paragraph("Not available", styles["Normal"]))
            story.append(Spacer(1, 14))

        add_heading(story, styles, "Feature Importance")
        if report.feature_analysis:
            important_features = report.feature_analysis.get("important_features", [])
            if important_features:
                rows = [["Feature", "Importance"]]
                for feature in important_features:
                    rows.append(
                        [
                            safe_text(feature.get("feature_name")),
                            safe_text(feature.get("importance_score")),
                        ]
                    )
                table = Table(rows)
                table.setStyle(
                    TableStyle(
                        [
                            ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                            ("PADDING", (0, 0), (-1, -1), 6),
                        ]
                    )
                )
                story.append(table)
                story.append(Spacer(1, 10))
            story.append(Paragraph(safe_text(report.feature_analysis.get("explanation")), styles["Normal"]))
            story.append(Spacer(1, 14))
        else:
            story.append(Paragraph("Not available", styles["Normal"]))
            story.append(Spacer(1, 14))

        add_heading(story, styles, "Correlation Insights")
        if report.feature_analysis and report.feature_analysis.get("correlation_insights"):
            rows = [["Feature", "Correlation"]]
            for insight in report.feature_analysis.get("correlation_insights", []):
                rows.append(
                    [
                        safe_text(insight.get("feature_name")),
                        safe_text(insight.get("correlation_value")),
                    ]
                )
            table = Table(rows)
            table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                        ("PADDING", (0, 0), (-1, -1), 6),
                    ]
                )
            )
            story.append(table)
            story.append(Spacer(1, 14))
        else:
            message = (
                report.feature_analysis.get("correlation_message")
                if report.feature_analysis
                else "Not available"
            )
            story.append(Paragraph(safe_text(message), styles["Normal"]))
            story.append(Spacer(1, 14))

        add_heading(story, styles, "Preprocessing Summary")
        if report.preprocessing_summary:
            add_key_value_table(
                story,
                [[key, safe_text(value)] for key, value in report.preprocessing_summary.items()],
            )
        else:
            story.append(
                Paragraph(
                    "Missing values were handled simply and categorical columns were encoded before training.",
                    styles["Normal"],
                )
            )
            story.append(Spacer(1, 14))

        add_heading(story, styles, "Single Model Training Result")
        add_key_value_table(
            story,
            [
                ["Selected model", safe_text(report.selected_model)],
                [
                    "Accuracy",
                    f"{report.accuracy * 100:.2f}%" if report.accuracy is not None else "Not available",
                ],
                [
                    "R2 score",
                    f"{report.r2_score:.4f}" if report.r2_score is not None else "Not available",
                ],
                ["Mean absolute error", safe_text(report.mean_absolute_error)],
                ["Mean squared error", safe_text(report.mean_squared_error)],
                ["Root mean squared error", safe_text(report.root_mean_squared_error)],
                ["CV folds", safe_text(report.cv_folds)],
                ["CV mean score", safe_text(report.cv_mean_score)],
                ["CV standard deviation", safe_text(report.cv_std_score)],
                ["CV scores", safe_text(report.cv_scores)],
            ],
        )

        add_heading(story, styles, "Confusion Matrix")
        add_matrix_table(story, report.class_labels, report.confusion_matrix)

        add_heading(story, styles, "Classification Report")
        add_classification_report_table(story, report.classification_report)

        add_heading(story, styles, "Model Comparison Results")
        if report.comparison_results:
            if report.task_type == "regression":
                rows = [["Model", "R2", "MAE", "MSE", "RMSE", "CV mean", "CV std"]]
            else:
                rows = [["Model", "Accuracy", "CV mean", "CV std"]]
            for result in report.comparison_results:
                if report.task_type == "regression":
                    rows.append(
                        [
                            safe_text(result.get("model_name")),
                            safe_text(result.get("r2_score")),
                            safe_text(result.get("mean_absolute_error")),
                            safe_text(result.get("mean_squared_error")),
                            safe_text(result.get("root_mean_squared_error")),
                            safe_text(result.get("cv_mean_score")),
                            safe_text(result.get("cv_std_score")),
                        ]
                    )
                else:
                    rows.append(
                        [
                            safe_text(result.get("model_name")),
                            f"{result.get('accuracy', 0) * 100:.2f}%",
                            safe_text(result.get("cv_mean_score")),
                            safe_text(result.get("cv_std_score")),
                        ]
                    )
            table = Table(rows)
            table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                        ("PADDING", (0, 0), (-1, -1), 6),
                    ]
                )
            )
            story.append(table)
            story.append(Spacer(1, 14))
        else:
            story.append(Paragraph("Not available", styles["Normal"]))
            story.append(Spacer(1, 14))

        add_heading(story, styles, "Best Model")
        if report.best_model:
            add_key_value_table(
                story,
                [
                    ["Model", safe_text(report.best_model.get("model_name"))],
                    [
                        "R2 score" if report.task_type == "regression" else "Accuracy",
                        safe_text(report.best_model.get("r2_score"))
                        if report.task_type == "regression"
                        else f"{report.best_model.get('accuracy', 0) * 100:.2f}%",
                    ],
                ],
            )
        else:
            story.append(Paragraph("Not available", styles["Normal"]))
            story.append(Spacer(1, 14))

        add_heading(story, styles, "Recommended Model")
        if report.recommendation:
            add_key_value_table(
                story,
                [
                    ["Recommended model", safe_text(report.recommendation.get("recommended_model"))],
                    [
                        "R2 score" if report.task_type == "regression" else "Accuracy",
                        safe_text(report.recommendation.get("recommended_accuracy"))
                        if report.task_type == "regression"
                        else f"{report.recommendation.get('recommended_accuracy', 0) * 100:.2f}%",
                    ],
                    ["Reason", safe_text(report.recommendation.get("reason"))],
                    ["Suggestion", safe_text(report.recommendation.get("suggestion"))],
                    ["Caution", safe_text(report.recommendation.get("caution"))],
                ],
            )
        else:
            story.append(Paragraph("Not available", styles["Normal"]))
            story.append(Spacer(1, 14))

        add_heading(story, styles, "Hyperparameter Tuning")
        if report.tuning_result:
            best_parameters = report.tuning_result.get("best_parameters", {})
            add_key_value_table(
                story,
                [
                    ["Tuned model", safe_text(report.tuning_result.get("model_name"))],
                    [
                        "Tuned accuracy",
                        f"{report.tuning_result.get('tuned_accuracy', 0) * 100:.2f}%",
                    ],
                    [
                        "Original accuracy",
                        f"{report.tuning_result.get('original_accuracy', 0) * 100:.2f}%",
                    ],
                    ["Best parameters", safe_text(best_parameters)],
                    ["Message", safe_text(report.tuning_result.get("message"))],
                ],
            )
        else:
            story.append(Paragraph("Not available", styles["Normal"]))
            story.append(Spacer(1, 14))

        add_heading(story, styles, "Prediction Result")
        if report.prediction_result:
            add_key_value_table(
                story,
                [
                    ["Predicted value", safe_text(report.prediction_result.get("prediction"))],
                    ["Model used", safe_text(report.prediction_result.get("model_name"))],
                    [
                        "Prediction probability",
                        f"{report.prediction_result.get('prediction_probability', 0) * 100:.2f}%"
                        if report.prediction_result.get("prediction_probability") is not None
                        else "Not available",
                    ],
                ],
            )
        else:
            story.append(Paragraph("Not available", styles["Normal"]))

        add_heading(story, styles, "Model Export and Import")
        if report.model_portability:
            add_key_value_table(
                story,
                [[key, safe_text(value)] for key, value in report.model_portability.items()],
            )
        else:
            story.append(Paragraph("No model export or import activity recorded.", styles["Normal"]))

        document.build(story)
    except Exception as error:
        raise HTTPException(status_code=400, detail=f"PDF generation failed: {error}") from error

    return FileResponse(
        path=report_path,
        media_type="application/pdf",
        filename="AI-Playground-Experiment-Report.pdf",
    )
