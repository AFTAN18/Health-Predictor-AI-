from __future__ import annotations

from typing import Sequence

from schemas import ConfidenceLevel, PredictionRequest, RiskLevel


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


def estimate_future_probability(probability: float, risk_score: float) -> float:
    return clamp(probability + (risk_score * 0.01), 0.0, 1.0)


def classify_confidence(probability: float, ensemble_agreement: int, total_models: int) -> ConfidenceLevel:
    if probability > 0.8:
        base_confidence: ConfidenceLevel = "High"
    elif probability > 0.6:
        base_confidence = "Medium"
    else:
        base_confidence = "Low"

    if ensemble_agreement >= min(3, total_models):
        if base_confidence == "Low":
            return "Medium"
        if base_confidence == "Medium":
            return "High"
    return base_confidence


def uncertainty_message(probability: float) -> str | None:
    if 0.45 <= probability <= 0.55:
        return "Prediction uncertain. Medical testing recommended."
    return None


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
    elif data.glucose < 70:
        insights.append("Low glucose level detected. Recheck values to ensure fasting/sample context is correct.")

    if data.BMI >= 30:
        insights.append("Higher BMI may raise diabetes and cardiovascular risk over time.")
    elif data.BMI < 18.5:
        insights.append("Lower BMI can indicate nutritional risk; review with a clinician if persistent.")

    if data.cholesterol >= 200:
        insights.append("Cholesterol is above optimal range and may increase heart disease risk.")
    if data.blood_pressure >= 130:
        insights.append("Blood pressure is elevated and should be monitored regularly.")

    insights.append(f"Current overall risk classification is {current_risk}.")
    insights.append(f"Projected 5-year risk classification is {future_risk}.")

    if not insights:
        insights.append("Inputs are currently within lower-risk ranges. Maintain preventive health habits.")
    return insights
