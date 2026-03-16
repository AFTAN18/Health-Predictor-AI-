from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    pregnancies: float = Field(ge=0)
    glucose: float = Field(ge=0)
    blood_pressure: float = Field(ge=0)
    skin_thickness: float = Field(ge=0)
    insulin: float = Field(ge=0)
    BMI: float = Field(ge=0)
    diabetes_pedigree: float = Field(ge=0)
    age: float = Field(ge=0)


class PredictionResponse(BaseModel):
    prediction: int = Field(ge=0, le=1)
    risk_probability: float = Field(ge=0, le=1)
