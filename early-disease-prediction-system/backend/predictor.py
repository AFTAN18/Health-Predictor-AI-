from pathlib import Path

import joblib
import numpy as np

from risk_analysis import (
    calculate_risk_score,
    classify_confidence,
    classify_risk_from_score,
    estimate_future_probability,
    generate_health_insights,
    get_key_risk_factors,
    uncertainty_message,
)
from schemas import EnsembleVote, FeatureExplanation, PredictionRequest, PredictionResponse

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "ml" / "models" / "best_model.pkl"
SCALER_PATH = BASE_DIR / "ml" / "models" / "scaler.pkl"
PRIMARY_MODEL_PATH = BASE_DIR / "ml" / "models" / "random_forest.pkl"
ENSEMBLE_MODEL_PATHS = {
    "Random Forest": PRIMARY_MODEL_PATH,
    "SVM": BASE_DIR / "ml" / "models" / "svm.pkl",
    "Naive Bayes": BASE_DIR / "ml" / "models" / "naive_bayes.pkl",
    "Decision Tree": BASE_DIR / "ml" / "models" / "decision_tree.pkl",
}
FEATURE_LABELS = {
    "pregnancies": "Pregnancies",
    "glucose": "Glucose",
    "blood_pressure": "Blood Pressure",
    "skin_thickness": "Skin Thickness",
    "insulin": "Insulin",
    "BMI": "BMI",
    "diabetes_pedigree": "Diabetes Pedigree",
    "age": "Age",
    "cholesterol": "Cholesterol",
}
REQUEST_FEATURE_ORDER = [
    "pregnancies",
    "glucose",
    "blood_pressure",
    "skin_thickness",
    "insulin",
    "BMI",
    "diabetes_pedigree",
    "age",
    "cholesterol",
]
DISCLAIMER = "This tool provides risk estimation only and is not a medical diagnosis. Please consult a healthcare professional."


