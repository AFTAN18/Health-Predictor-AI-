import os
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from dotenv import load_dotenv
from supabase import Client, create_client

from schemas import PredictionRequest, PredictionResponse

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")


def get_supabase() -> Client | None:
    if not SUPABASE_URL or not SUPABASE_KEY:
        return None

    try:
        return create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as exc:
        print(f"Error connecting to Supabase: {exc}")
        return None


supabase = get_supabase()


def verify_user_token(access_token: str) -> str:
    if supabase is None:
        raise RuntimeError("Supabase client is not configured. Set SUPABASE_URL and SUPABASE_KEY.")

    user_response = supabase.auth.get_user(access_token)
    if user_response.user is None:
        raise ValueError("Invalid access token.")

    return user_response.user.id


def save_prediction(
    user_id: str | None,
    request_data: PredictionRequest,
    result: PredictionResponse,
) -> Any:
    if supabase is None:
        raise RuntimeError("Supabase client is not configured. Set SUPABASE_URL and SUPABASE_KEY.")

    payload = {
        "id": str(uuid4()),
        "user_id": user_id,
        "age": request_data.age,
        "glucose": request_data.glucose,
        "blood_pressure": request_data.blood_pressure,
        "cholesterol": request_data.cholesterol,
        "BMI": request_data.BMI,
        "prediction": 1 if result.probability >= 0.5 else 0,
        "probability": result.probability,
        "future_probability": result.future_probability,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    return supabase.table("predictions").insert(payload).execute()


def fetch_recent_predictions(limit: int = 50) -> list[dict[str, Any]]:
    if supabase is None:
        raise RuntimeError("Supabase client is not configured. Set SUPABASE_URL and SUPABASE_KEY.")

    response = (
        supabase.table("predictions")
        .select("*")
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return response.data or []
