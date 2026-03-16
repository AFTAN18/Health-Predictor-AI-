from __future__ import annotations

import argparse
import csv
import json
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
from sklearn.datasets import fetch_openml
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier

RANDOM_STATE = 42
TEST_SIZE = 0.2
REQUIRED_COLUMNS = [
    "pregnancies",
    "glucose",
    "blood_pressure",
    "skin_thickness",
    "insulin",
    "BMI",
    "diabetes_pedigree",
    "age",
]

MODEL_FILES = {
    "Random Forest": "random_forest.pkl",
    "SVM": "svm.pkl",
    "Naive Bayes": "naive_bayes.pkl",
    "Decision Tree": "decision_tree.pkl",
}

POSITIVE_TOKENS = {"tested_positive", "1", "true", "yes", "positive"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train and validate disease models.")
    parser.add_argument(
        "--dataset-csv",
        type=str,
        default="",
        help="Optional CSV dataset path with feature columns and label column.",
    )
    parser.add_argument(
        "--target-column",
        type=str,
        default="class",
        help="Target column for CSV datasets.",
    )
    parser.add_argument(
        "--min-accuracy",
        type=float,
        default=0.90,
        help="Minimum required holdout accuracy for production gate.",
    )
    parser.add_argument(
        "--min-auc",
        type=float,
        default=0.90,
        help="Minimum required holdout ROC-AUC for production gate.",
    )
    parser.add_argument(
        "--allow-below-threshold",
        action="store_true",
        help="Allow saving best_model.pkl even if metrics do not meet thresholds.",
    )
    return parser.parse_args()


def _to_binary_target(value: object) -> int:
    token = str(value).strip().lower()
    if token in POSITIVE_TOKENS:
        return 1
    if token in {"0", "false", "no", "negative", "tested_negative"}:
        return 0

    try:
        return 1 if float(token) > 0 else 0
    except ValueError as exc:
        raise ValueError(f"Unsupported target value '{value}'.") from exc


def load_csv_dataset(csv_path: Path, target_column: str) -> tuple[np.ndarray, np.ndarray]:
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV dataset file not found: {csv_path}")

    features: list[list[float]] = []
    targets: list[int] = []

    with csv_path.open("r", encoding="utf-8", newline="") as file_obj:
        reader = csv.DictReader(file_obj)
        if reader.fieldnames is None:
            raise ValueError("CSV has no header row.")

        normalized = {name.strip().lower(): name for name in reader.fieldnames if name}
        missing = [name for name in REQUIRED_COLUMNS if name.lower() not in normalized]
        if missing:
            raise ValueError(f"CSV is missing required feature columns: {', '.join(missing)}")

        target_lookup = normalized.get(target_column.strip().lower())
        if target_lookup is None:
            raise ValueError(f"CSV target column '{target_column}' not found.")

        for row in reader:
            row_values = []
            for column in REQUIRED_COLUMNS:
                raw = row.get(normalized[column.lower()], "")
                row_values.append(float(raw))
            features.append(row_values)
            targets.append(_to_binary_target(row.get(target_lookup, "")))

    X = np.asarray(features, dtype=np.float64)
    y = np.asarray(targets, dtype=np.int64)
    return X, y


def load_openml_diabetes() -> tuple[np.ndarray, np.ndarray]:
    try:
        dataset = fetch_openml(name="diabetes", version=1, as_frame=False, parser="auto")
    except TypeError:
        dataset = fetch_openml(name="diabetes", version=1, as_frame=False)

    X = np.asarray(dataset.data, dtype=np.float64)
    y_raw = np.asarray(dataset.target)
    y = np.array([_to_binary_target(value) for value in y_raw], dtype=np.int64)
    return X, y


def load_dataset(dataset_csv: str, target_column: str) -> tuple[np.ndarray, np.ndarray, str]:
    if dataset_csv.strip():
        dataset_path = Path(dataset_csv).expanduser().resolve()
        X, y = load_csv_dataset(dataset_path, target_column)
        return X, y, f"CSV:{dataset_path}"

    X, y = load_openml_diabetes()
    return X, y, "OpenML diabetes v1"


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


def cross_validate_metrics(model: object, X: np.ndarray, y: np.ndarray) -> dict[str, float]:
    pipeline = Pipeline([("scaler", StandardScaler()), ("model", model)])
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    results = cross_validate(
        pipeline,
        X,
        y,
        cv=cv,
        n_jobs=-1,
        scoring=("accuracy", "precision", "recall", "f1", "roc_auc"),
    )
    return {
        "accuracy_mean": float(np.mean(results["test_accuracy"])),
        "accuracy_std": float(np.std(results["test_accuracy"])),
        "precision_mean": float(np.mean(results["test_precision"])),
        "recall_mean": float(np.mean(results["test_recall"])),
        "f1_mean": float(np.mean(results["test_f1"])),
        "roc_auc_mean": float(np.mean(results["test_roc_auc"])),
        "roc_auc_std": float(np.std(results["test_roc_auc"])),
    }


def main() -> None:
    args = parse_args()
    project_root = Path(__file__).resolve().parents[1]
    models_dir = project_root / "ml" / "models"
    models_dir.mkdir(parents=True, exist_ok=True)

    print("Loading dataset...")
    X, y, dataset_name = load_dataset(args.dataset_csv, args.target_column)
    print(f"Dataset loaded from {dataset_name}: {X.shape[0]} rows, {X.shape[1]} features")

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
            n_estimators=500,
            min_samples_leaf=2,
            random_state=RANDOM_STATE,
            n_jobs=-1,
            class_weight="balanced_subsample",
        ),
        "SVM": SVC(
            C=2.0,
            kernel="rbf",
            gamma="scale",
            probability=True,
            random_state=RANDOM_STATE,
        ),
        "Naive Bayes": GaussianNB(),
        "Decision Tree": DecisionTreeClassifier(
            max_depth=8,
            min_samples_leaf=3,
            random_state=RANDOM_STATE,
            class_weight="balanced",
        ),
    }

    trained_models: dict[str, object] = {}
    holdout_metrics_by_model: dict[str, dict[str, float]] = {}
    cross_val_metrics_by_model: dict[str, dict[str, float]] = {}

    print("Training and validating candidate models...")
    for model_name, model in candidates.items():
        cv_metrics = cross_validate_metrics(model, X_train, y_train)
        model.fit(X_train_scaled, y_train)
        holdout_metrics = evaluate(model, X_test_scaled, y_test)

        trained_models[model_name] = model
        holdout_metrics_by_model[model_name] = holdout_metrics
        cross_val_metrics_by_model[model_name] = cv_metrics

        print(
            f"{model_name:14} | "
            f"holdout_acc={holdout_metrics['accuracy']:.4f} "
            f"holdout_auc={holdout_metrics['roc_auc']:.4f} "
            f"cv_acc={cv_metrics['accuracy_mean']:.4f} "
            f"cv_auc={cv_metrics['roc_auc_mean']:.4f}"
        )

    best_model_name = max(
        holdout_metrics_by_model,
        key=lambda name: (
            holdout_metrics_by_model[name]["roc_auc"],
            holdout_metrics_by_model[name]["f1"],
            holdout_metrics_by_model[name]["accuracy"],
        ),
    )
    best_model = trained_models[best_model_name]
    best_metrics = holdout_metrics_by_model[best_model_name]

    for model_name, model in trained_models.items():
        joblib.dump(model, models_dir / MODEL_FILES[model_name])

    quality_gate = {
        "min_accuracy": float(args.min_accuracy),
        "min_roc_auc": float(args.min_auc),
        "achieved_accuracy": float(best_metrics["accuracy"]),
        "achieved_roc_auc": float(best_metrics["roc_auc"]),
        "passed": bool(
            best_metrics["accuracy"] >= args.min_accuracy and best_metrics["roc_auc"] >= args.min_auc
        ),
    }

    if quality_gate["passed"] or args.allow_below_threshold:
        joblib.dump(best_model, models_dir / "best_model.pkl")
        joblib.dump(scaler, models_dir / "scaler.pkl")
        print("Saved best_model.pkl and scaler.pkl.")
    else:
        print("Quality gate failed. Existing best_model.pkl/scaler.pkl were not overwritten.")

    metrics_payload = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "dataset": dataset_name,
        "split": {
            "test_size": TEST_SIZE,
            "random_state": RANDOM_STATE,
            "train_rows": int(X_train.shape[0]),
            "test_rows": int(X_test.shape[0]),
            "features": int(X.shape[1]),
        },
        "best_model": best_model_name,
        "holdout_metrics": holdout_metrics_by_model,
        "cross_validation_metrics": cross_val_metrics_by_model,
        "quality_gate": quality_gate,
    }
    (models_dir / "training_metrics.json").write_text(json.dumps(metrics_payload, indent=2), encoding="utf-8")

    print(f"Best model: {best_model_name}")
    print(f"Quality gate passed: {quality_gate['passed']}")
    print(f"Saved metrics report to: {models_dir / 'training_metrics.json'}")

    if not quality_gate["passed"] and not args.allow_below_threshold:
        raise SystemExit(2)


if __name__ == "__main__":
    main()
