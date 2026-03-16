# AI Real-Time Disease Prediction System (MVP)

Production-ready MVP for real-time and future disease risk prediction.

## Supported Diseases
- Diabetes
- Heart Disease

## Tech Stack
- Frontend: Next.js 14, TypeScript, TailwindCSS, Chart.js
- Backend: FastAPI, Python, scikit-learn, joblib, numpy
- Database: Supabase PostgreSQL
- Deployment: Vercel (frontend), Render/Railway (backend), Supabase (DB)

## Project Structure

```text
early-disease-prediction-system/
  frontend/
    app/
      dashboard/page.tsx
      predict/page.tsx
    components/
      PredictionForm.tsx
      PredictionResult.tsx
      RiskChart.tsx
      Navbar.tsx
    utils/
      supabaseClient.ts
      config.ts
      types.ts
  backend/
    main.py
    predictor.py
    schemas.py
    validation.py
    risk_analysis.py
    database.py
  ml/
    models/
      best_model.pkl
      random_forest.pkl
      svm.pkl
      naive_bayes.pkl
      decision_tree.pkl
      scaler.pkl
  supabase/
    schema.sql
```

## Core Features
- Real-time prediction via `/predict`
- Future risk estimation (5-year projection)
- Current and future risk classifications (Low/Medium/High)
- Strict backend input validation and logical consistency checks
- Outlier/anomaly rejection safeguards
- Ensemble agreement validation (Random Forest, SVM, Naive Bayes, Decision Tree)
- Confidence scoring based on probability + model agreement
- Explainable AI output using feature-importance driven factors
- Probability output:
  - Overall probability
  - Future probability
  - Diabetes probability
  - Heart disease probability
- Confidence level and uncertainty message when prediction is borderline
- Key risk factors and health insights
- Prediction history in Supabase
- Dashboard charts:
  - Risk distribution
  - Health score trend
  - Future disease risk trend

## Prediction API

### Endpoint
`POST /predict`

### Headers
- `Content-Type: application/json`
  - `Authorization` header is optional. If supplied with a valid Supabase bearer token, prediction history is linked to that user.

### Request Body
```json
{
  "pregnancies": 2,
  "glucose": 140,
  "blood_pressure": 84,
  "skin_thickness": 28,
  "insulin": 120,
  "BMI": 31.4,
  "diabetes_pedigree": 0.62,
  "age": 45,
  "cholesterol": 210
}
```

### Response
```json
{
  "current_risk": "High",
  "future_risk": "High",
  "confidence": "High",
  "probability": 0.88,
  "future_probability": 1.0,
  "diabetes_probability": 0.48,
  "heart_probability": 0.88,
  "risk_score": 88.08,
  "prediction": 1,
  "ensemble_agreement": 3,
  "ensemble_total_models": 4,
  "uncertainty_message": null,
  "key_risk_factors": ["Glucose", "Cholesterol", "Blood Pressure"],
  "feature_importance": [
    { "feature": "Age", "contribution": 0.093, "model_importance": 0.127 },
    { "feature": "Glucose", "contribution": 0.084, "model_importance": 0.291 }
  ],
  "ensemble_votes": [
    { "model_name": "Random Forest", "prediction": 0, "probability": 0.48 },
    { "model_name": "SVM", "prediction": 0, "probability": 0.49 },
    { "model_name": "Naive Bayes", "prediction": 0, "probability": 0.21 },
    { "model_name": "Decision Tree", "prediction": 1, "probability": 0.56 }
  ],
  "health_insights": [
    "Cholesterol is above optimal range and may increase heart disease risk.",
    "Current overall risk classification is High.",
    "Projected 5-year risk classification is High."
  ],
  "disclaimer": "This tool provides risk estimation only and is not a medical diagnosis. Please consult a healthcare professional."
}
```

### Example cURL
```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d "{\"pregnancies\":2,\"glucose\":140,\"blood_pressure\":84,\"skin_thickness\":28,\"insulin\":120,\"BMI\":31.4,\"diabetes_pedigree\":0.62,\"age\":45,\"cholesterol\":210}"
```

## Risk Logic

### Health Risk Score
`0.3*glucose + 0.25*BMI + 0.2*age + 0.15*blood_pressure + 0.1*cholesterol`

### Risk Classification
- Score `< 50` => Low
- Score `50 to 70` => Medium
- Score `> 70` => High

### Future Probability
`future_probability = probability + risk_score * 0.01` (clamped to 0-1)

## Input Validation Safeguards
- Age: `0-120`
- Glucose: `50-300`
- Blood pressure: `60-200`
- BMI: `10-60`
- Pregnancies: `0-20`
- Insulin: `0-900`
- Skin thickness: `0-100`
- Cholesterol: `100-400`
- Logical checks reject impossible combinations (for example, age `< 10` with pregnancies `> 0`).
- Z-score anomaly detection rejects severe abnormal patterns before prediction.

## Supabase Table

Run `supabase/schema.sql`.

Table: `predictions`
- `id`
- `user_id`
- `age`
- `glucose`
- `BMI`
- `blood_pressure`
- `cholesterol`
- `prediction`
- `probability`
- `future_probability`
- `created_at`

## Local Setup

## 1. Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload
```

Backend env:
```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your_supabase_service_role_key
CORS_ORIGINS=http://localhost:3000
```

## 2. Frontend
```bash
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```

Frontend env:
```env
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8000
```

## Deployment

## Frontend -> Vercel
1. Import `frontend` folder into Vercel.
2. Set env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_KEY`
   - `NEXT_PUBLIC_BACKEND_API_URL`
3. Deploy.

## Backend -> Render / Railway
1. Deploy `backend` directory as Python web service.
2. Ensure `ml/models/best_model.pkl` and `ml/models/scaler.pkl` are available in deploy artifact.
3. Start command:
   - `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Set env vars:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `CORS_ORIGINS` (include Vercel domain)
5. Optional: use included [render.yaml](./render.yaml) blueprint for faster setup.
6. For Railway/Heroku-style deploys, [backend/Procfile](./backend/Procfile) is included.

## Supabase
1. Run `supabase/schema.sql`.
2. Add URL/keys into backend environment.

## Medical Disclaimer
This system provides AI-assisted risk screening only. It is not a diagnostic device and does not replace clinical judgment.
