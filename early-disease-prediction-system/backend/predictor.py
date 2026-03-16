from pathlib import Path

import joblib
import numpy as np

from risk_analysis import (
    calculate_risk_score,
    classify_risk_from_score,
    estimate_future_probability,
    estimate_future_risk_score,
    generate_health_insights,
    get_key_risk_factors,
)
from schemas import PredictionRequest, PredictionResponse

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "ml" / "models" / "best_model.pkl"
SCALER_PATH = BASE_DIR / "ml" / "models" / "scaler.pkl"


class Predictor:
    def __init__(self) -> None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model file not found at: {MODEL_PATH}")
        if not SCALER_PATH.exists():
            raise FileNotFoundError(f"Scaler file not found at: {SCALER_PATH}")

        self.model = joblib.load(MODEL_PATH)
        self.scaler = joblib.load(SCALER_PATH)

    def _feature_vector(self, data: PredictionRequest) -> np.ndarray:
        standard_features = [
            data.pregnancies,
            data.glucose,
            data.blood_pressure,
            data.skin_thickness,
            data.insulin,
            data.BMI,
            data.diabetes_pedigree,
            data.age,
        ]
        extended_features = [*standard_features, data.cholesterol]
        expected_features = int(getattr(self.scaler, "n_features_in_", len(standard_features)))

        if expected_features == len(extended_features):
            feature_values = extended_features
        elif expected_features == len(standard_features):
            feature_values = standard_features
        elif expected_features < len(standard_features):
            feature_values = standard_features[:expected_features]
        else:
            feature_values = [*extended_features, *([0.0] * (expected_features - len(extended_features)))]

        return np.array([feature_values], dtype=np.float64)

    def _predict_diabetes_probability(self, scaled_features: np.ndarray) -> float:
        if hasattr(self.model, "predict_proba"):
            probabilities = self.model.predict_proba(scaled_features)[0]
            probability = float(probabilities[1]) if len(probabilities) > 1 else float(probabilities[0])
            return max(0.0, min(1.0, probability))

        if hasattr(self.model, "decision_function"):
            score = float(self.model.decision_function(scaled_features)[0])
            probability = 1.0 / (1.0 + np.exp(-score))
            return max(0.0, min(1.0, probability))

        prediction = float(self.model.predict(scaled_features)[0])
        return max(0.0, min(1.0, prediction))

    def predict(self, data: PredictionRequest) -> PredictionResponse:
        features = self._feature_vector(data)
        scaled_features = self.scaler.transform(features)
        diabetes_probability = self._predict_diabetes_probability(scaled_features)

        risk_score = calculate_risk_score(data)
        heart_probability = max(0.0, min(1.0, risk_score / 100.0))

        current_probability = max(diabetes_probability, heart_probability)
        future_probability = estimate_future_probability(current_probability, data)

        current_risk = classify_risk_from_score(risk_score)
        future_risk_score = estimate_future_risk_score(risk_score, data)
        future_risk = classify_risk_from_score(future_risk_score)

        return PredictionResponse(
            current_risk=current_risk,
            future_risk=future_risk,
            probability=current_probability,
            future_probability=future_probability,
            diabetes_probability=diabetes_probability,
            heart_probability=heart_probability,
            risk_score=risk_score,
            key_risk_factors=get_key_risk_factors(data),
            health_insights=generate_health_insights(data, current_risk=current_risk, future_risk=future_risk),
        )


predictor = Predictor()
