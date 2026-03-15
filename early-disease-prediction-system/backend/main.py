from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from schemas import PredictionRequest, PredictionResponse
from predictor import predictor
from database import supabase
from datetime import datetime
import uuid

app = FastAPI(title="AI Early Disease Prediction API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "AI Early Disease Prediction API is running"}

@app.post("/predict", response_model=PredictionResponse)
def predict_disease(request: PredictionRequest):
    # Perform prediction
    response = predictor.predict(request)
    
    # Check if supabase is initialized to save prediction
    if supabase is not None:
        try:
            # Assuming user_id can be passed or mocked for MVP, using mock uuid if none
            supabase.table("predictions").insert({
                "id": str(uuid.uuid4()),
                "user_id": "mock-user-id", # Ideally from Auth token
                "age": request.age,
                "glucose": request.glucose,
                "blood_pressure": request.blood_pressure,
                "BMI": request.BMI,
                "prediction": response.prediction,
                "probability": response.risk_probability,
                "created_at": datetime.utcnow().isoformat()
            }).execute()
        except Exception as e:
            print(f"Failed to log prediction to Supabase: {e}")
            
    return response

# To run: uvicorn backend.main:app --reload
