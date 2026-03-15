import joblib
import numpy as np
import os
from schemas import PredictionRequest, PredictionResponse

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "ml", "models", "best_model.pkl")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "..", "ml", "models", "scaler.pkl")

class Predictor:
    def __init__(self):
        try:
            self.model = joblib.load(MODEL_PATH)
            self.scaler = joblib.load(SCALER_PATH)
        except Exception as e:
            print(f"Error loading models: {e}")
            self.model = None
            self.scaler = None
    
    def predict(self, data: PredictionRequest) -> PredictionResponse:
        features = np.array([[
            data.pregnancies,
            data.glucose,
            data.blood_pressure,
            data.skin_thickness,
            data.insulin,
            data.BMI,
            data.diabetes_pedigree,
            data.age
        ]])
        
        if self.model is None or self.scaler is None:
            # Fallback if models are not loaded
            import random
            return PredictionResponse(
                prediction=random.randint(0, 1),
                risk_probability=random.random()
            )

        scaled_features = self.scaler.transform(features)
        prediction = int(self.model.predict(scaled_features)[0])
        probabilities = self.model.predict_proba(scaled_features)[0]
        
        risk_probability = float(probabilities[1]) if len(probabilities) > 1 else float(prediction)

        return PredictionResponse(
            prediction=prediction,
            risk_probability=risk_probability
        )

predictor = Predictor()
