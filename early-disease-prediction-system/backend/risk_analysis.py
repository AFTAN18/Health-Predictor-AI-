from __future__ import annotations

from typing import Sequence

from schemas import PredictionRequest, RiskLevel


def clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(upper, value))


def calculate_risk_score(data: PredictionRequest) -> float:
    return (
        0.3 * data.glucose
        + 0.25 * data.BMI
        + 0.2 * data.age
        + 0.15 * data.blood_pressure
        + 0.1 * data.cholesterol
    )


def classify_risk_from_score(score: float) -> RiskLevel:
    if score < 50:
        return "Low"
    if score <= 70:
        return "Medium"
    return "High"


def get_risk_growth_factors(data: PredictionRequest) -> tuple[float, float, float]:
    age_factor = clamp(data.age / 100.0, 0.0, 1.0)
    bmi_factor = clamp(data.BMI / 50.0, 0.0, 1.0)
    glucose_factor = clamp(data.glucose / 200.0, 0.0, 1.0)
    return age_factor, bmi_factor, glucose_factor


def estimate_future_probability(base_probability: float, data: PredictionRequest) -> float:
    age_factor, bmi_factor, glucose_factor = get_risk_growth_factors(data)
    return clamp(base_probability + (age_factor + bmi_factor + glucose_factor) * 0.05, 0.0, 1.0)


def estimate_future_risk_score(current_risk_score: float, data: PredictionRequest) -> float:
    age_factor, bmi_factor, glucose_factor = get_risk_growth_factors(data)
    return current_risk_score + (age_factor + bmi_factor + glucose_factor) * 10.0


def get_key_risk_factors(data: PredictionRequest, top_k: int = 3) -> list[str]:
    factor_scores: Sequence[tuple[str, float]] = (
        ("Glucose", 0.3 * data.glucose),
        ("BMI", 0.25 * data.BMI),
        ("Age", 0.2 * data.age),
        ("Blood Pressure", 0.15 * data.blood_pressure),
        ("Cholesterol", 0.1 * data.cholesterol),
    )
    return [name for name, _ in sorted(factor_scores, key=lambda item: item[1], reverse=True)[:top_k]]


def generate_health_insights(data: PredictionRequest, current_risk: RiskLevel, future_risk: RiskLevel) -> list[str]:
    insights: list[str] = []

    if data.glucose >= 140:
        insights.append("Elevated glucose indicates increased metabolic risk.")
    if data.BMI >= 30:
        insights.append("Higher BMI may raise diabetes and cardiovascular risk over time.")
    if data.cholesterol >= 200:
        insights.append("Cholesterol is above optimal range and may increase heart disease risk.")
    if data.blood_pressure >= 130:
        insights.append("Blood pressure is elevated and should be monitored regularly.")

    insights.append(f"Current overall risk classification is {current_risk}.")
    insights.append(f"Projected 5-year risk classification is {future_risk}.")

    if not insights:
        insights.append("Inputs are currently within lower-risk ranges. Maintain preventive health habits.")
    return insights
