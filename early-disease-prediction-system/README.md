# AI Early Disease Prediction System

A complete MVP full-stack application for predicting early onset diseases (e.g., Diabetes) using an authenticated UI and Machine Learning backend.

## Tech Stack
- **Frontend**: Next.js 14, TailwindCSS, Chart.js, Axios
- **Backend**: FastAPI, Scikit-Learn, Joblib, Pydantic
- **Database / Auth**: Supabase (PostgreSQL)

## Project Structure
```
early-disease-prediction-system/
├── backend/                  # FastAPI Backend API
│   ├── main.py               # Main API routes
│   ├── predictor.py          # ML Inference Logic
│   ├── database.py           # Supabase Integration
│   ├── schemas.py            # Pydantic Schemas
│   └── requirements.txt      # Python dependencies
├── frontend/                 # Next.js Application
│   ├── app/                  # Application Routes (Next.js App Router)
│   ├── components/           # Reusable UI Components
│   └── utils/                # Utilities (Auth & APIs)
└── ml/                       # Machine Learning Code
    ├── train_genuine_model.py# Fetches openML datasets & trains the genuine ML model
    └── models/               # Contains best_model.pkl and scaler.pkl
```

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 2. Environment Variables
Create a `.env.local` inside `frontend/` and a `.env` in `backend/` with the following variables:
```env
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8000

# Backend (.env)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

### 3. ML Model setup (if missing)
Models are already included. However, you can retrain the model on the full real-world Pima Indians Diabetes database using:
```bash
cd ml
pip install pandas scikit-learn
python train_genuine_model.py
```

### 4. Running Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
API runs on `http://localhost:8000`

### 5. Running Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:3000`

## Deployment
* **Frontend**: Push your code to GitHub and deploy the `/frontend` folder to Vercel. Add the `.env` variables to Vercel's settings.
* **Backend**: Deploy the `/backend` and `/ml/models` folders to Render or Railway as a Web Service, configuring `uvicorn main:app --host 0.0.0.0 --port $PORT` as your start command.
* **Database**: Already hosted on Supabase!
