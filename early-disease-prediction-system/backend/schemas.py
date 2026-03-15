from pydantic import BaseModel

class PredictionRequest(BaseModel):
    pregnancies: float
    glucose: float
    blood_pressure: float
    skin_thickness: float
    insulin: float
    BMI: float
    diabetes_pedigree: float
    age: float

class PredictionResponse(BaseModel):
    prediction: int
    risk_probability: float
