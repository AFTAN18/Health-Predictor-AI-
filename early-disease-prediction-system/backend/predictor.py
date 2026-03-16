from pathlib import Path

import joblib
import numpy as np

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

    def predict(self, data: PredictionRequest) -> PredictionResponse:
        features = np.array(
            [
                [
                    data.pregnancies,
                    data.glucose,
                    data.blood_pressure,
                    data.skin_thickness,
                    data.insulin,
                    data.BMI,
                    data.diabetes_pedigree,
                    data.age,
                ]
            ],
            dtype=np.float64,
        )

        scaled_features = self.scaler.transform(features)
        prediction = int(self.model.predict(scaled_features)[0])

        if hasattr(self.model, "predict_proba"):
            probabilities = self.model.predict_proba(scaled_features)[0]
            risk_probability = float(probabilities[1]) if len(probabilities) > 1 else float(prediction)
        else:
            risk_probability = float(prediction)

        risk_probability = max(0.0, min(1.0, risk_probability))
        return PredictionResponse(prediction=prediction, risk_probability=risk_probability)


predictor = Predictor()
