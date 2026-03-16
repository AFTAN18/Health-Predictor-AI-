from __future__ import annotations

from typing import Final

from schemas import PredictionRequest

# Approximate baseline stats from the Pima diabetes distribution.
BASELINE_STATS: Final[dict[str, tuple[float, float]]] = {
    "pregnancies": (3.8, 3.4),
    "glucose": (121.0, 32.0),
    "blood_pressure": (72.0, 19.0),
    "skin_thickness": (21.0, 16.0),
    "insulin": (80.0, 115.0),
    "BMI": (32.0, 7.9),
    "diabetes_pedigree": (0.47, 0.33),
    "age": (33.2, 11.8),
    "cholesterol": (200.0, 35.0),
}

SAFE_LIMITS: Final[dict[str, tuple[float, float]]] = {
    "age": (0, 120),
    "glucose": (50, 300),
    "blood_pressure": (60, 200),
    "BMI": (10, 60),
    "pregnancies": (0, 20),
    "insulin": (0, 900),
    "skin_thickness": (0, 100),
    "cholesterol": (100, 400),
}

OUTLIER_ZSCORE_THRESHOLD: Final[float] = 5.5


def validate_prediction_input(data: PredictionRequest) -> None:
    """Run strict safeguards on already-schema-validated request data."""

    for field, (lower, upper) in SAFE_LIMITS.items():
        value = float(getattr(data, field))
        if value < lower or value > upper:
            raise ValueError(f"{field}={value} is outside the supported medical range ({lower}-{upper}).")

    if data.age < 10 and data.pregnancies > 0:
        raise ValueError("Invalid input combination: age below 10 cannot have pregnancies greater than 0.")

    severe_outliers: list[str] = []
    for field, (mean, std_dev) in BASELINE_STATS.items():
        value = float(getattr(data, field))
        if std_dev <= 0:
            continue
        z_score = abs((value - mean) / std_dev)
        if z_score >= OUTLIER_ZSCORE_THRESHOLD:
            severe_outliers.append(f"{field} (z={z_score:.2f})")

    if severe_outliers:
        detected = ", ".join(severe_outliers)
        raise ValueError(
            f"Abnormal input pattern detected for {detected}. Please verify values and retry with clinical measurements."
        )
