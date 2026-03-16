import os
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException, Query, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from database import fetch_recent_predictions, save_prediction, supabase, verify_user_token
from predictor import predictor
from schemas import PredictionHistoryItem, PredictionRequest, PredictionResponse
from validation import validate_prediction_input

load_dotenv()

app = FastAPI(title="AI Early Disease Prediction API", version="1.0.0")

raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
allowed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def request_validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    messages: list[str] = []
    for error in exc.errors():
        location = ".".join(str(item) for item in error.get("loc", []) if item != "body")
        text = str(error.get("msg", "Invalid request payload."))
        messages.append(f"{location}: {text}" if location else text)

    detail = "; ".join(messages) if messages else "Invalid request payload."
    return JSONResponse(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, content={"detail": detail})


def get_optional_user_id(authorization: str | None) -> str | None:
    if authorization is None:
        return None
    if not authorization.lower().startswith("bearer "):
        return None

    access_token = authorization.split(" ", 1)[1].strip()
    if not access_token:
        return None

    try:
        return verify_user_token(access_token)
    except Exception:
        return None


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "AI Early Disease Prediction API is running"}


@app.get("/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "model_loaded": "true",
        "supabase_configured": "true" if supabase is not None else "false",
    }


@app.post("/predict", response_model=PredictionResponse)
def predict_disease(
    request: PredictionRequest,
    authorization: str | None = Header(default=None),
) -> PredictionResponse:
    try:
        validate_prediction_input(request)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc

    result = predictor.predict(request)
    user_id = get_optional_user_id(authorization)

    try:
        save_prediction(user_id=user_id, request_data=request, result=result)
    except Exception as exc:
        print(f"Warning: prediction generated but failed to save history: {exc}")

    return result


@app.get("/predictions", response_model=list[PredictionHistoryItem])
def get_predictions(limit: int = Query(default=50, ge=1, le=200)) -> list[PredictionHistoryItem]:
    try:
        rows: list[dict[str, Any]] = fetch_recent_predictions(limit=limit)
        return [PredictionHistoryItem(**row) for row in rows]
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load prediction history: {exc}",
        ) from exc
