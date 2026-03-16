from typing import Literal

from pydantic import BaseModel, Field

RiskLevel = Literal["Low", "Medium", "High"]


class PredictionRequest(BaseModel):
    pregnancies: float = Field(ge=0)
    glucose: float = Field(ge=0)
    blood_pressure: float = Field(ge=0)
    skin_thickness: float = Field(ge=0)
    insulin: float = Field(ge=0)
    BMI: float = Field(ge=0)
    diabetes_pedigree: float = Field(ge=0)
    age: float = Field(ge=0)
    cholesterol: float = Field(ge=0)


class PredictionResponse(BaseModel):
    current_risk: RiskLevel
    future_risk: RiskLevel
    probability: float = Field(ge=0, le=1)
    future_probability: float = Field(ge=0, le=1)
    diabetes_probability: float = Field(ge=0, le=1)
    heart_probability: float = Field(ge=0, le=1)
    risk_score: float = Field(ge=0)
    key_risk_factors: list[str]
    health_insights: list[str]


class PredictionHistoryItem(BaseModel):
    id: str
    user_id: str | None = None
    age: float
    glucose: float
    blood_pressure: float
    cholesterol: float
    BMI: float
    prediction: int
    probability: float
    future_probability: float
    created_at: str
