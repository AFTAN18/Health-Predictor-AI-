from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
from sklearn.datasets import fetch_openml
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier

RANDOM_STATE = 42
TEST_SIZE = 0.2

MODEL_FILES = {
    "Random Forest": "random_forest.pkl",
    "SVM": "svm.pkl",
    "Naive Bayes": "naive_bayes.pkl",
    "Decision Tree": "decision_tree.pkl",
}


def load_diabetes_dataset() -> tuple[np.ndarray, np.ndarray]:
    try:
        dataset = fetch_openml(name="diabetes", version=1, as_frame=False, parser="auto")
    except TypeError:
        dataset = fetch_openml(name="diabetes", version=1, as_frame=False)

    X = np.asarray(dataset.data, dtype=np.float64)
    y_raw = np.asarray(dataset.target)

    positive_tokens = {"tested_positive", "1", "true", "yes", "positive"}
    y = np.array([1 if str(value).strip().lower() in positive_tokens else 0 for value in y_raw], dtype=np.int64)

    # Fallback for unexpected label encoding.
    if np.unique(y).size < 2:
        y_numeric = np.asarray(y_raw, dtype=np.float64)
        y = (y_numeric > 0).astype(np.int64)

    return X, y


def probability_from_model(model: object, X: np.ndarray) -> np.ndarray:
    if hasattr(model, "predict_proba"):
        return np.asarray(model.predict_proba(X))[:, 1]

    if hasattr(model, "decision_function"):
        decision_values = np.asarray(model.decision_function(X), dtype=np.float64)
        return 1.0 / (1.0 + np.exp(-decision_values))

    predictions = np.asarray(model.predict(X), dtype=np.float64)
    return np.clip(predictions, 0.0, 1.0)


def evaluate(model: object, X_test: np.ndarray, y_test: np.ndarray) -> dict[str, float]:
    y_pred = np.asarray(model.predict(X_test))
    y_prob = probability_from_model(model, X_test)

    return {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred, zero_division=0)),
        "recall": float(recall_score(y_test, y_pred, zero_division=0)),
        "f1": float(f1_score(y_test, y_pred, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_test, y_prob)),
    }


def main() -> None:
    project_root = Path(__file__).resolve().parents[1]
    models_dir = project_root / "ml" / "models"
    models_dir.mkdir(parents=True, exist_ok=True)

    print("Loading diabetes dataset...")
    X, y = load_diabetes_dataset()
    print(f"Dataset loaded: {X.shape[0]} rows, {X.shape[1]} features")

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
        stratify=y,
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    candidates = {
        "Random Forest": RandomForestClassifier(
            n_estimators=400,
            min_samples_leaf=2,
            random_state=RANDOM_STATE,
            n_jobs=-1,
        ),
        "SVM": SVC(
            C=2.0,
            kernel="rbf",
            probability=True,
            random_state=RANDOM_STATE,
        ),
        "Naive Bayes": GaussianNB(),
        "Decision Tree": DecisionTreeClassifier(
            max_depth=6,
            min_samples_leaf=3,
            random_state=RANDOM_STATE,
        ),
    }

    trained_models: dict[str, object] = {}
    metrics_by_model: dict[str, dict[str, float]] = {}

    print("Training models...")
    for model_name, model in candidates.items():
        model.fit(X_train_scaled, y_train)
        metrics = evaluate(model, X_test_scaled, y_test)

        trained_models[model_name] = model
        metrics_by_model[model_name] = metrics

        print(
            f"{model_name:14} | "
            f"acc={metrics['accuracy']:.4f} "
            f"f1={metrics['f1']:.4f} "
            f"auc={metrics['roc_auc']:.4f}"
        )

    best_model_name = max(
        metrics_by_model,
        key=lambda name: (
            metrics_by_model[name]["roc_auc"],
            metrics_by_model[name]["f1"],
            metrics_by_model[name]["accuracy"],
        ),
    )
    best_model = trained_models[best_model_name]

    for model_name, model in trained_models.items():
        joblib.dump(model, models_dir / MODEL_FILES[model_name])

    joblib.dump(best_model, models_dir / "best_model.pkl")
    joblib.dump(scaler, models_dir / "scaler.pkl")

    metrics_payload = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "dataset": "OpenML diabetes v1",
        "split": {
            "test_size": TEST_SIZE,
            "random_state": RANDOM_STATE,
            "train_rows": int(X_train.shape[0]),
            "test_rows": int(X_test.shape[0]),
            "features": int(X.shape[1]),
        },
        "best_model": best_model_name,
        "metrics": metrics_by_model,
    }
    (models_dir / "training_metrics.json").write_text(json.dumps(metrics_payload, indent=2), encoding="utf-8")

    print(f"Best model: {best_model_name}")
    print(f"Saved scaler + best model + all candidate models to: {models_dir}")


if __name__ == "__main__":
    main()
