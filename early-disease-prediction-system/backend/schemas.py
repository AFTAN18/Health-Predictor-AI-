from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

RiskLevel = Literal["Low", "Medium", "High"]
ConfidenceLevel = Literal["Low", "Medium", "High"]


class PredictionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    pregnancies: int = Field(ge=0, le=20)
    glucose: float = Field(ge=50, le=300)
    blood_pressure: float = Field(ge=60, le=200)
    skin_thickness: float = Field(ge=0, le=100)
    insulin: float = Field(ge=0, le=900)
    BMI: float = Field(ge=10, le=60)
    diabetes_pedigree: float = Field(ge=0, le=3)
    age: int = Field(ge=0, le=120)
    cholesterol: float = Field(ge=100, le=400)

    @model_validator(mode="after")
    def validate_logical_consistency(self) -> "PredictionRequest":
        if self.age < 10 and self.pregnancies > 0:
            raise ValueError("Invalid input combination: pregnancies must be 0 when age is below 10.")
        if self.glucose < 40:
            raise ValueError("Glucose below 40 mg/dL is unrealistic for this model.")
        if self.BMI < 12:
            raise ValueError("BMI below 12 is unrealistic for this model.")
        if self.blood_pressure < 50:
            raise ValueError("Blood pressure below 50 mmHg is unrealistic for this model.")
        return self


class EnsembleVote(BaseModel):
    model_name: str
    prediction: int = Field(ge=0, le=1)
    probability: float = Field(ge=0, le=1)


class FeatureExplanation(BaseModel):
    feature: str
    contribution: float = Field(ge=0)
    model_importance: float = Field(ge=0, le=1)


class PredictionResponse(BaseModel):
    current_risk: RiskLevel
    future_risk: RiskLevel
    confidence: ConfidenceLevel
    probability: float = Field(ge=0, le=1)
    future_probability: float = Field(ge=0, le=1)
    diabetes_probability: float = Field(ge=0, le=1)
    heart_probability: float = Field(ge=0, le=1)
    risk_score: float = Field(ge=0)
    prediction: int = Field(ge=0, le=1)
    ensemble_agreement: int = Field(ge=1)
    ensemble_total_models: int = Field(ge=1)
    uncertainty_message: str | None = None
    key_risk_factors: list[str]
    feature_importance: list[FeatureExplanation]
    ensemble_votes: list[EnsembleVote]
    health_insights: list[str]
    disclaimer: str


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
