import os

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from database import save_prediction, supabase, verify_user_token
from predictor import predictor
from schemas import PredictionRequest, PredictionResponse

load_dotenv()

app = FastAPI(title="AI Early Disease Prediction API", version="1.0.0")
security = HTTPBearer(auto_error=False)

raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
allowed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> str:
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token.",
        )

    try:
        return verify_user_token(credentials.credentials)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {exc}",
        ) from exc


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
    user_id: str = Depends(get_current_user_id),
) -> PredictionResponse:
    result = predictor.predict(request)

    try:
        save_prediction(user_id=user_id, request_data=request, result=result)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction generated but failed to save history: {exc}",
        ) from exc

    return result