class Predictor:
    def __init__(self) -> None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model file not found at: {MODEL_PATH}")
        if not SCALER_PATH.exists():
            raise FileNotFoundError(f"Scaler file not found at: {SCALER_PATH}")

        self.model = joblib.load(PRIMARY_MODEL_PATH if PRIMARY_MODEL_PATH.exists() else MODEL_PATH)
        self.scaler = joblib.load(SCALER_PATH)
        self.ensemble_models = self._load_ensemble_models()
        self.feature_names = self._resolve_feature_names()

    def _load_ensemble_models(self) -> dict[str, object]:
        loaded_models: dict[str, object] = {}
        for name, path in ENSEMBLE_MODEL_PATHS.items():
            if path.exists():
                loaded_models[name] = joblib.load(path)

        if not loaded_models:
            loaded_models["Primary Model"] = self.model
        return loaded_models

    def _resolve_feature_names(self) -> list[str]:
        expected_features = int(getattr(self.scaler, "n_features_in_", len(REQUEST_FEATURE_ORDER)))
        if expected_features <= len(REQUEST_FEATURE_ORDER):
            return REQUEST_FEATURE_ORDER[:expected_features]
        padding = [f"feature_{index}" for index in range(len(REQUEST_FEATURE_ORDER), expected_features)]
        return [*REQUEST_FEATURE_ORDER, *padding]

    def _feature_vector(self, data: PredictionRequest) -> np.ndarray:
        feature_values = [float(getattr(data, field_name)) for field_name in REQUEST_FEATURE_ORDER]
        expected_features = int(getattr(self.scaler, "n_features_in_", len(feature_values)))

        if expected_features < len(feature_values):
            feature_values = feature_values[:expected_features]
        elif expected_features > len(feature_values):
            feature_values.extend([0.0] * (expected_features - len(feature_values)))

        return np.array([feature_values], dtype=np.float64)

    def _predict_probability(self, model: object, scaled_features: np.ndarray) -> float:
        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(scaled_features)[0]
            probability = float(probabilities[1]) if len(probabilities) > 1 else float(probabilities[0])
            return float(np.clip(probability, 0.0, 1.0))

        if hasattr(model, "decision_function"):
            score = float(model.decision_function(scaled_features)[0])
            probability = 1.0 / (1.0 + np.exp(-score))
            return float(np.clip(probability, 0.0, 1.0))

        prediction = float(model.predict(scaled_features)[0])
        return float(np.clip(prediction, 0.0, 1.0))

    def _ensemble_votes(self, scaled_features: np.ndarray) -> tuple[list[EnsembleVote], int]:
        votes: list[EnsembleVote] = []
        positive_votes = 0

        for model_name, model in self.ensemble_models.items():
            probability = self._predict_probability(model, scaled_features)
            prediction = 1 if probability >= 0.5 else 0
            votes.append(
                EnsembleVote(
                    model_name=model_name,
                    prediction=prediction,
                    probability=probability,
                )
            )
            positive_votes += prediction

        return votes, positive_votes

    def _feature_explanations(self, scaled_features: np.ndarray, top_k: int = 4) -> list[FeatureExplanation]:
        n_features = int(min(len(self.feature_names), scaled_features.shape[1]))
        if n_features == 0:
            return []

        model_importances = np.zeros(n_features, dtype=np.float64)
        if hasattr(self.model, "feature_importances_"):
            raw_importances = np.asarray(getattr(self.model, "feature_importances_"), dtype=np.float64)
            model_importances[: min(n_features, raw_importances.shape[0])] = raw_importances[:n_features]

        feature_values = np.abs(np.asarray(scaled_features[0][:n_features], dtype=np.float64))
        if np.allclose(model_importances.sum(), 0.0):
            contribution_scores = feature_values
        else:
            contribution_scores = feature_values * model_importances

        top_indices = np.argsort(contribution_scores)[::-1][:top_k]
        explanations: list[FeatureExplanation] = []
        for idx in top_indices:
            if contribution_scores[idx] <= 0:
                continue
            raw_name = self.feature_names[idx]
            explanations.append(
                FeatureExplanation(
                    feature=FEATURE_LABELS.get(raw_name, raw_name.replace("_", " ").title()),
                    contribution=float(contribution_scores[idx]),
                    model_importance=float(model_importances[idx]),
                )
            )

        if explanations:
            return explanations

        fallback_index = np.argsort(feature_values)[::-1][:top_k]
        return [
            FeatureExplanation(
                feature=FEATURE_LABELS.get(self.feature_names[idx], self.feature_names[idx].replace("_", " ").title()),
                contribution=float(feature_values[idx]),
                model_importance=float(model_importances[idx]),
            )
            for idx in fallback_index
        ]

    def predict(self, data: PredictionRequest) -> PredictionResponse:
        features = self._feature_vector(data)
        scaled_features = self.scaler.transform(features)
        diabetes_probability = self._predict_probability(self.model, scaled_features)

        votes, positive_votes = self._ensemble_votes(scaled_features)
        total_models = len(votes)
        negative_votes = total_models - positive_votes
        ensemble_agreement = max(positive_votes, negative_votes)
        ensemble_probability = float(np.mean([vote.probability for vote in votes])) if votes else diabetes_probability

        risk_score = calculate_risk_score(data)
        heart_probability = float(np.clip(risk_score / 100.0, 0.0, 1.0))

        current_probability = float(np.clip(max(ensemble_probability, heart_probability), 0.0, 1.0))
        future_probability = estimate_future_probability(current_probability, risk_score)

        current_risk = classify_risk_from_score(risk_score)
        future_risk = classify_risk_from_score(future_probability * 100.0)
        confidence = classify_confidence(current_probability, ensemble_agreement, total_models)
        prediction = 1 if current_probability >= 0.5 else 0

        return PredictionResponse(
            current_risk=current_risk,
            future_risk=future_risk,
            confidence=confidence,
            probability=current_probability,
            future_probability=future_probability,
            diabetes_probability=diabetes_probability,
            heart_probability=heart_probability,
            risk_score=risk_score,
            prediction=prediction,
            ensemble_agreement=ensemble_agreement,
            ensemble_total_models=total_models,
            uncertainty_message=uncertainty_message(current_probability),
            key_risk_factors=get_key_risk_factors(data),
            feature_importance=self._feature_explanations(scaled_features),
            ensemble_votes=votes,
            health_insights=generate_health_insights(data, current_risk=current_risk, future_risk=future_risk),
            disclaimer=DISCLAIMER,
        )


predictor = Predictor()
